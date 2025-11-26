import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// CONFIGURATION INSTRUCTIONS:
// 1. Create a project at https://console.firebase.google.com/
// 2. Enable "Firestore Database" in the Firebase Console.
// 3. Copy your web app configuration below.
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// We wrap initialization in a check so the app doesn't crash if config is missing.
const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

export const app = isConfigured ? initializeApp(firebaseConfig) : null;
export const db = isConfigured && app ? getFirestore(app) : null;

export const isFirebaseReady = () => !!db;