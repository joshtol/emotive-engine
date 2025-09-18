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
        const result = await authManager.signInWithGoogle();

        if (!result.success) {
            if (result.error !== 'Sign-in cancelled') {
                console.error('Sign in failed:', result.error);
                // Could show error toast here
            }
        }
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

        // Debug: Add temporary red border to see if container is visible
        this.container.style.border = '3px solid red';
        console.log('Auth UI: Anonymous prompt displayed');
        console.log('Container dimensions:', {
            width: this.container.offsetWidth,
            height: this.container.offsetHeight,
            top: this.container.offsetTop,
            left: this.container.offsetLeft
        });
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
            .auth-container {
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .auth-wrapper {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            /* Sign in button */
            .google-signin {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: white;
                border: 1px solid #dadce0;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 14px;
                color: #3c4043;
                font-weight: 500;
            }

            .google-signin:hover {
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                background: #f8f9fa;
            }

            /* User display */
            .auth-user-display {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 4px 8px 4px 4px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 20px;
                cursor: pointer;
            }

            .auth-user-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
            }

            .auth-user-name {
                color: white;
                font-size: 14px;
                max-width: 150px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .auth-menu-toggle {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 10px;
            }

            /* User menu */
            .auth-user-menu {
                position: absolute;
                top: 45px;
                right: 0;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                overflow: hidden;
                min-width: 250px;
            }

            .auth-menu-header {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px;
                background: #f8f9fa;
            }

            .auth-menu-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
            }

            .auth-menu-info {
                flex: 1;
                overflow: hidden;
            }

            .auth-menu-name {
                font-weight: 600;
                color: #202124;
                font-size: 14px;
            }

            .auth-menu-email {
                color: #5f6368;
                font-size: 12px;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .auth-menu-divider {
                height: 1px;
                background: #e0e0e0;
            }

            .auth-menu-item {
                display: block;
                width: 100%;
                padding: 12px 16px;
                background: none;
                border: none;
                text-align: left;
                cursor: pointer;
                font-size: 14px;
                color: #202124;
                transition: background 0.2s;
            }

            .auth-menu-item:hover {
                background: #f8f9fa;
            }

            /* Anonymous prompt */
            .auth-anonymous-prompt {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 20px;
            }

            .auth-prompt-text {
                color: rgba(255, 255, 255, 0.8);
                font-size: 14px;
            }

            .auth-upgrade-btn {
                padding: 6px 12px;
                background: white;
                border: none;
                border-radius: 12px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
                color: #1a73e8;
                transition: all 0.2s;
            }

            .auth-upgrade-btn:hover {
                background: #f8f9fa;
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