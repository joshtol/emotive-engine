export default class ThemeManager {
    constructor() {
        this.themes = {
            'sci-fi': {
                particleColor: '#00e5ff',
                glowColor: 'rgba(0, 229, 255, 0.5)',
                backgroundColor: '#0a0e1a',
                gridColor: 'rgba(0, 229, 255, 0.1)',
            },
            cyberpunk: {
                particleColor: '#ff00ff',
                glowColor: 'rgba(255, 0, 255, 0.5)',
                backgroundColor: '#1a0e1a',
                gridColor: 'rgba(255, 0, 255, 0.1)',
            },
            vaporwave: {
                particleColor: '#ff71ce',
                glowColor: 'rgba(255, 113, 206, 0.5)',
                backgroundColor: '#1a0e1f',
                gridColor: 'rgba(255, 113, 206, 0.1)',
            },
            matrix: {
                particleColor: '#00ff00',
                glowColor: 'rgba(0, 255, 0, 0.5)',
                backgroundColor: '#000000',
                gridColor: 'rgba(0, 255, 0, 0.1)',
            },
            minimal: {
                particleColor: '#ffffff',
                glowColor: 'rgba(255, 255, 255, 0.3)',
                backgroundColor: '#111111',
                gridColor: 'rgba(255, 255, 255, 0.05)',
            },
        };

        this.currentTheme = 'sci-fi';
    }

    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            return this.themes[themeName];
        }
        return null;
    }

    getTheme() {
        return this.themes[this.currentTheme];
    }

    getCurrentThemeName() {
        return this.currentTheme;
    }

    getAvailableThemes() {
        return Object.keys(this.themes);
    }
}
