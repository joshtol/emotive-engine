/**
 * Firebase Configuration
 * Handles Firebase initialization and exports auth/firestore instances
 */

// Import Firebase from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getAuth,
    signInWithPopup,
    signInAnonymously,
    GoogleAuthProvider,
    onAuthStateChanged,
    linkWithPopup,
    signOut
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    increment
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD4i0QMfbknNrHkTunBYpVKFma429707Wc",
    authDomain: "emotive-engine.firebaseapp.com",
    projectId: "emotive-engine",
    storageBucket: "emotive-engine.firebasestorage.app",
    messagingSenderId: "312651506267",
    appId: "1:312651506267:web:2f159e5ca265d61084157e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth providers
export const googleProvider = new GoogleAuthProvider();

// Export auth methods
export {
    signInWithPopup,
    signInAnonymously,
    onAuthStateChanged,
    linkWithPopup,
    signOut
};

// Export Firestore methods
export {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    increment
};

// Export the app instance
export default app;