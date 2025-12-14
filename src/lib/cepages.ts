// Liste de tous les cépages disponibles avec leurs IDs (l'index correspond à l'ID)
// Albariño = ID 0, Left Bank Bordeaux Blend = ID 1, etc.
// Liste complète de 0 à 91 (92 cépages) basée sur le CSV "VS - Content for recommendations(Grape varieties).csv"
export const cepagesList = [
    'Albariño',
    'Left Bank Bordeaux Blend',
    'Cabernet Franc',
    'Cabernet Sauvignon',
    'Cava',
    'Champagne Brut',
    'Champagne Rosé',
    'Champagne Blanc de Blanc',
    'Champagne Brut Nature',
    'Champagne sec (sucré)',
    'Chardonnay',
    'Altesse',
    'Chasselas',
    'Chasselas roux',
    'Cornalin',
    'Corvina',
    'Diolinoir',
    'Divico',
    'Gamaret',
    'Gamaret Barrique',
    'Grenache noir',
    'Garanoir',
    'Assemblage Gamaret Garanoir',
    'Humagne rouge',
    'Humagne blanche',
    'Johannisberg',
    'Johanniter',
    'Macabeo',
    'Mara',
    'Marselan',
    'Mondeuse',
    'Molinara',
    'Mourvèdre',
    'Muscat',
    'Muscadelle',
    'Nero di Troia',
    'Païen',
    'Savagnin',
    'Heida',
    'Petite Arvine',
    'Pinot Meunier',
    'Plan robert',
    'Rondinella',
    'Primitivo',
    'Sauvignon gris',
    'Chenin Blanc',
    'Chenin Blanc Liquoreux',
    'Gamay',
    'Gewürztraminer',
    'Gewürztraminer moelleux',
    'Gewürztraminer Liquoreux',
    'Grenache',
    'Grenache Blanc',
    'Grüner Veltliner',
    'Ice Wine',
    'Madeira',
    'Malbec',
    'Marsala',
    'Marsanne',
    'Ermitage',
    'Melon de Bourgogne',
    'Mencia',
    'Merlot',
    'Monastrell',
    'Montepulciano',
    'Muscat Blanc',
    'Nebbiolo',
    'Nero d\'Avola',
    'Petit Verdot',
    'Pinot Blanc',
    'Pinot Noir',
    'Port',
    'Prosecco',
    'Rhône / GSM Blend (Côtes du Rhône)',
    'Riesling',
    'Roussanne',
    'Sangiovese',
    'Sauternais (vin liquoreux)',
    'Sauvignon Blanc',
    'Sémillon',
    'Sylvaner',
    'Syrah',
    'Tempranillo',
    'Touriga Nacional',
    'Vinho Verde',
    'Viognier',
    'Viura',
    'Zinfandel',
    'Carignan',
    'Cinsault',
    'Marsanne blanche',
    'Grenache blanche'
];

// Fonction pour obtenir le nom du cépage par son ID
export function getCepageNameById(id: number): string {
    if (id < 0 || id >= cepagesList.length) {
        return '';
    }
    return cepagesList[id] || '';
}

// Fonction pour obtenir l'ID du cépage par son nom
export function getCepageIdByName(name: string): number {
    const index = cepagesList.indexOf(name);
    return index !== -1 ? index : -1;
}

// Créer les options de cépages pour les dropdowns (utiliser l'ID comme value)
export function createCepagesOptions() {
    return cepagesList.map((cepage, index) => ({
        value: index.toString(), // ID numérique comme string
        label: cepage
    }));
}
