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
                response = await api.post('/recommendations/restaurant_wines', {
                    restaurant_id: restaurantId
                });
            } catch (error: any) {
                if (error.response?.status === 422) {
                    try {
                        // Approche 2: POST avec restaurant_id en paramètre de requête
                        response = await api.post('/recommendations/restaurant_wines', {}, {
                            params: { restaurant_id: restaurantId }
                        });
                    } catch (error2: any) {
                        if (error2.response?.status === 422) {
                            try {
                                // Approche 3: GET avec restaurant_id en paramètre
                                response = await api.get('/recommendations/restaurant_wines', {
                                    params: { restaurant_id: restaurantId }
                                });
                            } catch (error3: any) {
                                if (error3.response?.status === 422) {
                                    // Approche 4: POST avec restaurantId (sans underscore)
                                    response = await api.post('/recommendations/restaurant_wines', {
                                        restaurantId: restaurantId
                                    });
                                } else {
                                    throw error3;
                                }
                            }
                        } else {
                            throw error2;
                        }
                    }
                } else {
                    throw error;
                }
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
                response = await api.post('/recommendations/dishes', {});
            } catch (error: any) {
                if (error.response?.status === 422) {
                    // Si 422, essayer avec des paramètres de requête
                    response = await api.post('/recommendations/dishes', {}, {
                        params: { restaurant_id: restaurantId }
                    });
                } else {
                    throw error;
                }
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