// Plant entity - vegetation that herbivores eat

import { Entity } from './entity.js';
import { PLANT_PARTS } from '../data/asciiArt.js';
import { CONFIG } from '../config.js';

const PLANT_TYPES = ['fern', 'tree', 'bush', 'cycad'];

export class Plant extends Entity {
    constructor(x, y, plantType) {
        super(x, y);
        this.type = 'plant';
        this.plantType = plantType || PLANT_TYPES[Math.floor(Math.random() * PLANT_TYPES.length)];

        const parts = PLANT_PARTS[this.plantType];
        this.width = parts ? parts.drawWidth : 40;
        this.height = parts ? parts.drawHeight : 40;

        this.nutrition = this.plantType === 'tree' ? 50 : 30;
        this.maxHealth = this.nutrition;
        this.health = this.nutrition;
        this.regrowTimer = 0;
        this.consumed = false;
        this.shortName = this.plantType.charAt(0).toUpperCase() + this.plantType.slice(1);
    }

    get healthPercent() {
        return this.health / this.maxHealth;
    }

    update(dt) {
        if (this.consumed) {
            this.regrowTimer += dt;
            if (this.regrowTimer > CONFIG.ECOSYSTEM.PLANT_REGROW_TIME / 1000) {
                this.consumed = false;
                this.health = this.maxHealth;
                this.alive = true;
                this.regrowTimer = 0;
            }
        }
    }

    consume() {
        this.consumed = true;
        this.health = 0;
        this.alive = false;
        this.regrowTimer = 0;
        return this.nutrition;
    }
}

export { PLANT_TYPES };
