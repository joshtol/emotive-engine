export default class FPSCounter {
    constructor() {
        this.fps = 0;
        this.frames = 0;
        this.lastTime = performance.now();
        this.updateInterval = 1000; // Update every second
        this.lastUpdate = performance.now();
    }

    update() {
        this.frames++;
        const currentTime = performance.now();
        const delta = currentTime - this.lastUpdate;

        if (delta >= this.updateInterval) {
            this.fps = Math.round((this.frames * 1000) / delta);
            this.frames = 0;
            this.lastUpdate = currentTime;
        }

        return this.fps;
    }

    getFPS() {
        return this.fps;
    }
}