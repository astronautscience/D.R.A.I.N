// Lightweight particle system for visual effects

import { CONFIG } from '../config.js';

class Particle {
    constructor(x, y, vx, vy, life, color, size) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.size = size;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += 50 * dt; // gravity
        this.life -= dt;
    }

    get alpha() {
        return Math.max(0, this.life / this.maxLife);
    }

    get dead() {
        return this.life <= 0;
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 200;
    }

    emit(type, x, y, count) {
        for (let i = 0; i < count && this.particles.length < this.maxParticles; i++) {
            let p;
            switch (type) {
                case 'dust':
                    p = new Particle(
                        x + (Math.random() - 0.5) * 20,
                        y,
                        (Math.random() - 0.5) * 30,
                        -Math.random() * 20 - 10,
                        0.5 + Math.random() * 0.5,
                        '#8B7355',
                        2 + Math.random() * 3
                    );
                    break;
                case 'leaves':
                    p = new Particle(
                        x + (Math.random() - 0.5) * 15,
                        y - Math.random() * 10,
                        (Math.random() - 0.5) * 40,
                        -Math.random() * 30 - 10,
                        0.8 + Math.random() * 0.5,
                        Math.random() > 0.5 ? '#558844' : '#66aa44',
                        3 + Math.random() * 3
                    );
                    break;
                case 'splash':
                    p = new Particle(
                        x + (Math.random() - 0.5) * 10,
                        y,
                        (Math.random() - 0.5) * 50,
                        -Math.random() * 60 - 20,
                        0.6 + Math.random() * 0.4,
                        '#44aacc',
                        2 + Math.random() * 2
                    );
                    break;
                case 'impact':
                    p = new Particle(
                        x + (Math.random() - 0.5) * 15,
                        y - Math.random() * 20,
                        (Math.random() - 0.5) * 80,
                        -Math.random() * 60 - 20,
                        0.3 + Math.random() * 0.3,
                        Math.random() > 0.5 ? '#cc4444' : '#ff6644',
                        2 + Math.random() * 4
                    );
                    break;
                default:
                    return;
            }
            this.particles.push(p);
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (this.particles[i].dead) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx, camera) {
        for (const p of this.particles) {
            const screen = camera.worldToScreen(p.x, p.y);
            const size = p.size * camera.zoom;
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
}
