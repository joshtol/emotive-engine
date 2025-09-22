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
 * SystemControlsGenerator - Generates system control buttons dynamically
 * Creates and manages system control buttons based on configuration
 */
class SystemControlsGenerator {
    constructor(config, options = {}) {
        this.config = config;
        this.options = {
            containerId: options.containerId || 'system-controls',
            ...options
        };
        
        this.container = null;
        this.buttons = new Map();
    }

    /**
     * Initialize the generator
     */
    init() {
        this.container = document.getElementById(this.options.containerId);
        if (!this.container) {
            console.error('SystemControlsGenerator: Container not found:', this.options.containerId);
            return;
        }

        this.generateControls();
        console.log('SystemControlsGenerator initialized');
    }

    /**
     * Generate all system controls
     */
    generateControls() {
        // Clear existing content
        this.container.innerHTML = '';

        // Get groups
        const groups = this.config.getGroups();
        
        groups.forEach((group, index) => {
            const groupControls = this.config.getControlsByGroup(group);
            
            // Create group container
            const groupElement = document.createElement('div');
            groupElement.className = 'system-controls-group';
            
            // Add buttons to group
            groupControls.forEach(control => {
                const button = this.createButton(control);
                groupElement.appendChild(button);
                this.buttons.set(control.id, button);
            });
            
            this.container.appendChild(groupElement);
            
            // Add divider between groups (except after last group)
            if (index < groups.length - 1) {
                const divider = document.createElement('div');
                divider.className = 'system-controls-divider';
                this.container.appendChild(divider);
            }
        });
    }

    /**
     * Create a single button
     */
    createButton(control) {
        const button = document.createElement('button');
        button.id = control.id;
        button.className = 'sci-fi-btn';
        button.setAttribute('aria-label', control.label);
        button.setAttribute('aria-pressed', control.defaultActive ? 'true' : 'false');
        
        // Add type-specific classes
        if (control.type === 'toggle') {
            button.classList.add('toggle-btn');
        } else if (control.type === 'audio') {
            button.classList.add('audio-icon-btn');
        }
        
        // Add active class if default active
        if (control.defaultActive) {
            button.classList.add('active');
        }
        
        // Add icon
        button.textContent = control.icon;
        
        // Store control data
        button.dataset.action = control.action;
        button.dataset.type = control.type;
        
        return button;
    }

    /**
     * Get button by ID
     */
    getButton(id) {
        return this.buttons.get(id);
    }

    /**
     * Update button state
     */
    updateButtonState(id, isActive) {
        const button = this.buttons.get(id);
        if (button) {
            if (isActive) {
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');
            } else {
                button.classList.remove('active');
                button.setAttribute('aria-pressed', 'false');
            }
        }
    }

    /**
     * Add special state class to button
     */
    addButtonClass(id, className) {
        const button = this.buttons.get(id);
        if (button) {
            button.classList.add(className);
        }
    }

    /**
     * Remove special state class from button
     */
    removeButtonClass(id, className) {
        const button = this.buttons.get(id);
        if (button) {
            button.classList.remove(className);
        }
    }

    /**
     * Destroy the generator
     */
    destroy() {
        this.buttons.clear();
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

export default SystemControlsGenerator;
