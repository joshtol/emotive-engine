/*!
 * Emotive Engine™ - Proprietary and Confidential
 * Copyright (c) 2025 Emotive Engine. All Rights Reserved.
 *
 * NOTICE: This code is proprietary and confidential. Unauthorized copying,
 * modification, or distribution is strictly prohibited and may result in
 * legal action. This software is licensed, not sold.
 *
 * Website: https://emotiveengine.com
 * License: https://emotive-engine.web.app/LICENSE.md
 */
/**
 * Firebase Configuration
 * Handles Firebase initialization and exports auth/firestore instances
 */

// Import Firebase from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signInAnonymously,
    GoogleAuthProvider,
    onAuthStateChanged,
    linkWithPopup,
    linkWithRedirect,
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

// Set persistence to local (survives browser refresh)
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log('Auth persistence set to LOCAL');
    })
    .catch((error) => {
        console.error('Error setting auth persistence:', error);
    });

// Auth providers
export const googleProvider = new GoogleAuthProvider();

// Export auth methods
export {
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signInAnonymously,
    onAuthStateChanged,
    linkWithPopup,
    linkWithRedirect,
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

// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.