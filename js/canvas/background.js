// Multi-layer parallax background renderer

import { CONFIG } from '../config.js';

export class Background {
    constructor() {
        this.stars = this.generateStars(80);
        this.mountains = this.generateMountains();
        this.groundDetails = this.generateGroundDetails();
        this.waterOffset = 0;
    }

    generateStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * CONFIG.WORLD.WIDTH * 1.5,
                y: Math.random() * CONFIG.WORLD.GROUND_Y * 0.4,
                char: Math.random() > 0.7 ? '*' : '.',
                brightness: 0.3 + Math.random() * 0.7,
            });
        }
        return stars;
    }

    generateMountains() {
        const peaks = [];
        let x = -200;
        while (x < CONFIG.WORLD.WIDTH + 400) {
            const height = 100 + Math.random() * 300;
            const width = 200 + Math.random() * 400;
            peaks.push({ x, height, width });
            x += width * 0.6 + Math.random() * 200;
        }
        return peaks;
    }

    generateGroundDetails() {
        const details = [];
        for (let i = 0; i < 200; i++) {
            details.push({
                x: Math.random() * CONFIG.WORLD.WIDTH,
                char: ['.', ',', '`', "'", '~', '"'][Math.floor(Math.random() * 6)],
            });
        }
        return details;
    }

    render(ctx, camera, canvasWidth, canvasHeight) {
        // Sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight * 0.7);
        gradient.addColorStop(0, CONFIG.COLORS.SKY_TOP);
        gradient.addColorStop(1, CONFIG.COLORS.SKY_BOTTOM);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Stars (parallax 0.1 — very slow)
        ctx.font = `12px ${CONFIG.CANVAS.FONT_FAMILY}`;
        ctx.textBaseline = 'top';
        for (const star of this.stars) {
            const sx = (star.x - camera.x * 0.1) * camera.zoom + canvasWidth / 2;
            const sy = (star.y - camera.y * 0.1) * camera.zoom + canvasHeight / 4;
            if (sx < -20 || sx > canvasWidth + 20 || sy < -20 || sy > canvasHeight) continue;
            ctx.fillStyle = `rgba(150,145,120,${star.brightness})`;
            ctx.fillText(star.char, sx, sy);
        }

        // Mountains (parallax 0.3)
        this.renderMountains(ctx, camera, canvasWidth, canvasHeight);

        // Ground
        this.renderGround(ctx, camera, canvasWidth, canvasHeight);

        // Water
        this.renderWater(ctx, camera, canvasWidth, canvasHeight);
    }

    renderMountains(ctx, camera, canvasWidth, canvasHeight) {
        const parallax = 0.3;
        ctx.fillStyle = CONFIG.COLORS.MOUNTAIN;

        for (const peak of this.mountains) {
            const baseY = CONFIG.WORLD.GROUND_Y - 50;
            const sx = (peak.x - camera.x * parallax) * camera.zoom + canvasWidth / 2;
            const sy = (baseY - camera.y) * camera.zoom + canvasHeight / 2;
            const sw = peak.width * camera.zoom;
            const sh = peak.height * camera.zoom;

            if (sx + sw < -100 || sx - sw > canvasWidth + 100) continue;

            ctx.beginPath();
            ctx.moveTo(sx - sw / 2, sy);
            ctx.lineTo(sx, sy - sh);
            ctx.lineTo(sx + sw / 2, sy);
            ctx.closePath();
            ctx.fill();

            // Mountain highlight
            ctx.fillStyle = CONFIG.COLORS.MOUNTAIN_LIGHT;
            ctx.beginPath();
            ctx.moveTo(sx, sy - sh);
            ctx.lineTo(sx + sw * 0.15, sy - sh * 0.6);
            ctx.lineTo(sx + sw / 2, sy);
            ctx.lineTo(sx, sy);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = CONFIG.COLORS.MOUNTAIN;
        }
    }

    renderGround(ctx, camera, canvasWidth, canvasHeight) {
        const groundScreenY = (CONFIG.WORLD.GROUND_Y - camera.y) * camera.zoom + canvasHeight / 2;
        const groundHeight = 200 * camera.zoom;

        // Main ground fill
        const groundGrad = ctx.createLinearGradient(0, groundScreenY, 0, groundScreenY + groundHeight);
        groundGrad.addColorStop(0, CONFIG.COLORS.GROUND_LIGHT);
        groundGrad.addColorStop(1, CONFIG.COLORS.GROUND);
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, groundScreenY, canvasWidth, groundHeight);

        // Ground texture details
        ctx.font = `${Math.round(10 * camera.zoom)}px ${CONFIG.CANVAS.FONT_FAMILY}`;
        ctx.fillStyle = 'rgba(80,70,50,0.5)';
        for (const detail of this.groundDetails) {
            const sx = (detail.x - camera.x) * camera.zoom + canvasWidth / 2;
            const sy = groundScreenY + Math.random() * groundHeight * 0.3;
            if (sx < -10 || sx > canvasWidth + 10) continue;
            ctx.fillText(detail.char, sx, sy);
        }
    }

    renderWater(ctx, camera, canvasWidth, canvasHeight) {
        this.waterOffset += 0.02;

        const waterScreenY = (CONFIG.WORLD.WATER_Y - camera.y) * camera.zoom + canvasHeight / 2;
        const waterHeight = CONFIG.WORLD.WATER_DEPTH * camera.zoom;

        // Water fill
        const waterGrad = ctx.createLinearGradient(0, waterScreenY, 0, waterScreenY + waterHeight);
        waterGrad.addColorStop(0, 'rgba(26,48,64,0.8)');
        waterGrad.addColorStop(1, 'rgba(15,30,45,0.95)');
        ctx.fillStyle = waterGrad;
        ctx.fillRect(0, waterScreenY, canvasWidth, waterHeight);

        // Water surface animation
        ctx.font = `${Math.round(12 * camera.zoom)}px ${CONFIG.CANVAS.FONT_FAMILY}`;
        ctx.fillStyle = CONFIG.COLORS.WATER_SURFACE;
        const waveChars = ['~', '~', '~~~', '~', '~~'];
        for (let x = 0; x < canvasWidth; x += 40 * camera.zoom) {
            const worldX = (x - canvasWidth / 2) / camera.zoom + camera.x;
            const waveY = Math.sin(worldX * 0.01 + this.waterOffset * 3) * 3 * camera.zoom;
            const char = waveChars[Math.floor((worldX * 0.05 + this.waterOffset) % waveChars.length + waveChars.length) % waveChars.length];
            ctx.fillText(char, x, waterScreenY + waveY);
        }
    }
}
