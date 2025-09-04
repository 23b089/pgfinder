import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase config is read from environment variables so the repo doesn't
// contain credentials. For client-side usage keep keys under NEXT_PUBLIC_.
const firebaseConfig = {
  apiKey: "AIzaSyDWP5DWdUwObv7K7JWOgyh2AMU5iISBkm0",
  authDomain: "pgfinder-445c8.firebaseapp.com",
  projectId: "pgfinder-445c8",
  storageBucket: "pgfinder-445c8.firebasestorage.app",
  messagingSenderId: "880699347323",
  appId: "1:880699347323:web:903e15b23f62cc8714edde",
  measurementId: "G-P1R7JX19N8"
};

// Validate minimal config early so we fail fast with a helpful message instead of
// a cryptic Firebase error like auth/invalid-api-key at runtime.
const REQUIRED_MINIMAL = ['apiKey', 'projectId', 'appId'];
const missingMinimal = REQUIRED_MINIMAL.filter(k => !firebaseConfig[k]);
if (missingMinimal.length) {
  // Map internal keys to the common NEXT_PUBLIC env var names (with underscores)
  const ENV_NAME_MAP = {
    apiKey: 'NEXT_PUBLIC_FIREBASE_API_KEY',
    projectId: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    appId: 'NEXT_PUBLIC_FIREBASE_APP_ID',
  };
  const names = missingMinimal.map(n => ENV_NAME_MAP[n] || `NEXT_PUBLIC_FIREBASE_${n.toUpperCase()}`).join(', ');
  // For local development, users should create a .env.local or set env vars.
  const msg = `Missing Firebase environment variables: ${names}.\n` +
    `Set the variables in a local .env (see .env.example) or in your hosting provider (e.g. Vercel) under the same names.\n` +
    `Example:\nNEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here\nNEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id\nNEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here`;
  // Throw so build/runtime stops with clear guidance. Avoid top-level console usage.
  throw new Error(msg);
}

// Initialize Firebase app only once (prevents issues in hot-reload)
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firebase services and export them for use across the app.
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;