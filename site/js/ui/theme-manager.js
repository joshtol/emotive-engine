/**
 * ThemeManager - Handles theme switching and persistence for the Emotive demo
 * Manages light, dark, and night themes with icon updates and logo filters
 */
class ThemeManager {
    constructor(options = {}) {
        // Configuration
        this.themes = options.themes || ['light', 'dark', 'night'];
        this.defaultTheme = options.defaultTheme || 'night';
        this.storageKey = options.storageKey || 'emotive-theme';

        // Theme icons for the switcher button
        this.themeIcons = options.themeIcons || {
            // Sun icon for light theme
            'light': 'M 12 0 L 9.5 6.5 A 5.5 5.5 0 0 1 14.5 6.5 L 12 0 z M 2 2 L 6.5 9.5 A 5.5 5.5 0 0 1 9.5 6.5 L 2 2 z M 0 12 L 6.5 14.5 A 5.5 5.5 0 0 1 6.5 9.5 L 0 12 z M 2 22 L 9.5 17.5 A 5.5 5.5 0 0 1 6.5 14.5 L 2 22 z M 12 24 L 14.5 17.5 A 5.5 5.5 0 0 1 9.5 17.5 L 12 24 z M 22 22 L 17.5 14.5 A 5.5 5.5 0 0 1 14.5 17.5 L 22 22 z M 24 12 L 17.5 9.5 A 5.5 5.5 0 0 1 17.5 14.5 L 24 12 z M 22 2 L 14.5 6.5 A 5.5 5.5 0 0 1 17.5 9.5 L 22 2 z',
            // Moon icon for dark theme
            'dark': 'M 12 3 C 7.03 3 3 7.03 3 12 C 3 16.97 7.03 21 12 21 C 16.97 21 21 16.97 21 12 C 21 11.34 20.91 10.7 20.75 10.09 C 19.84 10.67 18.75 11 17.57 11 C 14.48 11 12 8.52 12 5.43 C 12 4.25 12.33 3.16 12.91 2.25 C 12.61 3.09 12 3 12 3 z',
            // Eclipse icon for night theme
            'night': 'M 12 2 C 6.48 2 2 6.48 2 12 C 2 17.52 6.48 22 12 22 C 17.52 22 22 17.52 22 12 C 22 6.48 17.52 2 12 2 z M 15 4.5 C 18.04 4.5 20.5 6.96 20.5 10 C 20.5 13.04 18.04 15.5 15 15.5 C 11.96 15.5 9.5 13.04 9.5 10 C 9.5 6.96 11.96 4.5 15 4.5 z'
        };

        this.iconColors = options.iconColors || {
            'light': '#007acc',  // Blue for light theme
            'dark': '#00e5ff',   // Cyan for dark theme
            'night': '#CC6633'   // Burnt orange for night theme
        };

        // State
        this.currentTheme = this.defaultTheme;
        this.switcherElement = null;
        this.iconElement = null;

        // Callbacks
        this.onThemeChange = options.onThemeChange || (() => {});
    }

    /**
     * Initialize the theme manager
     */
    init() {
        // Find theme switcher elements
        this.switcherElement = document.getElementById('theme-switcher');
        this.iconElement = document.getElementById('theme-icon');

        if (!this.switcherElement || !this.iconElement) {
            console.warn('ThemeManager: Theme switcher elements not found');
            return;
        }

        // Load saved theme
        this.loadTheme();

        // Set up event listener
        this.switcherElement.addEventListener('click', () => this.cycleTheme());

        return this;
    }

    /**
     * Load theme from localStorage or use default
     */
    loadTheme() {
        const savedTheme = localStorage.getItem(this.storageKey);

        if (savedTheme && this.themes.includes(savedTheme)) {
            this.currentTheme = savedTheme;
        } else {
            this.currentTheme = this.defaultTheme;
        }

        this.applyTheme(this.currentTheme);
    }

    /**
     * Apply a specific theme
     */
    applyTheme(theme) {
        if (!this.themes.includes(theme)) {
            console.warn(`ThemeManager: Invalid theme "${theme}"`);
            return;
        }

        // Remove all theme classes from body
        document.body.classList.remove(...this.themes);

        // Add the new theme class
        document.body.classList.add(theme);

        // Update the icon
        this.updateIcon(theme);

        // Save to localStorage
        localStorage.setItem(this.storageKey, theme);

        // Update current theme
        this.currentTheme = theme;

        // Call callback
        this.onThemeChange(theme);
    }

    /**
     * Cycle to the next theme
     */
    cycleTheme() {
        const currentIndex = this.themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        const nextTheme = this.themes[nextIndex];

        // Add animation class
        if (this.switcherElement) {
            this.switcherElement.classList.add('switching');

            // Force remove focus
            setTimeout(() => {
                this.switcherElement.blur();
                this.switcherElement.classList.remove('active', 'focus', 'focused');
                document.body.focus();
                document.body.blur();
            }, 10);

            // Remove animation class after animation completes
            setTimeout(() => {
                this.switcherElement.classList.remove('switching');
            }, 600);
        }

        this.applyTheme(nextTheme);
    }

    /**
     * Update the theme icon
     */
    updateIcon(theme) {
        if (!this.iconElement) return;

        const path = this.iconElement.querySelector('path');
        if (!path) return;

        path.setAttribute('d', this.themeIcons[theme]);
        path.setAttribute('fill-rule', 'evenodd');
        this.iconElement.style.color = this.iconColors[theme];
    }

    /**
     * Get the current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Set a specific theme
     */
    setTheme(theme) {
        this.applyTheme(theme);
    }

    /**
     * Check if a theme is active
     */
    isTheme(theme) {
        return this.currentTheme === theme;
    }

    /**
     * Get all available themes
     */
    getAvailableThemes() {
        return [...this.themes];
    }

    /**
     * Add a new theme
     */
    addTheme(name, icon, color) {
        if (!this.themes.includes(name)) {
            this.themes.push(name);
            this.themeIcons[name] = icon;
            this.iconColors[name] = color;
        }
    }

    /**
     * Clean up
     */
    destroy() {
        if (this.switcherElement) {
            this.switcherElement.removeEventListener('click', this.cycleTheme);
        }
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.ThemeManager = ThemeManager;
}