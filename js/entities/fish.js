// Fish entity - small prey in the water zone

import { Entity } from './entity.js';
import { CONFIG } from '../config.js';

export class Fish extends Entity {
    constructor(x, y) {
        super(x, y);
        this.type = 'fish';
        this.width = 24;
        this.height = 12;
        this.speed = 40 + Math.random() * 30;
        this.shortName = 'Fish';
        this.facingRight = Math.random() > 0.5;
        this.vx = this.facingRight ? this.speed : -this.speed;
        this.turnTimer = 3 + Math.random() * 5;
        this.health = 10;
        this.defenseChance = 0;
        this.speciesId = 'fish';
    }

    update(dt) {
        if (!this.alive) return;

        this.turnTimer -= dt;
        if (this.turnTimer <= 0) {
            this.facingRight = !this.facingRight;
            this.vx = this.facingRight ? this.speed : -this.speed;
            this.turnTimer = 3 + Math.random() * 5;
        }

        this.x += this.vx * dt;
        this.y += Math.sin(Date.now() * 0.002 + this.id) * 0.5;

        // Stay in water zone
        if (this.x < 50 || this.x > CONFIG.WORLD.WIDTH - 50) {
            this.facingRight = !this.facingRight;
            this.vx = -this.vx;
        }
        this.y = Math.max(CONFIG.WORLD.WATER_Y + 20, Math.min(CONFIG.WORLD.WATER_Y + CONFIG.WORLD.WATER_DEPTH - 20, this.y));
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.alive = false;
        }
    }
}
