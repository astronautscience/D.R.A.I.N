// Food chain / predator-prey relationship graph

export const FOOD_CHAIN = {
    // Predator -> list of prey species
    relationships: {
        trex: ['triceratops', 'compsognathus'],
        compsognathus: ['fish'],
        // More species will be added in Phase 4
    },

    canEat(predatorId, preyId) {
        const prey = this.relationships[predatorId];
        return prey ? prey.includes(preyId) : false;
    },

    getPredators(speciesId) {
        const predators = [];
        for (const [predator, preyList] of Object.entries(this.relationships)) {
            if (preyList.includes(speciesId)) {
                predators.push(predator);
            }
        }
        return predators;
    },

    getPrey(speciesId) {
        return this.relationships[speciesId] || [];
    },

    getAllRelationships() {
        return this.relationships;
    }
};
