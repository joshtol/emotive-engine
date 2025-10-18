#!/usr/bin/env node

/**
 * Firebase Setup Script
 * Initializes Firestore collections and structure for Emotive Engine
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf8'));

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setupFirestore() {
    console.log('🔥 Setting up Firestore database structure...\n');

    try {
        // 1. Create sample user structure
        console.log('Creating sample user document structure...');
        const sampleUser = {
            displayName: 'Sample User',
            photoURL: null,
            email: 'sample@example.com',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastActive: admin.firestore.FieldValue.serverTimestamp(),
            isAnonymous: false,

            // User preferences
            preferences: {
                theme: 'dark',
                volume: 0.5,
                particleQuality: 'high',
                autoplay: true,
                rhythmSensitivity: 0.7
            },

            // Stats and achievements
            stats: {
                totalGestures: 0,
                totalCombos: 0,
                favoriteGesture: null,
                sessionsCount: 0,
                totalPlayTime: 0
            },

            // Arrays for user content
            discoveredCombos: [],
            savedGrooves: [],
            favorites: []
        };

        // Create a sample user doc (will be deleted)
        const sampleUserRef = db.collection('users').doc('sample_user');
        await sampleUserRef.set(sampleUser);
        console.log('✅ User structure created\n');

        // 2. Create combos collection
        console.log('Creating combos collection...');
        const sampleCombo = {
            name: 'Cosmic Spin',
            description: 'A mesmerizing combination',
            gestures: ['spin', 'sparkle', 'orbit'],
            timing: [0, 200, 400], // milliseconds
            discoveredBy: 'sample_user',
            discoveredAt: admin.firestore.FieldValue.serverTimestamp(),
            likes: 0,
            plays: 0,
            tags: ['energetic', 'visual'],
            isPublic: true,
            difficulty: 'medium'
        };

        await db.collection('combos').doc('sample_combo').set(sampleCombo);
        console.log('✅ Combos collection created\n');

        // 3. Create grooves collection
        console.log('Creating grooves collection...');
        const sampleGroove = {
            name: 'Chill Vibes',
            bpm: 90,
            baseMovement: 'grooveSway',
            accentGestures: ['pulse', 'glow'],
            emotionalTone: 'relaxed',
            createdBy: 'sample_user',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isPublic: true,
            likes: 0,
            plays: 0
        };

        await db.collection('grooves').doc('sample_groove').set(sampleGroove);
        console.log('✅ Grooves collection created\n');

        // 4. Create global stats document
        console.log('Creating global stats...');
        await db.collection('stats').doc('global').set({
            totalUsers: 0,
            totalCombos: 0,
            totalGrooves: 0,
            totalGestures: 0,
            mostPopularGesture: null,
            mostPopularCombo: null,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Global stats created\n');

        // 5. Clean up sample documents
        console.log('Cleaning up sample documents...');
        await sampleUserRef.delete();
        await db.collection('combos').doc('sample_combo').delete();
        await db.collection('grooves').doc('sample_groove').delete();
        console.log('✅ Cleanup complete\n');

        console.log('🎉 Firestore setup complete!');
        console.log('\nCollections created:');
        console.log('  - users/');
        console.log('  - combos/');
        console.log('  - grooves/');
        console.log('  - stats/');

    } catch (error) {
        console.error('❌ Error setting up Firestore:', error);
    }
}

async function createSecurityRules() {
    console.log('\n📝 Security Rules to add in Firebase Console:\n');

    const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function isValidCombo() {
      return request.resource.data.keys().hasAll(['name', 'gestures', 'timing']) &&
             request.resource.data.gestures is list &&
             request.resource.data.timing is list;
    }

    // Users can read their own data, update their own profile
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if false; // Prevent accidental deletion
    }

    // Public combos are readable by all, writable by creator
    match /combos/{comboId} {
      allow read: if resource.data.isPublic == true || isOwner(resource.data.discoveredBy);
      allow create: if isSignedIn() && isValidCombo();
      allow update: if isOwner(resource.data.discoveredBy);
      allow delete: if isOwner(resource.data.discoveredBy);
    }

    // Public grooves are readable by all, writable by creator
    match /grooves/{grooveId} {
      allow read: if resource.data.isPublic == true || isOwner(resource.data.createdBy);
      allow create: if isSignedIn();
      allow update: if isOwner(resource.data.createdBy);
      allow delete: if isOwner(resource.data.createdBy);
    }

    // Global stats are read-only for users
    match /stats/{document} {
      allow read: if true;
      allow write: if false; // Only server can update
    }
  }
}`;

    console.log(rules);
    console.log('\n👆 Copy these rules to: Firebase Console → Firestore → Rules\n');
}

// Run setup
(async () => {
    await setupFirestore();
    await createSecurityRules();
    process.exit(0);
})();