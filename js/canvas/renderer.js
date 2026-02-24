// Core Canvas rendering engine with camera system

import { CONFIG } from '../config.js';
import { Background } from './background.js';
import { DinoRenderer } from './dinoRenderer.js';

class Camera {
    constructor(canvasWidth, canvasHeight) {
        this.x = CONFIG.WORLD.WIDTH / 2;
        this.y = CONFIG.WORLD.GROUND_Y - 200;
        this.zoom = 1.0;
        this.targetX = this.x;
        this.targetY = this.y;
        this.smoothing = 0.08;
        this.minZoom = 0.3;
        this.maxZoom = 2.5;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.followTarget = null;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragCamStartX = 0;
        this.dragCamStartY = 0;
        this.wasDragging = false;
    }

    update() {
        if (this.followTarget && this.followTarget.alive) {
            this.targetX = this.followTarget.x;
            this.targetY = this.followTarget.y;
        }
        this.x += (this.targetX - this.x) * this.smoothing;
        this.y += (this.targetY - this.y) * this.smoothing;
    }

    worldToScreen(wx, wy) {
        return {
            x: (wx - this.x) * this.zoom + this.canvasWidth / 2,
            y: (wy - this.y) * this.zoom + this.canvasHeight / 2,
        };
    }

    screenToWorld(sx, sy) {
        return {
            x: (sx - this.canvasWidth / 2) / this.zoom + this.x,
            y: (sy - this.canvasHeight / 2) / this.zoom + this.y,
        };
    }

    isVisible(wx, wy, ww, wh) {
        const screen = this.worldToScreen(wx, wy);
        const sw = ww * this.zoom;
        const sh = wh * this.zoom;
        const margin = 100;
        return (
            screen.x + sw > -margin &&
            screen.x < this.canvasWidth + margin &&
            screen.y + sh > -margin &&
            screen.y < this.canvasHeight + margin
        );
    }

    zoomAt(delta, screenX, screenY) {
        const worldBefore = this.screenToWorld(screenX, screenY);
        this.zoom *= delta > 0 ? 0.9 : 1.1;
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom));
        const worldAfter = this.screenToWorld(screenX, screenY);
        this.targetX += worldBefore.x - worldAfter.x;
        this.targetY += worldBefore.y - worldAfter.y;
        this.x += worldBefore.x - worldAfter.x;
        this.y += worldBefore.y - worldAfter.y;
    }

    startDrag(screenX, screenY) {
        this.isDragging = true;
        this.wasDragging = false;
        this.dragStartX = screenX;
        this.dragStartY = screenY;
        this.dragCamStartX = this.targetX;
        this.dragCamStartY = this.targetY;
        this.followTarget = null;
    }

    drag(screenX, screenY) {
        if (!this.isDragging) return;
        const dx = screenX - this.dragStartX;
        const dy = screenY - this.dragStartY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            this.wasDragging = true;
        }
        this.targetX = this.dragCamStartX - dx / this.zoom;
        this.targetY = this.dragCamStartY - dy / this.zoom;
    }

    endDrag() {
        this.isDragging = false;
    }

    follow(entity) {
        this.followTarget = entity;
    }

    resize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }
}

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.camera = new Camera(canvas.width, canvas.height);
        this.background = new Background();
        this.dinoRenderer = new DinoRenderer();
        this.selectedEntity = null;
        this.hoveredEntity = null;
        this.mouseScreenX = 0;
        this.mouseScreenY = 0;

        // Callbacks
        this.onEntitySelect = null;
        this.onEntityDeselect = null;

        this.setupInputHandlers();
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.resize(this.canvas.width, this.canvas.height);
    }

    setupInputHandlers() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.camera.startDrag(e.clientX, e.clientY);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            this.camera.drag(e.clientX, e.clientY);
            this.mouseScreenX = e.clientX;
            this.mouseScreenY = e.clientY;
        });

        this.canvas.addEventListener('mouseup', (e) => {
            const wasDragging = this.camera.wasDragging;
            this.camera.endDrag();

            if (!wasDragging) {
                if (this.hoveredEntity) {
                    this.selectedEntity = this.hoveredEntity;
                    if (this.onEntitySelect) this.onEntitySelect(this.selectedEntity);
                } else {
                    this.selectedEntity = null;
                    if (this.onEntityDeselect) this.onEntityDeselect();
                }
            }
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.camera.endDrag();
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.camera.zoomAt(e.deltaY, e.clientX, e.clientY);
        }, { passive: false });

        this.canvas.addEventListener('dblclick', () => {
            if (this.hoveredEntity) {
                this.camera.follow(this.hoveredEntity);
            }
        });
    }

    render(entities) {
        const { ctx, canvas, camera } = this;
        const w = canvas.width;
        const h = canvas.height;

        camera.update();

        // Clear
        ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
        ctx.fillRect(0, 0, w, h);

        // Background
        this.background.render(ctx, camera, w, h);

        // Sort by y for depth
        const sorted = [...entities].filter(e => e.alive).sort((a, b) => a.y - b.y);

        // Check hover
        this.hoveredEntity = null;
        const mouseWorld = camera.screenToWorld(this.mouseScreenX, this.mouseScreenY);

        for (const entity of sorted) {
            if (!camera.isVisible(entity.x - entity.width / 2, entity.y - entity.height, entity.width, entity.height)) continue;

            const screen = camera.worldToScreen(entity.x, entity.y);

            // Draw based on entity type
            if (entity.type === 'dinosaur') {
                const flashColor = entity.flashTimer > 0 ? '#FF4444' : null;
                this.dinoRenderer.drawDinosaur(
                    ctx, entity.speciesId,
                    screen.x, screen.y,
                    entity.currentAction, entity.currentFrame,
                    entity.facingRight, camera.zoom,
                    flashColor
                );
            } else if (entity.type === 'plant') {
                this.dinoRenderer.drawPlant(
                    ctx, entity.plantType,
                    screen.x, screen.y,
                    camera.zoom, entity.healthPercent
                );
            } else if (entity.type === 'fish') {
                this.dinoRenderer.drawFish(
                    ctx, screen.x, screen.y,
                    camera.zoom, entity.facingRight
                );
            }

            // Check hover (bounding box in world coords)
            const halfW = entity.width / 2;
            if (mouseWorld.x >= entity.x - halfW &&
                mouseWorld.x <= entity.x + halfW &&
                mouseWorld.y >= entity.y - entity.height &&
                mouseWorld.y <= entity.y) {
                this.hoveredEntity = entity;
            }
        }

        // Selection highlight
        if (this.selectedEntity && this.selectedEntity.alive) {
            this.drawHighlight(this.selectedEntity, CONFIG.COLORS.TEXT_HIGHLIGHT, 2, true);
        }

        // Hover highlight
        if (this.hoveredEntity && this.hoveredEntity !== this.selectedEntity) {
            this.drawHighlight(this.hoveredEntity, 'rgba(200,184,138,0.5)', 1, false);
            this.drawTooltip(this.hoveredEntity);
        }

        // Cursor
        this.canvas.style.cursor = this.hoveredEntity ? 'pointer' : (camera.isDragging ? 'grabbing' : 'grab');
    }

    drawHighlight(entity, color, lineWidth, dashed) {
        const screen = this.camera.worldToScreen(entity.x, entity.y);
        const w = entity.width * this.camera.zoom;
        const h = entity.height * this.camera.zoom;

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        if (dashed) this.ctx.setLineDash([5, 3]);
        this.ctx.strokeRect(screen.x - w / 2 - 4, screen.y - h - 4, w + 8, h + 8);
        if (dashed) this.ctx.setLineDash([]);

        // Name label for selection
        if (dashed && entity.shortName) {
            const fontSize = Math.round(13 * this.camera.zoom);
            this.ctx.font = `bold ${fontSize}px ${CONFIG.CANVAS.FONT_FAMILY}`;
            this.ctx.fillStyle = color;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(entity.shortName, screen.x, screen.y - h - 12);
            this.ctx.textAlign = 'left';
        }
    }

    drawTooltip(entity) {
        const screen = this.camera.worldToScreen(entity.x, entity.y);
        const h = entity.height * this.camera.zoom;
        const name = entity.shortName || entity.type;
        const state = entity.currentAction || '';
        const label = `${name} - ${state}`;

        const fontSize = Math.max(11, Math.round(11 * this.camera.zoom));
        this.ctx.font = `${fontSize}px ${CONFIG.CANVAS.FONT_FAMILY}`;
        const textW = this.ctx.measureText(label).width;
        const tx = screen.x - textW / 2 - 5;
        const ty = screen.y - h - 28;

        this.ctx.fillStyle = CONFIG.COLORS.PANEL_BG;
        this.ctx.fillRect(tx, ty, textW + 10, fontSize + 6);
        this.ctx.fillStyle = CONFIG.COLORS.TEXT_PRIMARY;
        this.ctx.fillText(label, tx + 5, ty + fontSize + 1);
    }
}
