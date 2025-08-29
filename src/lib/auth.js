import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { auth, db } from './firebase';
import { deleteUser } from 'firebase/auth';
import { deleteDoc } from 'firebase/firestore';

// User registration
export const registerUser = async (email, password, userData) => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile with display name
    await updateProfile(user, {
      displayName: userData.fullName
    });

    // Store additional user data in Firestore
    const userDoc = {
      uid: user.uid,
      email: user.email,
      fullName: userData.fullName,
      phone: userData.phone || '',
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
      properties: userData.role === 'owner' ? [] : [],
      favorites: userData.role === 'user' ? [] : [],
      bookings: userData.role === 'user' ? [] : [],
      stayHistory: userData.role === 'user' ? [] : [],
      paymentHistory: userData.role === 'user' ? [] : []
    };

    await setDoc(doc(db, 'users', user.uid), userDoc);

    return {
      success: true,
      user: {
        ...userDoc,
        id: user.uid
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// User login
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        success: true,
        user: {
          ...userData,
          id: user.uid
        }
      };
    } else {
      throw new Error('User data not found');
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// User logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get current user
export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            resolve({
              success: true,
              user: {
                ...userData,
                id: user.uid
              }
            });
          } else {
            resolve({ success: false, error: 'User data not found' });
          }
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      } else {
        resolve({ success: false, user: null });
      }
    });
  });
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  try {
    await setDoc(doc(db, 'users', userId), updates, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Profile update error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete account: best-effort delete from Firestore and Auth
export const deleteAccount = async (userId) => {
  try {
    // Load user doc to determine role
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      // nothing to clean up in Firestore, proceed to try auth deletion
    } else {
      const userData = userDoc.data();
      const role = userData.role || 'user';

      // Delete notifications for this user
      try {
        const nq = query(collection(db, 'notifications'), where('userId', '==', userId));
        const notifSnap = await getDocs(nq);
        const notifDeletes = [];
        notifSnap.forEach(ns => notifDeletes.push(deleteDoc(doc(db, 'notifications', ns.id))));
        await Promise.all(notifDeletes);
      } catch (nErr) {
        console.error('Failed to delete notifications for user:', nErr);
      }

      if (role === 'owner') {
        // For owners: delete their properties and related bookings
        try {
          const pq = query(collection(db, 'pg_listings'), where('ownerId', '==', userId));
          const propSnap = await getDocs(pq);
          for (const pdoc of propSnap.docs) {
            const propId = pdoc.id;

            // Delete bookings for this property
            try {
              const bq = query(collection(db, 'bookings'), where('propertyId', '==', propId));
              const bSnap = await getDocs(bq);
              const delBookings = [];
              bSnap.forEach(b => delBookings.push(deleteDoc(doc(db, 'bookings', b.id))));
              await Promise.all(delBookings);
            } catch (bErr) {
              console.error('Failed to delete bookings for property', propId, bErr);
            }

            // Delete the property itself
            try {
              await deleteDoc(doc(db, 'pg_listings', propId));
            } catch (pdErr) {
              console.error('Failed to delete property', propId, pdErr);
            }
          }
        } catch (propErr) {
          console.error('Failed to enumerate properties for owner:', propErr);
        }
      } else {
        // For normal users: delete their bookings
        try {
          const bq = query(collection(db, 'bookings'), where('userId', '==', userId));
          const bSnap = await getDocs(bq);
          const delBookings = [];
          bSnap.forEach(b => delBookings.push(deleteDoc(doc(db, 'bookings', b.id))));
          await Promise.all(delBookings);
        } catch (bErr) {
          console.error('Failed to delete user bookings:', bErr);
        }
      }

      // Finally delete the user document
      try {
        await deleteDoc(userRef);
      } catch (uErr) {
        console.error('Failed to delete user doc:', uErr);
      }
    }

    // Attempt to delete Firebase Auth user if the SDK has a signed-in user
    const current = auth.currentUser;
    if (current && current.uid === userId) {
      try {
        await deleteUser(current);
        return { success: true };
      } catch (authErr) {
        // Deleting an Auth user may fail if recent authentication is required.
        console.error('Auth delete failed (reauth required?):', authErr);
        // Sign the user out so they must re-auth and can then delete their account.
        try { await auth.signOut(); } catch (sErr) { /* ignore */ }
        return { success: false, error: 'Auth delete failed. Please re-authenticate and try again.' };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Delete account error:', error);
    return { success: false, error: error.message };
  }
};
