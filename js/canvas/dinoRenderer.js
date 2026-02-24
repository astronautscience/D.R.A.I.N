// Draws dinosaurs using geometric shapes (rectangles, circles, triangles)
// Gives a blocky-but-cartoony look with rounded corners

import { DINO_PARTS, PLANT_PARTS } from '../data/asciiArt.js';

export class DinoRenderer {
    constructor() {}

    drawDinosaur(ctx, speciesId, x, y, action, frame, facingRight, zoom, flashColor) {
        const parts = DINO_PARTS[speciesId];
        if (!parts) return;

        const anim = parts.animations[action];
        const frameOffsets = anim ? (anim[frame % anim.frames] || {}) : {};

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(zoom, zoom);

        if (!facingRight) {
            ctx.scale(-1, 1);
        }

        // Handle death rotation
        if (frameOffsets._rotate) {
            ctx.rotate((frameOffsets._rotate * Math.PI) / 180);
            ctx.translate(0, -40);
        }

        const baseColor = flashColor || parts.bodyColor;
        const bellyColor = flashColor ? flashColor : parts.bellyColor;
        const accentColor = flashColor ? flashColor : parts.accentColor;

        // Draw tail
        if (parts.tail) {
            for (const seg of parts.tail.segments) {
                const off = frameOffsets.tail || {};
                this.drawRoundRect(ctx, accentColor,
                    seg.x + (off.x || 0), seg.y + (off.y || 0),
                    seg.w + (off.w || 0), seg.h + (off.h || 0), seg.rx);
            }
        }

        // Draw legs (behind body)
        this.drawPart(ctx, parts.legL, accentColor, frameOffsets.legL);
        this.drawPart(ctx, parts.legR, accentColor, frameOffsets.legR);
        this.drawPart(ctx, parts.footL, accentColor, frameOffsets.footL);
        this.drawPart(ctx, parts.footR, accentColor, frameOffsets.footR);

        // Draw body
        this.drawPart(ctx, parts.body, baseColor, frameOffsets.body);
        this.drawPart(ctx, parts.belly, bellyColor, frameOffsets.belly);

        // Draw arms (small, in front of body)
        if (parts.armL) this.drawPart(ctx, parts.armL, accentColor, frameOffsets.armL);
        if (parts.armR) this.drawPart(ctx, parts.armR, accentColor, frameOffsets.armR);

        // Draw neck
        if (parts.neck) this.drawPart(ctx, parts.neck, baseColor, frameOffsets.neck);

        // Draw frill (triceratops)
        if (parts.frill) {
            this.drawPart(ctx, parts.frill, parts.frillColor || accentColor, frameOffsets.frill);
            if (parts.frillInner) {
                this.drawPart(ctx, parts.frillInner, bellyColor, frameOffsets.frillInner || frameOffsets.frill);
            }
        }

        // Draw horns (triceratops)
        if (parts.hornTop) this.drawTriangle(ctx, '#FFFFF0', parts.hornTop.points, frameOffsets.hornTop);
        if (parts.hornL) this.drawTriangle(ctx, '#FFFFF0', parts.hornL.points, frameOffsets.hornL);
        if (parts.hornR) this.drawTriangle(ctx, '#FFFFF0', parts.hornR.points, frameOffsets.hornR);

        // Draw head
        this.drawPart(ctx, parts.head, baseColor, frameOffsets.head);

        // Draw jaw
        if (parts.jaw) this.drawPart(ctx, parts.jaw, baseColor, frameOffsets.jaw);

        // Draw teeth
        if (parts.teeth) {
            for (const tooth of parts.teeth) {
                const jawOff = frameOffsets.jaw || {};
                this.drawRoundRect(ctx, '#FFFFF0',
                    tooth.x + (jawOff.x || 0),
                    tooth.y + (jawOff.y || 0),
                    tooth.w, tooth.h, 1);
            }
        }

        // Draw beak (triceratops)
        if (parts.beak) this.drawPart(ctx, parts.beak, accentColor, frameOffsets.beak);

        // Draw eye
        if (parts.eye) {
            const headOff = frameOffsets.head || {};
            // Eye white
            ctx.beginPath();
            ctx.arc(parts.eye.x + (headOff.x || 0), parts.eye.y + (headOff.y || 0), parts.eye.r, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            // Pupil
            if (parts.pupil) {
                ctx.beginPath();
                ctx.arc(parts.pupil.x + (headOff.x || 0), parts.pupil.y + (headOff.y || 0), parts.pupil.r, 0, Math.PI * 2);
                ctx.fillStyle = parts.eyeColor || '#000000';
                ctx.fill();
            }
        }

        ctx.restore();
    }

    drawPart(ctx, part, color, offsets) {
        if (!part) return;
        const off = offsets || {};
        if (part.r !== undefined) {
            // Circle
            ctx.beginPath();
            ctx.arc(part.x + (off.x || 0), part.y + (off.y || 0), part.r + (off.r || 0), 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        } else if (part.w !== undefined) {
            // Rounded rectangle
            this.drawRoundRect(ctx, color,
                part.x + (off.x || 0),
                part.y + (off.y || 0),
                part.w + (off.w || 0),
                part.h + (off.h || 0),
                part.rx || 0);
        }
    }

    drawRoundRect(ctx, color, x, y, w, h, rx) {
        if (w <= 0 || h <= 0) return;
        rx = Math.min(rx, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + rx, y);
        ctx.lineTo(x + w - rx, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + rx);
        ctx.lineTo(x + w, y + h - rx);
        ctx.quadraticCurveTo(x + w, y + h, x + w - rx, y + h);
        ctx.lineTo(x + rx, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - rx);
        ctx.lineTo(x, y + rx);
        ctx.quadraticCurveTo(x, y, x + rx, y);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }

    drawTriangle(ctx, color, points, offsets) {
        if (!points || points.length < 3) return;
        const off = offsets || {};
        const ox = off.x || 0;
        const oy = off.y || 0;
        ctx.beginPath();
        ctx.moveTo(points[0][0] + ox, points[0][1] + oy);
        ctx.lineTo(points[1][0] + ox, points[1][1] + oy);
        ctx.lineTo(points[2][0] + ox, points[2][1] + oy);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }

    drawPlant(ctx, plantType, x, y, zoom, health) {
        const parts = PLANT_PARTS[plantType];
        if (!parts) return;

        const alpha = health !== undefined ? Math.max(0.3, health) : 1;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(zoom, zoom);
        ctx.globalAlpha = alpha;

        if (plantType === 'tree') {
            // Trunk
            if (parts.trunk) {
                this.drawRoundRect(ctx, parts.trunkColor || '#6B4226',
                    parts.trunk.x, parts.trunk.y, parts.trunk.w, parts.trunk.h, parts.trunk.rx);
            }
            // Canopy blobs
            if (parts.canopy) {
                for (const blob of parts.canopy) {
                    ctx.beginPath();
                    ctx.ellipse(blob.x, blob.y, blob.rx, blob.ry, 0, 0, Math.PI * 2);
                    ctx.fillStyle = parts.color;
                    ctx.fill();
                }
                // Darker overlay for depth
                for (const blob of parts.canopy) {
                    ctx.beginPath();
                    ctx.ellipse(blob.x + 3, blob.y + 3, blob.rx * 0.7, blob.ry * 0.7, 0, 0, Math.PI * 2);
                    ctx.fillStyle = parts.darkColor;
                    ctx.fill();
                }
            }
        } else if (plantType === 'bush') {
            if (parts.blobs) {
                for (const blob of parts.blobs) {
                    ctx.beginPath();
                    ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
                    ctx.fillStyle = parts.color;
                    ctx.fill();
                }
                // Highlight
                for (const blob of parts.blobs) {
                    ctx.beginPath();
                    ctx.arc(blob.x - 2, blob.y - 2, blob.r * 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = parts.darkColor;
                    ctx.fill();
                }
            }
        } else if (plantType === 'fern' || plantType === 'cycad') {
            // Trunk/stem for cycad
            if (parts.trunk) {
                this.drawRoundRect(ctx, parts.trunkColor || '#6B4226',
                    parts.trunk.x, parts.trunk.y, parts.trunk.w, parts.trunk.h, parts.trunk.rx);
            }
            // Fronds/leaves
            const fronds = parts.fronds || parts.leaves;
            if (fronds) {
                const stemTop = parts.trunk ? parts.trunk.y : -15;
                for (const frond of fronds) {
                    ctx.save();
                    ctx.translate(0, stemTop);
                    ctx.rotate((frond.angle * Math.PI) / 180);
                    // Draw frond as tapered shape
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.quadraticCurveTo(frond.length * 0.5, -frond.width / 2, frond.length, -2);
                    ctx.quadraticCurveTo(frond.length * 0.5, frond.width / 2, 0, 0);
                    ctx.fillStyle = parts.color;
                    ctx.fill();
                    ctx.restore();
                }
            }
            // Stem for fern
            if (parts.stem && !parts.trunk) {
                this.drawRoundRect(ctx, parts.darkColor,
                    -parts.stem.w / 2, -parts.stem.h, parts.stem.w, parts.stem.h, 2);
            }
        }

        ctx.restore();
    }

    drawFish(ctx, x, y, zoom, facingRight) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(zoom, zoom);
        if (!facingRight) ctx.scale(-1, 1);

        // Fish body
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#7799BB';
        ctx.fill();

        // Tail
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(-20, -6);
        ctx.lineTo(-20, 6);
        ctx.closePath();
        ctx.fillStyle = '#6688AA';
        ctx.fill();

        // Eye
        ctx.beginPath();
        ctx.arc(6, -1, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(7, -1, 1, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();

        ctx.restore();
    }
}
