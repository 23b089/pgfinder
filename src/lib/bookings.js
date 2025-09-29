import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import { writeBatch } from 'firebase/firestore';
import { updateRoomAvailability } from './properties';

// Create notification helper (used below)
export const createNotification = async (notificationData) => {
  try {
    const notification = {
      ...notificationData,
      createdAt: serverTimestamp(),
      isRead: false
    };

    await addDoc(collection(db, 'notifications'), notification);
    return { success: true };
  } catch (error) {
    console.error('Create notification error:', error);
    return { success: false, error: error.message };
  }
};

// Complete a stay when user moves out (checkout)
export const completeStay = async (bookingId, userId) => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingDoc = await getDoc(bookingRef);

    if (!bookingDoc.exists()) {
      return { success: false, error: 'Booking not found' };
    }

    const booking = bookingDoc.data();

    // Only the booking user can complete their stay
    if (booking.userId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Only proceed if booking is in a state that can be completed (confirmed/active)
    if (['completed', 'rejected', 'cancelled', 'pending'].includes(((booking.status || '') + '').toLowerCase())) {
      return { success: false, error: 'Booking cannot be completed' };
    }

    // Release room availability (they moved out) only if booking was confirmed/active
    if ((booking.status || '').toLowerCase() === 'confirmed') {
      const occupantCount = parseInt(booking.occupants || 1, 10);
      await updateRoomAvailability(booking.propertyId, 'cancel', occupantCount);
    }

    // Mark booking as completed and stamp checkout date (now)
    const nowIso = new Date().toISOString();
    await updateDoc(bookingRef, {
      status: 'completed',
      checkOut: nowIso,
      updatedAt: serverTimestamp(),
      completedAt: serverTimestamp()
    });

    // Add to user's stay history
    try {
      const userRef = doc(db, 'users', booking.userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const stayEntry = {
          bookingId,
          propertyId: booking.propertyId,
          propertyName: booking.propertyName || booking.pgName || '',
          checkIn: booking.checkIn,
          checkOut: nowIso,
          // serverTimestamp() cannot be used inside arrays — use ISO string timestamp instead
          completedAt: new Date().toISOString()
        };
        const updatedHistory = [...(userData.stayHistory || []), stayEntry];
        await updateDoc(userRef, { stayHistory: updatedHistory });
      }
    } catch (userErr) {
      console.error('Failed to update user stay history:', userErr);
      // not fatal
    }

    // Notify user and owner
    await createNotification({
      userId: booking.userId,
      type: 'stay_completed',
      title: 'Stay Completed',
      message: `You have successfully checked out from ${booking.propertyName || booking.pgName}.`,
      bookingId,
      propertyId: booking.propertyId,
      isRead: false
    });

    await createNotification({
      userId: booking.ownerId,
      type: 'guest_checked_out',
      title: 'Guest Checked Out',
      message: `${booking.userName} has checked out from ${booking.propertyName || booking.pgName}.`,
      bookingId,
      propertyId: booking.propertyId,
      isRead: false
    });

    return { success: true };
  } catch (error) {
    console.error('Complete stay error:', error);
    return { success: false, error: error.message };
  }
};

// Create a new booking (start as pending). Owner must accept to confirm.
export const createBooking = async (bookingData) => {
  try {
    // Phone OTP verification removed per request: allow booking without verified phone

    // Prevent duplicate booking for the same PG by the same user if an active/ongoing booking exists
    try {
      const existingQ = query(collection(db, 'bookings'), where('userId', '==', bookingData.userId));
      const existingSnap = await getDocs(existingQ);
      const blockedStatuses = ['pending', 'confirmed', 'active', 'paid'];
      const hasOngoingForSamePG = existingSnap.docs.some((d) => {
        const b = d.data();
        const status = ((b.status || '') + '').toLowerCase();
        return b.propertyId === bookingData.propertyId && blockedStatuses.includes(status);
      });
      if (hasOngoingForSamePG) {
        return { success: false, error: 'You already have an active booking for this PG.' };
      }
    } catch (dupeErr) {
      console.error('Duplicate booking pre-check failed:', dupeErr);
      // Continue to attempt booking if pre-check fails due to index or transient errors
    }

    // Reserve a slot at booking time using a transaction to avoid overbooking.
    const bookingRef = doc(collection(db, 'bookings'));
    const bookingId = bookingRef.id;

    await runTransaction(db, async (transaction) => {
      const propRef = doc(db, 'pg_listings', bookingData.propertyId);
      const propSnap = await transaction.get(propRef);
      if (!propSnap.exists()) throw new Error('Property not found');

      const prop = propSnap.data();

      // Prevent bookings by blocked users
      const blocked = prop.blockedUsers || [];
      if (blocked.includes(bookingData.userId)) {
        throw new Error('You are blocked from booking this property');
      }

      const occupantCount = parseInt(bookingData.occupants || 1, 10) || 1;
      const availableSlots = parseInt(prop.availableSlots || 0, 10);
      if (availableSlots < occupantCount) {
        throw new Error('Not enough slots available');
      }

      // decrement slots and update derived room counts
      const newAvailableSlots = availableSlots - occupantCount;
      const newOccupiedSlots = (parseInt(prop.occupiedSlots || 0, 10) + occupantCount);
      const roomCapacity = parseInt(prop.roomCapacity || 1, 10) || 1;
      const newAvailableRooms = Math.floor(newAvailableSlots / roomCapacity);
      const newOccupiedRooms = Math.ceil(newOccupiedSlots / roomCapacity);

      transaction.update(propRef, {
        availableSlots: newAvailableSlots,
        occupiedSlots: newOccupiedSlots,
        availableRooms: newAvailableRooms,
        occupiedRooms: newOccupiedRooms,
        updatedAt: serverTimestamp()
      });

      // Create booking as pending (owner must accept)
      const booking = {
        ...bookingData,
        occupants: occupantCount,
        status: 'pending', // FIX: bookings now start as pending
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        rentAmount: bookingData.rentAmount || 0,
        checkOut: null,
        // Security deposit and other payment tracking removed per request
      };

      transaction.set(bookingRef, booking);
    });

    // Notify owner about new booking request
    try {
      const bookingDoc = await getDoc(bookingRef);
      const booking = bookingDoc.exists() ? bookingDoc.data() : null;
      if (booking) {
        await createNotification({
          userId: booking.ownerId,
          type: 'new_booking',
          title: 'New Booking Request',
          message: `${booking.userName} has requested to book ${booking.propertyName || booking.pgName}.`,
          bookingId,
          propertyId: booking.propertyId,
          isRead: false
        });
      }
    } catch (nErr) {
      console.error('Failed to notify owner of new booking:', nErr);
    }

    return { success: true, bookingId };
  } catch (error) {
    console.error('Create booking error:', error);
    return { success: false, error: error.message };
  }
};

// Toggle favorite property
export const toggleFavoriteProperty = async (propertyId, userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const favorites = userData.favorites || [];
      
      let updatedFavorites;
      if (favorites.includes(propertyId)) {
        updatedFavorites = favorites.filter(id => id !== propertyId);
      } else {
        updatedFavorites = [...favorites, propertyId];
      }
      
      await updateDoc(userRef, { favorites: updatedFavorites });
      
      return {
        success: true,
        favorites: updatedFavorites
      };
    } else {
      return {
        success: false,
        error: 'User not found'
      };
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get user favorites
export const getUserFavorites = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const favoriteIds = userData.favorites || [];
      
      // Get favorite properties
      const favoriteProperties = [];
      for (const propertyId of favoriteIds) {
        const propertyDoc = await getDoc(doc(db, 'properties', propertyId));
        if (propertyDoc.exists()) {
          favoriteProperties.push({ ...propertyDoc.data(), id: propertyDoc.id });
        }
      }
      
      return {
        success: true,
        favorites: favoriteProperties
      };
    } else {
      return {
        success: false,
        error: 'User not found'
      };
    }
  } catch (error) {
    console.error('Get favorites error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get bookings for a user
export const getUserBookings = async (userId) => {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    const bookings = [];
    snapshot.forEach(docSnap => {
      bookings.push({ id: docSnap.id, ...docSnap.data() });
    });

    const toMillis = (ts) => {
      if (!ts) return 0;
      if (typeof ts === 'object' && typeof ts.toMillis === 'function') return ts.toMillis();
      if (typeof ts === 'string') return new Date(ts).getTime();
      if (typeof ts === 'number') return ts;
      return 0;
    };

    bookings.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

    return { success: true, bookings };
  } catch (error) {
    console.error('Get user bookings error:', error);
    return { success: false, error: error.message };
  }
};

// Get notifications for a user
export const getUserNotifications = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const notifications = [];
    snapshot.forEach(docSnap => {
      notifications.push({ id: docSnap.id, ...docSnap.data() });
    });

    return { success: true, notifications };
  } catch (error) {
    console.error('Get user notifications error:', error);
    return { success: false, error: error.message };
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    const snap = await getDocs(q);
    if (snap.empty) return { success: true };
    const batch = writeBatch(db);
    snap.forEach(d => batch.update(doc(db, 'notifications', d.id), { isRead: true, updatedAt: serverTimestamp() }));
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return { success: false, error: error.message };
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notifRef = doc(db, 'notifications', notificationId);
    const notifDoc = await getDoc(notifRef);
    if (!notifDoc.exists()) return { success: false, error: 'Notification not found' };

    const notif = notifDoc.data();
    if (notif.userId !== userId) return { success: false, error: 'Unauthorized' };

    await updateDoc(notifRef, { isRead: true, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (error) {
    console.error('Mark notification read error:', error);
    return { success: false, error: error.message };
  }
};

// Optional: Mark a notification as UNREAD (used by UI toggle)
export const markNotificationAsUnread = async (notificationId, userId) => {
  try {
    const notifRef = doc(db, 'notifications', notificationId);
    const notifDoc = await getDoc(notifRef);
    if (!notifDoc.exists()) return { success: false, error: 'Notification not found' };

    const notif = notifDoc.data();
    if (notif.userId !== userId) return { success: false, error: 'Unauthorized' };

    await updateDoc(notifRef, { isRead: false, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (error) {
    console.error('Mark notification unread error:', error);
    return { success: false, error: error.message };
  }
};

// Delete a single notification (auth: must belong to userId)
export const deleteNotification = async (notificationId, userId) => {
  try {
    const notifRef = doc(db, 'notifications', notificationId);
    const notifDoc = await getDoc(notifRef);
    if (!notifDoc.exists()) return { success: false, error: 'Notification not found' };

    const notif = notifDoc.data();
    if (notif.userId !== userId) return { success: false, error: 'Unauthorized' };

    await deleteDoc(notifRef);
    return { success: true };
  } catch (error) {
    console.error('Delete notification error:', error);
    return { success: false, error: error.message };
  }
};

// Delete multiple notifications by IDs (auth: each must belong to userId)
export const deleteNotifications = async (notificationIds = [], userId) => {
  try {
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return { success: true };
    }
    const batch = writeBatch(db);
    for (const id of notificationIds) {
      const ref = doc(db, 'notifications', id);
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().userId === userId) {
        batch.delete(ref);
      }
    }
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Batch delete notifications error:', error);
    return { success: false, error: error.message };
  }
};

// Delete all notifications for a user
export const deleteAllNotificationsForUser = async (userId) => {
  try {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (snap.empty) return { success: true };
    const batch = writeBatch(db);
    snap.forEach(d => batch.delete(doc(db, 'notifications', d.id)));
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Delete all notifications error:', error);
    return { success: false, error: error.message };
  }
};

// Cancel a booking by the user
export const cancelBooking = async (bookingId, userId) => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingDoc = await getDoc(bookingRef);
    if (!bookingDoc.exists()) return { success: false, error: 'Booking not found' };

    const booking = bookingDoc.data();
    if (booking.userId !== userId) return { success: false, error: 'Unauthorized' };

    // If booking was confirmed, release the slot(s)
    if (((booking.status || '') + '').toLowerCase() === 'confirmed') {
      try {
        const occupantCount = parseInt(booking.occupants || 1, 10);
        await updateRoomAvailability(booking.propertyId, 'cancel', occupantCount);
      } catch (err) {
        console.error('Failed to update room availability on cancel:', err);
      }
    }

    await updateDoc(bookingRef, { status: 'cancelled', updatedAt: serverTimestamp(), cancelledAt: serverTimestamp() });

    await createNotification({
      userId: booking.ownerId,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `${booking.userName} has cancelled their booking for ${booking.propertyName || booking.pgName}.`,
      bookingId,
      propertyId: booking.propertyId,
      isRead: false
    });

    return { success: true };
  } catch (error) {
    console.error('Cancel booking error:', error);
    return { success: false, error: error.message };
  }
};

// Submit a review for a booking/property
export const submitReview = async (bookingId, userId, text, rating) => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingDoc = await getDoc(bookingRef);
    if (!bookingDoc.exists()) return { success: false, error: 'Booking not found' };

    const booking = bookingDoc.data();
    if (booking.userId !== userId) return { success: false, error: 'Unauthorized' };

    const reviewEntry = {
      userId,
      text,
      rating,
      createdAt: new Date().toISOString()
    };

    await updateDoc(bookingRef, { review: reviewEntry, updatedAt: serverTimestamp() });

    try {
      const propRef = doc(db, 'pg_listings', booking.propertyId);
      const propDoc = await getDoc(propRef);
      if (propDoc.exists()) {
        const prop = propDoc.data();
        const reviews = prop.reviews || [];
        const updated = [...reviews, { ...reviewEntry, propertyId: booking.propertyId, userName: booking.userName }];
        await updateDoc(propRef, { reviews: updated });
      }
    } catch (propErr) {
      console.error('Failed to attach review to property:', propErr);
    }

    await createNotification({
      userId: booking.ownerId,
      type: 'new_review',
      title: 'New Review Received',
      message: `${booking.userName} left a review for ${booking.propertyName || booking.pgName}.`,
      bookingId,
      propertyId: booking.propertyId,
      isRead: false
    });

    return { success: true };
  } catch (error) {
    console.error('Submit review error:', error);
    return { success: false, error: error.message };
  }
};

// Get bookings for an owner
export const getOwnerBookings = async (ownerId) => {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('ownerId', '==', ownerId)
    );

    const snapshot = await getDocs(q);
    const bookings = [];
    snapshot.forEach(docSnap => bookings.push({ id: docSnap.id, ...docSnap.data() }));

    const toMillis = (ts) => {
      if (!ts) return 0;
      if (typeof ts === 'object' && typeof ts.toMillis === 'function') return ts.toMillis();
      if (typeof ts === 'string') return new Date(ts).getTime();
      if (typeof ts === 'number') return ts;
      return 0;
    };

    bookings.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

    return { success: true, bookings };
  } catch (error) {
    console.error('Get owner bookings error:', error);
    return { success: false, error: error.message };
  }
};

// Owner accepts a booking (confirms it)
export const acceptBooking = async (bookingId, ownerId) => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingDoc = await getDoc(bookingRef);
    if (!bookingDoc.exists()) return { success: false, error: 'Booking not found' };

    const booking = bookingDoc.data();
    if (booking.ownerId !== ownerId) return { success: false, error: 'Unauthorized' };

    await updateDoc(bookingRef, { status: 'confirmed', updatedAt: serverTimestamp(), confirmedAt: serverTimestamp() });

    await createNotification({
      userId: booking.userId,
      type: 'booking_accepted',
      title: 'Booking Confirmed',
      message: `Your booking for ${booking.propertyName || booking.pgName} has been confirmed by the owner.`,
      bookingId,
      propertyId: booking.propertyId,
      isRead: false
    });

    return { success: true };
  } catch (error) {
    console.error('Accept booking error:', error);
    return { success: false, error: error.message };
  }
};

// Owner rejects a booking
export const rejectBooking = async (bookingId, ownerId) => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingDoc = await getDoc(bookingRef);
    if (!bookingDoc.exists()) return { success: false, error: 'Booking not found' };

    const booking = bookingDoc.data();
    if (booking.ownerId !== ownerId) return { success: false, error: 'Unauthorized' };

    await updateDoc(bookingRef, { status: 'rejected', updatedAt: serverTimestamp(), rejectedAt: serverTimestamp() });

    // Release reserved slot
    try {
      const occupantCount = parseInt(booking.occupants || 1, 10);
      await updateRoomAvailability(booking.propertyId, 'cancel', occupantCount);
    } catch (err) {
      console.error('Failed to update room availability on rejection:', err);
    }

    await createNotification({
      userId: booking.userId,
      type: 'booking_rejected',
      title: 'Booking Rejected',
      message: `Your booking for ${booking.propertyName || booking.pgName} has been rejected by the owner.`,
      bookingId,
      propertyId: booking.propertyId,
      isRead: false
    });

    return { success: true };
  } catch (error) {
    console.error('Reject booking error:', error);
    return { success: false, error: error.message };
  }
};
