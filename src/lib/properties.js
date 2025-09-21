import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  limit,
  startAfter,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

// Add new PG property
export const addProperty = async (propertyData, ownerId) => {
  try {
    const property = {
      ...propertyData,
      ownerId,
      visibility: 'public', // Default to public for user feed visibility
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active',
      views: 0,
      favorites: 0,
      rating: 0,
      reviews: 0,
  totalRooms: propertyData.totalRooms || 0,
  roomCapacity: propertyData.roomCapacity || 1,
  // Track slots (totalSlots = totalRooms * roomCapacity)
  totalSlots: (propertyData.totalRooms || 0) * (propertyData.roomCapacity || 1),
  availableSlots: (propertyData.availableRooms || propertyData.totalRooms || 0) * (propertyData.roomCapacity || 1),
  occupiedSlots: 0,
  // availableRooms/occupiedRooms are derived fields used in UI
  availableRooms: propertyData.availableRooms || propertyData.totalRooms || 0,
  occupiedRooms: 0,
      // New fields for PG listings
      pgName: propertyData.pgName,
      location: propertyData.location,
      sharingType: propertyData.sharingType,
      features: propertyData.features || [],
      price: propertyData.price || 0,
      roomType: propertyData.roomType || 'Single',
      gender: propertyData.gender || 'Unisex',
      amenities: propertyData.amenities || []
    };
    // Normalize Third-party service charge
    property.tpServiceChargeType = propertyData.tpServiceChargeType || 'none';
    property.tpServiceChargeValue = propertyData.tpServiceChargeType === 'none' ? 0 : (parseFloat(propertyData.tpServiceChargeValue) || 0);

    const docRef = await addDoc(collection(db, 'pg_listings'), property);
    
    // Update owner's properties array
    const ownerRef = doc(db, 'users', ownerId);
    const ownerDoc = await getDoc(ownerRef);
    if (ownerDoc.exists()) {
      const ownerData = ownerDoc.data();
      const updatedProperties = [...(ownerData.properties || []), docRef.id];
      await updateDoc(ownerRef, { properties: updatedProperties });
    }

    return {
      success: true,
      propertyId: docRef.id,
      property: { ...property, id: docRef.id }
    };
  } catch (error) {
    console.error('Add property error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Update PG property
export const updateProperty = async (propertyId, updates) => {
  try {
    const propertyRef = doc(db, 'pg_listings', propertyId);
    await updateDoc(propertyRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Update property error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete PG property
export const deleteProperty = async (propertyId, ownerId) => {
  try {
    // Delete property
    await deleteDoc(doc(db, 'pg_listings', propertyId));
    
    // Remove from owner's properties array
    const ownerRef = doc(db, 'users', ownerId);
    const ownerDoc = await getDoc(ownerRef);
    if (ownerDoc.exists()) {
      const ownerData = ownerDoc.data();
      const updatedProperties = ownerData.properties.filter(id => id !== propertyId);
      await updateDoc(ownerRef, { properties: updatedProperties });
    }

    // Mark related bookings as cancelled and notify users
    try {
      const bq = query(collection(db, 'bookings'), where('propertyId', '==', propertyId));
      const bookingsSnap = await getDocs(bq);
      for (const bdoc of bookingsSnap.docs) {
        const bdata = bdoc.data();
        const bookingRef = doc(db, 'bookings', bdoc.id);
        await updateDoc(bookingRef, { status: 'cancelled', updatedAt: serverTimestamp() });

        // Create notification for the user
        await addDoc(collection(db, 'notifications'), {
          userId: bdata.userId,
          type: 'booking_cancelled_due_to_property_deletion',
          title: 'Booking Cancelled',
          message: `Your booking for ${bdata.propertyName || ''} was cancelled because the property was removed by the owner.`,
          bookingId: bdoc.id,
          propertyId,
          createdAt: serverTimestamp(),
          isRead: false
        });
      }
    } catch (bErr) {
      console.error('Error cancelling related bookings:', bErr);
    }

    return { success: true };
  } catch (error) {
    console.error('Delete property error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get property by ID
export const getProperty = async (propertyId) => {
  try {
    const propertyDoc = await getDoc(doc(db, 'pg_listings', propertyId));
    if (propertyDoc.exists()) {
      return {
        success: true,
        property: { ...propertyDoc.data(), id: propertyDoc.id }
      };
    } else {
      return {
        success: false,
        error: 'Property not found'
      };
    }
  } catch (error) {
    console.error('Get property error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get properties by owner
export const getPropertiesByOwner = async (ownerId) => {
  try {
    const q = query(
      collection(db, 'pg_listings'),
      where('ownerId', '==', ownerId)
    );
    
    const querySnapshot = await getDocs(q);
    const properties = [];
    
    querySnapshot.forEach((doc) => {
      properties.push({ ...doc.data(), id: doc.id });
    });

    // Sort in JavaScript instead of Firestore
    properties.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
      return dateB - dateA; // Descending order
    });

    return {
      success: true,
      properties
    };
  } catch (error) {
    console.error('Get properties by owner error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get all properties with filters
export const getProperties = async (filters = {}, page = 1, limitCount = 10) => {
  try {
    let q = collection(db, 'pg_listings');
    const constraints = [];

    // Add filters
    if (filters.location) {
      constraints.push(where('location', '>=', filters.location));
      constraints.push(where('location', '<=', filters.location + '\uf8ff'));
    }
    
    if (filters.gender && filters.gender !== 'Unisex') {
      constraints.push(where('gender', 'in', [filters.gender, 'Unisex']));
    }
    
    if (filters.roomType) {
      constraints.push(where('roomType', '==', filters.roomType));
    }
    
    if (filters.maxPrice) {
      constraints.push(where('price', '<=', parseInt(filters.maxPrice)));
    }
    
    if (filters.minPrice) {
      constraints.push(where('price', '>=', parseInt(filters.minPrice)));
    }

    // Add status and visibility filters - only show public and active properties
    constraints.push(where('status', '==', 'active'));
    constraints.push(where('visibility', '==', 'public'));

    // Add ordering
    constraints.push(orderBy('createdAt', 'desc'));

    // Add pagination
    if (page > 1) {
      // This would need to be implemented with cursor-based pagination
      // For now, we'll use limit
    }
    constraints.push(limit(limitCount));

    q = query(q, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const properties = [];
    querySnapshot.forEach((doc) => {
      properties.push({ ...doc.data(), id: doc.id });
    });

    return {
      success: true,
      properties,
      total: properties.length
    };
  } catch (error) {
    console.error('Get properties error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Upload property image
export const uploadPropertyImage = async (file, propertyId) => {
  try {
    const storageRef = ref(storage, `pg_listings/${propertyId}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      success: true,
      url: downloadURL
    };
  } catch (error) {
    console.error('Upload image error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Search properties
export const searchProperties = async (searchTerm, filters = {}) => {
  try {
    let q = collection(db, 'pg_listings');
    const constraints = [where('status', '==', 'active'), where('visibility', '==', 'public')];

    // Add search term filter
    if (searchTerm) {
      constraints.push(where('pgName', '>=', searchTerm));
      constraints.push(where('pgName', '<=', searchTerm + '\uf8ff'));
    }

    // Add other filters
    if (filters.location) {
      constraints.push(where('location', '>=', filters.location));
      constraints.push(where('location', '<=', filters.location + '\uf8ff'));
    }
    
    if (filters.gender && filters.gender !== 'Unisex') {
      constraints.push(where('gender', 'in', [filters.gender, 'Unisex']));
    }
    
    if (filters.roomType) {
      constraints.push(where('roomType', '==', filters.roomType));
    }

    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(20));

    q = query(q, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const properties = [];
    querySnapshot.forEach((doc) => {
      properties.push({ ...doc.data(), id: doc.id });
    });

    return {
      success: true,
      properties,
      total: properties.length
    };
  } catch (error) {
    console.error('Search properties error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Update room availability when booking is made
// Update room availability in terms of slots. occupantCount is number of occupants reserved/released.
export const updateRoomAvailability = async (propertyId, action = 'book', occupantCount = 1) => {
  try {
    const propertyRef = doc(db, 'pg_listings', propertyId);
    const propertyDoc = await getDoc(propertyRef);

    if (!propertyDoc.exists()) {
      return { success: false, error: 'Property not found' };
    }

    const propertyData = propertyDoc.data();
    const roomCapacity = propertyData.roomCapacity || 1;
    let totalSlots = propertyData.totalSlots || (propertyData.totalRooms || 0) * roomCapacity;
    let availableSlots = propertyData.availableSlots != null ? propertyData.availableSlots : (propertyData.availableRooms || propertyData.totalRooms || 0) * roomCapacity;
    let occupiedSlots = propertyData.occupiedSlots || 0;

    if (action === 'book') {
      if (availableSlots >= occupantCount) {
        availableSlots -= occupantCount;
        occupiedSlots += occupantCount;
      } else {
        return { success: false, error: 'Not enough slots available' };
      }
    } else if (action === 'cancel') {
      if (occupiedSlots >= occupantCount) {
        availableSlots += occupantCount;
        occupiedSlots -= occupantCount;
      }
    }

    // Derive room counts from slots (rounded down)
    const availableRooms = Math.floor(availableSlots / roomCapacity);
    const occupiedRooms = Math.ceil(occupiedSlots / roomCapacity);

    await updateDoc(propertyRef, {
      totalSlots,
      availableSlots,
      occupiedSlots,
      availableRooms,
      occupiedRooms,
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      availableSlots,
      occupiedSlots,
      availableRooms,
      occupiedRooms
    };
  } catch (error) {
    console.error('Update room availability error:', error);
    return { success: false, error: error.message };
  }
};

// Get properties for user feed with advanced filtering
export const getPropertiesForFeed = async (filters = {}, page = 1, limitCount = 20) => {
  try {
    // Query recent properties and apply status + other filters in JS
    // This avoids requiring a composite Firestore index for (status + createdAt).
    let q = query(
      collection(db, 'pg_listings'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    
    const properties = [];
    querySnapshot.forEach((doc) => {
      const propertyData = { ...doc.data(), id: doc.id };
      
      // Apply JavaScript-based filtering to avoid Firestore index issues
      let shouldInclude = true;
      
      // Filter out inactive listings
      if (propertyData.status && propertyData.status !== 'active') {
        shouldInclude = false;
      }

      // Filter by available slots/spaces
      if ((propertyData.availableSlots || 0) <= 0) {
        shouldInclude = false;
      }
      
      // Filter by location
      if (filters.location && propertyData.location) {
        if (!propertyData.location.toLowerCase().includes(filters.location.toLowerCase())) {
          shouldInclude = false;
        }
      }
      
      // Filter by gender
      if (filters.gender && filters.gender !== 'Unisex') {
        if (propertyData.gender !== filters.gender && propertyData.gender !== 'Unisex') {
          shouldInclude = false;
        }
      }
      
      // Filter by room type
      if (filters.roomType && propertyData.roomType !== filters.roomType) {
        shouldInclude = false;
      }
      
      // Filter by price
      if (filters.maxPrice && propertyData.price > parseInt(filters.maxPrice)) {
        shouldInclude = false;
      }
      
      if (filters.minPrice && propertyData.price < parseInt(filters.minPrice)) {
        shouldInclude = false;
      }
      
      if (shouldInclude) {
        properties.push(propertyData);
      }
    });

    return {
      success: true,
      properties,
      total: properties.length
    };
  } catch (error) {
    console.error('Get properties for feed error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Debug function to get all properties (for troubleshooting)
export const getAllPropertiesDebug = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'pg_listings'));
    const properties = [];
    querySnapshot.forEach((doc) => {
      properties.push({ ...doc.data(), id: doc.id });
    });
    
    console.log('All properties in database:', properties);
    return {
      success: true,
      properties,
      total: properties.length
    };
  } catch (error) {
    console.error('Debug get all properties error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
