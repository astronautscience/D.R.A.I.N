// Dinosaur entity with AI state machine and animation

import { Entity } from './entity.js';
import { SPECIES } from '../data/species.js';
import { DINO_PARTS, ACTION_FRAME_RATES } from '../data/asciiArt.js';
import { CONFIG } from '../config.js';

const STATES = {
    IDLE: 'idle',
    WANDERING: 'walking',
    GRAZING: 'eating',
    HUNTING: 'walking',
    ATTACKING: 'attacking',
    FLEEING: 'walking',
    DEAD: 'dead',
};

export class Dinosaur extends Entity {
    constructor(x, y, speciesId) {
        super(x, y);
        this.type = 'dinosaur';
        this.speciesId = speciesId;

        const data = SPECIES[speciesId];
        const parts = DINO_PARTS[speciesId];

        this.shortName = data.shortName;
        this.diet = data.diet;
        this.trophicLevel = data.trophicLevel;
        this.habitat = data.habitat;
        this.size = data.size;
        this.speed = data.speed * 50;
        this.maxHealth = data.health;
        this.health = data.health;
        this.attackPower = data.attackPower;
        this.defensePower = data.defensePower;
        this.defenseChance = data.defenseChance;
        this.detectionRange = data.detectionRange;
        this.color = data.color;

        this.width = parts ? parts.drawWidth : 80;
        this.height = parts ? parts.drawHeight : 80;

        // State
        this.state = 'IDLE';
        this.hunger = 0;
        this.target = null;
        this.stateTimer = 0;
        this.wanderAngle = Math.random() * Math.PI * 2;
        this.flashTimer = 0;
        this.deathTimer = 0;

        // Animation
        this.currentAction = 'idle';
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.frameInterval = ACTION_FRAME_RATES.idle;
    }

    update(dt, allEntities, foodChain) {
        if (!this.alive) return;

        // Hunger increases over time
        this.hunger += CONFIG.ECOSYSTEM.HUNGER_RATE * dt;
        this.hunger = Math.min(100, this.hunger);

        // Flash timer (visual feedback when hit)
        if (this.flashTimer > 0) {
            this.flashTimer -= dt;
        }

        // Run state machine
        this.stateTimer += dt;
        switch (this.state) {
            case 'IDLE':
                this.updateIdle(dt);
                break;
            case 'WANDERING':
                this.updateWandering(dt);
                break;
            case 'GRAZING':
                this.updateGrazing(dt);
                break;
            case 'HUNTING':
                this.updateHunting(dt, allEntities, foodChain);
                break;
            case 'ATTACKING':
                this.updateAttacking(dt);
                break;
            case 'FLEEING':
                this.updateFleeing(dt, allEntities, foodChain);
                break;
            case 'DEAD':
                this.updateDead(dt);
                return;
        }

        // Check for threats (if not already fleeing or dead)
        if (this.state !== 'FLEEING' && this.state !== 'DEAD' && this.state !== 'ATTACKING') {
            this.checkForThreats(allEntities, foodChain);
        }

        // Update position
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Keep in bounds
        this.x = Math.max(50, Math.min(CONFIG.WORLD.WIDTH - 50, this.x));
        if (this.habitat === 'land') {
            this.y = Math.max(CONFIG.WORLD.GROUND_Y - 100, Math.min(CONFIG.WORLD.GROUND_Y, this.y));
        }

        // Facing direction
        if (Math.abs(this.vx) > 1) {
            this.facingRight = this.vx > 0;
        }

        // Update animation
        this.updateAnimation(dt);
    }

    updateAnimation(dt) {
        const parts = DINO_PARTS[this.speciesId];
        if (!parts) return;
        const anim = parts.animations[this.currentAction];
        if (!anim) return;

        this.frameTimer += dt * 1000;
        if (this.frameTimer >= anim.interval) {
            this.frameTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % anim.frames;
        }
    }

    setState(newState, action) {
        if (this.state === newState) return;
        this.state = newState;
        this.stateTimer = 0;
        if (action && action !== this.currentAction) {
            this.currentAction = action;
            this.currentFrame = 0;
            this.frameTimer = 0;
        }
    }

    updateIdle(dt) {
        this.vx = 0;
        this.vy = 0;
        this.currentAction = 'idle';

        // After 2-4 seconds, start wandering or look for food
        if (this.stateTimer > 2 + Math.random() * 2) {
            if (this.hunger > CONFIG.ECOSYSTEM.HUNGER_THRESHOLD) {
                if (this.diet === 'carnivore') {
                    this.setState('HUNTING', 'walking');
                } else {
                    this.setState('WANDERING', 'walking');
                }
            } else {
                this.setState('WANDERING', 'walking');
            }
        }
    }

    updateWandering(dt) {
        this.currentAction = 'walking';

        // Change direction occasionally
        if (this.stateTimer > 3 + Math.random() * 5) {
            this.wanderAngle += (Math.random() - 0.5) * Math.PI;
            this.stateTimer = 0;

            // Chance to go idle
            if (Math.random() < 0.3) {
                this.setState('IDLE', 'idle');
                return;
            }
        }

        // Steer away from edges
        if (this.x < 200) this.wanderAngle = Math.abs(this.wanderAngle) < Math.PI / 2 ? this.wanderAngle : 0;
        if (this.x > CONFIG.WORLD.WIDTH - 200) this.wanderAngle = Math.abs(this.wanderAngle) > Math.PI / 2 ? this.wanderAngle : Math.PI;

        const moveSpeed = this.speed * 0.5;
        this.vx = Math.cos(this.wanderAngle) * moveSpeed;
        this.vy = Math.sin(this.wanderAngle) * moveSpeed * 0.2; // Less vertical movement

        // Herbivore: check for nearby plants to eat
        if (this.diet === 'herbivore' && this.hunger > 30) {
            // This will be handled by ecosystem system
        }
    }

    updateGrazing(dt) {
        this.currentAction = 'eating';
        this.vx = 0;
        this.vy = 0;

        if (this.stateTimer > 2) {
            this.hunger = Math.max(0, this.hunger - 40);
            this.setState('IDLE', 'idle');
        }
    }

    updateHunting(dt, allEntities, foodChain) {
        this.currentAction = 'walking';

        if (!this.target || !this.target.alive) {
            // Find prey
            this.target = this.findPrey(allEntities, foodChain);
            if (!this.target) {
                this.setState('WANDERING', 'walking');
                return;
            }
        }

        // Move toward prey
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.ECOSYSTEM.ATTACK_DISTANCE) {
            this.setState('ATTACKING', 'attacking');
            return;
        }

        if (dist > CONFIG.ECOSYSTEM.CHASE_DISTANCE * 1.5) {
            this.target = null;
            this.setState('WANDERING', 'walking');
            return;
        }

        const moveSpeed = this.speed;
        this.vx = (dx / dist) * moveSpeed;
        this.vy = (dy / dist) * moveSpeed * 0.3;
    }

    updateAttacking(dt) {
        this.currentAction = 'attacking';
        this.vx = 0;
        this.vy = 0;

        if (this.stateTimer > 0.5) {
            if (this.target && this.target.alive) {
                // Check defense
                if (Math.random() < this.target.defenseChance) {
                    // Defense succeeded - target fends off attack
                    this.target = null;
                    this.setState('IDLE', 'idle');
                    return;
                }

                this.target.takeDamage(this.attackPower);

                if (!this.target.alive) {
                    // Killed prey - eat it
                    this.hunger = 0;
                    this.setState('GRAZING', 'eating');
                } else {
                    // Prey survived - keep hunting or give up
                    if (Math.random() < 0.5) {
                        this.setState('HUNTING', 'walking');
                    } else {
                        this.target = null;
                        this.setState('IDLE', 'idle');
                    }
                }
            } else {
                this.setState('IDLE', 'idle');
            }
        }
    }

    updateFleeing(dt, allEntities, foodChain) {
        this.currentAction = 'walking';

        // Find nearest threat
        let nearestThreat = null;
        let nearestDist = Infinity;
        for (const entity of allEntities) {
            if (entity === this || !entity.alive || entity.type !== 'dinosaur') continue;
            if (foodChain && foodChain.canEat(entity.speciesId, this.speciesId)) {
                const dist = this.distanceTo(entity);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestThreat = entity;
                }
            }
        }

        if (!nearestThreat || nearestDist > CONFIG.ECOSYSTEM.FLEE_DISTANCE * 2) {
            this.setState('IDLE', 'idle');
            return;
        }

        // Run away
        const dx = this.x - nearestThreat.x;
        const dy = this.y - nearestThreat.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const fleeSpeed = this.speed * 1.2;
        this.vx = (dx / dist) * fleeSpeed;
        this.vy = (dy / dist) * fleeSpeed * 0.2;
    }

    updateDead(dt) {
        this.currentAction = 'dead';
        this.vx = 0;
        this.vy = 0;
        this.deathTimer += dt;
        if (this.deathTimer > 5) {
            this.alive = false;
        }
    }

    checkForThreats(allEntities, foodChain) {
        if (!foodChain) return;
        for (const entity of allEntities) {
            if (entity === this || !entity.alive || entity.type !== 'dinosaur') continue;
            if (foodChain.canEat(entity.speciesId, this.speciesId)) {
                const dist = this.distanceTo(entity);
                if (dist < CONFIG.ECOSYSTEM.FLEE_DISTANCE) {
                    this.setState('FLEEING', 'walking');
                    return;
                }
            }
        }
    }

    findPrey(allEntities, foodChain) {
        if (!foodChain) return null;
        let nearest = null;
        let nearestDist = Infinity;
        for (const entity of allEntities) {
            if (entity === this || !entity.alive) continue;
            if (entity.type === 'dinosaur' && foodChain.canEat(this.speciesId, entity.speciesId)) {
                const dist = this.distanceTo(entity);
                if (dist < this.detectionRange && dist < nearestDist) {
                    nearestDist = dist;
                    nearest = entity;
                }
            }
        }
        return nearest;
    }

    takeDamage(amount) {
        this.health -= amount;
        this.flashTimer = 0.3;
        if (this.health <= 0) {
            this.health = 0;
            this.state = 'DEAD';
            this.currentAction = 'dead';
            this.currentFrame = 0;
            this.deathTimer = 0;
        }
    }

    die() {
        this.state = 'DEAD';
        this.currentAction = 'dead';
        this.currentFrame = 0;
        this.deathTimer = 0;
        this.health = 0;
    }
}
