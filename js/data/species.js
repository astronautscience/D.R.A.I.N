// Species database with stats, facts, and descriptions

export const SPECIES = {
    trex: {
        name: 'Tyrannosaurus Rex',
        shortName: 'T-Rex',
        diet: 'carnivore',
        trophicLevel: 3,
        habitat: 'land',
        size: 'large',
        speed: 3.5,
        health: 150,
        attackPower: 40,
        defensePower: 0,
        defenseChance: 0.1,
        detectionRange: 350,
        color: '#cc4444',
        description: 'The king of the dinosaurs. One of the largest land predators ever to walk the Earth.',
        facts: [
            'T-Rex had the strongest bite force of any land animal ever — over 12,800 pounds!',
            'Despite their tiny arms, each arm could lift over 400 pounds.',
            'T-Rex could run at speeds up to 25 mph.',
            'They had excellent binocular vision, better than modern hawks.',
            'A T-Rex tooth could be up to 12 inches long, including the root.',
        ],
        period: 'Late Cretaceous (68-66 million years ago)',
        preyList: ['triceratops', 'parasaurolophus', 'ankylosaurus', 'pachycephalosaurus', 'gallimimus', 'compsognathus'],
        predatorList: [],
        spawnWeight: 1,
        asciiWidth: 41,
        asciiHeight: 19,
    },

    triceratops: {
        name: 'Triceratops',
        shortName: 'Triceratops',
        diet: 'herbivore',
        trophicLevel: 1,
        habitat: 'land',
        size: 'large',
        speed: 2.5,
        health: 130,
        attackPower: 25,
        defensePower: 25,
        defenseChance: 0.4,
        detectionRange: 250,
        color: '#66cc66',
        description: 'A powerful three-horned herbivore with a massive neck frill for defense.',
        facts: [
            'Triceratops means "three-horned face" in Greek.',
            'Their frill was made of solid bone and could grow up to 7 feet wide.',
            'They had between 400-800 teeth arranged in groups called batteries.',
            'Triceratops fossils show bite marks from T-Rex, evidence of epic battles.',
            'They could weigh up to 12 tons — as heavy as two African elephants!',
        ],
        period: 'Late Cretaceous (68-66 million years ago)',
        preyList: [],
        predatorList: ['trex', 'allosaurus'],
        spawnWeight: 3,
        asciiWidth: 36,
        asciiHeight: 15,
    },

    compsognathus: {
        name: 'Compsognathus',
        shortName: 'Compy',
        diet: 'carnivore',
        trophicLevel: 2,
        habitat: 'land',
        size: 'tiny',
        speed: 4.0,
        health: 20,
        attackPower: 5,
        defensePower: 0,
        defenseChance: 0.0,
        detectionRange: 150,
        color: '#cc8844',
        description: 'One of the smallest known dinosaurs, about the size of a chicken.',
        facts: [
            'Compsognathus was only about 3 feet long and weighed around 6 pounds.',
            'Its name means "elegant jaw" in Greek.',
            'It was one of the first complete dinosaur skeletons ever found.',
            'Compsognathus was likely covered in proto-feathers.',
            'They were incredibly fast runners for their size.',
        ],
        period: 'Late Jurassic (150 million years ago)',
        preyList: [],
        predatorList: ['trex', 'allosaurus', 'velociraptor', 'dilophosaurus'],
        spawnWeight: 5,
        asciiWidth: 12,
        asciiHeight: 9,
    },
};

// Get species color based on diet for UI
export function getSpeciesColor(speciesId) {
    const species = SPECIES[speciesId];
    if (!species) return '#c8b88a';
    return species.color;
}

// Get all species of a given diet type
export function getSpeciesByDiet(diet) {
    return Object.entries(SPECIES)
        .filter(([, data]) => data.diet === diet)
        .map(([id]) => id);
}
