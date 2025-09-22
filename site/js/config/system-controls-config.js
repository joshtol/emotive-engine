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
 * SystemControlsConfig - Configuration for system control buttons
 * Defines all system control buttons and their properties
 */
class SystemControlsConfig {
    constructor(options = {}) {
        this.config = {
            // System control button definitions
            controls: [
                {
                    id: 'load-audio-btn',
                    type: 'audio',
                    icon: '▶',
                    label: 'Play demo song',
                    action: 'togglePlayPause',
                    group: 'audio'
                },
                {
                    id: 'load-song-btn',
                    type: 'audio',
                    icon: '♪',
                    label: 'Load audio file',
                    action: 'openFileDialog',
                    group: 'audio'
                },
                {
                    id: 'blinking-toggle',
                    type: 'toggle',
                    icon: '👁',
                    label: 'Toggle blinking',
                    action: 'toggleBlinking',
                    group: 'system',
                    defaultActive: true
                },
                {
                    id: 'gaze-toggle',
                    type: 'toggle',
                    icon: '👀',
                    label: 'Toggle gaze tracking',
                    action: 'toggleGaze',
                    group: 'system',
                    defaultActive: false
                },
                {
                    id: 'fps-toggle',
                    type: 'toggle',
                    icon: '▣',
                    label: 'Toggle FPS display',
                    action: 'toggleFPS',
                    group: 'system',
                    defaultActive: false
                },
                {
                    id: 'record-btn',
                    type: 'toggle',
                    icon: '●',
                    label: 'Toggle audio recording',
                    action: 'toggleRecording',
                    group: 'system',
                    defaultActive: false
                },
                {
                    id: 'randomize-all-btn',
                    type: 'action',
                    icon: '⟳',
                    label: 'Randomize everything',
                    action: 'randomizeAll',
                    group: 'system',
                    defaultActive: false
                }
            ],
            ...options
        };
    }

    /**
     * Get controls by group
     */
    getControlsByGroup(group) {
        return this.config.controls.filter(control => control.group === group);
    }

    /**
     * Get all groups
     */
    getGroups() {
        const groups = [...new Set(this.config.controls.map(control => control.group))];
        return groups;
    }

    /**
     * Get control by ID
     */
    getControlById(id) {
        return this.config.controls.find(control => control.id === id);
    }

    /**
     * Initialize the configuration
     */
    init() {
        console.log('SystemControlsConfig initialized');
        return this;
    }
}

export default SystemControlsConfig;
