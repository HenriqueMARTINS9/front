import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/lib/useTranslation';
import { 
    authService, 
    restaurantAuthService,
    questionsService, 
    answersService, 
    recommendationsService,
    foodsService,
    winesService,
    dishesService,
    convertRestaurantWineToVin,
    convertVinToRestaurantWineData,
    convertPlatToDishData,
    convertDishToPlat,
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
    type Vin,
    type Plat
} from './api';
import { getRestaurantId, getLastModifiedDate, setLastModifiedDate } from './auth';

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
            // Stocker le token et le restaurant ID dans localStorage
            const storage = getLocalStorage();
            if (storage) {
                storage.setItem('restaurant_token', data.access_token);
                storage.setItem('restaurant_id', data.restaurant.id.toString());
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
    // Utiliser le restaurant ID depuis le localStorage ou restaurantInfo
    const storedRestaurantId = getRestaurantId();
    const actualRestaurantId = restaurantId !== undefined 
        ? restaurantId 
        : (storedRestaurantId !== null && storedRestaurantId !== undefined 
            ? storedRestaurantId 
            : (restaurantInfo?.id !== undefined ? restaurantInfo.id : null));
    
    return useQuery({
        queryKey: queryKeys.restaurantWines(actualRestaurantId ?? 0),
        queryFn: () => recommendationsService.getRestaurantWines(actualRestaurantId ?? 0),
        enabled: actualRestaurantId !== null,
    });
};

export const useRestaurantDishes = (restaurantId?: number) => {
    const { data: restaurantInfo } = useRestaurantInfo();
    // Utiliser le restaurant ID depuis le localStorage ou restaurantInfo
    const storedRestaurantId = getRestaurantId();
    const actualRestaurantId = restaurantId !== undefined 
        ? restaurantId 
        : (storedRestaurantId !== null && storedRestaurantId !== undefined 
            ? storedRestaurantId 
            : (restaurantInfo?.id !== undefined ? restaurantInfo.id : null));
    
    return useQuery({
        queryKey: queryKeys.restaurantDishes(actualRestaurantId ?? 0),
        queryFn: () => recommendationsService.getRestaurantDishes(actualRestaurantId ?? 0),
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
export const useVins = (restaurantId?: number) => {
    const { data: restaurantInfo } = useRestaurantInfo();
    const storedRestaurantId = getRestaurantId();
    const actualRestaurantId = restaurantId !== undefined 
        ? restaurantId 
        : (storedRestaurantId !== null && storedRestaurantId !== undefined 
            ? storedRestaurantId 
            : (restaurantInfo?.id !== undefined ? restaurantInfo.id : null));
    
    // Récupérer les vins depuis l'API et les convertir au format Vin
    return useQuery({
        queryKey: ['vins', actualRestaurantId ?? 0],
        queryFn: async () => {
            const restaurantId = actualRestaurantId ?? 0;
            const restaurantWines = await recommendationsService.getRestaurantWines(restaurantId);
            if (restaurantWines && restaurantWines.length > 0) {
                return restaurantWines.map(wine => convertRestaurantWineToVin(wine, restaurantId));
            }
            return [];
        },
        enabled: actualRestaurantId !== null,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useCreateVin = (restaurantId?: number) => {
    const queryClient = useQueryClient();
    const { data: restaurantInfo } = useRestaurantInfo();
    const storedRestaurantId = getRestaurantId();
    const actualRestaurantId = restaurantId !== undefined 
        ? restaurantId 
        : (storedRestaurantId !== null && storedRestaurantId !== undefined 
            ? storedRestaurantId 
            : (restaurantInfo?.id !== undefined ? restaurantInfo.id : null));
    
    return useMutation({
        mutationFn: async (vinData: Omit<Vin, 'id'>) => {
            const restaurantId = actualRestaurantId ?? 0;
            // Convertir le format Vin vers le format API
            const wineData = convertVinToRestaurantWineData(vinData);
            
            // Créer le vin via l'API
            const createdWine = await winesService.createWine(restaurantId, wineData);
            
            // Convertir le résultat en format Vin
            return convertRestaurantWineToVin(createdWine, restaurantId);
        },
        onSuccess: (newVin) => {
            const restaurantId = actualRestaurantId ?? 0;
            // Invalider et rafraîchir les requêtes de vins
            queryClient.invalidateQueries({ queryKey: ['restaurant-wines', restaurantId] });
            queryClient.invalidateQueries({ queryKey: ['vins', restaurantId] });
            
            // Forcer le refetch immédiatement
            queryClient.refetchQueries({ queryKey: ['restaurant-wines', restaurantId] });
            
            // Mettre à jour la date de dernière modification
            setLastModifiedDate();
        },
    });
};

export const useUpdateVin = (restaurantId?: number) => {
    const queryClient = useQueryClient();
    const { data: restaurantInfo } = useRestaurantInfo();
    const storedRestaurantId = getRestaurantId();
    const actualRestaurantId = restaurantId !== undefined 
        ? restaurantId 
        : (storedRestaurantId !== null && storedRestaurantId !== undefined 
            ? storedRestaurantId 
            : (restaurantInfo?.id !== undefined ? restaurantInfo.id : null));
    
    return useMutation({
        mutationFn: async ({ id, vin }: { id: string; vin: Partial<Vin> }) => {
            const restaurantId = actualRestaurantId ?? 0;
            const wineId = parseInt(id);
            if (isNaN(wineId)) {
                throw new Error(`ID de vin invalide: ${id}`);
            }
            
            // Convertir les données partielles en format API
            const wineData = convertVinToRestaurantWineData(vin as Vin);
            
            // Mettre à jour le vin via l'API
            const updatedWine = await winesService.updateWine(restaurantId, wineId, wineData);
            
            // L'API ne retourne pas toujours les données complètes après la mise à jour
            // Si la réponse ne contient pas les données complètes, retourner les données qu'on a envoyées
            if (updatedWine && updatedWine.wine_name) {
                // Convertir le résultat en format Vin
                return convertRestaurantWineToVin(updatedWine, restaurantId);
            } else {
                // Si l'API ne retourne pas les données complètes, retourner les données qu'on a préparées
                // (converties en format Vin)
                return vin as Vin;
            }
        },
        onSuccess: (updatedVin) => {
            const restaurantId = actualRestaurantId ?? 0;
            // Invalider et rafraîchir les requêtes de vins
            queryClient.invalidateQueries({ queryKey: ['restaurant-wines', restaurantId] });
            queryClient.invalidateQueries({ queryKey: ['vins', restaurantId] });
            
            // Mettre à jour la date de dernière modification
            setLastModifiedDate();
        },
    });
};

export const useDeleteVin = (restaurantId?: number) => {
    const queryClient = useQueryClient();
    const { data: restaurantInfo } = useRestaurantInfo();
    const storedRestaurantId = getRestaurantId();
    const actualRestaurantId = restaurantId !== undefined 
        ? restaurantId 
        : (storedRestaurantId !== null && storedRestaurantId !== undefined 
            ? storedRestaurantId 
            : (restaurantInfo?.id !== undefined ? restaurantInfo.id : null));
    
    return useMutation({
        mutationFn: async (id: string) => {
            const restaurantId = actualRestaurantId ?? 0;
            const wineId = parseInt(id);
            if (isNaN(wineId)) {
                throw new Error(`ID de vin invalide: ${id}`);
            }
            
            // Supprimer le vin via l'API
            await winesService.deleteWine(restaurantId, wineId);
        },
        onSuccess: () => {
            const restaurantId = actualRestaurantId ?? 0;
            // Invalider et rafraîchir les requêtes de vins
            queryClient.invalidateQueries({ queryKey: ['restaurant-wines', restaurantId] });
            queryClient.invalidateQueries({ queryKey: ['vins', restaurantId] });
            
            // Mettre à jour la date de dernière modification
            setLastModifiedDate();
        },
    });
};

// Hooks pour les plats (similaires aux vins)
export const useCreateDish = (restaurantId?: number) => {
    const queryClient = useQueryClient();
    const { data: restaurantInfo } = useRestaurantInfo();
    const storedRestaurantId = getRestaurantId();
    // Si restaurantId est explicitement fourni et n'est pas 0, l'utiliser
    // Sinon, utiliser restaurantInfo.id ou storedRestaurantId ou 1 par défaut
    // Note: 0 est une valeur valide pour restaurantId, donc on doit vérifier explicitement undefined
    const actualRestaurantId = restaurantId !== undefined
        ? restaurantId 
        : (restaurantInfo?.id !== undefined 
            ? restaurantInfo.id 
            : (storedRestaurantId !== null && storedRestaurantId !== undefined 
                ? storedRestaurantId 
                : 1));
    
    return useMutation({
        mutationFn: async (platData: Omit<Plat, 'id'>) => {
            const restaurantId = actualRestaurantId ?? 0;
            // Convertir le format Plat vers le format API
            const dishData = convertPlatToDishData(platData);
            
            // Créer le plat via l'API
            const createdDish = await dishesService.createDish(restaurantId, dishData);
            
            // Convertir le résultat en format Plat
            return convertDishToPlat(createdDish, restaurantId);
        },
        onSuccess: (newPlat) => {
            const restaurantId = actualRestaurantId ?? 0;
            // Invalider et rafraîchir les requêtes de plats
            queryClient.invalidateQueries({ queryKey: queryKeys.restaurantDishes(restaurantId) });
            
            // Forcer le refetch immédiatement
            queryClient.refetchQueries({ queryKey: queryKeys.restaurantDishes(restaurantId) });
            
            // Mettre à jour la date de dernière modification
            setLastModifiedDate();
        },
    });
};

export const useUpdateDish = (restaurantId?: number) => {
    const queryClient = useQueryClient();
    const { data: restaurantInfo } = useRestaurantInfo();
    const storedRestaurantId = getRestaurantId();
    const actualRestaurantId = restaurantId !== undefined 
        ? restaurantId 
        : (storedRestaurantId !== null && storedRestaurantId !== undefined 
            ? storedRestaurantId 
            : (restaurantInfo?.id !== undefined ? restaurantInfo.id : null));
    
    return useMutation({
        mutationFn: async ({ id, plat }: { id: string; plat: Partial<Plat> }) => {
            // Extraire l'ID numérique depuis l'ID string (format: "api-{dish_id}")
            const dishIdMatch = id.match(/^api-(\d+)$/);
            if (!dishIdMatch) {
                throw new Error(`ID de plat invalide: ${id}`);
            }
            const dishId = parseInt(dishIdMatch[1]);
            
            const restaurantId = actualRestaurantId ?? 0;
            // Convertir les données partielles en format API
            const dishData = convertPlatToDishData(plat as Plat);
            
            // Mettre à jour le plat via l'API
            const updatedDish = await dishesService.updateDish(restaurantId, dishId, dishData);
            
            // Convertir le résultat en format Plat
            return convertDishToPlat(updatedDish, restaurantId);
        },
        onSuccess: (updatedPlat) => {
            const restaurantId = actualRestaurantId ?? 0;
            // Invalider et rafraîchir les requêtes de plats
            queryClient.invalidateQueries({ queryKey: queryKeys.restaurantDishes(restaurantId) });
            
            // Mettre à jour la date de dernière modification
            setLastModifiedDate();
        },
    });
};

export const useDeleteDish = (restaurantId?: number) => {
    const queryClient = useQueryClient();
    const { data: restaurantInfo } = useRestaurantInfo();
    const storedRestaurantId = getRestaurantId();
    const actualRestaurantId = restaurantId !== undefined 
        ? restaurantId 
        : (storedRestaurantId !== null && storedRestaurantId !== undefined 
            ? storedRestaurantId 
            : (restaurantInfo?.id !== undefined ? restaurantInfo.id : null));
    
    return useMutation({
        mutationFn: async (id: string) => {
            // Extraire l'ID numérique depuis l'ID string (format: "api-{dish_id}")
            const dishIdMatch = id.match(/^api-(\d+)$/);
            if (!dishIdMatch) {
                throw new Error(`ID de plat invalide: ${id}`);
            }
            const dishId = parseInt(dishIdMatch[1]);
            const restaurantId = actualRestaurantId ?? 0;
            
            // Supprimer le plat via l'API
            await dishesService.deleteDish(restaurantId, dishId);
        },
        onSuccess: () => {
            const restaurantId = actualRestaurantId ?? 0;
            // Invalider et rafraîchir les requêtes de plats
            queryClient.invalidateQueries({ queryKey: queryKeys.restaurantDishes(restaurantId) });
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
        autresFormats: 0,
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
            // Vérifier d'abord dans formats
            const formats = typeof vin === 'object' && 'formats' in vin 
                ? (vin.formats as any[]) 
                : [];
            if (Array.isArray(formats) && formats.length > 0) {
                return formats.some((format: any) => 
                    format.nom && (
                        format.nom.toLowerCase().includes('bouteille') && 
                        !format.nom.toLowerCase().includes('demi') &&
                        !format.nom.toLowerCase().includes('magnum')
                    )
                );
            }
            // Sinon, vérifier format_cl si disponible (pour RestaurantWine)
            const formatCl = (vin as any).format_cl;
            if (formatCl !== undefined && formatCl !== null) {
                return Math.abs(formatCl - 75) < 0.1; // Bouteille = 75 cl
            }
            // Si on a un format mais qu'on ne peut pas le déterminer, compter quand même
            return false;
        }).length,
        verre: vinsToUse.filter(vin => {
            // Vérifier d'abord dans formats
            const formats = typeof vin === 'object' && 'formats' in vin 
                ? (vin.formats as any[]) 
                : [];
            if (Array.isArray(formats) && formats.length > 0) {
                return formats.some((format: any) => 
                    format.nom && format.nom.toLowerCase().includes('verre')
                );
            }
            // Sinon, vérifier format_cl si disponible (pour RestaurantWine)
            const formatCl = (vin as any).format_cl;
            if (formatCl !== undefined && formatCl !== null) {
                return Math.abs(formatCl - 10) < 0.1; // Verre = 10 cl
            }
            return false;
        }).length,
        magnum: vinsToUse.filter(vin => {
            // Logique pour détecter les magnums
            const formats = typeof vin === 'object' && 'formats' in vin 
                ? (vin.formats as any[]) 
                : [];
            if (Array.isArray(formats) && formats.length > 0) {
                return formats.some((format: any) => 
                    format.nom && format.nom.toLowerCase().includes('magnum')
                );
            }
            // Vérifier format_cl si disponible (pour RestaurantWine)
            const formatCl = (vin as any).format_cl;
            if (formatCl !== undefined && formatCl !== null) {
                return Math.abs(formatCl - 150) < 0.1; // Magnum = 150 cl
            }
            return false;
        }).length,
        demiBouteille: vinsToUse.filter(vin => {
            const formats = typeof vin === 'object' && 'formats' in vin 
                ? (vin.formats as any[]) 
                : [];
            if (Array.isArray(formats) && formats.length > 0) {
                return formats.some((format: any) => 
                    format.nom && format.nom.toLowerCase().includes('demi')
                );
            }
            // Vérifier format_cl si disponible (pour RestaurantWine)
            const formatCl = (vin as any).format_cl;
            if (formatCl !== undefined && formatCl !== null) {
                return Math.abs(formatCl - 37) < 0.1; // Demi-bouteille = 37 cl
            }
            return false;
        }).length,
        desiree: vinsToUse.filter(vin => {
            const formats = typeof vin === 'object' && 'formats' in vin
                ? (vin.formats as any[]) 
                : [];
            if (Array.isArray(formats) && formats.length > 0) {
                return formats.some((format: any) => 
                    format.nom && format.nom.toLowerCase().includes('désirée')
                );
            }
            // Vérifier format_cl si disponible (pour RestaurantWine)
            const formatCl = (vin as any).format_cl;
            if (formatCl !== undefined && formatCl !== null) {
                return Math.abs(formatCl - 50) < 0.1; // Désirée = 50 cl
            }
            return false;
        }).length,
        // Compter tous les autres formats (formats non reconnus)
        autresFormats: vinsToUse.filter(vin => {
            // Vérifier si le vin a un format mais qu'il ne correspond à aucun format connu
            const formats = typeof vin === 'object' && 'formats' in vin 
                ? (vin.formats as any[]) 
                : [];
            if (Array.isArray(formats) && formats.length > 0) {
                const hasKnownFormat = formats.some((format: any) => {
                    if (!format.nom) return false;
                    const nomLower = format.nom.toLowerCase();
                    return nomLower.includes('bouteille') || 
                           nomLower.includes('verre') || 
                           nomLower.includes('magnum') || 
                           nomLower.includes('demi') || 
                           nomLower.includes('désirée');
                });
                // Si le vin a un format mais qu'il ne correspond à aucun format connu, le compter
                return !hasKnownFormat;
            }
            // Vérifier format_cl si disponible (pour RestaurantWine) et qu'il ne correspond à aucun format connu
            const formatCl = (vin as any).format_cl;
            if (formatCl !== undefined && formatCl !== null) {
                const knownFormatCls = [75, 10, 150, 37, 50];
                return !knownFormatCls.some(cl => Math.abs(formatCl - cl) < 0.1);
            }
            return false;
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

// Hook pour calculer les alertes
export const useAlerts = () => {
    const { t } = useTranslation();
    const { data: wines, isLoading: isLoadingWines } = useRestaurantWines();
    const { data: dishes, isLoading: isLoadingDishes } = useRestaurantDishes();
    
    const isLoading = isLoadingWines || isLoadingDishes;
    
    if (isLoading) {
        return {
            alerts: [],
            incompleteWinesCount: 0,
            isLoading: true,
        };
    }
    
    const alerts: Array<{ type: 'error' | 'success' | 'warning'; message: string; category?: 'wine' | 'dish' | 'menu' }> = [];
    const winesArray = wines || [];
    const dishesArray = dishes || [];
    
    // Vérifier si un vin n'a pas de cépages
    const winesWithoutGrapes = winesArray.filter((wine: RestaurantWine) => 
        !wine.grapes_varieties || wine.grapes_varieties.length === 0
    );
    if (winesWithoutGrapes.length > 0) {
        const plural = winesWithoutGrapes.length > 1 ? 's' : '';
        const has = winesWithoutGrapes.length > 1 ? 'ont' : 'a';
        alerts.push({
            type: 'warning',
            message: t('common.alertWinesWithoutGrapes', { count: winesWithoutGrapes.length, plural, has }),
            category: 'wine'
        });
    }
    
    // Vérifier si un prix est à 0 pour un vin
    const winesWithZeroPrice = winesArray.filter((wine: RestaurantWine) => 
        !wine.price || wine.price === 0
    );
    if (winesWithZeroPrice.length > 0) {
        const plural = winesWithZeroPrice.length > 1 ? 's' : '';
        const has = winesWithZeroPrice.length > 1 ? ' ont' : ' a';
        alerts.push({
            type: 'warning',
            message: t('common.alertWinesWithZeroPrice', { count: winesWithZeroPrice.length, plural, has }),
            category: 'wine'
        });
    }
    
    // Vérifier si un prix est à 0 pour un plat
    // Note: Le type Dish de l'API n'a pas de propriété price, donc on ne peut pas vérifier le prix
    // Cette vérification est désactivée pour l'instant car l'API ne retourne pas de prix pour les plats
    const dishesWithZeroPrice: Dish[] = [];
    if (dishesWithZeroPrice.length > 0) {
        const plural = dishesWithZeroPrice.length > 1 ? 's' : '';
        const has = dishesWithZeroPrice.length > 1 ? ' ont' : ' a';
        alerts.push({
            type: 'warning',
            message: t('common.alertDishesWithZeroPrice', { count: dishesWithZeroPrice.length, plural, has }),
            category: 'dish'
        });
    }
    
    // Vérifier si le menu n'a pas été mis à jour depuis 30 jours
    const lastModified = getLastModifiedDate();
    if (lastModified) {
        const daysSinceUpdate = Math.floor((new Date().getTime() - lastModified.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceUpdate >= 30) {
            alerts.push({
                type: 'error',
                message: t('common.alertMenuNotUpdated', { days: daysSinceUpdate }),
                category: 'menu'
            });
        }
    }
    
    // Vérifier s'il n'y a pas de vins créés
    if (winesArray.length === 0) {
        alerts.push({
            type: 'warning',
            message: t('common.alertNoWinesCreated'),
            category: 'wine'
        });
    }
    
    // Vérifier s'il n'y a pas de plats créés
    if (dishesArray.length === 0) {
        alerts.push({
            type: 'warning',
            message: t('common.alertNoDishesCreated'),
            category: 'dish'
        });
    }
    
    // Vérifier si une fiche vin est incomplète (pas de cépages OU pas de région OU pas de prix)
    const incompleteWines = winesArray.filter((wine: RestaurantWine) => {
        const hasNoGrapes = !wine.grapes_varieties || wine.grapes_varieties.length === 0;
        const hasNoRegion = !wine.appellation?.fr && !wine.appellation?.['en-US'];
        const hasNoPrice = !wine.price || wine.price === 0;
        return hasNoGrapes || hasNoRegion || hasNoPrice;
    });
    
    return {
        alerts,
        incompleteWinesCount: incompleteWines.length,
        isLoading: false,
    };
};

// Hook pour vérifier les plats sans arôme principal
export const useDishesWithoutPrincipalAroma = () => {
    const { data: dishes, isLoading } = useRestaurantDishes();
    
    if (isLoading || !dishes) {
        return {
            count: 0,
            isLoading: true,
        };
    }
    
    const dishesWithoutAroma = dishes.filter((dish: Dish) => 
        !dish.food_cat_1 || dish.food_cat_1 === null || dish.food_cat_1 === undefined || dish.food_cat_1 === -1
    );
    
    return {
        count: dishesWithoutAroma.length,
        isLoading: false,
    };
};
