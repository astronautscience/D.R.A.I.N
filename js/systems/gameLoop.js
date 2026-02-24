// Fixed-timestep game loop with variable rendering

import { CONFIG } from '../config.js';

export class GameLoop {
    constructor(updateFn, renderFn) {
        this.updateFn = updateFn;
        this.renderFn = renderFn;
        this.accumulator = 0;
        this.lastTime = 0;
        this.running = false;
        this.paused = false;
        this.speed = 1.0;
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTimer = 0;
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.tick(t));
    }

    stop() {
        this.running = false;
    }

    togglePause() {
        this.paused = !this.paused;
        if (!this.paused) {
            this.lastTime = performance.now();
            this.accumulator = 0;
        }
        return this.paused;
    }

    setSpeed(speed) {
        this.speed = Math.max(0.25, Math.min(5, speed));
    }

    tick(currentTime) {
        if (!this.running) return;

        if (!this.paused) {
            const rawDt = currentTime - this.lastTime;
            const dt = rawDt * this.speed;
            this.lastTime = currentTime;
            this.accumulator += dt;

            // FPS counter
            this.frameCount++;
            this.fpsTimer += rawDt;
            if (this.fpsTimer >= 1000) {
                this.fps = this.frameCount;
                this.frameCount = 0;
                this.fpsTimer = 0;
            }

            // Fixed update steps
            let steps = 0;
            while (this.accumulator >= CONFIG.CANVAS.FIXED_TIMESTEP && steps < CONFIG.CANVAS.MAX_FRAME_SKIP) {
                this.updateFn(CONFIG.CANVAS.FIXED_TIMESTEP / 1000);
                this.accumulator -= CONFIG.CANVAS.FIXED_TIMESTEP;
                steps++;
            }
        } else {
            this.lastTime = currentTime;
        }

        // Render every frame
        this.renderFn();

        requestAnimationFrame((t) => this.tick(t));
    }
}
