import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDWP5DWdUwObv7K7JWOgyh2AMU5iISBkm0",
  authDomain: "pgfinder-445c8.firebaseapp.com",
  projectId: "pgfinder-445c8",
  storageBucket: "pgfinder-445c8.firebasestorage.app",
  messagingSenderId: "880699347323",
  appId: "1:880699347323:web:903e15b23f62cc8714edde",
  measurementId: "G-P1R7JX19N8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;