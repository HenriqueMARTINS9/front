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
    pointsDeVente: [boolean, boolean, boolean, boolean];
    motsCles: Array<{
        id: string;
        label: string;
        color: string;
        textColor: string;
    }>;
}

// Configuration de l'API
export const api = axios.create({
    baseURL: 'http://vps.virtualsomm.ch:8081',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Services pour l'authentification
export const authService = {
    // Connexion utilisateur
    login: async (username: string, password: string): Promise<LoginResponse> => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('grant_type', 'password');
        
        const response = await api.post('/token', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
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
        const response = await api.post('/recommendations/restaurant_wines', {}, {
            params: { restaurant_id: restaurantId },
        });
        return response.data;
    },

    // Récupérer les plats d'un restaurant
    getRestaurantDishes: async (restaurantId: number): Promise<Dish[]> => {
        const response = await api.post(`/recommendations/dishes?restaurant_id=${restaurantId}`, {});
        return response.data;
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

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
    (config) => {
        const storage = getLocalStorage();
        const token = storage?.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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