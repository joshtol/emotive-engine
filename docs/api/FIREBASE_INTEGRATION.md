# Firebase Integration Guide

This guide covers how to integrate Firebase with the Emotive Engine for social features, persistence, and real-time synchronization.

## Table of Contents
- [Overview](#overview)
- [Setup](#setup)
- [Authentication](#authentication)
- [Real-time Database](#real-time-database)
- [Cloud Firestore](#cloud-firestore)
- [Social Features](#social-features)
- [Leaderboards](#leaderboards)
- [Cloud Functions](#cloud-functions)
- [Security Rules](#security-rules)
- [Best Practices](#best-practices)

## Overview

Firebase integration enables:
- **User Authentication** - Sign in with Google, email, anonymous
- **Data Persistence** - Save recordings, preferences, scores
- **Real-time Sync** - Multi-user experiences, live reactions
- **Social Features** - Share gestures, compete with friends
- **Analytics** - Track usage, popular gestures, engagement

### Architecture

```
┌─────────────────────────────────────────┐
│            Client (Browser)              │
├─────────────────────────────────────────┤
│         Emotive Engine                   │
│              ↓                           │
│      Firebase Integration Layer          │
├─────────────────────────────────────────┤
│         Firebase SDK                     │
│    ├── Authentication                    │
│    ├── Firestore / Realtime DB          │
│    ├── Cloud Storage                     │
│    └── Analytics                         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Firebase Backend                 │
│    ├── Cloud Functions                   │
│    ├── Security Rules                    │
│    └── Admin SDK                         │
└─────────────────────────────────────────┘
```

## Setup

### 1. Install Firebase

```html
<!-- Add Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-database-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-storage-compat.js"></script>
```

Or with npm:

```bash
npm install firebase
```

### 2. Initialize Firebase

Create `firebase-config.js`:

```javascript
// Your Firebase configuration
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id",
    measurementId: "your-measurement-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get references
const auth = firebase.auth();
const db = firebase.firestore();
const rtdb = firebase.database();
const storage = firebase.storage();

export { auth, db, rtdb, storage };
```

### 3. Create Firebase Integration Module

```javascript
import { auth, db, rtdb } from './firebase-config.js';

export class FirebaseIntegration {
    constructor(mascot) {
        this.mascot = mascot;
        this.user = null;
        this.listeners = [];

        this.setupAuthListener();
    }

    setupAuthListener() {
        auth.onAuthStateChanged((user) => {
            this.user = user;
            this.mascot.emit('auth:stateChanged', { user });

            if (user) {
                this.loadUserData();
                this.setupRealtimeListeners();
            } else {
                this.cleanup();
            }
        });
    }

    async loadUserData() {
        if (!this.user) return;

        try {
            const doc = await db.collection('users').doc(this.user.uid).get();
            if (doc.exists) {
                const userData = doc.data();
                this.mascot.emit('user:dataLoaded', userData);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    cleanup() {
        this.listeners.forEach(unsubscribe => unsubscribe());
        this.listeners = [];
    }
}
```

## Authentication

### Sign In Methods

```javascript
class AuthManager {
    // Google Sign In
    async signInWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();

        try {
            const result = await auth.signInWithPopup(provider);
            const user = result.user;

            // Create/update user profile
            await this.createUserProfile(user);

            return user;
        } catch (error) {
            console.error('Google sign in error:', error);
            throw error;
        }
    }

    // Email/Password Sign In
    async signInWithEmail(email, password) {
        try {
            const result = await auth.signInWithEmailAndPassword(email, password);
            return result.user;
        } catch (error) {
            console.error('Email sign in error:', error);
            throw error;
        }
    }

    // Anonymous Sign In
    async signInAnonymously() {
        try {
            const result = await auth.signInAnonymously();
            return result.user;
        } catch (error) {
            console.error('Anonymous sign in error:', error);
            throw error;
        }
    }

    // Sign Out
    async signOut() {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    }

    // Create User Profile
    async createUserProfile(user) {
        const userRef = db.collection('users').doc(user.uid);

        const snapshot = await userRef.get();
        if (!snapshot.exists) {
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                preferences: {
                    particleIntensity: 0.8,
                    soundEnabled: true,
                    favoriteEmotion: 'happy'
                },
                stats: {
                    totalGestures: 0,
                    totalPlaytime: 0,
                    favoriteGesture: null
                }
            };

            await userRef.set(userData);
        }

        return userRef;
    }
}
```

## Real-time Database

### Saving Mascot State

```javascript
class StateSync {
    constructor(mascot, userId) {
        this.mascot = mascot;
        this.userId = userId;
        this.stateRef = rtdb.ref(`states/${userId}`);

        this.setupSync();
    }

    setupSync() {
        // Listen for local changes
        this.mascot.on('emotion', this.syncEmotion.bind(this));
        this.mascot.on('gesture', this.syncGesture.bind(this));

        // Listen for remote changes
        this.stateRef.on('value', this.handleRemoteChange.bind(this));
    }

    async syncEmotion(data) {
        await this.stateRef.update({
            emotion: data.emotion,
            undertone: data.undertone,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    }

    async syncGesture(data) {
        await this.stateRef.child('lastGesture').set({
            name: data.gesture,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    }

    handleRemoteChange(snapshot) {
        const state = snapshot.val();
        if (state && state.timestamp > this.lastSync) {
            // Apply remote state
            if (state.emotion) {
                this.mascot.setEmotion(state.emotion, state.undertone);
            }
        }
    }
}
```

### Live Reactions

```javascript
class LiveReactions {
    constructor(roomId) {
        this.roomId = roomId;
        this.reactionsRef = rtdb.ref(`rooms/${roomId}/reactions`);
    }

    sendReaction(type, userId) {
        const reaction = {
            type,  // 'heart', 'star', 'laugh', etc.
            userId,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };

        // Push reaction
        this.reactionsRef.push(reaction);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            this.reactionsRef.child(reaction.key).remove();
        }, 5000);
    }

    onReaction(callback) {
        this.reactionsRef.on('child_added', (snapshot) => {
            const reaction = snapshot.val();
            callback(reaction);
        });
    }
}
```

## Cloud Firestore

### Saving Recordings

```javascript
class RecordingManager {
    async saveRecording(recording, metadata) {
        if (!auth.currentUser) {
            throw new Error('User must be authenticated');
        }

        const recordingData = {
            userId: auth.currentUser.uid,
            name: metadata.name || 'Untitled Recording',
            duration: recording.duration,
            timeline: recording.timeline,
            thumbnail: metadata.thumbnail,
            public: metadata.public || false,
            tags: metadata.tags || [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            stats: {
                views: 0,
                likes: 0,
                shares: 0
            }
        };

        try {
            const docRef = await db.collection('recordings').add(recordingData);
            return docRef.id;
        } catch (error) {
            console.error('Error saving recording:', error);
            throw error;
        }
    }

    async loadRecording(recordingId) {
        try {
            const doc = await db.collection('recordings').doc(recordingId).get();

            if (!doc.exists) {
                throw new Error('Recording not found');
            }

            // Increment view count
            await doc.ref.update({
                'stats.views': firebase.firestore.FieldValue.increment(1)
            });

            return doc.data();
        } catch (error) {
            console.error('Error loading recording:', error);
            throw error;
        }
    }

    async getUserRecordings(userId) {
        try {
            const snapshot = await db.collection('recordings')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error loading user recordings:', error);
            throw error;
        }
    }
}
```

### User Preferences

```javascript
class PreferencesManager {
    async savePreferences(preferences) {
        if (!auth.currentUser) return;

        const userRef = db.collection('users').doc(auth.currentUser.uid);

        await userRef.update({
            preferences,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    async loadPreferences() {
        if (!auth.currentUser) return null;

        const doc = await db.collection('users')
            .doc(auth.currentUser.uid)
            .get();

        return doc.exists ? doc.data().preferences : null;
    }

    onPreferencesChange(callback) {
        if (!auth.currentUser) return;

        return db.collection('users')
            .doc(auth.currentUser.uid)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    callback(doc.data().preferences);
                }
            });
    }
}
```

## Social Features

### Sharing Gestures

```javascript
class GestureSharing {
    async shareGesture(gesture, message) {
        if (!auth.currentUser) return;

        const share = {
            userId: auth.currentUser.uid,
            userName: auth.currentUser.displayName,
            gesture: gesture,
            message: message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            likes: [],
            comments: []
        };

        const docRef = await db.collection('shared_gestures').add(share);
        return docRef.id;
    }

    async likeGesture(gestureId) {
        if (!auth.currentUser) return;

        const gestureRef = db.collection('shared_gestures').doc(gestureId);

        await gestureRef.update({
            likes: firebase.firestore.FieldValue.arrayUnion(auth.currentUser.uid)
        });
    }

    async getPublicGestures(limit = 20) {
        const snapshot = await db.collection('shared_gestures')
            .where('public', '==', true)
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
}
```

### Friend System

```javascript
class FriendManager {
    async sendFriendRequest(targetUserId) {
        if (!auth.currentUser) return;

        const request = {
            from: auth.currentUser.uid,
            to: targetUserId,
            status: 'pending',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('friend_requests').add(request);
    }

    async acceptFriendRequest(requestId) {
        const batch = db.batch();

        // Update request status
        const requestRef = db.collection('friend_requests').doc(requestId);
        batch.update(requestRef, { status: 'accepted' });

        // Add to both users' friend lists
        const request = await requestRef.get();
        const data = request.data();

        const user1Ref = db.collection('users').doc(data.from);
        const user2Ref = db.collection('users').doc(data.to);

        batch.update(user1Ref, {
            friends: firebase.firestore.FieldValue.arrayUnion(data.to)
        });

        batch.update(user2Ref, {
            friends: firebase.firestore.FieldValue.arrayUnion(data.from)
        });

        await batch.commit();
    }

    async getFriends() {
        if (!auth.currentUser) return [];

        const doc = await db.collection('users')
            .doc(auth.currentUser.uid)
            .get();

        const friendIds = doc.data()?.friends || [];

        // Get friend details
        const friends = await Promise.all(
            friendIds.map(async (id) => {
                const friendDoc = await db.collection('users').doc(id).get();
                return { id, ...friendDoc.data() };
            })
        );

        return friends;
    }
}
```

## Leaderboards

### Score Management

```javascript
class LeaderboardManager {
    async submitScore(score, category = 'overall') {
        if (!auth.currentUser) return;

        const entry = {
            userId: auth.currentUser.uid,
            userName: auth.currentUser.displayName,
            score: score,
            category: category,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Add to scores collection
        await db.collection('scores').add(entry);

        // Update user's high score
        const userRef = db.collection('users').doc(auth.currentUser.uid);
        const userData = await userRef.get();
        const currentHighScore = userData.data()?.highScores?.[category] || 0;

        if (score > currentHighScore) {
            await userRef.update({
                [`highScores.${category}`]: score
            });
        }
    }

    async getLeaderboard(category = 'overall', limit = 10) {
        const snapshot = await db.collection('users')
            .orderBy(`highScores.${category}`, 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map((doc, index) => ({
            rank: index + 1,
            userId: doc.id,
            userName: doc.data().displayName,
            score: doc.data().highScores?.[category] || 0
        }));
    }

    async getUserRank(userId, category = 'overall') {
        const userDoc = await db.collection('users').doc(userId).get();
        const userScore = userDoc.data()?.highScores?.[category] || 0;

        const higherScores = await db.collection('users')
            .where(`highScores.${category}`, '>', userScore)
            .get();

        return higherScores.size + 1;
    }
}
```

### Daily Challenges

```javascript
class ChallengeManager {
    async getTodayChallenge() {
        const today = new Date().toISOString().split('T')[0];

        const doc = await db.collection('challenges')
            .doc(today)
            .get();

        if (!doc.exists) {
            // Generate new challenge
            return this.generateDailyChallenge(today);
        }

        return doc.data();
    }

    async submitChallengeScore(score) {
        if (!auth.currentUser) return;

        const today = new Date().toISOString().split('T')[0];

        const submission = {
            userId: auth.currentUser.uid,
            userName: auth.currentUser.displayName,
            score: score,
            date: today,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('challenge_scores').add(submission);
    }

    async generateDailyChallenge(date) {
        const challenges = [
            { type: 'gesture_chain', target: ['bounce', 'spin', 'wave'], points: 100 },
            { type: 'rhythm_accuracy', bpm: 120, duration: 30000, points: 150 },
            { type: 'emotion_sequence', emotions: ['happy', 'excited', 'calm'], points: 80 }
        ];

        const challenge = challenges[Math.floor(Math.random() * challenges.length)];
        challenge.date = date;

        await db.collection('challenges').doc(date).set(challenge);
        return challenge;
    }
}
```

## Cloud Functions

### Server-side Functions

Create `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Clean up old reactions
exports.cleanupReactions = functions.pubsub
    .schedule('every 1 hours')
    .onRun(async (context) => {
        const cutoff = Date.now() - (60 * 60 * 1000); // 1 hour ago

        const snapshot = await admin.database()
            .ref('reactions')
            .orderByChild('timestamp')
            .endAt(cutoff)
            .once('value');

        const deletions = [];
        snapshot.forEach((child) => {
            deletions.push(child.ref.remove());
        });

        await Promise.all(deletions);
        console.log(`Deleted ${deletions.length} old reactions`);
    });

// Calculate user statistics
exports.updateUserStats = functions.firestore
    .document('events/{eventId}')
    .onCreate(async (snap, context) => {
        const event = snap.data();

        if (event.type === 'gesture') {
            // Update gesture count
            await admin.firestore()
                .collection('users')
                .doc(event.userId)
                .update({
                    'stats.totalGestures': admin.firestore.FieldValue.increment(1)
                });
        }
    });

// Generate thumbnail for recording
exports.generateThumbnail = functions.firestore
    .document('recordings/{recordingId}')
    .onCreate(async (snap, context) => {
        const recording = snap.data();

        // Generate thumbnail from first frame
        // This would involve server-side canvas rendering
        const thumbnail = await generateThumbnailFromTimeline(recording.timeline);

        await snap.ref.update({ thumbnail });
    });
```

## Security Rules

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Public recordings
    match /recordings/{recordingId} {
      allow read: if resource.data.public == true ||
                     request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.userId;
      allow delete: if request.auth.uid == resource.data.userId;
    }

    // Shared gestures
    match /shared_gestures/{gestureId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.userId ||
                      request.auth.uid in resource.data.likes;
      allow delete: if request.auth.uid == resource.data.userId;
    }

    // Scores - write once, read all
    match /scores/{scoreId} {
      allow read: if true;
      allow create: if request.auth != null &&
                      request.auth.uid == request.resource.data.userId;
      allow update: if false;
      allow delete: if false;
    }
  }
}
```

### Realtime Database Rules

```json
{
  "rules": {
    "states": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "rooms": {
      "$roomId": {
        "reactions": {
          ".read": true,
          ".write": "auth != null"
        },
        "participants": {
          ".read": true,
          "$userId": {
            ".write": "auth != null && auth.uid == $userId"
          }
        }
      }
    }
  }
}
```

## Best Practices

### 1. Offline Support

```javascript
// Enable offline persistence
db.enablePersistence()
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open
      console.log('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // Browser doesn't support
      console.log('Persistence not supported');
    }
  });

// Use cache-first for user data
const getUserData = async (userId) => {
  try {
    // Try cache first
    const doc = await db.collection('users')
      .doc(userId)
      .get({ source: 'cache' });

    if (doc.exists) {
      return doc.data();
    }
  } catch (error) {
    // Fall back to server
    const doc = await db.collection('users')
      .doc(userId)
      .get({ source: 'server' });

    return doc.data();
  }
};
```

### 2. Batch Operations

```javascript
// Batch multiple writes
async function batchUpdate(updates) {
  const batch = db.batch();

  updates.forEach(({ ref, data }) => {
    batch.update(ref, data);
  });

  await batch.commit();
}
```

### 3. Optimize Queries

```javascript
// Use compound indexes
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "recordings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### 4. Rate Limiting

```javascript
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }

    return false;
  }
}

const limiter = new RateLimiter();

async function saveAction(action) {
  if (!limiter.canMakeRequest()) {
    throw new Error('Rate limit exceeded');
  }

  await db.collection('actions').add(action);
}
```

### 5. Error Handling

```javascript
class FirebaseErrorHandler {
  handle(error) {
    switch (error.code) {
      case 'permission-denied':
        console.error('Permission denied. Check security rules.');
        break;
      case 'unavailable':
        console.error('Service unavailable. Retrying...');
        this.retry();
        break;
      case 'unauthenticated':
        console.error('User not authenticated');
        this.redirectToLogin();
        break;
      default:
        console.error('Firebase error:', error);
    }
  }

  retry() {
    setTimeout(() => {
      // Retry operation
    }, 5000);
  }

  redirectToLogin() {
    window.location.href = '/login';
  }
}
```

## Integration Example

### Complete Integration

```javascript
import EmotiveMascot from './EmotiveMascotPublic.js';
import { FirebaseIntegration } from './FirebaseIntegration.js';

class EmotiveFirebaseApp {
  constructor() {
    this.mascot = null;
    this.firebase = null;
  }

  async init() {
    // Initialize mascot
    this.mascot = new EmotiveMascot();
    await this.mascot.init(document.getElementById('canvas'));

    // Initialize Firebase integration
    this.firebase = new FirebaseIntegration(this.mascot);

    // Set up event listeners
    this.setupEventListeners();

    // Start
    this.mascot.start();
  }

  setupEventListeners() {
    // Auth state
    this.mascot.on('auth:stateChanged', ({ user }) => {
      if (user) {
        this.onUserSignedIn(user);
      } else {
        this.onUserSignedOut();
      }
    });

    // Gesture performed
    this.mascot.on('gesture', async (data) => {
      if (this.firebase.user) {
        await this.firebase.trackGesture(data);
      }
    });

    // Recording saved
    this.mascot.on('recording:saved', async (recording) => {
      if (this.firebase.user) {
        const id = await this.firebase.saveRecording(recording);
        console.log('Recording saved with ID:', id);
      }
    });
  }

  async onUserSignedIn(user) {
    console.log('User signed in:', user.displayName);

    // Load preferences
    const prefs = await this.firebase.loadPreferences();
    if (prefs) {
      this.mascot.applyPreferences(prefs);
    }

    // Show social features
    this.enableSocialFeatures();
  }

  onUserSignedOut() {
    console.log('User signed out');
    this.disableSocialFeatures();
  }

  enableSocialFeatures() {
    // Enable sharing, leaderboards, etc.
    document.getElementById('social-panel').style.display = 'block';
  }

  disableSocialFeatures() {
    document.getElementById('social-panel').style.display = 'none';
  }
}

// Initialize app
const app = new EmotiveFirebaseApp();
app.init();
```

## Summary

Firebase integration provides:
- **Authentication** - Secure user management
- **Real-time Sync** - Live collaboration features
- **Data Persistence** - Cloud storage for recordings
- **Social Features** - Sharing, friends, leaderboards
- **Analytics** - Usage tracking and insights

The modular architecture keeps Firebase logic separate from the core engine, maintaining clean separation of concerns.

---

For more information:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Getting Started Guide](./GETTING_STARTED.md)
- [API Reference](../site/src/docs/PUBLIC_API.md)
- [Events Documentation](../site/src/docs/EVENTS.md)