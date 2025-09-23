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
 * EmotionButtonsGenerator - Generates emotion buttons dynamically
 * Creates and manages emotion buttons based on configuration
 */
class EmotionButtonsGenerator {
    constructor(config, options = {}) {
        this.config = config;
        this.options = {
            leftContainerId: options.leftContainerId || 'emotion-panel-left',
            rightContainerId: options.rightContainerId || 'emotion-panel-right',
            ...options
        };
        
        this.leftContainer = null;
        this.rightContainer = null;
        this.buttons = new Map();
    }

    /**
     * Initialize the generator
     */
    init() {
        this.leftContainer = document.getElementById(this.options.leftContainerId);
        this.rightContainer = document.getElementById(this.options.rightContainerId);
        
        if (!this.leftContainer || !this.rightContainer) {
            console.error('EmotionButtonsGenerator: Containers not found:', this.options.leftContainerId, this.options.rightContainerId);
            return;
        }

        this.generateButtons();
        // EmotionButtonsGenerator initialized
    }

    /**
     * Generate all emotion buttons
     */
    generateButtons() {
        // Clear existing content
        this.leftContainer.innerHTML = '';
        this.rightContainer.innerHTML = '';

        // Get groups
        const groups = this.config.getGroups();
        
        groups.forEach(group => {
            const groupEmotions = this.config.getEmotionsByGroup(group);
            const container = group === 'left' ? this.leftContainer : this.rightContainer;
            
            // Add buttons to container
            groupEmotions.forEach(emotion => {
                const button = this.createButton(emotion);
                container.appendChild(button);
                this.buttons.set(emotion.id, button);
            });
        });
    }

    /**
     * Create a single emotion button
     */
    createButton(emotion) {
        const button = document.createElement('button');
        button.id = `emotion-${emotion.id}`;
        button.className = 'sci-fi-btn emotion-btn';
        button.setAttribute('data-emotion', emotion.id);
        button.setAttribute('aria-label', emotion.label);
        button.setAttribute('title', emotion.label);
        
        // Add active class if default active
        if (emotion.defaultActive) {
            button.classList.add('active');
        }
        
        // Add icon or SVG
        if (emotion.svgPath) {
            this.addSVGIcon(button, emotion.svgPath);
        } else {
            button.textContent = emotion.icon;
        }
        
        return button;
    }

    /**
     * Add SVG icon to button
     */
    addSVGIcon(button, svgPath) {
        // Adding SVG icon to button
        
        // Create img element for SVG (simpler approach)
        const img = document.createElement('img');
        img.src = svgPath;
        img.alt = button.getAttribute('aria-label') || 'Emotion icon';
        img.className = 'emotion-icon';
        // Remove hardcoded width/height - let CSS handle sizing
        
        // Add error handling
        img.onerror = () => {
            console.error('Failed to load SVG:', svgPath);
            // Fallback to emoji
            button.textContent = button.getAttribute('data-emotion') === 'surprise' ? '😲' : '?';
        };
        
        img.onload = () => {
            // SVG loaded successfully
        };
        
        button.appendChild(img);
    }

    /**
     * Get button by emotion ID
     */
    getButton(emotionId) {
        return this.buttons.get(emotionId);
    }

    /**
     * Update button state
     */
    updateButtonState(emotionId, isActive) {
        const button = this.buttons.get(emotionId);
        if (button) {
            if (isActive) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }
    }

    /**
     * Set active emotion (deactivates others)
     */
    setActiveEmotion(emotionId) {
        // Deactivate all buttons
        this.buttons.forEach((button, id) => {
            button.classList.remove('active');
        });
        
        // Activate the selected button
        this.updateButtonState(emotionId, true);
    }

    /**
     * Destroy the generator
     */
    destroy() {
        this.buttons.clear();
        if (this.leftContainer) {
            this.leftContainer.innerHTML = '';
        }
        if (this.rightContainer) {
            this.rightContainer.innerHTML = '';
        }
    }
}

export default EmotionButtonsGenerator;
