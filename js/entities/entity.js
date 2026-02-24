// Base Entity class for all world objects
let nextId = 0;

export class Entity {
    constructor(x, y) {
        this.id = nextId++;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.width = 0;
        this.height = 0;
        this.alive = true;
        this.facingRight = true;
        this.currentAction = 'idle';
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.frameInterval = 200;
        this.type = 'entity';
    }

    update(dt) {
        // Override in subclasses
    }

    updateAnimation(dt, frames) {
        if (!frames || frames.length === 0) return;
        this.frameTimer += dt * 1000;
        if (this.frameTimer >= this.frameInterval) {
            this.frameTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % frames.length;
        }
    }

    setAction(action) {
        if (this.currentAction !== action) {
            this.currentAction = action;
            this.currentFrame = 0;
            this.frameTimer = 0;
        }
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            w: this.width,
            h: this.height
        };
    }

    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
