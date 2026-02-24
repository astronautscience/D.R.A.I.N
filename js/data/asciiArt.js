// Dinosaur body part definitions for shape-based rendering
// Each species defines body parts as geometric shapes (rects, circles, triangles, arcs)
// Coordinates are relative to the entity's anchor point (bottom-center of feet)
// All sizes are in world units; renderer scales by camera zoom

export const DINO_PARTS = {
    trex: {
        // Color palette
        bodyColor: '#8B4513',
        bellyColor: '#D2B48C',
        accentColor: '#654321',
        eyeColor: '#FFD700',

        // Body parts with relative positions and sizes
        // Parts are drawn in order (back to front)
        body: { x: -40, y: -100, w: 80, h: 60, rx: 12 },
        belly: { x: -30, y: -85, w: 55, h: 35, rx: 10 },
        tail: {
            segments: [
                { x: -70, y: -95, w: 35, h: 20, rx: 8 },
                { x: -100, y: -90, w: 35, h: 15, rx: 6 },
                { x: -125, y: -82, w: 30, h: 10, rx: 5 },
            ]
        },
        neck: { x: 20, y: -130, w: 25, h: 45, rx: 8 },
        head: { x: 15, y: -165, w: 55, h: 40, rx: 8 },
        jaw: { x: 40, y: -145, w: 35, h: 15, rx: 4 },
        eye: { x: 48, y: -158, r: 7 },
        pupil: { x: 50, y: -157, r: 3 },
        teeth: [
            { x: 55, y: -145, w: 4, h: 8 },
            { x: 62, y: -145, w: 4, h: 6 },
            { x: 69, y: -145, w: 4, h: 7 },
        ],
        armL: { x: 15, y: -85, w: 10, h: 18, rx: 3 },
        armR: { x: 22, y: -82, w: 10, h: 20, rx: 3 },
        legL: { x: -20, y: -45, w: 18, h: 45, rx: 5 },
        legR: { x: 10, y: -45, w: 18, h: 45, rx: 5 },
        footL: { x: -25, y: -5, w: 25, h: 8, rx: 4 },
        footR: { x: 8, y: -5, w: 25, h: 8, rx: 4 },

        // Animation offsets per action (applied additively to part positions)
        animations: {
            idle: {
                frames: 2,
                interval: 600,
                0: {}, // no offset
                1: { body: { y: -2 }, head: { y: -2 }, neck: { y: -2 } },
            },
            walking: {
                frames: 4,
                interval: 180,
                0: { legL: { y: -10, h: -5 }, footL: { y: -12 }, legR: { y: 5 }, footR: { y: 5 } },
                1: { legL: { y: 0 }, footL: { y: 0 }, legR: { y: 0 }, footR: { y: 0 } },
                2: { legL: { y: 5 }, footL: { y: 5 }, legR: { y: -10, h: -5 }, footR: { y: -12 } },
                3: { legL: { y: 0 }, footL: { y: 0 }, legR: { y: 0 }, footR: { y: 0 } },
            },
            attacking: {
                frames: 3,
                interval: 150,
                0: { head: { x: 10 }, jaw: { x: 10, y: 5 } },
                1: { head: { x: 20 }, jaw: { x: 20, y: 12 } },
                2: { head: { x: 5 }, jaw: { x: 5, y: 2 } },
            },
            eating: {
                frames: 2,
                interval: 300,
                0: { head: { y: 20, x: -5 }, neck: { y: 10 }, jaw: { y: 25, x: -5 } },
                1: { head: { y: 25, x: -5 }, neck: { y: 12 }, jaw: { y: 22, x: -5 } },
            },
            dead: {
                frames: 1,
                interval: 99999,
                0: { _rotate: -90 },
            },
        },
        drawWidth: 160,
        drawHeight: 170,
    },

    triceratops: {
        bodyColor: '#5F8A3E',
        bellyColor: '#A8C98A',
        accentColor: '#3D5C28',
        eyeColor: '#2E1A0E',
        frillColor: '#7BA858',

        body: { x: -45, y: -80, w: 90, h: 55, rx: 15 },
        belly: { x: -35, y: -65, w: 65, h: 30, rx: 10 },
        tail: {
            segments: [
                { x: -75, y: -75, w: 35, h: 18, rx: 8 },
                { x: -100, y: -70, w: 30, h: 12, rx: 6 },
            ]
        },
        frill: { x: 20, y: -130, w: 50, h: 50, rx: 25 },
        frillInner: { x: 27, y: -123, w: 36, h: 36, rx: 18 },
        head: { x: 35, y: -105, w: 40, h: 30, rx: 6 },
        beak: { x: 68, y: -98, w: 18, h: 15, rx: 3 },
        eye: { x: 55, y: -100, r: 5 },
        pupil: { x: 57, y: -99, r: 2 },
        hornTop: { points: [[45, -130], [48, -155], [51, -130]] },
        hornL: { points: [[58, -105], [70, -118], [62, -100]] },
        hornR: { points: [[58, -100], [72, -110], [62, -95]] },
        legL: { x: -25, y: -30, w: 20, h: 32, rx: 6 },
        legR: { x: 10, y: -30, w: 20, h: 32, rx: 6 },
        footL: { x: -28, y: -3, w: 26, h: 6, rx: 3 },
        footR: { x: 8, y: -3, w: 26, h: 6, rx: 3 },

        animations: {
            idle: {
                frames: 2,
                interval: 700,
                0: {},
                1: { body: { y: -1 }, head: { y: -1 }, frill: { y: -1 } },
            },
            walking: {
                frames: 4,
                interval: 220,
                0: { legL: { y: -8 }, footL: { y: -10 }, legR: { y: 4 }, footR: { y: 4 } },
                1: {},
                2: { legR: { y: -8 }, footR: { y: -10 }, legL: { y: 4 }, footL: { y: 4 } },
                3: {},
            },
            attacking: {
                frames: 3,
                interval: 160,
                0: { head: { x: 5 }, frill: { x: 5 }, beak: { x: 5 } },
                1: { head: { x: 18 }, frill: { x: 15 }, beak: { x: 22 } },
                2: { head: { x: 3 }, frill: { x: 3 }, beak: { x: 3 } },
            },
            eating: {
                frames: 2,
                interval: 350,
                0: { head: { y: 15, x: 5 }, frill: { y: 10 }, beak: { y: 18, x: 5 } },
                1: { head: { y: 18, x: 5 }, frill: { y: 12 }, beak: { y: 15, x: 5 } },
            },
            dead: {
                frames: 1,
                interval: 99999,
                0: { _rotate: -90 },
            },
        },
        drawWidth: 150,
        drawHeight: 160,
    },

    compsognathus: {
        bodyColor: '#C4A94D',
        bellyColor: '#E8D898',
        accentColor: '#8B7832',
        eyeColor: '#1A1A1A',

        body: { x: -15, y: -40, w: 30, h: 22, rx: 8 },
        belly: { x: -10, y: -32, w: 18, h: 12, rx: 5 },
        tail: {
            segments: [
                { x: -30, y: -38, w: 18, h: 8, rx: 4 },
                { x: -45, y: -35, w: 18, h: 6, rx: 3 },
                { x: -58, y: -32, w: 15, h: 4, rx: 2 },
            ]
        },
        neck: { x: 8, y: -55, w: 8, h: 20, rx: 4 },
        head: { x: 6, y: -68, w: 22, h: 16, rx: 6 },
        jaw: { x: 18, y: -60, w: 12, h: 6, rx: 2 },
        eye: { x: 20, y: -65, r: 3 },
        pupil: { x: 21, y: -64, r: 1.5 },
        legL: { x: -8, y: -20, w: 8, h: 20, rx: 3 },
        legR: { x: 4, y: -20, w: 8, h: 20, rx: 3 },
        footL: { x: -10, y: -3, w: 12, h: 4, rx: 2 },
        footR: { x: 3, y: -3, w: 12, h: 4, rx: 2 },

        animations: {
            idle: {
                frames: 2,
                interval: 400,
                0: {},
                1: { head: { y: -2 }, neck: { y: -1 } },
            },
            walking: {
                frames: 4,
                interval: 120,
                0: { legL: { y: -6 }, footL: { y: -8 }, legR: { y: 3 }, footR: { y: 3 } },
                1: {},
                2: { legR: { y: -6 }, footR: { y: -8 }, legL: { y: 3 }, footL: { y: 3 } },
                3: {},
            },
            attacking: {
                frames: 3,
                interval: 100,
                0: { head: { x: 5 }, jaw: { x: 5, y: 3 } },
                1: { head: { x: 10 }, jaw: { x: 12, y: 6 } },
                2: {},
            },
            eating: {
                frames: 2,
                interval: 250,
                0: { head: { y: 10, x: -3 }, neck: { y: 5 }, jaw: { y: 12, x: -3 } },
                1: { head: { y: 12, x: -3 }, neck: { y: 6 }, jaw: { y: 10, x: -3 } },
            },
            dead: {
                frames: 1,
                interval: 99999,
                0: { _rotate: -90 },
            },
        },
        drawWidth: 75,
        drawHeight: 72,
    },
};

// Plant shape definitions
export const PLANT_PARTS = {
    fern: {
        color: '#558844',
        darkColor: '#446633',
        leaves: [
            { angle: -60, length: 20, width: 8 },
            { angle: -30, length: 25, width: 10 },
            { angle: 0, length: 28, width: 10 },
            { angle: 30, length: 25, width: 10 },
            { angle: 60, length: 20, width: 8 },
        ],
        stem: { w: 4, h: 15 },
        drawWidth: 60,
        drawHeight: 50,
    },
    tree: {
        color: '#558844',
        darkColor: '#446633',
        trunkColor: '#6B4226',
        canopy: [
            { x: 0, y: -80, rx: 30, ry: 25 },
            { x: -15, y: -60, rx: 25, ry: 20 },
            { x: 15, y: -60, rx: 25, ry: 20 },
        ],
        trunk: { x: -6, y: -30, w: 12, h: 35, rx: 3 },
        drawWidth: 70,
        drawHeight: 110,
    },
    bush: {
        color: '#66aa44',
        darkColor: '#558833',
        blobs: [
            { x: 0, y: -15, r: 15 },
            { x: -12, y: -10, r: 12 },
            { x: 12, y: -10, r: 12 },
        ],
        drawWidth: 40,
        drawHeight: 35,
    },
    cycad: {
        color: '#558844',
        darkColor: '#446633',
        trunkColor: '#7B5B3A',
        trunk: { x: -5, y: -40, w: 10, h: 40, rx: 4 },
        fronds: [
            { angle: -70, length: 30, width: 10 },
            { angle: -35, length: 35, width: 12 },
            { angle: 0, length: 25, width: 10 },
            { angle: 35, length: 35, width: 12 },
            { angle: 70, length: 30, width: 10 },
        ],
        drawWidth: 70,
        drawHeight: 75,
    },
};

export const ACTION_FRAME_RATES = {
    idle: 600,
    walking: 180,
    attacking: 150,
    eating: 300,
    dead: 99999,
};
