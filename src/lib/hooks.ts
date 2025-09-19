import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    authService, 
    restaurantAuthService,
    questionsService, 
    answersService, 
    recommendationsService,
    foodsService,
    type User, 
    type UserWithPassword,
    type Restaurant,
    type RestaurantLoginResponse,
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
    restaurant: ['restaurant'] as const,
    testRestaurants: ['test-restaurants'] as const,
    
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

// Hooks pour l'authentification des restaurants
export const useRestaurantLogin = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) => 
            restaurantAuthService.login(email, password),
        onSuccess: (data) => {
            // Stocker le token restaurant dans localStorage
            const storage = getLocalStorage();
            if (storage) {
                storage.setItem('restaurant_token', data.access_token);
            }
            // Invalider les requêtes restaurant
            queryClient.invalidateQueries({ queryKey: queryKeys.restaurant });
        },
    });
};

export const useRestaurantInfo = () => {
    return useQuery({
        queryKey: queryKeys.restaurant,
        queryFn: restaurantAuthService.getRestaurantInfo,
        enabled: !!getLocalStorage()?.getItem('restaurant_token'),
    });
};

export const useTestRestaurants = () => {
    return useQuery({
        queryKey: queryKeys.testRestaurants,
        queryFn: () => Promise.resolve(restaurantAuthService.getTestRestaurants()),
        staleTime: 10 * 60 * 1000, // 10 minutes
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

export const useRestaurantWines = (restaurantId?: number) => {
    const { data: restaurantInfo } = useRestaurantInfo();
    // Forcer l'utilisation du restaurant ID 0 pour les données de démonstration
    const actualRestaurantId = restaurantId !== undefined ? restaurantId : 0;
    
    return useQuery({
        queryKey: queryKeys.restaurantWines(actualRestaurantId),
        queryFn: () => recommendationsService.getRestaurantWines(actualRestaurantId),
        enabled: actualRestaurantId !== null,
    });
};

export const useRestaurantDishes = (restaurantId?: number) => {
    const { data: restaurantInfo } = useRestaurantInfo();
    // Forcer l'utilisation du restaurant ID 0 pour les données de démonstration
    const actualRestaurantId = restaurantId !== undefined ? restaurantId : 0;
    
    return useQuery({
        queryKey: queryKeys.restaurantDishes(actualRestaurantId),
        queryFn: () => recommendationsService.getRestaurantDishes(actualRestaurantId),
        enabled: actualRestaurantId !== null,
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
                pointsDeVente: [true],
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
                pointsDeVente: [true],
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
    // Récupérer les plats du restaurant connecté depuis l'API
    const { data: apiDishes, isLoading: isLoadingApi, error: apiError } = useRestaurantDishes();
    
    // Données des plats statiques pour les autres restaurants
    const platsData = {
        entrees: [
            { id: 'e1', nom: 'Salade verte', pointsDeVente: [true] },
            { id: 'e2', nom: 'Salade mêlée', pointsDeVente: [true] },
            { id: 'e3', nom: 'Gaspacho andalou', pointsDeVente: [true] },
            { id: 'e4', nom: 'Carpaccio de tomate à l\'ancienne', pointsDeVente: [true] },
            { id: 'e5', nom: 'Feuilleté aux champignons', pointsDeVente: [true] },
            { id: 'e6', nom: 'Crevettes Royales sautées', pointsDeVente: [true] }
        ],
        viandes: [
            { id: 'v1', nom: 'Entrecôte de la Tour', pointsDeVente: [true] },
            { id: 'v2', nom: 'Filet de bœuf', pointsDeVente: [true] },
            { id: 'v3', nom: 'Filet de bœuf Landais', pointsDeVente: [true] },
            { id: 'v4', nom: 'Tartare de bœuf 180gr', pointsDeVente: [true] }
        ],
        poissons: [
            { id: 'p1', nom: 'Spécialité du Chef : Assiette exotique', pointsDeVente: [true] },
            { id: 'p2', nom: 'Filets de perche meunière', pointsDeVente: [true] },
            { id: 'p3', nom: 'Filet de féra du lac Léman', pointsDeVente: [true] }
        ],
        pates: [
            { id: 'pa1', nom: 'Tagliatelles sauce morilles et parmesan', pointsDeVente: [true] },
            { id: 'pa2', nom: 'Tagliatelles végétariennes', pointsDeVente: [true] },
            { id: 'pa3', nom: 'Tagliatelles aux crevettes royale', pointsDeVente: [true] }
        ],
        suggestions: [
            { id: 's1', nom: 'Salade gourmande de printemps', pointsDeVente: [true] },
            { id: 's2', nom: 'Langue de bœuf', pointsDeVente: [true] },
            { id: 's3', nom: 'Suprême de poulet sauce aux morilles', pointsDeVente: [true] },
            { id: 's4', nom: 'Filet de Bar poêlé, sauce vierge', pointsDeVente: [true] },
            { id: 's5', nom: 'Tagliata de bœuf', pointsDeVente: [true] }
        ],
        desserts: [
            { id: 'd1', nom: 'Douceur de soleil', pointsDeVente: [true] },
            { id: 'd2', nom: 'Moelleux au chocolat et glace vanille', pointsDeVente: [true] },
            { id: 'd3', nom: 'Crème brûlée à la vanille', pointsDeVente: [true] },
            { id: 'd4', nom: 'Dessert du jour', pointsDeVente: [true] },
            { id: 'd5', nom: 'Carpaccio d\'ananas au sirop de thym', pointsDeVente: [true] }
        ]
    };

    // Fonction pour compter les plats par restaurant (seulement restaurant 1)
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
            restaurant1: 0
        };

        allPlats.forEach(plat => {
            if (plat.pointsDeVente[0]) counts.restaurant1++;
        });

        return counts;
    };

    const staticDishesCount = countPlatsByRestaurant();
    
    // Utiliser les données de l'API pour le restaurant 0, sinon fallback vers les données statiques
    const dishesCount = {
        restaurant0: apiDishes ? apiDishes.length : staticDishesCount.restaurant1
    };

    return {
        data: dishesCount,
        isLoading: isLoadingApi,
        error: apiError,
        isOffline: false,
    };
};

// Hook pour récupérer les statistiques des vins
export const useWineStats = () => {
    // Récupérer les vins du restaurant connecté depuis l'API
    const { data: apiVins, isLoading: isLoadingApi, error: apiError } = useRestaurantWines();
    
    // Récupérer les vins statiques
    const { data: staticVins, isLoading: isLoadingStatic, error: staticError } = useVins();

    // Données de fallback si l'API n'est pas accessible
    const fallbackStats = {
        total: 45,
        mousseux: 4,
        blanc: 12,
        rouge: 17,
        rose: 5,
        sweet: 3,
        oldWhite: 2,
        fortifie: 2,
        bouteille: 38,
        verre: 9,
        magnum: 2,
        demiBouteille: 5,
        desiree: 3,
        incomplete: 2,
    };

    const isLoading = isLoadingApi || isLoadingStatic;

    if (isLoading) {
        return {
            data: fallbackStats,
            isLoading: true,
            error: null,
            isOffline: false,
        };
    }

    // Utiliser les données de l'API si disponibles, sinon les données statiques
    const vinsToUse = apiVins || staticVins;
    const error = apiError || staticError;

    if (error || !vinsToUse) {
        return {
            data: fallbackStats,
            isLoading: false,
            error,
            isOffline: true,
        };
    }

    // Calculer les statistiques à partir des vins récupérés
    const stats = {
        total: vinsToUse.length,
        mousseux: vinsToUse.filter(vin => {
            const type = typeof vin === 'object' && 'type' in vin 
                ? vin.type.toLowerCase() 
                : (vin as any).wine_type?.fr?.toLowerCase() || (vin as any).wine_type?.['en-US']?.toLowerCase() || '';
            return type.includes('mousseux') || type.includes('sparkling');
        }).length,
        blanc: vinsToUse.filter(vin => {
            const type = typeof vin === 'object' && 'type' in vin 
                ? vin.type.toLowerCase() 
                : (vin as any).wine_type?.fr?.toLowerCase() || (vin as any).wine_type?.['en-US']?.toLowerCase() || '';
            return type.includes('blanc') || type.includes('white');
        }).length,
        rouge: vinsToUse.filter(vin => {
            const type = typeof vin === 'object' && 'type' in vin 
                ? vin.type.toLowerCase() 
                : (vin as any).wine_type?.fr?.toLowerCase() || (vin as any).wine_type?.['en-US']?.toLowerCase() || '';
            return type.includes('rouge') || type.includes('red');
        }).length,
        rose: vinsToUse.filter(vin => {
            const type = typeof vin === 'object' && 'type' in vin 
                ? vin.type.toLowerCase() 
                : (vin as any).wine_type?.fr?.toLowerCase() || (vin as any).wine_type?.['en-US']?.toLowerCase() || '';
            return type.includes('rosé') || type.includes('rose');
        }).length,
        sweet: vinsToUse.filter(vin => {
            const type = typeof vin === 'object' && 'type' in vin 
                ? vin.type.toLowerCase() 
                : (vin as any).wine_type?.fr?.toLowerCase() || (vin as any).wine_type?.['en-US']?.toLowerCase() || '';
            return type.includes('sweet') || type.includes('doux') || type.includes('moelleux') || type.includes('liquoreux');
        }).length,
        oldWhite: vinsToUse.filter(vin => {
            const type = typeof vin === 'object' && 'type' in vin 
                ? vin.type.toLowerCase() 
                : (vin as any).wine_type?.fr?.toLowerCase() || (vin as any).wine_type?.['en-US']?.toLowerCase() || '';
            return type.includes('old white') || type.includes('blanc vieux');
        }).length,
        fortifie: vinsToUse.filter(vin => {
            const type = typeof vin === 'object' && 'type' in vin 
                ? vin.type.toLowerCase() 
                : (vin as any).wine_type?.fr?.toLowerCase() || (vin as any).wine_type?.['en-US']?.toLowerCase() || '';
            return type.includes('fortifié');
        }).length,
        bouteille: vinsToUse.filter(vin => {
            const prix = typeof vin === 'object' && 'prix' in vin 
                ? vin.prix 
                : (vin as any).price || 0;
            return prix > 0;
        }).length,
        verre: vinsToUse.filter(vin => {
            const prix = typeof vin === 'object' && 'prix' in vin 
                ? vin.prix 
                : (vin as any).price || 0;
            return prix < 20;
        }).length,
        magnum: vinsToUse.filter(vin => {
            // Logique pour détecter les magnums (à adapter selon la structure des données)
            const formats = typeof vin === 'object' && 'formats' in vin 
                ? (vin.formats as any[]) 
                : [];
            return Array.isArray(formats) && formats.some((format: any) => 
                format.nom && format.nom.toLowerCase().includes('magnum')
            );
        }).length,
        demiBouteille: vinsToUse.filter(vin => {
            const formats = typeof vin === 'object' && 'formats' in vin 
                ? (vin.formats as any[]) 
                : [];
            return Array.isArray(formats) && formats.some((format: any) => 
                format.nom && format.nom.toLowerCase().includes('demi')
            );
        }).length,
        desiree: vinsToUse.filter(vin => {
            const formats = typeof vin === 'object' && 'formats' in vin 
                ? (vin.formats as any[]) 
                : [];
            return Array.isArray(formats) && formats.some((format: any) => 
                format.nom && format.nom.toLowerCase().includes('désirée')
            );
        }).length,
        incomplete: vinsToUse.filter(vin => {
            const cepage = typeof vin === 'object' && 'cepage' in vin 
                ? vin.cepage 
                : (vin as any).grapes_varieties?.length > 0 ? 'présent' : '';
            const region = typeof vin === 'object' && 'region' in vin 
                ? vin.region 
                : (vin as any).appellation?.fr || (vin as any).appellation?.['en-US'] || '';
            return !cepage || !region;
        }).length,
    };

    return {
        data: stats,
        isLoading: false,
        error: null,
        isOffline: false,
    };
};
