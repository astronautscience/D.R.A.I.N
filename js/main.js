// Main entry point - initializes and wires everything together

import { CONFIG } from './config.js';
import { Renderer } from './canvas/renderer.js';
import { ParticleSystem } from './canvas/particles.js';
import { GameLoop } from './systems/gameLoop.js';
import { Dinosaur } from './entities/dinosaur.js';
import { Plant, PLANT_TYPES } from './entities/plant.js';
import { Fish } from './entities/fish.js';
import { FOOD_CHAIN } from './data/foodChain.js';
import { SPECIES } from './data/species.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.renderer = new Renderer(this.canvas);
        this.particles = new ParticleSystem();
        this.entities = [];
        this.events = [];

        this.spawnTimer = 0;

        this.init();
    }

    init() {
        // Spawn initial population
        this.spawnInitialPopulation();

        // Set up renderer callbacks
        this.renderer.onEntitySelect = (entity) => this.onEntitySelect(entity);
        this.renderer.onEntityDeselect = () => this.onEntityDeselect();

        // Start game loop
        this.gameLoop = new GameLoop(
            (dt) => this.update(dt),
            () => this.render()
        );
        this.gameLoop.start();

        // Keyboard controls
        document.addEventListener('keydown', (e) => this.onKeyDown(e));

        // Hide loading screen
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';

        this.logEvent('Welcome to the Dinosaur Ecosystem!', '#ffcc33');
        this.logEvent('Click and drag to pan. Scroll to zoom.', '#c8b88a');
        this.logEvent('Click a dinosaur to learn about it!', '#c8b88a');
    }

    spawnInitialPopulation() {
        const groundY = CONFIG.WORLD.GROUND_Y;

        // Spawn dinosaurs
        // T-Rex (2)
        for (let i = 0; i < 2; i++) {
            const x = 500 + Math.random() * (CONFIG.WORLD.WIDTH - 1000);
            this.entities.push(new Dinosaur(x, groundY - Math.random() * 50, 'trex'));
        }

        // Triceratops (5)
        for (let i = 0; i < 5; i++) {
            const x = 300 + Math.random() * (CONFIG.WORLD.WIDTH - 600);
            this.entities.push(new Dinosaur(x, groundY - Math.random() * 50, 'triceratops'));
        }

        // Compsognathus (6)
        for (let i = 0; i < 6; i++) {
            const x = 200 + Math.random() * (CONFIG.WORLD.WIDTH - 400);
            this.entities.push(new Dinosaur(x, groundY - Math.random() * 50, 'compsognathus'));
        }

        // Spawn plants
        for (let i = 0; i < 30; i++) {
            const x = 100 + Math.random() * (CONFIG.WORLD.WIDTH - 200);
            const plantType = PLANT_TYPES[Math.floor(Math.random() * PLANT_TYPES.length)];
            this.entities.push(new Plant(x, groundY, plantType));
        }

        // Spawn fish
        for (let i = 0; i < 8; i++) {
            const x = 200 + Math.random() * (CONFIG.WORLD.WIDTH - 400);
            const y = CONFIG.WORLD.WATER_Y + 30 + Math.random() * (CONFIG.WORLD.WATER_DEPTH - 60);
            this.entities.push(new Fish(x, y));
        }
    }

    update(dt) {
        // Update all entities
        for (const entity of this.entities) {
            if (entity.type === 'dinosaur') {
                entity.update(dt, this.entities, FOOD_CHAIN);
            } else {
                entity.update(dt);
            }
        }

        // Handle herbivore grazing
        this.handleGrazing(dt);

        // Update particles
        this.particles.update(dt);

        // Spawn timer
        this.spawnTimer += dt;
        if (this.spawnTimer > CONFIG.ECOSYSTEM.SPAWN_INTERVAL / 1000) {
            this.spawnTimer = 0;
            this.managePopulation();
        }

        // Clean up dead entities (after their death animation)
        this.entities = this.entities.filter(e => {
            if (e.type === 'plant' && e.consumed) return true; // Keep consumed plants for regrowth
            return e.alive;
        });

        // Prune old events
        const now = Date.now();
        this.events = this.events.filter(e => now - e.time < 8000);
    }

    handleGrazing(dt) {
        for (const dino of this.entities) {
            if (dino.type !== 'dinosaur' || !dino.alive) continue;
            if (dino.diet !== 'herbivore') continue;
            if (dino.hunger < 30) continue;
            if (dino.state === 'FLEEING' || dino.state === 'DEAD') continue;

            // Find nearest plant
            let nearestPlant = null;
            let nearestDist = 80; // Must be close
            for (const entity of this.entities) {
                if (entity.type !== 'plant' || !entity.alive) continue;
                const dist = dino.distanceTo(entity);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestPlant = entity;
                }
            }

            if (nearestPlant && dino.state !== 'GRAZING') {
                if (nearestDist < 40) {
                    // Close enough to eat
                    dino.setState('GRAZING', 'eating');
                    dino.target = nearestPlant;
                    const nutrition = nearestPlant.consume();
                    dino.hunger = Math.max(0, dino.hunger - nutrition);
                    this.particles.emit('leaves', nearestPlant.x, nearestPlant.y, 5);
                    this.logEvent(`${dino.shortName} is eating a ${nearestPlant.shortName}`, CONFIG.COLORS.HERBIVORE);
                } else if (dino.state === 'WANDERING' || dino.state === 'IDLE') {
                    // Move toward plant
                    const dx = nearestPlant.x - dino.x;
                    const dy = nearestPlant.y - dino.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    dino.vx = (dx / dist) * dino.speed * 0.4;
                    dino.vy = (dy / dist) * dino.speed * 0.1;
                }
            }
        }
    }

    managePopulation() {
        // Count living dinos by species
        const counts = {};
        for (const entity of this.entities) {
            if (entity.type === 'dinosaur' && entity.alive) {
                counts[entity.speciesId] = (counts[entity.speciesId] || 0) + 1;
            }
        }

        // Respawn species that are getting low
        const targets = { trex: 2, triceratops: 5, compsognathus: 6 };
        for (const [species, target] of Object.entries(targets)) {
            const current = counts[species] || 0;
            if (current < target) {
                const x = 300 + Math.random() * (CONFIG.WORLD.WIDTH - 600);
                const y = CONFIG.WORLD.GROUND_Y - Math.random() * 50;
                this.entities.push(new Dinosaur(x, y, species));
                this.logEvent(`A new ${SPECIES[species].shortName} has appeared!`, CONFIG.COLORS.TEXT_HIGHLIGHT);
            }
        }

        // Respawn plants
        const plantCount = this.entities.filter(e => e.type === 'plant' && e.alive).length;
        if (plantCount < 20) {
            const x = 100 + Math.random() * (CONFIG.WORLD.WIDTH - 200);
            const plantType = PLANT_TYPES[Math.floor(Math.random() * PLANT_TYPES.length)];
            this.entities.push(new Plant(x, CONFIG.WORLD.GROUND_Y, plantType));
        }

        // Respawn fish
        const fishCount = this.entities.filter(e => e.type === 'fish' && e.alive).length;
        if (fishCount < 5) {
            const x = 200 + Math.random() * (CONFIG.WORLD.WIDTH - 400);
            const y = CONFIG.WORLD.WATER_Y + 30 + Math.random() * (CONFIG.WORLD.WATER_DEPTH - 60);
            this.entities.push(new Fish(x, y));
        }
    }

    render() {
        this.renderer.render(this.entities);

        // Render particles
        this.particles.render(this.renderer.ctx, this.renderer.camera);

        // Render HUD
        this.renderHUD();
    }

    renderHUD() {
        const ctx = this.renderer.ctx;
        const w = this.renderer.canvas.width;

        // Top bar
        ctx.fillStyle = 'rgba(20,18,12,0.85)';
        ctx.fillRect(0, 0, w, 36);

        ctx.font = '13px Courier New, Consolas, monospace';

        // Population counts
        const counts = { herbivore: 0, carnivore: 0, plant: 0, fish: 0 };
        for (const e of this.entities) {
            if (!e.alive) continue;
            if (e.type === 'dinosaur') {
                counts[e.diet] = (counts[e.diet] || 0) + 1;
            } else if (e.type === 'plant') {
                counts.plant++;
            } else if (e.type === 'fish') {
                counts.fish++;
            }
        }

        let hx = 15;
        const items = [
            [`Herbivores: ${counts.herbivore}`, CONFIG.COLORS.HERBIVORE],
            [`Carnivores: ${counts.carnivore}`, CONFIG.COLORS.CARNIVORE],
            [`Plants: ${counts.plant}`, CONFIG.COLORS.PLANT],
            [`Fish: ${counts.fish}`, CONFIG.COLORS.AQUATIC],
        ];

        for (const [text, color] of items) {
            ctx.fillStyle = color;
            ctx.fillText(text, hx, 23);
            hx += ctx.measureText(text).width + 25;
        }

        // Speed and FPS
        ctx.fillStyle = CONFIG.COLORS.TEXT_PRIMARY;
        const speedText = `Speed: ${this.gameLoop.speed}x | FPS: ${this.gameLoop.fps}`;
        ctx.fillText(speedText, w - ctx.measureText(speedText).width - 15, 23);

        // Pause indicator
        if (this.gameLoop.paused) {
            ctx.fillStyle = CONFIG.COLORS.TEXT_HIGHLIGHT;
            ctx.font = 'bold 14px Courier New, Consolas, monospace';
            ctx.fillText('PAUSED', w / 2 - 30, 23);
        }

        // Event ticker at bottom
        const eventY = this.renderer.canvas.height - 15;
        for (let i = 0; i < Math.min(4, this.events.length); i++) {
            const event = this.events[this.events.length - 1 - i];
            const age = (Date.now() - event.time) / 8000;
            ctx.globalAlpha = 1 - age;
            ctx.fillStyle = 'rgba(20,18,12,0.75)';
            const textWidth = ctx.measureText('> ' + event.text).width;
            ctx.fillRect(8, eventY - i * 22 - 14, textWidth + 16, 20);
            ctx.fillStyle = event.color;
            ctx.font = '12px Courier New, Consolas, monospace';
            ctx.fillText('> ' + event.text, 15, eventY - i * 22);
        }
        ctx.globalAlpha = 1;

        // Controls hint (bottom right)
        ctx.fillStyle = 'rgba(200,184,138,0.4)';
        ctx.font = '11px Courier New, Consolas, monospace';
        const hint = '[Space] Pause | [1-3] Speed | [F] Food Chain';
        ctx.fillText(hint, w - ctx.measureText(hint).width - 15, this.renderer.canvas.height - 15);
    }

    logEvent(text, color) {
        this.events.push({ text, color: color || CONFIG.COLORS.TEXT_PRIMARY, time: Date.now() });
    }

    onEntitySelect(entity) {
        if (entity.type === 'dinosaur') {
            this.showInfoPanel(entity);
        }
    }

    onEntityDeselect() {
        const panel = document.getElementById('info-panel');
        if (panel) panel.classList.remove('visible');
    }

    showInfoPanel(entity) {
        const panel = document.getElementById('info-panel');
        if (!panel) return;

        const species = SPECIES[entity.speciesId];
        if (!species) return;

        const prey = FOOD_CHAIN.getPrey(entity.speciesId);
        const predators = FOOD_CHAIN.getPredators(entity.speciesId);

        panel.innerHTML = `
            <button class="close-btn" onclick="document.getElementById('info-panel').classList.remove('visible')">&times;</button>
            <h2 style="color: ${species.color}">${species.name}</h2>
            <div class="info-divider"></div>
            <p class="info-period">${species.period}</p>
            <p><strong>Diet:</strong> ${species.diet.charAt(0).toUpperCase() + species.diet.slice(1)}</p>
            <p><strong>Size:</strong> ${species.size.charAt(0).toUpperCase() + species.size.slice(1)}</p>
            <p><strong>Role:</strong> ${entity.trophicLevel === 3 ? 'Apex Predator' : entity.trophicLevel === 2 ? 'Secondary Consumer' : entity.trophicLevel === 1 ? 'Primary Consumer' : 'Producer'}</p>
            <div class="info-divider"></div>
            <p class="info-desc">${species.description}</p>
            <div class="info-divider"></div>
            <h3>Fun Facts</h3>
            <ul class="facts-list">
                ${species.facts.map(f => `<li>${f}</li>`).join('')}
            </ul>
            <div class="info-divider"></div>
            <h3>Food Chain</h3>
            <p><strong style="color: ${CONFIG.COLORS.CARNIVORE}">Hunts:</strong> ${prey.length > 0 ? prey.map(p => SPECIES[p]?.shortName || p).join(', ') : 'None (herbivore)'}</p>
            <p><strong style="color: ${CONFIG.COLORS.HERBIVORE}">Hunted by:</strong> ${predators.length > 0 ? predators.map(p => SPECIES[p]?.shortName || p).join(', ') : 'None (apex predator)'}</p>
            <div class="info-divider"></div>
            <p class="info-stats">
                <span>HP: ${entity.health}/${entity.maxHealth}</span>
                <span>Hunger: ${Math.round(entity.hunger)}%</span>
            </p>
        `;

        panel.classList.add('visible');
    }

    onKeyDown(e) {
        switch (e.key) {
            case ' ':
                e.preventDefault();
                const paused = this.gameLoop.togglePause();
                this.logEvent(paused ? 'Simulation paused' : 'Simulation resumed', CONFIG.COLORS.TEXT_HIGHLIGHT);
                break;
            case '1':
                this.gameLoop.setSpeed(1);
                this.logEvent('Speed: 1x', CONFIG.COLORS.TEXT_PRIMARY);
                break;
            case '2':
                this.gameLoop.setSpeed(2);
                this.logEvent('Speed: 2x', CONFIG.COLORS.TEXT_PRIMARY);
                break;
            case '3':
                this.gameLoop.setSpeed(5);
                this.logEvent('Speed: 5x', CONFIG.COLORS.TEXT_PRIMARY);
                break;
        }
    }
}

// Start the game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
