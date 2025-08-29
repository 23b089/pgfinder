# Firestore Setup Guide

## 🔧 Fixing "Missing or insufficient permissions" Error

The error you're encountering is due to Firestore security rules that are preventing write operations. Here's how to fix it:

### Step 1: Deploy Security Rules

You have two options for security rules:

#### Option A: Simple Rules (For Development/Testing)
Use the simple rules that allow all authenticated users to read and write:

```javascript
// Copy content from firestore.rules.simple
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Option B: Production-Ready Rules (Recommended)
Use the comprehensive rules that provide proper role-based access:

```javascript
// Copy content from firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // PG Listings collection - authenticated users can read, owners can write
    match /pg_listings/{listingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.ownerId;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.ownerId;
    }
    
    // Bookings collection - users can read their own bookings, create new bookings
    match /bookings/{bookingId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.uid == resource.data.ownerId);
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.uid == resource.data.ownerId);
    }
    
    // Notifications collection - users can read their own notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### Step 2: Deploy Rules to Firebase

#### Using Firebase CLI:
1. Install Firebase CLI if you haven't:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project (if not already done):
   ```bash
   firebase init firestore
   ```

4. Deploy the security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

#### Using Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Firestore Database
4. Click on "Rules" tab
5. Copy and paste the security rules
6. Click "Publish"

### Step 3: Verify Authentication

Make sure your user is properly authenticated before adding PGs:

1. Check if the user is logged in
2. Verify the user has the 'owner' role
3. Ensure the user document exists in Firestore

### Step 4: Test the Fix

1. Try adding a PG again
2. Check the browser console for any additional errors
3. Verify the PG appears in the owner dashboard

## 🔍 Troubleshooting

### Common Issues:

1. **User not authenticated**: Make sure you're logged in before adding PGs
2. **User role not set**: Ensure the user has 'owner' role in their user document
3. **Rules not deployed**: Verify the security rules are published to Firebase
4. **Collection doesn't exist**: The collection will be created automatically on first write

### Debug Steps:

1. **Check Authentication Status**:
   ```javascript
   // In browser console
   firebase.auth().currentUser
   ```

2. **Check User Role**:
   ```javascript
   // In browser console
   firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
   ```

3. **Test Write Permission**:
   ```javascript
   // In browser console
   firebase.firestore().collection('pg_listings').add({
     test: true,
     ownerId: firebase.auth().currentUser.uid
   })
   ```

## 📋 Required Collections

Make sure these collections exist in your Firestore database:

- `users` - User profiles and authentication data
- `pg_listings` - PG property listings
- `bookings` - Booking information
- `notifications` - User notifications

## 🚀 Quick Fix for Development

If you want to quickly test the application without setting up complex rules, use the simple rules:

1. Copy the content from `firestore.rules.simple`
2. Deploy it to Firebase
3. Test adding PGs

**Note**: The simple rules allow any authenticated user to read/write all data. Only use this for development/testing.

## 🔒 Production Security

For production, always use the comprehensive security rules that:
- Restrict users to their own data
- Allow owners to manage only their PGs
- Prevent unauthorized access to sensitive information

## 📞 Support

If you continue to have issues:
1. Check the Firebase Console for error logs
2. Verify your Firebase configuration in `src/lib/firebase.js`
3. Ensure all required Firebase services are enabled
4. Check that your Firebase project has Firestore enabled
