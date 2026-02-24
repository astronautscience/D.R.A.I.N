// Sprite cache for pre-rendered dinosaur frames
// Renders dino shapes to off-screen canvases for performance

export class SpriteCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 200;
        this.accessOrder = [];
    }

    get(key) {
        if (this.cache.has(key)) {
            const idx = this.accessOrder.indexOf(key);
            if (idx > -1) this.accessOrder.splice(idx, 1);
            this.accessOrder.push(key);
            return this.cache.get(key);
        }
        return null;
    }

    set(key, canvas) {
        if (this.cache.size >= this.maxSize) {
            const oldKey = this.accessOrder.shift();
            this.cache.delete(oldKey);
        }
        this.cache.set(key, canvas);
        this.accessOrder.push(key);
    }

    clear() {
        this.cache.clear();
        this.accessOrder = [];
    }
}
