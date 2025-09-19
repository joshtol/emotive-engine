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
 * Authentication UI Components
 * Handles sign-in buttons, user display, and auth-related UI
 */

import authManager from './auth-manager.js';

class AuthUI {
    constructor() {
        this.container = null;
        this.userDisplay = null;
        this.signInButton = null;
        this.userMenu = null;
        this.initialized = false;

        // Bind methods
        this.handleSignIn = this.handleSignIn.bind(this);
        this.handleSignOut = this.handleSignOut.bind(this);
        this.updateUI = this.updateUI.bind(this);
    }

    /**
     * Initialize the auth UI
     */
    async init(containerId = 'auth-container') {
        try {
            console.log('Auth UI: Starting initialization...');

            // Wait for auth manager to initialize
            await authManager.waitForInit();
            console.log('Auth UI: Auth manager initialized');

            // Create UI elements
            this.createAuthUI(containerId);
            console.log('Auth UI: UI elements created');

            // Listen for auth state changes
            authManager.on('authStateChanged', this.updateUI);

            // Initial UI update
            this.updateUI({
                user: authManager.getUser(),
                profile: authManager.getProfile(),
                isAnonymous: authManager.isUserAnonymous()
            });
            console.log('Auth UI: Initial update complete');

            // Auto sign in anonymously if not signed in
            if (!authManager.isSignedIn()) {
                console.log('Auth UI: No user signed in, signing in anonymously...');
                await authManager.signInAnonymously();
            }

            this.initialized = true;
            console.log('Auth UI: Initialization complete');
        } catch (error) {
            console.error('Auth UI: Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Create auth UI elements
     */
    createAuthUI(containerId) {
        // Find or create container
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.log('Auth UI: Container not found, creating new one');
            this.container = document.createElement('div');
            this.container.id = containerId;
            this.container.className = 'auth-container';
            document.body.appendChild(this.container);
        } else {
            console.log('Auth UI: Using existing container');
            // Ensure the container has the right class
            this.container.className = 'auth-container';
        }

        // Add styles
        this.injectStyles();

        // Create UI structure
        this.container.innerHTML = `
            <div class="auth-wrapper">
                <div class="auth-signed-out" style="display: none;">
                    <button class="auth-signin-btn google-signin" title="Sign in with Google">
                        <svg width="18" height="18" viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H23v8.51h12.47c-.54 2.9-2.17 5.35-4.62 7l7.47 5.8c4.35-4.01 6.8-9.91 6.8-16.81z"/>
                            <path fill="#34A853" d="M23 46c6.21 0 11.42-2.06 15.23-5.58l-7.47-5.8c-2.06 1.38-4.7 2.2-7.76 2.2-5.97 0-11.03-4.03-12.83-9.46l-7.72 5.96C6.37 40.8 14.1 46 23 46z"/>
                            <path fill="#FBBC05" d="M10.17 27.36c-.46-1.38-.72-2.85-.72-4.36s.26-2.98.72-4.36l-7.72-5.96C.88 15.95 0 19.36 0 23s.88 7.05 2.45 10.32l7.72-5.96z"/>
                            <path fill="#EA4335" d="M23 9.18c3.36 0 6.37 1.16 8.75 3.43l6.56-6.56C34.42 2.37 29.21 0 23 0 14.1 0 6.37 5.2 2.45 12.68l7.72 5.96C11.97 13.21 17.03 9.18 23 9.18z"/>
                        </svg>
                        <span>Sign In</span>
                    </button>
                </div>

                <div class="auth-signed-in" style="display: none;">
                    <div class="auth-user-display">
                        <img class="auth-user-avatar" src="" alt="User">
                        <span class="auth-user-name"></span>
                        <button class="auth-menu-toggle">▼</button>
                    </div>
                    <div class="auth-user-menu" style="display: none;">
                        <div class="auth-menu-header">
                            <img class="auth-menu-avatar" src="" alt="User">
                            <div class="auth-menu-info">
                                <div class="auth-menu-name"></div>
                                <div class="auth-menu-email"></div>
                            </div>
                        </div>
                        <div class="auth-menu-divider"></div>
                        <button class="auth-menu-item" id="auth-sign-out">Sign Out</button>
                    </div>
                </div>

                <div class="auth-anonymous-prompt" style="display: none;">
                    <span class="auth-prompt-text">Playing as Guest</span>
                    <button class="auth-upgrade-btn">Sign In to Save Progress</button>
                </div>
            </div>
        `;

        // Cache elements
        this.signedOutDiv = this.container.querySelector('.auth-signed-out');
        this.signedInDiv = this.container.querySelector('.auth-signed-in');
        this.anonymousPrompt = this.container.querySelector('.auth-anonymous-prompt');
        this.userDisplay = this.container.querySelector('.auth-user-display');
        this.userMenu = this.container.querySelector('.auth-user-menu');

        // Add event listeners
        this.setupEventListeners();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Sign in button
        const signInBtn = this.container.querySelector('.google-signin');
        if (signInBtn) {
            signInBtn.addEventListener('click', this.handleSignIn);
        }

        // Upgrade button for anonymous users
        const upgradeBtn = this.container.querySelector('.auth-upgrade-btn');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', this.handleSignIn);
        }

        // Menu toggle
        const menuToggle = this.container.querySelector('.auth-menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                this.toggleUserMenu();
            });
        }

        // Sign out button
        const signOutBtn = this.container.querySelector('#auth-sign-out');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', this.handleSignOut);
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target) && this.userMenu) {
                this.userMenu.style.display = 'none';
            }
        });
    }

    /**
     * Handle sign in
     */
    async handleSignIn() {
        try {
            // Disable button and show loading state
            const signInBtn = this.container.querySelector('.google-signin');
            const upgradeBtn = this.container.querySelector('.auth-upgrade-btn');
            const activeBtn = signInBtn || upgradeBtn;

            if (activeBtn) {
                const originalText = activeBtn.innerHTML;
                activeBtn.innerHTML = '<span style="display: inline-block; animation: spin 1s linear infinite;">⏳</span> Signing in...';
                activeBtn.disabled = true;

                const result = await authManager.signInWithGoogle();

                // Always restore button
                activeBtn.innerHTML = originalText;
                activeBtn.disabled = false;

                if (!result.success) {
                    if (result.error && result.error !== 'Sign-in cancelled') {
                        console.error('Sign in failed:', result.error);
                        // Show error message
                        this.showErrorMessage(result.error);
                    }
                } else {
                    console.log('Sign in successful');
                }
            }
        } catch (error) {
            console.error('Unexpected sign-in error:', error);
            this.showErrorMessage('An unexpected error occurred. Please try again.');
        }
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        // Remove any existing error message
        const existingError = this.container.querySelector('.auth-error-message');
        if (existingError) {
            existingError.remove();
        }

        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: absolute;
            top: 60px;
            right: 0;
            background: rgba(255, 50, 50, 0.9);
            color: white;
            padding: 10px 15px;
            border-radius: 10px;
            font-size: 13px;
            max-width: 300px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            animation: fadeInOut 5s forwards;
        `;

        this.container.appendChild(errorDiv);

        // Remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    /**
     * Handle sign out
     */
    async handleSignOut() {
        const result = await authManager.signOut();

        if (!result.success) {
            console.error('Sign out failed:', result.error);
        } else {
            // Sign in anonymously after signing out
            await authManager.signInAnonymously();
        }

        // Close menu
        if (this.userMenu) {
            this.userMenu.style.display = 'none';
        }
    }

    /**
     * Toggle user menu
     */
    toggleUserMenu() {
        if (this.userMenu) {
            const isVisible = this.userMenu.style.display === 'block';
            this.userMenu.style.display = isVisible ? 'none' : 'block';
        }
    }

    /**
     * Update UI based on auth state
     */
    updateUI({ user, profile, isAnonymous }) {
        console.log('Auth UI: Updating UI, user:', user ? 'exists' : 'null', 'anonymous:', isAnonymous);

        if (!this.container) {
            console.error('Auth UI: Container not found!');
            return;
        }

        if (user && !isAnonymous) {
            // Signed in with Google
            console.log('Auth UI: User is signed in with Google');
            this.showSignedIn(user, profile);
        } else if (user && isAnonymous) {
            // Anonymous user
            console.log('Auth UI: User is anonymous');
            this.showAnonymous();
        } else {
            // Signed out
            console.log('Auth UI: User is signed out');
            this.showSignedOut();
        }
    }

    /**
     * Show signed in state
     */
    showSignedIn(user, profile) {
        // Hide other states
        this.signedOutDiv.style.display = 'none';
        this.anonymousPrompt.style.display = 'none';

        // Show signed in
        this.signedInDiv.style.display = 'block';

        // Update user info
        const displayName = profile?.displayName || user.displayName || 'User';
        const photoURL = profile?.photoURL || user.photoURL || this.getDefaultAvatar(displayName);
        const email = user.email || '';

        // Update display
        const avatar = this.container.querySelector('.auth-user-avatar');
        const name = this.container.querySelector('.auth-user-name');
        if (avatar) avatar.src = photoURL;
        if (name) name.textContent = displayName;

        // Update menu
        const menuAvatar = this.container.querySelector('.auth-menu-avatar');
        const menuName = this.container.querySelector('.auth-menu-name');
        const menuEmail = this.container.querySelector('.auth-menu-email');
        if (menuAvatar) menuAvatar.src = photoURL;
        if (menuName) menuName.textContent = displayName;
        if (menuEmail) menuEmail.textContent = email;
    }

    /**
     * Show anonymous state
     */
    showAnonymous() {
        console.log('Auth UI: Showing anonymous state');

        // Hide other states
        this.signedOutDiv.style.display = 'none';
        this.signedInDiv.style.display = 'none';

        // Show anonymous prompt
        this.anonymousPrompt.style.display = 'flex';

        // Make sure container is visible
        this.container.style.display = 'block';
        console.log('Auth UI: Anonymous prompt displayed');
    }

    /**
     * Show signed out state
     */
    showSignedOut() {
        // Hide other states
        this.signedInDiv.style.display = 'none';
        this.anonymousPrompt.style.display = 'none';

        // Show sign in
        this.signedOutDiv.style.display = 'block';
    }

    /**
     * Get default avatar for user
     */
    getDefaultAvatar(name) {
        const initial = name ? name[0].toUpperCase() : '?';
        const colors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335'];
        const color = colors[name.length % colors.length];

        // Create SVG data URL
        const svg = `
            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="${color}"/>
                <text x="20" y="26" text-anchor="middle" fill="white" font-size="20" font-family="Arial">
                    ${initial}
                </text>
            </svg>
        `;

        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    /**
     * Inject styles
     */
    injectStyles() {
        if (document.getElementById('auth-ui-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'auth-ui-styles';
        styles.innerHTML = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateY(-10px); }
                10% { opacity: 1; transform: translateY(0); }
                90% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-10px); }
            }

            .auth-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 999999;
                font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .auth-wrapper {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            /* Sign in button - sci-fi style */
            .google-signin {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 20px;
                background: rgba(0, 255, 200, 0.1);
                border: 1px solid rgba(0, 255, 200, 0.3);
                border-radius: 25px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 14px;
                color: #00ffc8;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
                backdrop-filter: blur(10px);
                box-shadow:
                    0 0 20px rgba(0, 255, 200, 0.2),
                    inset 0 0 20px rgba(0, 255, 200, 0.05);
            }

            .google-signin:hover {
                background: rgba(0, 255, 200, 0.2);
                border-color: rgba(0, 255, 200, 0.5);
                box-shadow:
                    0 0 30px rgba(0, 255, 200, 0.4),
                    inset 0 0 20px rgba(0, 255, 200, 0.1);
                transform: translateY(-2px);
            }

            .google-signin svg {
                filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.5));
            }

            /* User display */
            .auth-user-display {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 6px 12px 6px 6px;
                background: rgba(0, 255, 200, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(0, 255, 200, 0.3);
                border-radius: 25px;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow:
                    0 0 20px rgba(0, 255, 200, 0.2),
                    inset 0 0 20px rgba(0, 255, 200, 0.05);
            }

            .auth-user-display:hover {
                background: rgba(0, 255, 200, 0.15);
                border-color: rgba(0, 255, 200, 0.4);
                box-shadow:
                    0 0 25px rgba(0, 255, 200, 0.3),
                    inset 0 0 20px rgba(0, 255, 200, 0.08);
            }

            .auth-user-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border: 2px solid rgba(0, 255, 200, 0.5);
                box-shadow: 0 0 10px rgba(0, 255, 200, 0.3);
            }

            .auth-user-name {
                color: #00ffc8;
                font-size: 14px;
                font-weight: 600;
                max-width: 150px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .auth-menu-toggle {
                background: none;
                border: none;
                color: #00ffc8;
                cursor: pointer;
                font-size: 12px;
                transition: transform 0.3s ease;
            }

            .auth-menu-toggle:hover {
                transform: rotate(180deg);
            }

            /* User menu */
            .auth-user-menu {
                position: absolute;
                top: 50px;
                right: 0;
                background: rgba(20, 20, 30, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(0, 255, 200, 0.3);
                border-radius: 15px;
                box-shadow:
                    0 10px 40px rgba(0, 0, 0, 0.8),
                    0 0 30px rgba(0, 255, 200, 0.2),
                    inset 0 0 30px rgba(0, 255, 200, 0.05);
                overflow: hidden;
                min-width: 280px;
            }

            .auth-menu-header {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 20px;
                background: rgba(0, 255, 200, 0.05);
                border-bottom: 1px solid rgba(0, 255, 200, 0.2);
            }

            .auth-menu-avatar {
                width: 45px;
                height: 45px;
                border-radius: 50%;
                border: 2px solid rgba(0, 255, 200, 0.5);
                box-shadow: 0 0 15px rgba(0, 255, 200, 0.4);
            }

            .auth-menu-info {
                flex: 1;
                overflow: hidden;
            }

            .auth-menu-name {
                font-weight: 700;
                color: #00ffc8;
                font-size: 15px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 3px;
            }

            .auth-menu-email {
                color: rgba(0, 255, 200, 0.7);
                font-size: 12px;
                overflow: hidden;
                text-overflow: ellipsis;
                letter-spacing: 0.3px;
            }

            .auth-menu-divider {
                height: 1px;
                background: linear-gradient(90deg,
                    transparent,
                    rgba(0, 255, 200, 0.3) 20%,
                    rgba(0, 255, 200, 0.3) 80%,
                    transparent
                );
            }

            .auth-menu-item {
                display: block;
                width: 100%;
                padding: 14px 20px;
                background: none;
                border: none;
                text-align: left;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                color: rgba(0, 255, 200, 0.9);
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                position: relative;
            }

            .auth-menu-item::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                width: 3px;
                height: 100%;
                background: #00ffc8;
                transform: scaleY(0);
                transition: transform 0.3s ease;
            }

            .auth-menu-item:hover {
                background: rgba(0, 255, 200, 0.1);
                color: #00ffc8;
                padding-left: 25px;
            }

            .auth-menu-item:hover::before {
                transform: scaleY(1);
            }

            /* Anonymous prompt */
            .auth-anonymous-prompt {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 10px 15px;
                background: rgba(255, 180, 0, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 180, 0, 0.3);
                border-radius: 25px;
                box-shadow:
                    0 0 20px rgba(255, 180, 0, 0.2),
                    inset 0 0 20px rgba(255, 180, 0, 0.05);
            }

            .auth-prompt-text {
                color: rgba(255, 180, 0, 0.9);
                font-size: 13px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .auth-upgrade-btn {
                padding: 8px 16px;
                background: rgba(0, 255, 200, 0.1);
                border: 1px solid rgba(0, 255, 200, 0.4);
                border-radius: 20px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
                color: #00ffc8;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                box-shadow:
                    0 0 15px rgba(0, 255, 200, 0.2),
                    inset 0 0 15px rgba(0, 255, 200, 0.05);
            }

            .auth-upgrade-btn:hover {
                background: rgba(0, 255, 200, 0.2);
                border-color: rgba(0, 255, 200, 0.6);
                box-shadow:
                    0 0 20px rgba(0, 255, 200, 0.4),
                    inset 0 0 15px rgba(0, 255, 200, 0.1);
                transform: translateY(-1px);
            }
        `;

        document.head.appendChild(styles);
    }
}

// Create singleton instance
const authUI = new AuthUI();

// Export as default
export default authUI;

// Also export class for testing
export { AuthUI };

// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.