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
 * EmotionButtonsConfig - Configuration for emotion buttons
 * Defines all emotion buttons and their properties
 */
class EmotionButtonsConfig {
    constructor(options = {}) {
        this.config = {
            // Emotion button definitions
            emotions: [
                {
                    id: 'neutral',
                    label: 'Neutral',
                    icon: '😐', // Will be replaced with SVG
                    svgPath: null, // Will be set when SVG is available
                    group: 'left',
                    defaultActive: true
                },
                    {
                        id: 'calm',
                        label: 'Calm',
                        icon: '😌',
                        svgPath: 'assets/icons/calm.svg',
                        group: 'left',
                        defaultActive: false
                    },
                    {
                        id: 'joy',
                        label: 'Joy',
                        icon: '😊',
                        svgPath: 'assets/icons/joy.svg',
                        group: 'left',
                        defaultActive: false
                    },
                    {
                        id: 'excited',
                        label: 'Excited',
                        icon: '🤩',
                        svgPath: 'assets/icons/excited.svg',
                        group: 'left',
                        defaultActive: false
                    },
                    {
                        id: 'love',
                        label: 'Love',
                        icon: '🥰',
                        svgPath: 'assets/icons/love.svg',
                        group: 'left',
                        defaultActive: false
                    },
                {
                    id: 'euphoria',
                    label: 'Euphoria',
                    icon: '✨',
                    svgPath: null,
                    group: 'left',
                    defaultActive: false
                },
                {
                    id: 'surprise',
                    label: 'Surprise',
                    icon: '😲',
                    svgPath: 'assets/icons/surprise.svg', // Relative to site directory
                    group: 'right',
                    defaultActive: false
                },
                    {
                        id: 'fear',
                        label: 'Fear',
                        icon: '😨',
                        svgPath: 'assets/icons/fear.svg',
                        group: 'right',
                        defaultActive: false
                    },
                {
                    id: 'disgust',
                    label: 'Disgust',
                    icon: '🤢',
                    svgPath: null,
                    group: 'right',
                    defaultActive: false
                },
                {
                    id: 'sadness',
                    label: 'Sadness',
                    icon: '😢',
                    svgPath: null,
                    group: 'right',
                    defaultActive: false
                },
                {
                    id: 'anger',
                    label: 'Anger',
                    icon: '😠',
                    svgPath: null,
                    group: 'right',
                    defaultActive: false
                },
                {
                    id: 'glitch',
                    label: 'Glitch',
                    icon: '👾',
                    svgPath: null,
                    group: 'right',
                    defaultActive: false
                }
            ],
            ...options
        };
    }

    /**
     * Get emotions by group
     */
    getEmotionsByGroup(group) {
        return this.config.emotions.filter(emotion => emotion.group === group);
    }

    /**
     * Get all groups
     */
    getGroups() {
        const groups = [...new Set(this.config.emotions.map(emotion => emotion.group))];
        return groups;
    }

    /**
     * Get emotion by ID
     */
    getEmotionById(id) {
        return this.config.emotions.find(emotion => emotion.id === id);
    }

    /**
     * Get default emotion
     */
    getDefaultEmotion() {
        return this.config.emotions.find(emotion => emotion.defaultActive);
    }

    /**
     * Initialize the configuration
     */
    init() {
        // EmotionButtonsConfig initialized
        return this;
    }
}

export default EmotionButtonsConfig;
