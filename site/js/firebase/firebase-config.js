/**
 * Firebase Configuration
 * Handles Firebase initialization and exports auth/firestore instances
 */

import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithPopup,
    signInAnonymously,
    GoogleAuthProvider,
    onAuthStateChanged,
    linkWithPopup,
    signOut
} from 'firebase/auth';
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
} from 'firebase/firestore';

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