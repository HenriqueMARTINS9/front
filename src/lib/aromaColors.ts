// Mapping des arômes vers leurs catégories et couleurs
// Basé sur le tableau Excel fourni

export type AromaCategory = 'cheese' | 'protein' | 'vegetables' | 'fruits' | 'spices';

// Mapping des clés d'arômes vers leurs catégories
const aromaToCategory: Record<string, AromaCategory> = {
    // Cheese (0-6)
    'saltyCrumblyCheese': 'cheese',
    'pungentBlueCheese': 'cheese',
    'sourCheeseCream': 'cheese',
    'delicateButteryCheese': 'cheese',
    'nuttyHardCheese': 'cheese',
    'fruityUmamiCheese': 'cheese',
    'drySaltyUmamiCheese': 'cheese',
    
    // Sea Protein (7-9)
    'mollusk': 'protein',
    'finFish': 'protein',
    'shellfish': 'protein',
    
    // Earth Protein (10-13)
    'whiteMeat': 'protein',
    'redMeat': 'protein',
    'curedMeat': 'protein',
    'strongMarinade': 'protein',
    
    // Vegetables (14-20)
    'cruciferousVegetable': 'vegetables',
    'greenVegetable': 'vegetables',
    'harvestVegetable': 'vegetables',
    'allium': 'vegetables',
    'nightshade': 'vegetables',
    'bean': 'vegetables',
    'funghi': 'vegetables',
    
    // Spices / Herbs (21-27)
    'aromaticGreenHerb': 'spices',
    'dryHerb': 'spices',
    'resinousHerb': 'spices',
    'exoticSpice': 'spices',
    'bakingSpice': 'spices',
    'umamiSpice': 'spices',
    'redPepper': 'spices',
    'tertiaryAromas': 'spices',
    
    // Fruits (28-31)
    'redBlackFruits': 'fruits',
    'citrusFruits': 'fruits',
    'whiteFruits': 'fruits',
};

// Mapping des catégories vers les couleurs Tailwind
const categoryColors: Record<AromaCategory, { bg: string; text: string; puce: string }> = {
    'cheese': {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        puce: '#2563EB' // blue-600
    },
    'protein': {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        puce: '#CA8A04' // yellow-600
    },
    'vegetables': {
        bg: 'bg-green-100',
        text: 'text-green-700',
        puce: '#16A34A' // green-600
    },
    'fruits': {
        bg: 'bg-pink-100',
        text: 'text-pink-700',
        puce: '#DB2777' // pink-600 (rose-rouge)
    },
    'spices': {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        puce: '#EA580C' // orange-600
    }
};

/**
 * Obtient la catégorie d'un arôme à partir de sa clé
 */
export const getAromaCategory = (aromaKey: string): AromaCategory | null => {
    return aromaToCategory[aromaKey] || null;
};

/**
 * Obtient les couleurs pour un arôme à partir de sa clé
 */
export const getAromaColors = (aromaKey: string): { bg: string; text: string; puce: string } | null => {
    const category = getAromaCategory(aromaKey);
    if (!category) {
        return null;
    }
    return categoryColors[category];
};
