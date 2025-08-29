# Firebase Setup Guide for PG Finder

This guide will help you set up Firebase for your PG Finder application.

## Prerequisites

1. A Google account
2. Node.js and npm installed
3. Firebase CLI (optional but recommended)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "pgfinder-app")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project console, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication:
   - Click on "Email/Password"
   - Toggle the "Enable" switch
   - Click "Save"

## Step 3: Create Firestore Database

1. In your Firebase project console, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development (you can secure it later)
4. Select a location for your database (choose the closest to your users)
5. Click "Done"

## Step 4: Set up Storage (for images)

1. In your Firebase project console, go to "Storage" in the left sidebar
2. Click "Get started"
3. Choose "Start in test mode" for development
4. Select a location for your storage bucket
5. Click "Done"

## Step 5: Get Firebase Configuration

1. In your Firebase project console, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "pgfinder-web")
6. Copy the Firebase configuration object

## Step 6: Update Firebase Configuration

1. Open `src/lib/firebase.js` in your project
2. Replace the placeholder configuration with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Step 7: Set up Firestore Security Rules

1. In your Firebase console, go to "Firestore Database" → "Rules"
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Properties can be read by anyone, but only owners can write
    match /properties/{propertyId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.ownerId;
    }
    
    // Bookings can be read and written by the user who created them
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Stay history can be read and written by the user
    match /stayHistory/{stayId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Payments can be read and written by the user
    match /payments/{paymentId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## Step 8: Set up Storage Security Rules

1. In your Firebase console, go to "Storage" → "Rules"
2. Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow users to upload images for their properties
    match /properties/{propertyId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Step 9: Create Firestore Indexes (if needed)

If you encounter index errors when running queries, you'll need to create composite indexes:

1. Go to "Firestore Database" → "Indexes"
2. Click "Create index"
3. Add the required fields based on your queries

Common indexes you might need:
- Collection: `properties`
  - Fields: `ownerId` (Ascending), `createdAt` (Descending)
- Collection: `properties`
  - Fields: `status` (Ascending), `createdAt` (Descending)
- Collection: `bookings`
  - Fields: `userId` (Ascending), `createdAt` (Descending)

## Step 10: Test Your Setup

1. Start your development server: `npm run dev`
2. Try to register a new user
3. Try to log in with the registered user
4. Check your Firebase console to see if data is being created

## Environment Variables (Optional but Recommended)

For better security, you can use environment variables:

1. Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

2. Update `src/lib/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};
```

## Troubleshooting

### Common Issues:

1. **"Firebase App named '[DEFAULT]' already exists"**
   - This usually happens in development with hot reloading
   - The current setup should handle this automatically

2. **"Missing or insufficient permissions"**
   - Check your Firestore security rules
   - Make sure you're authenticated when making requests

3. **"Index not found"**
   - Create the required composite indexes in Firestore
   - Wait for indexes to build (can take a few minutes)

4. **"Storage permission denied"**
   - Check your Storage security rules
   - Make sure the user is authenticated

### Testing Authentication:

You can test if Firebase is working by checking the browser console for any errors and verifying that:
- User registration creates entries in Authentication
- User data is stored in Firestore
- Login works correctly

## Next Steps

Once Firebase is set up:

1. Test all authentication flows (signup, login, logout)
2. Test property creation and management
3. Test booking and payment systems
4. Set up proper security rules for production
5. Consider setting up Firebase Analytics for insights

## Production Considerations

Before deploying to production:

1. Update security rules to be more restrictive
2. Set up proper authentication methods
3. Configure Firebase Hosting (if needed)
4. Set up monitoring and alerts
5. Consider using Firebase Functions for server-side logic
6. Set up proper backup strategies

## Support

If you encounter issues:
1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Review the [Firebase Console](https://console.firebase.google.com/) for error logs
3. Check the browser console for client-side errors
4. Verify your configuration matches the Firebase console settings
