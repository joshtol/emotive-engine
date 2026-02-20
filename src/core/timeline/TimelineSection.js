/**
 * TimelineSection — Named subsection with start/end beats and loop support.
 *
 * @module core/timeline/TimelineSection
 */

export class TimelineSection {
    /**
     * @param {string} name
     * @param {number} startBeat
     * @param {number} endBeat
     */
    constructor(name, startBeat, endBeat) {
        this.name = name;
        this.startBeat = startBeat;
        this.endBeat = endBeat;
    }

    /** Duration in beats */
    get duration() {
        return this.endBeat - this.startBeat;
    }
}
