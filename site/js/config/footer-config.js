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
 * FooterConfig - Centralized footer text and links configuration
 * Manages all footer content including trademark, copyright, and links
 */
class FooterConfig {
    constructor(options = {}) {
        // Configuration with defaults
        this.config = {
            // Trademark text
            trademark: options.trademark || 'emotive ENGINE™',

            // Copyright information
            copyright: {
                year: options.copyrightYear || new Date().getFullYear(),
                author: options.copyrightAuthor || 'Joshua Tollette',
                prefix: options.copyrightPrefix || '©',
                ...options.copyright
            },

            // Footer links
            links: {
                license: {
                    text: 'License',
                    href: '../LICENSE.md',
                    target: '_self'
                },
                ...options.links
            },

            // Separator character
            separator: options.separator || '•',

            // Auto-update copyright year
            autoUpdateYear: options.autoUpdateYear !== false,

            // Enable automatic application to DOM
            autoApply: options.autoApply !== false,

            ...options
        };
    }

    /**
     * Initialize and apply footer content to DOM
     */
    init() {
        if (this.config.autoUpdateYear) {
            this.updateCopyrightYear();
        }

        if (this.config.autoApply) {
            this.applyFooterContent();
        }

        return this;
    }

    /**
     * Update copyright year to current year
     */
    updateCopyrightYear() {
        const currentYear = new Date().getFullYear();
        if (this.config.copyright.year < currentYear) {
            this.config.copyright.year = currentYear;
        }
    }

    /**
     * Apply all footer content to DOM
     */
    applyFooterContent() {
        const footer = document.querySelector('.legal-footer');
        if (!footer) return;

        const footerContent = footer.querySelector('.footer-content');
        if (!footerContent) return;

        // Clear existing content
        footerContent.innerHTML = '';

        // Add trademark
        if (this.config.trademark) {
            const trademarkSpan = document.createElement('span');
            trademarkSpan.className = 'trademark';
            trademarkSpan.textContent = this.config.trademark;
            footerContent.appendChild(trademarkSpan);
        }

        // Add separator after trademark
        if (this.config.trademark && this.config.copyright) {
            this.addSeparator(footerContent);
        }

        // Add copyright
        if (this.config.copyright) {
            const copyrightSpan = document.createElement('span');
            copyrightSpan.className = 'copyright';
            copyrightSpan.textContent = this.getCopyrightText();
            footerContent.appendChild(copyrightSpan);
        }

        // Add links
        if (this.config.links && Object.keys(this.config.links).length > 0) {
            for (const [key, link] of Object.entries(this.config.links)) {
                // Add separator before link
                this.addSeparator(footerContent);

                // Add link
                const linkElement = document.createElement('a');
                linkElement.className = 'footer-link';
                linkElement.href = link.href;
                linkElement.textContent = link.text;

                if (link.target) {
                    linkElement.target = link.target;
                }

                if (link.rel) {
                    linkElement.rel = link.rel;
                }

                footerContent.appendChild(linkElement);
            }
        }
    }

    /**
     * Add separator element
     */
    addSeparator(container) {
        const separator = document.createElement('span');
        separator.className = 'separator';
        separator.textContent = this.config.separator;
        container.appendChild(separator);
    }

    /**
     * Get formatted copyright text
     */
    getCopyrightText() {
        const { prefix, year, author } = this.config.copyright;
        return `${prefix} ${year} ${author}`;
    }

    /**
     * Update trademark text
     */
    setTrademark(trademark) {
        this.config.trademark = trademark;
        if (this.config.autoApply) {
            this.applyFooterContent();
        }
    }

    /**
     * Update copyright info
     */
    setCopyright(copyright) {
        this.config.copyright = { ...this.config.copyright, ...copyright };
        if (this.config.autoApply) {
            this.applyFooterContent();
        }
    }

    /**
     * Add or update a footer link
     */
    setLink(key, link) {
        if (!this.config.links) {
            this.config.links = {};
        }
        this.config.links[key] = link;
        if (this.config.autoApply) {
            this.applyFooterContent();
        }
    }

    /**
     * Remove a footer link
     */
    removeLink(key) {
        if (this.config.links && this.config.links[key]) {
            delete this.config.links[key];
            if (this.config.autoApply) {
                this.applyFooterContent();
            }
        }
    }

    /**
     * Get all configuration
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Export configuration as JSON
     */
    exportJSON() {
        return JSON.stringify(this.config, null, 2);
    }

    /**
     * Load configuration from JSON
     */
    async loadFromJSON(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            this.config = { ...this.config, ...data };
            if (this.config.autoApply) {
                this.applyFooterContent();
            }
        } catch (error) {
            console.error('Failed to load footer config:', error);
        }
    }
}

// ES6 Module Export
export { FooterConfig };
export default FooterConfig;

// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.