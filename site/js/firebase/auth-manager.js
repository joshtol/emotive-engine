/**
 * Authentication Manager
 * Handles user authentication, profile management, and session state
 */

import {
    auth,
    db,
    googleProvider,
    signInWithPopup,
    signInAnonymously,
    onAuthStateChanged,
    linkWithPopup,
    signOut,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp
} from './firebase-config.js';

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.isAnonymous = false;
        this.isInitialized = false;
        this.listeners = new Map();

        // Initialize auth state listener
        this.initAuthListener();
    }

    /**
     * Initialize authentication state listener
     */
    initAuthListener() {
        console.log('AuthManager: Setting up auth state listener...');
        onAuthStateChanged(auth, async (user) => {
            console.log('AuthManager: Auth state changed, user:', user ? user.uid : 'null');

            if (user) {
                // User is signed in
                this.currentUser = user;
                this.isAnonymous = user.isAnonymous;
                console.log('AuthManager: User signed in, anonymous:', this.isAnonymous);

                // Load or create user profile
                await this.loadUserProfile(user.uid);

                this.emit('authStateChanged', {
                    user: this.currentUser,
                    profile: this.userProfile,
                    isAnonymous: this.isAnonymous
                });
            } else {
                // User is signed out
                console.log('AuthManager: No user signed in');
                this.currentUser = null;
                this.userProfile = null;
                this.isAnonymous = false;

                this.emit('authStateChanged', {
                    user: null,
                    profile: null,
                    isAnonymous: false
                });
            }

            this.isInitialized = true;
            this.emit('initialized', true);
            console.log('AuthManager: Initialization complete');
        });
    }

    /**
     * Sign in anonymously
     */
    async signInAnonymously() {
        try {
            const result = await signInAnonymously(auth);
            console.log('Signed in anonymously:', result.user.uid);
            return {
                success: true,
                user: result.user
            };
        } catch (error) {
            console.error('Anonymous sign-in error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Sign in with Google
     */
    async signInWithGoogle() {
        try {
            // If user is anonymous, try to link accounts
            if (this.isAnonymous && this.currentUser) {
                return await this.linkWithGoogle();
            }

            // Regular sign in
            const result = await signInWithPopup(auth, googleProvider);
            console.log('Signed in with Google:', result.user.email);

            return {
                success: true,
                user: result.user
            };
        } catch (error) {
            console.error('Google sign-in error:', error);

            // Handle specific errors
            if (error.code === 'auth/popup-closed-by-user') {
                return {
                    success: false,
                    error: 'Sign-in cancelled'
                };
            }

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Link anonymous account with Google
     */
    async linkWithGoogle() {
        try {
            const result = await linkWithPopup(this.currentUser, googleProvider);
            console.log('Linked anonymous account with Google:', result.user.email);

            // Update user profile with Google data
            await this.updateUserProfile({
                displayName: result.user.displayName,
                photoURL: result.user.photoURL,
                email: result.user.email,
                isAnonymous: false
            });

            return {
                success: true,
                user: result.user,
                linked: true
            };
        } catch (error) {
            console.error('Account linking error:', error);

            // Handle credential already in use
            if (error.code === 'auth/credential-already-in-use') {
                // Sign in with the Google account instead
                return await this.signInWithGoogle();
            }

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Sign out
     */
    async signOut() {
        try {
            await signOut(auth);
            console.log('Signed out successfully');
            return {
                success: true
            };
        } catch (error) {
            console.error('Sign-out error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Load user profile from Firestore
     */
    async loadUserProfile(uid) {
        try {
            const userRef = doc(db, 'users', uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                this.userProfile = userDoc.data();

                // Update last active
                await updateDoc(userRef, {
                    lastActive: serverTimestamp()
                });
            } else {
                // Create new profile
                await this.createUserProfile(uid);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    /**
     * Create new user profile
     */
    async createUserProfile(uid) {
        const profile = {
            uid: uid,
            displayName: this.currentUser?.displayName || 'Anonymous Player',
            photoURL: this.currentUser?.photoURL || null,
            email: this.currentUser?.email || null,
            createdAt: serverTimestamp(),
            lastActive: serverTimestamp(),
            isAnonymous: this.currentUser?.isAnonymous || false,

            // Preferences
            preferences: {
                theme: 'dark',
                volume: 0.5,
                particleQuality: 'high',
                autoplay: true,
                rhythmSensitivity: 0.7
            },

            // Stats
            stats: {
                totalGestures: 0,
                totalCombos: 0,
                favoriteGesture: null,
                sessionsCount: 1,
                totalPlayTime: 0
            },

            // Content arrays
            discoveredCombos: [],
            savedGrooves: [],
            favorites: []
        };

        try {
            const userRef = doc(db, 'users', uid);
            await setDoc(userRef, profile);
            this.userProfile = profile;
            console.log('Created user profile:', uid);
        } catch (error) {
            console.error('Error creating user profile:', error);
        }
    }

    /**
     * Update user profile
     */
    async updateUserProfile(updates) {
        if (!this.currentUser) return;

        try {
            const userRef = doc(db, 'users', this.currentUser.uid);
            await updateDoc(userRef, updates);

            // Update local profile
            this.userProfile = {
                ...this.userProfile,
                ...updates
            };

            this.emit('profileUpdated', this.userProfile);

            return {
                success: true,
                profile: this.userProfile
            };
        } catch (error) {
            console.error('Error updating profile:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Update user preferences
     */
    async updatePreferences(preferences) {
        return await this.updateUserProfile({
            preferences: {
                ...this.userProfile?.preferences,
                ...preferences
            }
        });
    }

    /**
     * Increment a stat
     */
    async incrementStat(statName, amount = 1) {
        if (!this.currentUser) return;

        const userRef = doc(db, 'users', this.currentUser.uid);
        const statPath = `stats.${statName}`;

        try {
            await updateDoc(userRef, {
                [statPath]: increment(amount)
            });

            // Update local profile
            if (this.userProfile?.stats) {
                this.userProfile.stats[statName] = (this.userProfile.stats[statName] || 0) + amount;
            }
        } catch (error) {
            console.error('Error incrementing stat:', error);
        }
    }

    /**
     * Event emitter methods
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.listeners.has(event)) return;

        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    emit(event, data) {
        if (!this.listeners.has(event)) return;

        this.listeners.get(event).forEach(callback => {
            callback(data);
        });
    }

    /**
     * Get current user
     */
    getUser() {
        return this.currentUser;
    }

    /**
     * Get user profile
     */
    getProfile() {
        return this.userProfile;
    }

    /**
     * Check if user is signed in
     */
    isSignedIn() {
        return !!this.currentUser;
    }

    /**
     * Check if current user is anonymous
     */
    isUserAnonymous() {
        return this.isAnonymous;
    }

    /**
     * Wait for initialization
     */
    async waitForInit() {
        if (this.isInitialized) return;

        return new Promise((resolve) => {
            const handler = () => {
                this.off('initialized', handler);
                resolve();
            };
            this.on('initialized', handler);
        });
    }
}

// Create singleton instance
const authManager = new AuthManager();

// Export as default
export default authManager;

// Also export class for testing
export { AuthManager };