import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    authService, 
    questionsService, 
    answersService, 
    recommendationsService,
    foodsService,
    type User, 
    type UserWithPassword,
    type Question,
    type Answer,
    type RestaurantWine,
    type Dish,
    type Recommendation,
    type LoginResponse,
    type Foods,
    type Vin
} from './api';

// Clés de cache pour React Query
export const queryKeys = {
    // Authentification
    user: ['user'] as const,
    
    // Questions
    questions: ['questions'] as const,
    question: (id: number) => ['question', id] as const,
    nextQuestion: ['next-question'] as const,
    prefill: (id: number) => ['prefill', id] as const,
    
    // Réponses
    answers: ['answers'] as const,
    answer: (questionId: number) => ['answer', questionId] as const,
    
    // Aliments
    foods: ['foods'] as const,
    
    // Recommandations
    wineRecommendations: ['wine-recommendations'] as const,
    restaurantWines: (restaurantId: number) => ['restaurant-wines', restaurantId] as const,
    restaurantDishes: (restaurantId: number) => ['restaurant-dishes', restaurantId] as const,
    bestWinesFromDishes: (restaurantId: number) => ['best-wines-from-dishes', restaurantId] as const,
};

// Hooks pour l'authentification
// Fonction utilitaire pour vérifier si localStorage est disponible
const getLocalStorage = () => {
    if (typeof window !== 'undefined') {
        return localStorage;
    }
    return null;
};

export const useLogin = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ username, password }: { username: string; password: string }) => 
            authService.login(username, password),
        onSuccess: (data) => {
            // Stocker le token dans localStorage
            const storage = getLocalStorage();
            if (storage) {
                storage.setItem('access_token', data.access_token);
            }
            // Invalider les requêtes utilisateur
            queryClient.invalidateQueries({ queryKey: queryKeys.user });
        },
    });
};

export const useRegister = () => {
    return useMutation({
        mutationFn: authService.register,
    });
};

export const useUserInfo = () => {
    return useQuery({
        queryKey: queryKeys.user,
        queryFn: authService.getUserInfo,
        enabled: !!getLocalStorage()?.getItem('access_token'),
    });
};

// Hooks pour les questions
export const useQuestions = () => {
    return useQuery({
        queryKey: queryKeys.questions,
        queryFn: questionsService.getAll,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

export const useQuestion = (id: number) => {
    return useQuery({
        queryKey: queryKeys.question(id),
        queryFn: () => questionsService.getById(id),
        enabled: !!id,
    });
};

export const useNextQuestion = () => {
    return useQuery({
        queryKey: queryKeys.nextQuestion,
        queryFn: questionsService.getNextQuestion,
    });
};

export const usePrefill = (questionId: number) => {
    return useQuery({
        queryKey: queryKeys.prefill(questionId),
        queryFn: () => questionsService.getPrefill(questionId),
        enabled: !!questionId,
    });
};

// Hooks pour les réponses
export const useUserAnswers = () => {
    return useQuery({
        queryKey: queryKeys.answers,
        queryFn: answersService.getUserAnswers,
    });
};

export const useAnswerForQuestion = (questionId: number) => {
    return useQuery({
        queryKey: queryKeys.answer(questionId),
        queryFn: () => answersService.getAnswerForQuestion(questionId),
        enabled: !!questionId,
    });
};

export const useSaveAnswer = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: answersService.saveAnswer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.answers });
        },
    });
};

// Hooks pour les aliments
export const useFoods = () => {
    return useQuery({
        queryKey: queryKeys.foods,
        queryFn: foodsService.getAll,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hooks pour les recommandations
export const useWineRecommendations = (userList?: User[], wineCategories?: string[]) => {
    return useQuery({
        queryKey: [...queryKeys.wineRecommendations, userList, wineCategories],
        queryFn: () => recommendationsService.getWineRecommendations(userList, wineCategories),
        enabled: !!getLocalStorage()?.getItem('access_token'),
    });
};

export const useRestaurantWines = (restaurantId: number) => {
    return useQuery({
        queryKey: queryKeys.restaurantWines(restaurantId),
        queryFn: () => recommendationsService.getRestaurantWines(restaurantId),
        enabled: !!restaurantId,
    });
};

export const useRestaurantDishes = (restaurantId: number) => {
    return useQuery({
        queryKey: queryKeys.restaurantDishes(restaurantId),
        queryFn: () => recommendationsService.getRestaurantDishes(restaurantId),
        enabled: !!restaurantId,
    });
};

export const useBestWinesFromDishes = (restaurantId: number, dishesId: number[], userList?: User[]) => {
    return useQuery({
        queryKey: [...queryKeys.bestWinesFromDishes(restaurantId), dishesId, userList],
        queryFn: () => recommendationsService.getBestWinesFromDishes(restaurantId, dishesId, userList),
        enabled: !!restaurantId && dishesId.length > 0,
    });
};

// Hooks pour les vins (compatibilité avec l'ancien système)
export const useVins = () => {
    // Pour l'instant, retourner des données statiques en attendant l'intégration complète
    return useQuery({
        queryKey: ['vins-static'],
        queryFn: () => Promise.resolve([
            {
                id: 'w1',
                nom: 'Domaine de la Harpe',
                subname: 'Domaine de la Harpe',
                type: 'Blanc',
                cepage: 'Chasselas',
                region: 'La Côte',
                pays: 'Suisse',
                millesime: 2021,
                prix: 36.00,
                restaurant: 'Restaurant Principal',
                pointsDeVente: [true, true, true, true],
                motsCles: [
                    { id: 'mc1', label: 'Frais & léger', color: 'bg-[#FFFAEB]', textColor: 'text-[#B54708]' },
                    { id: 'mc2', label: 'Fruit blanc discret', color: 'bg-[#FFFAEB]', textColor: 'text-[#B54708]' }
                ]
            },
            {
                id: 'w2',
                nom: 'Château de Vinzel - Grand Cru',
                subname: 'Château de Vinzel',
                type: 'Blanc',
                cepage: 'Chasselas',
                region: 'La Côte',
                pays: 'Suisse',
                millesime: 2023,
                prix: 42.00,
                restaurant: 'Restaurant Principal',
                pointsDeVente: [true, false, true, true],
                motsCles: [
                    { id: 'mc3', label: 'Label 1', color: 'bg-[#FFFAEB]', textColor: 'text-[#B54708]' },
                    { id: 'mc4', label: 'Label 2', color: 'bg-[#FFFAEB]', textColor: 'text-[#B54708]' }
                ]
            }
        ]),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useCreateVin = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (vinData: Omit<Vin, 'id'>) => {
            // Pour l'instant, simuler la création
            console.log('Création de vin:', vinData);
            const newVin: Vin = {
                id: `w${Date.now()}`, // Générer un ID unique
                ...vinData
            };
            return Promise.resolve(newVin);
        },
        onSuccess: (newVin) => {
            // Mettre à jour le cache avec le nouveau vin
            queryClient.setQueryData(['vins-static'], (oldData: Vin[] | undefined) => {
                if (!oldData) return [newVin];
                return [...oldData, newVin];
            });
        },
    });
};

export const useUpdateVin = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ id, vin }: { id: string; vin: Partial<Vin> }) => {
            // Pour l'instant, simuler la mise à jour
            console.log('Mise à jour du vin:', id, vin);
            return Promise.resolve({ id, ...vin });
        },
        onSuccess: (updatedVin) => {
            // Mettre à jour le cache avec le vin modifié
            queryClient.setQueryData(['vins-static'], (oldData: Vin[] | undefined) => {
                if (!oldData) return [updatedVin];
                return oldData.map(vin => vin.id === updatedVin.id ? updatedVin : vin);
            });
        },
    });
};

export const useDeleteVin = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (id: string) => {
            // Pour l'instant, simuler la suppression
            console.log('Suppression du vin:', id);
            return Promise.resolve();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vins-static'] });
        },
    });
};

// Hook pour récupérer les plats de tous les restaurants
export const useAllRestaurantDishes = () => {
    // Données des plats de la page menus
    const platsData = {
        entrees: [
            { id: 'e1', nom: 'Salade verte', pointsDeVente: [true, true, true, true] },
            { id: 'e2', nom: 'Salade mêlée', pointsDeVente: [true, true, true, false] },
            { id: 'e3', nom: 'Gaspacho andalou', pointsDeVente: [true, false, true, true] },
            { id: 'e4', nom: 'Carpaccio de tomate à l\'ancienne', pointsDeVente: [true, true, false, true] },
            { id: 'e5', nom: 'Feuilleté aux champignons', pointsDeVente: [false, true, true, true] },
            { id: 'e6', nom: 'Crevettes Royales sautées', pointsDeVente: [true, true, true, true] }
        ],
        viandes: [
            { id: 'v1', nom: 'Entrecôte de la Tour', pointsDeVente: [true, true, true, true] },
            { id: 'v2', nom: 'Filet de bœuf', pointsDeVente: [true, true, true, true] },
            { id: 'v3', nom: 'Filet de bœuf Landais', pointsDeVente: [true, true, false, true] },
            { id: 'v4', nom: 'Tartare de bœuf 180gr', pointsDeVente: [true, true, true, false] }
        ],
        poissons: [
            { id: 'p1', nom: 'Spécialité du Chef : Assiette exotique', pointsDeVente: [true, true, true, true] },
            { id: 'p2', nom: 'Filets de perche meunière', pointsDeVente: [true, true, false, true] },
            { id: 'p3', nom: 'Filet de féra du lac Léman', pointsDeVente: [true, false, true, true] }
        ],
        pates: [
            { id: 'pa1', nom: 'Tagliatelles sauce morilles et parmesan', pointsDeVente: [true, true, true, true] },
            { id: 'pa2', nom: 'Tagliatelles végétariennes', pointsDeVente: [true, true, false, true] },
            { id: 'pa3', nom: 'Tagliatelles aux crevettes royale', pointsDeVente: [true, true, true, false] }
        ],
        suggestions: [
            { id: 's1', nom: 'Salade gourmande de printemps', pointsDeVente: [true, true, true, true] },
            { id: 's2', nom: 'Langue de bœuf', pointsDeVente: [true, true, false, true] },
            { id: 's3', nom: 'Suprême de poulet sauce aux morilles', pointsDeVente: [true, true, true, false] },
            { id: 's4', nom: 'Filet de Bar poêlé, sauce vierge', pointsDeVente: [true, false, true, true] },
            { id: 's5', nom: 'Tagliata de bœuf', pointsDeVente: [true, true, true, true] }
        ],
        desserts: [
            { id: 'd1', nom: 'Douceur de soleil', pointsDeVente: [true, true, true, true] },
            { id: 'd2', nom: 'Moelleux au chocolat et glace vanille', pointsDeVente: [true, true, true, true] },
            { id: 'd3', nom: 'Crème brûlée à la vanille', pointsDeVente: [true, true, false, true] },
            { id: 'd4', nom: 'Dessert du jour', pointsDeVente: [true, false, true, true] },
            { id: 'd5', nom: 'Carpaccio d\'ananas au sirop de thym', pointsDeVente: [true, true, true, false] }
        ]
    };

    // Fonction pour compter les plats par restaurant
    const countPlatsByRestaurant = () => {
        const allPlats = [
            ...platsData.entrees,
            ...platsData.viandes,
            ...platsData.poissons,
            ...platsData.pates,
            ...platsData.suggestions,
            ...platsData.desserts
        ];

        const counts = {
            restaurant1: 0,
            restaurant2: 0,
            restaurant3: 0,
            restaurant4: 0
        };

        allPlats.forEach(plat => {
            if (plat.pointsDeVente[0]) counts.restaurant1++;
            if (plat.pointsDeVente[1]) counts.restaurant2++;
            if (plat.pointsDeVente[2]) counts.restaurant3++;
            if (plat.pointsDeVente[3]) counts.restaurant4++;
        });

        return counts;
    };

    const dishesCount = countPlatsByRestaurant();

    return {
        data: dishesCount,
        isLoading: false,
        error: null,
        isOffline: false,
    };
};

// Hook pour récupérer les statistiques des vins
export const useWineStats = () => {
    const { data: vins, isLoading, error } = useVins();

    // Données de fallback si l'API n'est pas accessible
    const fallbackStats = {
        total: 45,
        mousseux: 4,
        blanc: 12,
        rouge: 17,
        rose: 5,
        bouteille: 38,
        verre: 9,
        incomplete: 2,
    };

    if (isLoading) {
        return {
            data: fallbackStats,
            isLoading: true,
            error: null,
            isOffline: false,
        };
    }

    if (error || !vins) {
        return {
            data: fallbackStats,
            isLoading: false,
            error,
            isOffline: true,
        };
    }

    // Calculer les statistiques à partir des vins récupérés
    const stats = {
        total: vins.length,
        mousseux: vins.filter(vin => vin.type.toLowerCase().includes('mousseux')).length,
        blanc: vins.filter(vin => vin.type.toLowerCase().includes('blanc')).length,
        rouge: vins.filter(vin => vin.type.toLowerCase().includes('rouge')).length,
        rose: vins.filter(vin => vin.type.toLowerCase().includes('rosé')).length,
        bouteille: vins.filter(vin => vin.prix > 0).length, // Approximation
        verre: vins.filter(vin => vin.prix < 20).length, // Approximation
        incomplete: vins.filter(vin => !vin.cepage || !vin.region).length,
    };

    return {
        data: stats,
        isLoading: false,
        error: null,
        isOffline: false,
    };
};
