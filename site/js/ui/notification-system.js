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
 * NotificationSystem - Dynamic notification management
 * Handles info, success, warning, error, and tutorial messages
 */
class NotificationSystem {
    constructor(options = {}) {
        // Configuration
        this.config = {
            containerId: options.containerId || 'notification-container',
            maxNotifications: options.maxNotifications || 3,
            defaultDuration: options.defaultDuration || 5000,
            animationDuration: options.animationDuration || 300,
            queueMessages: options.queueMessages !== false,
            stackNotifications: options.stackNotifications !== false,
            dismissOnClick: options.dismissOnClick !== false,
            showProgress: options.showProgress !== false,
            soundEnabled: options.soundEnabled || false,
            ariaAnnounce: options.ariaAnnounce !== false,
            ...options
        };

        // Duration presets by type
        this.durations = {
            info: options.infoDuration || 4000,
            success: options.successDuration || 3000,
            warning: options.warningDuration || 6000,
            error: options.errorDuration || 8000,
            tutorial: options.tutorialDuration || 10000,
            permanent: 0 // Won't auto-dismiss
        };

        // Icon mappings
        this.icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            tutorial: '💡',
            ...options.customIcons
        };

        // State
        this.container = null;
        this.notifications = [];
        this.queue = [];
        this.idCounter = 0;
        this.isProcessing = false;
    }

    /**
     * Initialize the notification system
     */
    init() {
        this.container = document.getElementById(this.config.containerId);

        if (!this.container) {
            console.warn('NotificationSystem: Container element not found');
            return this;
        }

        // Add stacked class if enabled
        if (this.config.stackNotifications) {
            this.container.classList.add('stacked');
        }

        // Set up global access
        if (!window.notify) {
            window.notify = this.show.bind(this);
        }

        return this;
    }

    /**
     * Show a notification
     */
    show(message, type = 'info', options = {}) {
        const notification = {
            id: ++this.idCounter,
            message,
            type,
            duration: options.duration ?? this.durations[type] ?? this.config.defaultDuration,
            dismissible: options.dismissible ?? true,
            important: options.important ?? false,
            icon: options.icon ?? this.icons[type],
            showProgress: options.showProgress ?? this.config.showProgress,
            onDismiss: options.onDismiss,
            ...options
        };

        // Queue if needed
        if (this.notifications.length >= this.config.maxNotifications && this.config.queueMessages) {
            this.queue.push(notification);
            return notification.id;
        }

        // Show immediately
        this.displayNotification(notification);
        return notification.id;
    }

    /**
     * Display a notification in the DOM
     */
    displayNotification(notification) {
        const element = this.createElement(notification);

        // Add to container
        this.container.appendChild(element);
        this.notifications.push({ ...notification, element });

        // Announce to screen readers if enabled
        if (this.config.ariaAnnounce) {
            this.announceToScreenReader(notification.message, notification.type);
        }

        // Trigger entrance animation
        requestAnimationFrame(() => {
            element.classList.add('visible');
        });

        // Set up auto-dismiss if duration is set
        if (notification.duration > 0) {
            this.setupAutoDismiss(notification, element);
        }

        // Set up click dismiss if enabled
        if (notification.dismissible && this.config.dismissOnClick) {
            element.addEventListener('click', () => this.dismiss(notification.id));
        }

        // Play sound if enabled
        if (this.config.soundEnabled) {
            this.playNotificationSound(notification.type);
        }
    }

    /**
     * Create notification element
     */
    createElement(notification) {
        const element = document.createElement('div');
        element.className = `notification ${notification.type}`;
        element.id = `notification-${notification.id}`;
        element.setAttribute('role', 'alert');
        element.setAttribute('aria-live', 'polite');

        if (notification.important) {
            element.classList.add('important');
        }

        // Build content
        const content = document.createElement('div');
        content.className = 'notification-content';

        // Icon
        if (notification.icon) {
            const icon = document.createElement('span');
            icon.className = 'notification-icon';
            icon.textContent = notification.icon;
            content.appendChild(icon);
        }

        // Message
        const message = document.createElement('p');
        message.className = 'notification-message';
        message.textContent = notification.message;
        content.appendChild(message);

        // Close button
        if (notification.dismissible) {
            const close = document.createElement('span');
            close.className = 'notification-close';
            close.textContent = '✕';
            close.setAttribute('role', 'button');
            close.setAttribute('aria-label', 'Dismiss notification');
            close.addEventListener('click', (e) => {
                e.stopPropagation();
                this.dismiss(notification.id);
            });
            content.appendChild(close);
        }

        element.appendChild(content);

        // Progress bar for auto-dismiss
        if (notification.showProgress && notification.duration > 0) {
            const progress = document.createElement('div');
            progress.className = 'notification-progress';
            element.appendChild(progress);
        }

        return element;
    }

    /**
     * Set up auto-dismiss with progress bar
     */
    setupAutoDismiss(notification, element) {
        const progress = element.querySelector('.notification-progress');

        if (progress) {
            progress.style.width = '100%';
            progress.style.transition = `width ${notification.duration}ms linear`;

            requestAnimationFrame(() => {
                progress.style.width = '0%';
            });
        }

        notification.timeout = setTimeout(() => {
            this.dismiss(notification.id);
        }, notification.duration);
    }

    /**
     * Dismiss a notification
     */
    dismiss(id) {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index === -1) return;

        const notification = this.notifications[index];
        const element = notification.element;

        // Clear timeout if exists
        if (notification.timeout) {
            clearTimeout(notification.timeout);
        }

        // Trigger exit animation
        element.classList.add('hiding');
        element.classList.remove('visible');

        // Remove after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.remove();
            }
            this.notifications.splice(index, 1);

            // Process queue if available
            if (this.queue.length > 0 && !this.isProcessing) {
                this.isProcessing = true;
                const next = this.queue.shift();
                setTimeout(() => {
                    this.displayNotification(next);
                    this.isProcessing = false;
                }, this.config.animationDuration);
            }

            // Call dismiss callback if provided
            if (notification.onDismiss) {
                notification.onDismiss();
            }
        }, this.config.animationDuration);
    }

    /**
     * Dismiss all notifications
     */
    dismissAll() {
        const ids = this.notifications.map(n => n.id);
        ids.forEach(id => this.dismiss(id));
        this.queue = [];
    }

    /**
     * Announce to screen readers
     */
    announceToScreenReader(message, type) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'alert');
        announcement.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
        announcement.style.position = 'absolute';
        announcement.style.left = '-9999px';
        announcement.textContent = `${type}: ${message}`;

        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
    }

    /**
     * Play notification sound (stub for future implementation)
     */
    playNotificationSound(type) {
        // Could implement Web Audio API sounds here
        // For now, just a placeholder
    }

    /**
     * Show specific type notifications
     */
    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', options);
    }

    tutorial(message, options = {}) {
        return this.show(message, 'tutorial', options);
    }

    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };

        if (this.container) {
            if (this.config.stackNotifications) {
                this.container.classList.add('stacked');
            } else {
                this.container.classList.remove('stacked');
            }
        }
    }

    /**
     * Get current state
     */
    getState() {
        return {
            notifications: this.notifications.map(n => ({
                id: n.id,
                message: n.message,
                type: n.type
            })),
            queueLength: this.queue.length
        };
    }

    /**
     * Destroy and clean up
     */
    destroy() {
        this.dismissAll();
        if (window.notify === this.show.bind(this)) {
            delete window.notify;
        }
    }
}

// ES6 Module Export
export { NotificationSystem };

// LEGAL WARNING: This code is protected by copyright law and international treaties.
// Unauthorized reproduction or distribution of this code, or any portion of it,
// may result in severe civil and criminal penalties, and will be prosecuted
// to the maximum extent possible under the law.