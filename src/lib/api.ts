import axios from 'axios';

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
}

// Fonctions utilitaires pour convertir entre Vin et RestaurantWine
export const convertRestaurantWineToVin = (wine: RestaurantWine, restaurantId: number = 0): Vin => {
    // Extraire les valeurs françaises ou utiliser la première langue disponible
    const getValue = (obj: { [key: string]: string } | undefined, fallback: string = '') => {
        if (!obj) return fallback;
        return obj['fr'] || obj['en-US'] || Object.values(obj)[0] || fallback;
    };

    // Convertir tous les cépages avec leurs pourcentages
    const cepages = wine.grapes_varieties && wine.grapes_varieties.length > 0
        ? wine.grapes_varieties.map((gv, index) => ({
            id: gv.variety_id ? gv.variety_id.toString() : `cep-${index}`,
            nom: getValue(gv.variety_name),
            pourcentage: gv.variety_percent || 0
        }))
        : [];

    // Le premier cépage pour la compatibilité avec l'ancien format
    const cepage = cepages.length > 0 ? cepages[0].nom : '';

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
    // Les formats peuvent être: "Bouteille (75 cl)", "Magnum (150 cl)", etc.
    const extractFormatCl = (formatString?: string): number => {
        if (!formatString) return 75; // Par défaut 75cl
        
        // Chercher un nombre suivi de "cl" dans le format
        const match = formatString.match(/(\d+(?:\.\d+)?)\s*cl/i);
        if (match) {
            return parseFloat(match[1]);
        }
        
        // Mapping des formats connus
        const formatMap: Record<string, number> = {
            'Magnum': 150,
            'Bouteille': 75,
            'Désirée': 50,
            'Demi-bouteille': 37.5,
            'Verre': 10,
        };
        
        for (const [key, value] of Object.entries(formatMap)) {
            if (formatString.toLowerCase().includes(key.toLowerCase())) {
                return value;
            }
        }
        
        return 75; // Par défaut
    };

    // Gérer les cépages multiples si disponibles dans le vin
    // Vérifier si on a des cépages dans un format de liste (depuis le formulaire)
    let grapesVarieties: Array<{
        variety_name: { [key: string]: string };
        variety_percent: number;
    }> = [];
    
    if ((vin as any).cepages && Array.isArray((vin as any).cepages) && (vin as any).cepages.length > 0) {
        // Utiliser les cépages depuis le formulaire
        grapesVarieties = (vin as any).cepages.map((cep: any) => ({
            variety_name: {
                [language]: cep.nom || '',
                ...(language === 'fr' ? { 'en-US': cep.nom || '' } : { fr: cep.nom || '' }),
            },
            variety_percent: typeof cep.pourcentage === 'string' ? parseFloat(cep.pourcentage) || 100 : (cep.pourcentage || 100),
        }));
    } else if (vin.cepage) {
        // Utiliser le cépage simple
        grapesVarieties = [{
            variety_name: {
                [language]: vin.cepage,
                ...(language === 'fr' ? { 'en-US': vin.cepage } : { fr: vin.cepage }),
            },
            variety_percent: 100, // Par défaut 100% si un seul cépage
        }];
    }

    // Extraire le format_cl du format si disponible
    // Vérifier d'abord si on a des formats dans un format de liste
    let formatCl = 75; // Par défaut
    if ((vin as any).formats && Array.isArray((vin as any).formats) && (vin as any).formats.length > 0) {
        // Prendre le premier format
        const firstFormat = (vin as any).formats[0];
        formatCl = extractFormatCl(firstFormat.nom || firstFormat.capacite);
    } else if ((vin as any).format) {
        formatCl = extractFormatCl((vin as any).format);
    }

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
            [language]: vin.subname || vin.nom,
            ...(language === 'fr' ? { 'en-US': vin.subname || vin.nom } : { fr: vin.subname || vin.nom }),
        },
        country: {
            [language]: vin.pays,
            ...(language === 'fr' ? { 'en-US': vin.pays } : { fr: vin.pays }),
        },
        appellation: {
            [language]: vin.region,
            ...(language === 'fr' ? { 'en-US': vin.region } : { fr: vin.region }),
        },
        grapes_varieties: grapesVarieties,
        year: vin.millesime,
        price: vin.prix,
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
        
        // Rechercher le restaurant par email
        const restaurant = TEST_RESTAURANTS.find(r => r.email === email);
        
        if (!restaurant) {
            throw new Error('Restaurant non trouvé');
        }
        
        if (restaurant.password !== password) {
            throw new Error('Mot de passe incorrect');
        }
        
        // Générer un token simulé
        const token = `restaurant_${restaurant.id}_${Date.now()}`;
        
        return {
            access_token: token,
            token_type: 'Bearer',
            restaurant: {
                id: restaurant.id,
                name: restaurant.name,
                email: restaurant.email,
                address: restaurant.address,
                phone: restaurant.phone
            }
        };
    },

    // Récupérer les informations du restaurant connecté
    getRestaurantInfo: async (): Promise<Restaurant> => {
        const storage = getLocalStorage();
        const token = storage?.getItem('restaurant_token');
        
        if (!token) {
            throw new Error('Aucun token restaurant trouvé');
        }
        
        // Extraire l'ID du restaurant du token
        const restaurantId = parseInt(token.split('_')[1]);
        const restaurant = TEST_RESTAURANTS.find(r => r.id === restaurantId);
        
        if (!restaurant) {
            throw new Error('Restaurant non trouvé');
        }
        
        return {
            id: restaurant.id,
            name: restaurant.name,
            email: restaurant.email,
            address: restaurant.address,
            phone: restaurant.phone
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
                // Approche 1: POST avec restaurant_id dans le body
                response = await api.post('/recommendations/restaurant_wines', {}, {
                    params: { restaurant_id: restaurantId }
                });
            } catch (error: unknown) {
                    throw error;
                }
            
            console.log('Wines response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching restaurant wines:', error);
            throw error;
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

            const response = await api.put(`/recommendations/restaurant_wines/${wineId}`, sanitizedBody, {
                params: { restaurant_id: restaurantId },
            });
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
    nom: string;
    description?: string;
    prix?: number;
    section: string;
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
            [language]: plat.nom,
            ...(language === 'fr' ? { 'en-US': plat.nom } : { fr: plat.nom }),
        },
        dish_type: {
            [language]: plat.section,
            ...(language === 'fr' ? { 'en-US': plat.section } : { fr: plat.section }),
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
        // On ne peut pas traduire ici car on n'a pas accès à la fonction de traduction
        // On utilisera le label brut et la traduction sera faite dans le composant
        motsCles.push({
            id: `mc-api-${dish.dish_id}-1`,
            label: aromaKey, // Le composant traduira ce label
            color: 'bg-green-100',
            textColor: 'text-green-700',
            puce: true,
            puceColor: '#10b981'
        });
    }
    
    // Arômes secondaires (food_cat_2 et food_cat_3)
    if (dish.food_cat_2 !== undefined && dish.food_cat_2 !== null) {
        const aromaKey = getAromaKeyFromNumber(dish.food_cat_2);
        motsCles.push({
            id: `mc-api-${dish.dish_id}-2`,
            label: aromaKey,
            color: 'bg-blue-100',
            textColor: 'text-blue-700',
            puce: true,
            puceColor: '#3b82f6'
        });
    }
    
    if (dish.food_cat_3 !== undefined && dish.food_cat_3 !== null) {
        const aromaKey = getAromaKeyFromNumber(dish.food_cat_3);
        motsCles.push({
            id: `mc-api-${dish.dish_id}-3`,
            label: aromaKey,
            color: 'bg-purple-100',
            textColor: 'text-purple-700',
            puce: true,
            puceColor: '#8b5cf6'
        });
    }

    return {
        id: `api-${dish.dish_id}`,
        nom: dishName,
        description: '', // Pas de description dans l'API pour l'instant
        prix: 0, // Pas de prix dans l'API pour l'instant
        section: dishType,
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