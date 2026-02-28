// Firebase Configuration
// Replace these values with your actual Firebase project credentials
// Go to Firebase Console -> Project Settings -> Your Apps -> Web App -> Config

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
// IMPORTANT: Replace these with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyCQPFosQ_B0jSIPB6mceBC9BG6R_gfEjYQ",
  authDomain: "resqscan-34e01.firebaseapp.com",
  projectId: "resqscan-34e01",
  storageBucket: "resqscan-34e01.firebasestorage.app",
  messagingSenderId: "285703492436",
  appId: "1:285703492436:web:cabd877639cfcaa612eec1",
  measurementId: "G-KNMJV5X4RY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
