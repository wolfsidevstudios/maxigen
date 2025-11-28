
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, OAuthProvider } from 'firebase/auth';

// User provided configuration
const firebaseConfig = {
    apiKey: "AIzaSyALmX4xk9t4PbRK_3MSl3wxMyEayK9tbBI",
    authDomain: "wolfsi-studios.firebaseapp.com",
    projectId: "wolfsi-studios",
    storageBucket: "wolfsi-studios.firebasestorage.app",
    messagingSenderId: "562922803230",
    appId: "1:562922803230:web:e3140287e5d7f7dc275e0f",
    measurementId: "G-P591NJDE4J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exports
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const yahooProvider = new OAuthProvider('yahoo.com');

export const isFirebaseReady = () => !!app;
