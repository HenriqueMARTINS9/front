// Système de couleurs pour les arômes selon les catégories
export function getAromaColor(aromaKey: string): { bg: string; text: string; dot: string } {
    // Fromages (bleu) - les 7 premiers
    const cheeseAromas = [
        'saltyCrumblyCheese',
        'pungentBlueCheese', 
        'sourCheeseCream',
        'delicateButteryCheese',
        'nuttyHardCheese',
        'fruityUmamiCheese',
        'drySaltyUmamiCheese'
    ];
    
    // Protéines (jaune) - les 7 suivants
    const proteinAromas = [
        'mollusk',
        'finFish',
        'shellfish',
        'whiteMeat',
        'redMeat',
        'curedMeat',
        'strongMarinade'
    ];
    
    // Herbes et légumes (vert) - les 15 suivants
    const herbAromas = [
        'cruciferousVegetable',
        'greenVegetable',
        'harvestVegetable',
        'allium',
        'nightshade',
        'bean',
        'funghi',
        'aromaticGreenHerb',
        'dryHerb',
        'resinousHerb',
        'exoticSpice',
        'bakingSpice',
        'umamiSpice',
        'redPepper',
        'tertiaryAromas'
    ];
    
    // Fruits (rouge) - les 3 derniers
    const fruitAromas = [
        'redBlackFruits',
        'citrusFruits',
        'whiteFruits'
    ];
    
    if (cheeseAromas.includes(aromaKey)) {
        return {
            bg: 'bg-blue-100',
            text: 'text-blue-700',
            dot: 'bg-blue-500'
        };
    }
    
    if (proteinAromas.includes(aromaKey)) {
        return {
            bg: 'bg-yellow-100',
            text: 'text-yellow-700',
            dot: 'bg-yellow-500'
        };
    }
    
    if (herbAromas.includes(aromaKey)) {
        return {
            bg: 'bg-green-100',
            text: 'text-green-700',
            dot: 'bg-green-500'
        };
    }
    
    if (fruitAromas.includes(aromaKey)) {
        return {
            bg: 'bg-red-100',
            text: 'text-red-700',
            dot: 'bg-red-500'
        };
    }
    
    // Couleur par défaut si l'arôme n'est pas trouvé
    return {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        dot: 'bg-gray-500'
    };
}

// Fonction pour obtenir la couleur selon le type d'arôme (principal ou secondaire)
export function getAromaColorByType(aromaKey: string, isMain: boolean = false): { bg: string; text: string; dot: string } {
    const baseColor = getAromaColor(aromaKey);
    
    // Tous les arômes ont la même couleur de fond, seul le point change selon le type
    return {
        bg: baseColor.bg,
        text: baseColor.text,
        dot: isMain ? baseColor.dot.replace('-500', '-600') : baseColor.dot // Point plus foncé pour l'arôme principal
    };
}

// Fonction utilitaire pour s'assurer qu'un arôme a toujours une couleur de puce
export function ensurePuceColor(aromaKey: string, isMain: boolean = false): string {
    const colors = getAromaColorByType(aromaKey, isMain);
    return colors.dot || 'bg-gray-500'; // Couleur par défaut si aucune n'est trouvée
}
