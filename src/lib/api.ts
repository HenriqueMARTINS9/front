import axios from 'axios';
import { getCepageIdByName, getCepageNameById } from './cepages';

// Types pour les vins (basés sur l'API VirtualSomm)
export interface RestaurantWine {
    wine_id: number;
    wine_type: { [key: string]: string };
    domain: { [key: string]: string };
    country: { [key: string]: string };
    appellation: { [key: string]: string };
    wine_name: { [key: string]: string };
    grapes_varieties: Array<{
        variety_id: number;
        variety_name: { [key: string]: string };
        variety_percent: number;
    }>;
    year: number;
    price: number;
    format_cl: number;
    global_score: string;
    internal_score: string;
}

// Types pour les plats (basés sur l'API VirtualSomm)
export interface Dish {
    dish_id: number;
    dish_type: { [key: string]: string };
    dish_name: { [key: string]: string };
    dish_description?: { [key: string]: string };
    food_cat_1: number;
    food_cat_1_percent: number;
    food_cat_2: number;
    food_cat_2_percent: number;
    food_cat_3: number;
    food_cat_3_percent: number;
}

// Types pour les aliments (basés sur l'API VirtualSomm)
export interface SubFood {
    id: number;
    name: { [key: string]: string };
    examples: { [key: string]: string };
    values: { [key: string]: number };
}

export interface Food {
    name: { [key: string]: string };
    sub_foods: SubFood[];
}

export interface Foods {
    [key: string]: Food[];
}

// Types pour les recommandations
export interface Recommendation {
    name: string;
    variety_id: number;
    score: number;
    also_try: string[];
}

// Types pour les questions et réponses
export interface Question {
    id: number;
    title: { [key: string]: string };
    description: { [key: string]: string };
    type: 'single' | 'multi' | 'group';
    category: {
        id: number;
        title: { [key: string]: string };
    };
    responses: Array<{
        title: { [key: string]: string };
    }>;
    is_last?: boolean;
}

export interface Answer {
    version?: number;
    question_id: number;
    answers: Array<{
        value: boolean;
    }>;
}

// Types pour l'authentification
export interface User {
    username: string;
    email?: string;
}

export interface UserWithPassword extends User {
    password: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

// Types pour l'authentification des restaurants
export interface Restaurant {
    id: number;
    name: string;
    email: string;
    password?: string; // Optionnel car on ne retourne pas le mot de passe dans les réponses
    address?: string;
    phone?: string;
}

export interface RestaurantLoginResponse {
    access_token: string;
    token_type: string;
    restaurant: Restaurant;
}

// Types pour compatibilité avec l'ancien système
export interface Vin {
    id: string;
    nom: string;
    subname?: string;
    type: string;
    cepage: string;
    cepages?: Array<{
        id: string;
        nom: string;
        pourcentage: number;
    }>;
    region: string;
    pays: string;
    millesime: number;
    prix: number;
    restaurant: string;
    pointsDeVente: [boolean];
    motsCles: Array<{
        id: string;
        label: string;
        color: string;
        textColor: string;
    }>;
    formats?: Array<{
        id: string;
        nom: string;
        prix: number;
    }>;
}

// Fonction pour convertir format_cl (nombre) en format local (chaîne)
const convertFormatClToString = (formatCl: number): string => {
    console.log('convertFormatClToString - formatCl reçu:', formatCl, 'type:', typeof formatCl);
    
    // Mapping des formats connus
    // Note: La demi-bouteille utilise 37 dans l'API mais s'affiche comme 37.5 cl
    const formatMap: Array<{ value: number; label: string }> = [
        { value: 150, label: 'Magnum (150 cl)' },
        { value: 75, label: 'Bouteille (75 cl)' },
        { value: 50, label: 'Désirée (50 cl)' },
        { value: 37, label: 'Demi-bouteille (37.5 cl)' },
        { value: 10, label: 'Verre (10 cl)' },
    ];
    
    // Chercher une correspondance exacte ou proche (pour gérer les erreurs d'arrondi)
    const match = formatMap.find(f => Math.abs(f.value - formatCl) < 0.1);
    if (match) {
        console.log('convertFormatClToString - correspondance trouvée:', match.label);
        return match.label;
    }
    
    // Sinon, créer un format générique avec la valeur en cl
    const generic = `${formatCl} cl`;
    console.log('convertFormatClToString - format générique créé:', generic);
    return generic;
};

// Fonctions utilitaires pour convertir entre Vin et RestaurantWine
export const convertRestaurantWineToVin = (wine: RestaurantWine, restaurantId: number = 0): Vin => {
    // Extraire les valeurs françaises ou utiliser la première langue disponible
    const getValue = (obj: { [key: string]: string } | undefined, fallback: string = '') => {
        if (!obj) return fallback;
        return obj['fr'] || obj['en-US'] || Object.values(obj)[0] || fallback;
    };

    // Convertir tous les cépages avec leurs pourcentages
    // Toujours convertir le nom en ID local (ne pas utiliser variety_id de l'API car les IDs peuvent différer)
    const cepages = wine.grapes_varieties && wine.grapes_varieties.length > 0
        ? wine.grapes_varieties.map((gv, index) => {
            const cepageName = getValue(gv.variety_name);
            // Toujours convertir le nom en ID local (ignorer variety_id de l'API)
            const cepageId = getCepageIdByName(cepageName);
            const finalId = cepageId !== -1 ? cepageId.toString() : `cep-${index}`;
            return {
                id: finalId,
                nom: finalId, // Stocker l'ID local comme nom pour le formulaire
                pourcentage: gv.variety_percent || 0
            };
        })
        : [];

    // Le premier cépage pour la compatibilité avec l'ancien format
    const cepage = cepages.length > 0 ? cepages[0].nom : '';

    // Convertir format_cl en format local
    console.log('convertRestaurantWineToVin - wine.format_cl:', wine.format_cl);
    console.log('convertRestaurantWineToVin - wine.price:', wine.price);
    const formatString = convertFormatClToString(wine.format_cl || 75);
    console.log('convertRestaurantWineToVin - formatString converti:', formatString);
    const formats = [{
        id: `format-${wine.wine_id || Date.now()}`,
        nom: formatString,
        prix: wine.price || 0
    }];
    console.log('convertRestaurantWineToVin - formats créés:', JSON.stringify(formats, null, 2));

    return {
        id: wine.wine_id != null ? wine.wine_id.toString() : `wine-${Date.now()}`,
        nom: getValue(wine.wine_name),
        subname: getValue(wine.domain), // Le domaine est bien récupéré ici
        type: getValue(wine.wine_type),
        cepage: cepage,
        cepages: cepages, // Tous les cépages avec leurs pourcentages
        region: getValue(wine.appellation),
        pays: getValue(wine.country),
        millesime: wine.year || 0,
        prix: wine.price || 0,
        restaurant: `Restaurant ${restaurantId}`,
        pointsDeVente: [true], // Par défaut, tous les vins sont disponibles
        motsCles: [], // Les mots-clés ne sont pas dans l'API pour l'instant
        formats: formats, // Ajouter les formats convertis
    };
};

export const convertVinToRestaurantWineData = (vin: Omit<Vin, 'id'> | Vin, language: 'fr' | 'en-US' = 'fr'): {
    wine_name: { [key: string]: string };
    wine_type: { [key: string]: string };
    domain: { [key: string]: string };
    country: { [key: string]: string };
    appellation: { [key: string]: string };
    grapes_varieties: Array<{
        variety_name: { [key: string]: string };
        variety_percent: number;
    }>;
    year: number;
    price: number;
    format_cl: number;
} => {
    // Mapper les types de vins
    const wineTypeMap: Record<string, { fr: string; 'en-US': string }> = {
        'Blanc': { fr: 'Blanc', 'en-US': 'White' },
        'Rouge': { fr: 'Rouge', 'en-US': 'Red' },
        'Rosé': { fr: 'Rosé', 'en-US': 'Rosé' },
        'Mousseux': { fr: 'Mousseux', 'en-US': 'Sparkling' },
        'Fortifié': { fr: 'Fortifié', 'en-US': 'Fortified' },
        'Sweet': { fr: 'Doux', 'en-US': 'Sweet' },
        'Old White': { fr: 'Blanc vieux', 'en-US': 'Old White' },
        'Orange': { fr: 'Orange', 'en-US': 'Orange' },
    };

    const wineType = wineTypeMap[vin.type] || { fr: vin.type, 'en-US': vin.type };

    // Extraire le format en cl depuis le format du vin
    // Les formats peuvent être: "Bouteille (75 cl)", "Magnum (150 cl)", "Verre (10 cl)", etc.
    const extractFormatCl = (formatString?: string): number => {
        if (!formatString) {
            console.log('extractFormatCl - formatString vide, retour 75');
            return 75; // Par défaut 75cl
        }
        
        console.log('extractFormatCl - formatString reçu:', formatString);
        
        // Chercher un nombre suivi de "cl" dans le format (peut être dans des parenthèses)
        // Exemples: "Verre (10 cl)", "Bouteille (75 cl)", "10 cl", etc.
        const match = formatString.match(/(\d+(?:\.\d+)?)\s*cl/i);
        if (match) {
            const extracted = parseFloat(match[1]);
            console.log('extractFormatCl - valeur extraite depuis regex:', extracted);
            return extracted;
        }
        
        // Mapping des formats connus (fallback si la regex ne fonctionne pas)
        // Note: La demi-bouteille utilise 37 dans l'API (pas 37.5)
        const formatMap: Record<string, number> = {
            'Magnum': 150,
            'Bouteille': 75,
            'Désirée': 50,
            'Demi-bouteille': 37,
            'Demi bouteille': 37,
            'Verre': 10,
        };
        
        for (const [key, value] of Object.entries(formatMap)) {
            if (formatString.toLowerCase().includes(key.toLowerCase())) {
                console.log('extractFormatCl - valeur trouvée dans formatMap:', key, '->', value);
                return value;
            }
        }
        
        console.warn('extractFormatCl - Aucune correspondance trouvée, retour 75 par défaut');
        return 75; // Par défaut
    };

    // Gérer les cépages multiples si disponibles dans le vin
    // Vérifier si on a des cépages dans un format de liste (depuis le formulaire)
    let grapesVarieties: Array<{
        variety_name: { [key: string]: string };
        variety_percent: number;
    }> = [];
    
    // Si on a des cépages (même un tableau vide, cela signifie que proportions inconnues)
    if ((vin as any).cepages && Array.isArray((vin as any).cepages)) {
        // Si le tableau est vide, cela signifie proportions inconnues, on retourne un tableau vide
        if ((vin as any).cepages.length === 0) {
            console.log('convertVinToRestaurantWineData - Tableau de cépages vide (proportions inconnues), grapes_varieties sera vide');
        } else {
        // Utiliser les cépages depuis le formulaire
        // Le nom est maintenant l'ID (string), convertir en nom réel
        console.log('convertVinToRestaurantWineData - Début conversion cépages, nombre:', (vin as any).cepages.length);
        console.log('convertVinToRestaurantWineData - cepages bruts:', JSON.stringify((vin as any).cepages, null, 2));
        grapesVarieties = (vin as any).cepages
            .map((cep: any) => {
                console.log('convertVinToRestaurantWineData - Traitement cep:', JSON.stringify(cep));
                // Étape 1: Déterminer l'ID du cépage
                // cep.nom peut être soit un ID (string numérique) soit un nom de cépage
                let cepageId: number = -1;
                
                if (typeof cep.nom === 'string' && cep.nom !== '') {
                    // Vérifier si c'est un ID numérique
                    if (!isNaN(Number(cep.nom))) {
                        const parsedId = parseInt(cep.nom, 10);
                        console.log('convertVinToRestaurantWineData - parsedId:', parsedId, 'isValid:', parsedId >= 0 && parsedId < 92);
                        // Vérifier que l'ID est valide (entre 0 et 91)
                        if (parsedId >= 0 && parsedId < 92) {
                            cepageId = parsedId;
                        } else {
                            console.warn('convertVinToRestaurantWineData - ID invalide:', parsedId);
                        }
                    } else {
                        // C'est un nom de cépage, le convertir en ID
                        cepageId = getCepageIdByName(cep.nom);
                        console.log('convertVinToRestaurantWineData - Nom converti en ID:', cep.nom, '→', cepageId);
                    }
                }
                
                // Étape 2: Obtenir le nom du cépage à partir de l'ID
                // IMPORTANT: Toujours utiliser getCepageNameById pour obtenir le nom, jamais utiliser cep.nom directement
                const cepageName = cepageId !== -1 ? getCepageNameById(cepageId) : '';
                console.log('convertVinToRestaurantWineData - cepageId:', cepageId, 'cepageName:', cepageName);
                
                // Étape 3: Si on n'a pas pu obtenir un ID et un nom valides, ignorer ce cépage
                if (cepageId === -1 || !cepageName) {
                    console.warn('convertVinToRestaurantWineData - Impossible de convertir cep.nom:', cep.nom, 'en ID et nom valides, cépage ignoré');
                    return null;
                }
                
                // Vérifier que le pourcentage est valide
                const varietyPercent = typeof cep.pourcentage === 'string' ? parseFloat(cep.pourcentage) || 0 : (cep.pourcentage || 0);
                if (isNaN(varietyPercent) || varietyPercent < 0 || varietyPercent > 100) {
                    console.warn('convertVinToRestaurantWineData - Pourcentage invalide:', cep.pourcentage, 'pour le cépage:', cepageName);
                }
                
                const result = {
                    variety_id: cepageId, // ID numérique (0-91)
                    variety_name: {
                        [language]: cepageName, // Nom du cépage (ex: "Diolinoir")
                        ...(language === 'fr' ? { 'en-US': cepageName } : { fr: cepageName }),
                    },
                    variety_percent: typeof cep.pourcentage === 'string' ? parseFloat(cep.pourcentage) || 100 : (cep.pourcentage || 100),
                };
                console.log('convertVinToRestaurantWineData - Résultat final:', JSON.stringify(result, null, 2));
                return result;
            })
            .filter((gv: any) => gv !== null); // Filtrer les cépages invalides
        console.log('convertVinToRestaurantWineData - grapesVarieties finaux:', JSON.stringify(grapesVarieties, null, 2));
        }
    } else if (vin.cepage) {
        // Utiliser le cépage simple
        const cepageId = getCepageIdByName(vin.cepage);
        const cepageName = cepageId !== -1 ? getCepageNameById(cepageId) : vin.cepage;
        grapesVarieties = [{
            variety_name: {
                [language]: cepageName,
                ...(language === 'fr' ? { 'en-US': cepageName } : { fr: cepageName }),
            },
            variety_percent: 100, // Par défaut 100% si un seul cépage
        }];
    }

    // Extraire le format_cl et le prix du format si disponible
    // Vérifier d'abord si on a des formats dans un format de liste
    let formatCl = 75; // Par défaut
    let price = vin.prix || 0; // Par défaut utiliser le prix du vin
    
    console.log('convertVinToRestaurantWineData - vin.formats:', JSON.stringify((vin as any).formats, null, 2));
    console.log('convertVinToRestaurantWineData - vin.prix:', vin.prix);
    
    if ((vin as any).formats && Array.isArray((vin as any).formats) && (vin as any).formats.length > 0) {
        // Prendre le premier format
        const firstFormat = (vin as any).formats[0];
        console.log('convertVinToRestaurantWineData - firstFormat:', JSON.stringify(firstFormat, null, 2));
        const formatString = firstFormat.nom || firstFormat.capacite || '';
        
        if (!formatString || formatString.trim() === '') {
            console.warn('convertVinToRestaurantWineData - Format string vide, utilisation de la valeur par défaut 75cl');
            formatCl = 75;
        } else {
            console.log('convertVinToRestaurantWineData - formatString:', formatString);
            formatCl = extractFormatCl(formatString);
            console.log('convertVinToRestaurantWineData - formatCl extrait:', formatCl);
        }
        
        // Extraire le prix du format si disponible
        if (firstFormat.prix !== undefined && firstFormat.prix !== null) {
            price = typeof firstFormat.prix === 'string' ? parseFloat(firstFormat.prix) || 0 : firstFormat.prix || 0;
            if (isNaN(price)) {
                console.warn('convertVinToRestaurantWineData - Prix invalide:', firstFormat.prix, ', utilisation de 0');
                price = 0;
            }
            console.log('convertVinToRestaurantWineData - prix extrait du format:', price);
        }
    } else if ((vin as any).format) {
        formatCl = extractFormatCl((vin as any).format);
        console.log('convertVinToRestaurantWineData - formatCl extrait depuis format:', formatCl);
    } else {
        console.warn('convertVinToRestaurantWineData - Aucun format trouvé, utilisation de la valeur par défaut 75cl');
    }
    
    console.log('convertVinToRestaurantWineData - format_cl final:', formatCl, 'price final:', price);

    return {
        wine_name: {
            [language]: vin.nom,
            ...(language === 'fr' ? { 'en-US': vin.nom } : { fr: vin.nom }),
        },
        wine_type: {
            [language]: wineType[language],
            ...(language === 'fr' ? { 'en-US': wineType['en-US'] } : { fr: wineType.fr }),
        },
        domain: {
            [language]: vin.subname || vin.nom || '',
            ...(language === 'fr' ? { 'en-US': vin.subname || vin.nom || '' } : { fr: vin.subname || vin.nom || '' }),
        },
        country: {
            [language]: vin.pays || '',
            ...(language === 'fr' ? { 'en-US': vin.pays || '' } : { fr: vin.pays || '' }),
        },
        appellation: {
            [language]: vin.region || '',
            ...(language === 'fr' ? { 'en-US': vin.region || '' } : { fr: vin.region || '' }),
        },
        grapes_varieties: grapesVarieties,
        year: vin.millesime,
        price: price,
        format_cl: formatCl,
    };
};

// Configuration de l'API
export const api = axios.create({
    baseURL: '/api', // Utilise le proxy Next.js pour contourner CORS
    headers: {
        'Content-Type': 'application/json',
    },
});

// Instance API séparée pour l'authentification (sans intercepteurs)
export const authApi = axios.create({
    baseURL: '/api', // Utilise le proxy Next.js pour contourner CORS
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
});

// Restaurants de test prédéfinis
const TEST_RESTAURANTS: Restaurant[] = [
    {
        id: 1,
        name: "Restaurant Principal",
        email: "restaurant1@virtualsomm.ch",
        password: "resto123",
        address: "123 Rue de la Gastronomie, 1000 Lausanne",
        phone: "+41 21 123 45 67"
    },
    {
        id: 2,
        name: "Bistrot du Lac",
        email: "bistrot@virtualsomm.ch",
        password: "bistrot456",
        address: "456 Quai du Lac, 1000 Lausanne",
        phone: "+41 21 234 56 78"
    },
    {
        id: 3,
        name: "Café des Arts",
        email: "cafe@virtualsomm.ch",
        password: "cafe789",
        address: "789 Avenue des Arts, 1000 Lausanne",
        phone: "+41 21 345 67 89"
    },
    {
        id: 4,
        name: "Brasserie Moderne",
        email: "brasserie@virtualsomm.ch",
        password: "brasserie012",
        address: "012 Place Moderne, 1000 Lausanne",
        phone: "+41 21 456 78 90"
    }
];

// Configuration OAuth2 pour l'API VirtualSomm
const OAUTH_CONFIG = {
    client_id: '250684173847-7f1vs6bi5852mel1k2ddogijlrffemf8.apps.googleusercontent.com',
    client_secret: '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',
};

// Services pour l'authentification
export const authService = {
    // Connexion utilisateur avec OAuth2
    login: async (username: string, password: string): Promise<LoginResponse> => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('grant_type', 'password');
        formData.append('client_id', OAUTH_CONFIG.client_id);
        formData.append('client_secret', OAUTH_CONFIG.client_secret);
        
        const response = await authApi.post('/token', formData);
        return response.data;
    },

    // Inscription utilisateur
    register: async (userData: UserWithPassword): Promise<void> => {
        await api.post('/register', userData);
    },

    // Récupérer les informations utilisateur
    getUserInfo: async (): Promise<User> => {
        const response = await api.get('/users_infos');
        return response.data;
    },
};

// Services pour l'authentification des restaurants
export const restaurantAuthService = {
    // Connexion restaurant
    login: async (email: string, password: string): Promise<RestaurantLoginResponse> => {
        // Simuler un délai de réseau
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Extraire le restaurant ID depuis l'email (format: restaurantX@test.com)
        const emailMatch = email.match(/^restaurant(\d+)@test\.com$/i);
        if (!emailMatch || emailMatch[1] === undefined) {
            throw new Error('Format d\'email invalide. Utilisez le format: restaurantX@test.com');
        }
        
        const restaurantId = parseInt(emailMatch[1], 10);
        if (isNaN(restaurantId) || restaurantId < 0) {
            throw new Error('ID de restaurant invalide dans l\'email');
        }
        
        // Pour le test, on accepte n'importe quel mot de passe
        // En production, vous devriez vérifier le mot de passe via l'API
        
        // Générer un token simulé
        const token = `restaurant_${restaurantId}_${Date.now()}`;
        
        return {
            access_token: token,
            token_type: 'Bearer',
            restaurant: {
                id: restaurantId,
                name: `Restaurant ${restaurantId}`,
                email: email,
                address: `Adresse du restaurant ${restaurantId}`,
                phone: `+41 21 ${restaurantId.toString().padStart(3, '0')} 00 00`
            }
        };
    },

    // Récupérer les informations du restaurant connecté
    getRestaurantInfo: async (): Promise<Restaurant> => {
        const storage = getLocalStorage();
        const token = storage?.getItem('restaurant_token');
        const restaurantId = storage?.getItem('restaurant_id');
        
        if (!token || !restaurantId) {
            throw new Error('Aucun token restaurant trouvé');
        }
        
        const id = parseInt(restaurantId, 10);
        if (isNaN(id)) {
            throw new Error('ID de restaurant invalide');
        }
        
        return {
            id: id,
            name: `Restaurant ${id}`,
            email: `restaurant${id}@test.com`,
            address: `Adresse du restaurant ${id}`,
            phone: `+41 21 ${id.toString().padStart(3, '0')} 00 00`
        };
    },

    // Récupérer la liste des restaurants de test
    getTestRestaurants: (): Restaurant[] => {
        return TEST_RESTAURANTS.map(r => ({
            id: r.id,
            name: r.name,
            email: r.email,
            address: r.address,
            phone: r.phone
        }));
    }
};

// Services pour les questions
export const questionsService = {
    // Récupérer toutes les questions
    getAll: async (): Promise<Question[]> => {
        const response = await api.get('/questions');
        return response.data;
    },

    // Récupérer une question par ID
    getById: async (id: number): Promise<Question> => {
        const response = await api.get(`/questions/${id}`);
        return response.data;
    },

    // Récupérer la prochaine question prédite
    getNextQuestion: async (): Promise<Question> => {
        const response = await api.get('/predict');
        return response.data;
    },

    // Récupérer les réponses prédites pour une question
    getPrefill: async (questionId: number): Promise<Answer> => {
        const response = await api.get(`/predict/${questionId}`);
        return response.data;
    },
};

// Services pour les réponses
export const answersService = {
    // Récupérer toutes les réponses de l'utilisateur
    getUserAnswers: async (): Promise<Answer[]> => {
        const response = await api.get('/answers');
        return response.data;
    },

    // Récupérer la réponse pour une question spécifique
    getAnswerForQuestion: async (questionId: number): Promise<Answer> => {
        const response = await api.get(`/answers/${questionId}`);
        return response.data;
    },

    // Sauvegarder une réponse
    saveAnswer: async (answer: Answer): Promise<void> => {
        await api.post('/answers', answer);
    },
};

// Services pour les aliments
export const foodsService = {
    // Récupérer tous les aliments
    getAll: async (): Promise<Foods> => {
        const response = await api.get('/foods');
        return response.data;
    },
};

// Services pour les recommandations
export const recommendationsService = {
    // Récupérer les recommandations de vins
    getWineRecommendations: async (userList?: User[], wineCategories?: string[]): Promise<Recommendation[]> => {
        const response = await api.post('/recommendations/wines', {
            user_list: userList,
            wine_categories: wineCategories || [],
        });
        return response.data;
    },

    // Récupérer les recommandations de vins pour d'autres utilisateurs
    getOtherUsersWineRecommendations: async (userList: User[], wineCategories?: string[]): Promise<Recommendation[]> => {
        const response = await api.post('/recommendations/wines/other', {
            user_list: userList,
            wine_categories: wineCategories || [],
        });
        return response.data;
    },

    // Récupérer les vins d'un restaurant
    getRestaurantWines: async (restaurantId: number): Promise<RestaurantWine[]> => {
        try {
            console.log(`Fetching wines for restaurant ID: ${restaurantId}`);
            
            // Essayer différentes approches pour l'endpoint restaurant_wines
            let response;
            
            try {
                // Approche 1: POST avec restaurant_id dans les paramètres de requête
                response = await api.post('/recommendations/restaurant_wines', {}, {
                    params: { restaurant_id: restaurantId }
                });
            } catch (error: any) {
                // Si l'approche 1 échoue, essayer avec restaurant_id dans le body
                try {
                    console.log('Tentative avec restaurant_id dans le body');
                    response = await api.post('/recommendations/restaurant_wines', {
                        restaurant_id: restaurantId
                    });
                } catch (error2: any) {
                    // Si les deux approches échouent, essayer GET
                    try {
                        console.log('Tentative avec GET');
                        response = await api.get('/recommendations/restaurant_wines', {
                            params: { restaurant_id: restaurantId }
                        });
                    } catch (error3: any) {
                        console.error('Toutes les approches ont échoué:', error3);
                        throw error3;
                    }
                }
            }
            
            console.log('Wines response:', response.data);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching restaurant wines:', error);
            // Si l'endpoint ne fonctionne pas, retourner un tableau vide pour éviter de bloquer l'application
            console.warn('Endpoint /recommendations/restaurant_wines non fonctionnel, retour d\'un tableau vide');
            return [];
        }
    },

    // Récupérer les plats d'un restaurant
    getRestaurantDishes: async (restaurantId: number): Promise<Dish[]> => {
        try {
            console.log(`Fetching dishes for restaurant ID: ${restaurantId}`);
            // L'endpoint /recommendations/dishes retourne 422, essayons différentes approches
            let response;
            
            try {
                // Essayer avec un body vide d'abord
                response = await api.post('/recommendations/dishes', {}, {
                    params: { restaurant_id: restaurantId }
                });
            } catch (error: unknown) {
                throw error;
            }
            
            console.log('Dishes response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching restaurant dishes:', error);
            // Si l'endpoint ne fonctionne pas, retourner un tableau vide pour l'instant
            console.warn('Endpoint /recommendations/dishes non fonctionnel, retour d\'un tableau vide');
            return [];
        }
    },

    // Récupérer les meilleurs vins pour des plats
    getBestWinesFromDishes: async (restaurantId: number, dishesId: number[], userList?: User[]): Promise<RestaurantWine[]> => {
        const response = await api.post('/recommendations/best_wines_from_dishes', {
            dishes_id: dishesId,
            user_list: userList,
        }, {
            params: { restaurant_id: restaurantId },
        });
        return response.data;
    },

    // Récupérer les meilleurs vines pour des plats (version invité)
    getBestWinesFromDishesGuest: async (restaurantId: number, dishesId: number[], answers: Answer[]): Promise<RestaurantWine[]> => {
        const response = await api.post('/recommendations/best_wines_from_dishes_guest', {
            dishes_id: dishesId,
            answers: answers,
        }, {
            params: { restaurant_id: restaurantId },
        });
        return response.data;
    },
};

// Services pour la gestion CRUD des vins
export const winesService = {
    // Créer un nouveau vin
    createWine: async (restaurantId: number, wineData: {
        wine_name: { [key: string]: string };
        wine_type: { [key: string]: string };
        domain: { [key: string]: string };
        country: { [key: string]: string };
        appellation: { [key: string]: string };
        grapes_varieties: Array<{
            variety_id?: number;
            variety_name: { [key: string]: string };
            variety_percent: number;
        }>;
        year: number;
        price: number;
        format_cl: number;
        global_score?: string;
        internal_score?: string;
    }): Promise<RestaurantWine> => {
        try {
            // S'assurer que tous les nombres sont bien des nombres et non des chaînes
            const sanitizedBody = {
                ...wineData,
                year: typeof wineData.year === 'string' ? parseInt(wineData.year) : wineData.year,
                price: typeof wineData.price === 'string' ? parseFloat(wineData.price) : wineData.price,
                format_cl: typeof wineData.format_cl === 'string' ? parseInt(wineData.format_cl) : wineData.format_cl,
                grapes_varieties: wineData.grapes_varieties.map((gv: any) => ({
                    ...gv,
                    variety_percent: typeof gv.variety_percent === 'string' ? parseFloat(gv.variety_percent) : gv.variety_percent,
                })),
                // Ajouter les champs requis par l'API avec des valeurs par défaut
                global_score: (wineData as any).global_score || 'N/A',
                internal_score: (wineData as any).internal_score || 'N/A',
            };
            
            console.log('Données envoyées pour la création du vin:', JSON.stringify(sanitizedBody, null, 2));
            console.log('Restaurant ID:', restaurantId);
            console.log('Types des valeurs:', {
                year: typeof sanitizedBody.year,
                price: typeof sanitizedBody.price,
                format_cl: typeof sanitizedBody.format_cl,
                grapes_varieties: sanitizedBody.grapes_varieties.map((gv: any) => ({
                    variety_percent_type: typeof gv.variety_percent,
                    variety_percent_value: gv.variety_percent
                }))
            });
            
            // Essayer avec restaurant_id dans les paramètres de requête
            const response = await api.post('/recommendations/restaurant_wines/create', sanitizedBody, {
                params: { restaurant_id: restaurantId }
            });
            return response.data;
        } catch (error: any) {
            console.error('Erreur lors de la création du vin:', error);
            
            // Afficher les détails de l'erreur si disponibles
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Headers:', error.response.headers);
                console.error('Données de réponse complètes:', JSON.stringify(error.response.data, null, 2));
                console.error('URL:', error.config?.url);
                console.error('Méthode:', error.config?.method);
                console.error('Données envoyées:', JSON.stringify(error.config?.data ? JSON.parse(error.config.data) : error.config?.data, null, 2));
            } else {
                console.error('Pas de réponse du serveur:', error.message);
            }
            
            throw error;
        }
    },

    // Mettre à jour un vin existant
    updateWine: async (restaurantId: number, wineId: number, wineData: {
        wine_name?: { [key: string]: string };
        wine_type?: { [key: string]: string };
        domain?: { [key: string]: string };
        country?: { [key: string]: string };
        appellation?: { [key: string]: string };
        grapes_varieties?: Array<{
            variety_id?: number;
            variety_name: { [key: string]: string };
            variety_percent: number;
        }>;
        year?: number;
        price?: number;
        format_cl?: number;
        global_score?: string;
        internal_score?: string;
    }): Promise<RestaurantWine> => {
        try {
            console.log('winesService.updateWine - Données reçues:', JSON.stringify(wineData, null, 2));
            console.log('winesService.updateWine - grapes_varieties:', JSON.stringify(wineData.grapes_varieties, null, 2));
            const sanitizedBody = {
                ...wineData,
                year: typeof wineData.year === 'string' ? parseInt(wineData.year) : wineData.year,
                price: typeof wineData.price === 'string' ? parseFloat(wineData.price) : wineData.price,
                format_cl: typeof wineData.format_cl === 'string' ? parseInt(wineData.format_cl) : wineData.format_cl,
                grapes_varieties: wineData.grapes_varieties?.map((gv: any) => ({
                    ...gv,
                    variety_percent: typeof gv.variety_percent === 'string' ? parseFloat(gv.variety_percent) : gv.variety_percent,
                })),
                global_score: wineData.global_score || 'N/A',
                internal_score: wineData.internal_score || 'N/A',
            };

            console.log('winesService.updateWine - Données sanitizées avant envoi:', JSON.stringify(sanitizedBody, null, 2));
            console.log('winesService.updateWine - format_cl dans sanitizedBody:', sanitizedBody.format_cl);
            console.log('winesService.updateWine - grapes_varieties sanitizés:', JSON.stringify(sanitizedBody.grapes_varieties, null, 2));

            const response = await api.put(`/recommendations/restaurant_wines/${wineId}`, sanitizedBody, {
                params: { restaurant_id: restaurantId },
            });
            
            console.log('winesService.updateWine - Réponse de l\'API:', JSON.stringify(response.data, null, 2));
            console.log('winesService.updateWine - format_cl dans la réponse:', response.data?.format_cl);
            return response.data;
        } catch (error: any) {
            console.error('Erreur lors de la mise à jour du vin:', error);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Données de réponse complètes:', JSON.stringify(error.response.data, null, 2));
            }
            throw error;
        }
    },

    // Supprimer un vin
    deleteWine: async (restaurantId: number, wineId: number): Promise<void> => {
        try {
            await api.delete(`/recommendations/restaurant_wines/${wineId}`, {
                params: { restaurant_id: restaurantId },
            });
        } catch (error) {
            console.error('Erreur lors de la suppression du vin:', error);
            throw error;
        }
    },
};

// Types pour compatibilité avec l'interface Plat
export type MotCle = {
    id: string;
    label: string;
    color: string;
    textColor: string;
    puce: boolean;
    puceColor: string;
};

export type Plat = {
    id: string;
    nom: string; // Pour compatibilité, utilise nomFr par défaut
    nomFr?: string;
    nomEn?: string;
    description?: string; // Pour compatibilité, utilise descriptionFr par défaut
    descriptionFr?: string;
    descriptionEn?: string;
    prix?: number;
    section: string; // Pour compatibilité, utilise sectionFr par défaut
    sectionFr?: string;
    sectionEn?: string;
    pointsDeVente: boolean[];
    motsCles: MotCle[];
};

// Mapping des clés d'arômes vers les numéros de catégories alimentaires
const aromaKeyToNumberMap: Record<string, number> = {
    'saltyCrumblyCheese': 0,
    'pungentBlueCheese': 1,
    'sourCheeseCream': 2,
    'delicateButteryCheese': 3,
    'nuttyHardCheese': 4,
    'fruityUmamiCheese': 5,
    'drySaltyUmamiCheese': 6,
    'mollusk': 7,
    'finFish': 8,
    'shellfish': 9,
    'whiteMeat': 10,
    'redMeat': 11,
    'curedMeat': 12,
    'strongMarinade': 13,
    'cruciferousVegetable': 14,
    'greenVegetable': 15,
    'harvestVegetable': 16,
    'allium': 17,
    'nightshade': 18,
    'bean': 19,
    'funghi': 20,
    'aromaticGreenHerb': 21,
    'dryHerb': 22,
    'resinousHerb': 23,
    'exoticSpice': 24,
    'bakingSpice': 25,
    'umamiSpice': 26,
    'redPepper': 27,
    'tertiaryAromas': 28,
    'redBlackFruits': 29,
    'citrusFruits': 30,
    'whiteFruits': 31,
    // Mappings pour les anciennes clés
    'viande-rouge': 11,
    'viande-blanche': 10,
    'volaille': 10,
    'poisson': 8,
    'crustace': 9,
    'mollusque': 7,
    'legume-vert': 15,
    'solanacee': 18,
    'champignon': 20,
    'fromage-dur': 4,
    'fromage-bleu': 1,
    'fromage-doux': 3,
    'herbe-fraiche': 21,
    'herbe-seche': 22,
    'epices-exotiques': 24,
    'viande-sechee': 12,
    'faisselle': 2,
    'fromage-sale': 0,
};

// Fonction pour obtenir le numéro d'arôme depuis une clé ou un label
const getAromaNumberFromKeyOrLabel = (keyOrLabel: string): number | null => {
    // Essayer d'abord avec la clé exacte
    if (aromaKeyToNumberMap[keyOrLabel] !== undefined) {
        return aromaKeyToNumberMap[keyOrLabel];
    }
    
    // Essayer de trouver par correspondance partielle (pour les labels traduits)
    const normalized = keyOrLabel.toLowerCase().replace(/\s+/g, '');
    for (const [key, value] of Object.entries(aromaKeyToNumberMap)) {
        if (normalized.includes(key.toLowerCase()) || key.toLowerCase().includes(normalized)) {
            return value;
        }
    }
    
    return null;
};

// Fonction pour convertir un Plat vers le format Dish de l'API
export const convertPlatToDishData = (plat: Omit<Plat, 'id'> | Plat, language: 'fr' | 'en-US' = 'fr'): {
    dish_name: { [key: string]: string };
    dish_type: { [key: string]: string };
    food_cat_1?: number;
    food_cat_1_percent?: number;
    food_cat_2?: number;
    food_cat_2_percent?: number;
    food_cat_3?: number;
    food_cat_3_percent?: number;
} => {
    const dishData: {
        dish_name: { [key: string]: string };
        dish_type: { [key: string]: string };
        food_cat_1?: number;
        food_cat_1_percent?: number;
        food_cat_2?: number;
        food_cat_2_percent?: number;
        food_cat_3?: number;
        food_cat_3_percent?: number;
    } = {
        dish_name: {
            fr: plat.nomFr || plat.nom || '',
            'en-US': plat.nomEn || plat.nom || '',
        },
        dish_type: {
            fr: plat.sectionFr || plat.section || '',
            'en-US': plat.sectionEn || plat.section || '',
        },
    };

    // Convertir les mots-clés (arômes) en catégories alimentaires
    if (plat.motsCles && plat.motsCles.length > 0) {
        const motsCles = plat.motsCles.filter(mc => mc.label && mc.label.trim());
        
        if (motsCles.length > 0) {
            const aroma1 = getAromaNumberFromKeyOrLabel(motsCles[0].label);
            if (aroma1 !== null) {
                dishData.food_cat_1 = aroma1;
                dishData.food_cat_1_percent = 100; // Par défaut 100% pour l'arôme principal
            }
        }
        
        if (motsCles.length > 1) {
            const aroma2 = getAromaNumberFromKeyOrLabel(motsCles[1].label);
            if (aroma2 !== null) {
                dishData.food_cat_2 = aroma2;
                dishData.food_cat_2_percent = 50; // Par défaut 50% pour le second arôme
            }
        }
        
        if (motsCles.length > 2) {
            const aroma3 = getAromaNumberFromKeyOrLabel(motsCles[2].label);
            if (aroma3 !== null) {
                dishData.food_cat_3 = aroma3;
                dishData.food_cat_3_percent = 25; // Par défaut 25% pour le troisième arôme
            }
        }
    }

    return dishData;
};

// Fonction pour convertir un Dish de l'API vers le format Plat
import { getAromaColors } from './aromaColors';

export const convertDishToPlat = (dish: Dish, restaurantId: number = 0): Plat => {
    // Cette fonction est déjà implémentée dans TableauMenu.tsx, mais on la duplique ici pour l'utiliser dans les hooks
    // On va l'utiliser depuis TableauMenu si nécessaire, ou la recréer ici
    const getAromaKeyFromNumber = (aromaNumber: number | string): string => {
        const aromaMap: Record<string, string> = {
            '0': 'saltyCrumblyCheese',
            '1': 'pungentBlueCheese',
            '2': 'sourCheeseCream',
            '3': 'delicateButteryCheese',
            '4': 'nuttyHardCheese',
            '5': 'fruityUmamiCheese',
            '6': 'drySaltyUmamiCheese',
            '7': 'mollusk',
            '8': 'finFish',
            '9': 'shellfish',
            '10': 'whiteMeat',
            '11': 'redMeat',
            '12': 'curedMeat',
            '13': 'strongMarinade',
            '14': 'cruciferousVegetable',
            '15': 'greenVegetable',
            '16': 'harvestVegetable',
            '17': 'allium',
            '18': 'nightshade',
            '19': 'bean',
            '20': 'funghi',
            '21': 'aromaticGreenHerb',
            '22': 'dryHerb',
            '23': 'resinousHerb',
            '24': 'exoticSpice',
            '25': 'bakingSpice',
            '26': 'umamiSpice',
            '27': 'redPepper',
            '28': 'tertiaryAromas',
            '29': 'redBlackFruits',
            '30': 'citrusFruits',
            '31': 'whiteFruits'
        };
        return aromaMap[String(aromaNumber)] || String(aromaNumber);
    };

    // Traduire le nom du plat selon la langue (on utilise 'fr' par défaut)
    const dishName = dish.dish_name?.fr || dish.dish_name?.['en-US'] || dish.dish_name?.en || `Plat ${dish.dish_id}`;
    const dishType = dish.dish_type?.fr || dish.dish_type?.['en-US'] || dish.dish_type?.en || 'Non spécifié';
    
    // Créer des mots-clés basés sur les catégories alimentaires
    const motsCles: MotCle[] = [];
    
    // Arôme principal (food_cat_1)
    if (dish.food_cat_1 !== undefined && dish.food_cat_1 !== null) {
        const aromaKey = getAromaKeyFromNumber(dish.food_cat_1);
        const colors = getAromaColors(aromaKey) || { bg: 'bg-gray-100', text: 'text-gray-700', puce: '#6B7280' };
        motsCles.push({
            id: `mc-api-${dish.dish_id}-1`,
            label: aromaKey, // Le composant traduira ce label
            color: colors.bg,
            textColor: colors.text,
            puce: true,
            puceColor: colors.puce
        });
    }
    
    // Arômes secondaires (food_cat_2 et food_cat_3)
    if (dish.food_cat_2 !== undefined && dish.food_cat_2 !== null) {
        const aromaKey = getAromaKeyFromNumber(dish.food_cat_2);
        const colors = getAromaColors(aromaKey) || { bg: 'bg-gray-100', text: 'text-gray-700', puce: '#6B7280' };
        motsCles.push({
            id: `mc-api-${dish.dish_id}-2`,
            label: aromaKey,
            color: colors.bg,
            textColor: colors.text,
            puce: true,
            puceColor: colors.puce
        });
    }
    
    if (dish.food_cat_3 !== undefined && dish.food_cat_3 !== null) {
        const aromaKey = getAromaKeyFromNumber(dish.food_cat_3);
        const colors = getAromaColors(aromaKey) || { bg: 'bg-gray-100', text: 'text-gray-700', puce: '#6B7280' };
        motsCles.push({
            id: `mc-api-${dish.dish_id}-3`,
            label: aromaKey,
            color: colors.bg,
            textColor: colors.text,
            puce: true,
            puceColor: colors.puce
        });
    }

    return {
        id: `api-${dish.dish_id}`,
        nom: dishName, // Pour compatibilité avec l'affichage
        nomFr: dish.dish_name?.fr || undefined,
        nomEn: dish.dish_name?.['en-US'] || dish.dish_name?.en || undefined,
        description: dish.dish_description?.fr || dish.dish_description?.['en-US'] || dish.dish_description?.en || '', // Description traduite selon la langue
        descriptionFr: dish.dish_description?.fr || undefined,
        descriptionEn: dish.dish_description?.['en-US'] || dish.dish_description?.en || undefined,
        prix: 0, // Pas de prix dans l'API pour l'instant
        section: dishType, // Pour compatibilité avec l'affichage
        sectionFr: dish.dish_type?.fr || undefined,
        sectionEn: dish.dish_type?.['en-US'] || dish.dish_type?.en || undefined,
        pointsDeVente: [true], // Par défaut disponible
        motsCles: motsCles
    };
};

// Services pour la gestion CRUD des plats
export const dishesService = {
    // Créer un nouveau plat
    createDish: async (restaurantId: number, dishData: {
        dish_name: { [key: string]: string };
        dish_type: { [key: string]: string };
        food_cat_1?: number;
        food_cat_1_percent?: number;
        food_cat_2?: number;
        food_cat_2_percent?: number;
        food_cat_3?: number;
        food_cat_3_percent?: number;
    }): Promise<Dish> => {
        try {
            // S'assurer que tous les nombres sont bien des nombres
            const sanitizedBody = {
                ...dishData,
                food_cat_1: typeof dishData.food_cat_1 === 'string' ? parseInt(dishData.food_cat_1) : dishData.food_cat_1,
                food_cat_1_percent: typeof dishData.food_cat_1_percent === 'string' ? parseFloat(dishData.food_cat_1_percent) : dishData.food_cat_1_percent,
                food_cat_2: typeof dishData.food_cat_2 === 'string' ? parseInt(dishData.food_cat_2) : dishData.food_cat_2,
                food_cat_2_percent: typeof dishData.food_cat_2_percent === 'string' ? parseFloat(dishData.food_cat_2_percent) : dishData.food_cat_2_percent,
                food_cat_3: typeof dishData.food_cat_3 === 'string' ? parseInt(dishData.food_cat_3) : dishData.food_cat_3,
                food_cat_3_percent: typeof dishData.food_cat_3_percent === 'string' ? parseFloat(dishData.food_cat_3_percent) : dishData.food_cat_3_percent,
            };
            
            console.log('Données envoyées pour la création du plat:', JSON.stringify(sanitizedBody, null, 2));
            console.log('Restaurant ID:', restaurantId);
            
            const response = await api.post('/recommendations/dishes/create', sanitizedBody, {
                params: { restaurant_id: restaurantId }
            });
            return response.data;
        } catch (error: any) {
            console.error('Erreur lors de la création du plat:', error);
            
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Données de réponse complètes:', JSON.stringify(error.response.data, null, 2));
                console.error('URL:', error.config?.url);
                console.error('Méthode:', error.config?.method);
                console.error('Données envoyées:', JSON.stringify(error.config?.data ? JSON.parse(error.config.data) : error.config?.data, null, 2));
            } else {
                console.error('Pas de réponse du serveur:', error.message);
            }
            
            throw error;
        }
    },

    // Mettre à jour un plat existant
    updateDish: async (restaurantId: number, dishId: number, dishData: {
        dish_name?: { [key: string]: string };
        dish_type?: { [key: string]: string };
        food_cat_1?: number;
        food_cat_1_percent?: number;
        food_cat_2?: number;
        food_cat_2_percent?: number;
        food_cat_3?: number;
        food_cat_3_percent?: number;
    }): Promise<Dish> => {
        try {
            const sanitizedBody = {
                ...dishData,
                food_cat_1: typeof dishData.food_cat_1 === 'string' ? parseInt(dishData.food_cat_1) : dishData.food_cat_1,
                food_cat_1_percent: typeof dishData.food_cat_1_percent === 'string' ? parseFloat(dishData.food_cat_1_percent) : dishData.food_cat_1_percent,
                food_cat_2: typeof dishData.food_cat_2 === 'string' ? parseInt(dishData.food_cat_2) : dishData.food_cat_2,
                food_cat_2_percent: typeof dishData.food_cat_2_percent === 'string' ? parseFloat(dishData.food_cat_2_percent) : dishData.food_cat_2_percent,
                food_cat_3: typeof dishData.food_cat_3 === 'string' ? parseInt(dishData.food_cat_3) : dishData.food_cat_3,
                food_cat_3_percent: typeof dishData.food_cat_3_percent === 'string' ? parseFloat(dishData.food_cat_3_percent) : dishData.food_cat_3_percent,
            };

            const response = await api.put(`/recommendations/dishes/${dishId}`, sanitizedBody, {
                params: { restaurant_id: restaurantId },
            });
            return response.data;
        } catch (error: any) {
            console.error('Erreur lors de la mise à jour du plat:', error);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Données de réponse complètes:', JSON.stringify(error.response.data, null, 2));
            }
            throw error;
        }
    },

    // Supprimer un plat
    deleteDish: async (restaurantId: number, dishId: number): Promise<void> => {
        try {
            await api.delete(`/recommendations/dishes/${dishId}`, {
                params: { restaurant_id: restaurantId },
            });
        } catch (error) {
            console.error('Erreur lors de la suppression du plat:', error);
            throw error;
        }
    },
};

// Fonction utilitaire pour vérifier si localStorage est disponible
const getLocalStorage = () => {
    if (typeof window !== 'undefined') {
        return localStorage;
    }
    return null;
};

// Fonction pour obtenir un token valide (génère automatiquement si nécessaire)
let tokenPromise: Promise<string> | null = null;

const getValidToken = async (): Promise<string> => {
    const storage = getLocalStorage();
    if (!storage) {
        throw new Error('localStorage not available');
    }

    // Vérifier si on a déjà un token valide
    const existingToken = storage.getItem('access_token');
    if (existingToken) {
        return existingToken;
    }

    // Si pas de token, en générer un automatiquement
    if (!tokenPromise) {
        tokenPromise = generateToken();
    }

    try {
        const token = await tokenPromise;
        return token;
    } finally {
        tokenPromise = null;
    }
};

// Fonction pour générer un token automatiquement
const generateToken = async (): Promise<string> => {
    console.log('Génération automatique du token...');
    
    const formData = new URLSearchParams();
    formData.append('username', 'admin');
    formData.append('password', 'admin123');
    formData.append('grant_type', 'password');
    formData.append('client_id', OAUTH_CONFIG.client_id);
    formData.append('client_secret', OAUTH_CONFIG.client_secret);

    try {
        // Utiliser l'instance API d'authentification (sans intercepteurs)
        const response = await authApi.post('/token', formData);

        const token = response.data.access_token;
        const storage = getLocalStorage();
        if (storage) {
            storage.setItem('access_token', token);
        }
        
        console.log('Token généré avec succès:', token.substring(0, 20) + '...');
        return token;
    } catch (error) {
        console.error('Erreur lors de la génération du token:', error);
        throw error;
    }
};

// Intercepteur pour ajouter le token d'authentification automatiquement
api.interceptors.request.use(
    async (config) => {
        // Ne pas essayer d'authentifier les requêtes vers /token
        if (config.url?.includes('/token')) {
            return config;
        }

        try {
            const token = await getValidToken();
            config.headers.Authorization = `Bearer ${token}`;
        } catch (error) {
            console.error('Impossible d\'obtenir un token valide:', error);
            // Continuer sans token si l'authentification échoue
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Gestion des erreurs
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        
        // Si l'erreur est 401 (non autorisé), supprimer le token
        if (error.response?.status === 401) {
            const storage = getLocalStorage();
            if (storage) {
                storage.removeItem('access_token');
            }
        }
        
        throw error;
    }
);