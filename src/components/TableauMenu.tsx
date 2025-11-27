"use client";
import React, { useMemo, useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import Tag from './Tag';
import Button from './Button';
import FormulaireModificationPlat from './FormulaireModificationPlat';
import { recommendationsService } from '@/lib/api';
import { Dish } from '@/lib/api';
import { useTranslation } from '@/lib/useTranslation';
import { useTranslation as useI18n } from 'react-i18next';
import { getAromaColorByType } from '@/lib/aromaColors';
import { useUpdateDish, useDeleteDish } from '@/lib/hooks';

type MotCle = {
    id: string;
    label: string;
    color: string;
    textColor: string;
    puce: boolean; // Rendre obligatoire
    puceColor: string; // Rendre obligatoire
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

const API_MENU_STORAGE_PREFIX = 'virtualsomm_api_menu_';

function createInitialData(): Plat[] {
    return [
        {
            id: 'p1',
            nom: 'Salade verte',
            description: 'Salade fraîche du jardin',
            prix: 12.00,
            section: 'Nos entrées',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc1', label: 'Légume vert', color: 'bg-green-100', textColor: 'text-green-700' }
            ]
        },
        {
            id: 'p2',
            nom: 'Salade mêlée',
            description: 'Mélange de salades variées',
            prix: 14.00,
            section: 'Nos entrées',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc2', label: 'Légume vert', color: 'bg-green-100', textColor: 'text-green-700' }
            ]
        },
        {
            id: 'p3',
            nom: 'Gaspacho andalou',
            description: 'Perles de melon et lard grillé',
            prix: 16.00,
            section: 'Nos entrées',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc3', label: 'Solanacée', color: 'bg-green-100', textColor: 'text-green-700' },
                { id: 'mc4', label: 'Viande séchée', color: 'bg-red-100', textColor: 'text-red-700' }
            ]
        },
        {
            id: 'p4',
            nom: 'Carpaccio de tomate à l\'ancienne',
            description: 'Vinaigrette balsamique, sorbet basilic maison',
            prix: 18.00,
            section: 'Nos entrées',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc5', label: 'Solanacée', color: 'bg-green-100', textColor: 'text-green-700' },
                { id: 'mc6', label: 'Herbe fraîche aromatique', color: 'bg-purple-100', textColor: 'text-purple-700' }
            ]
        },
        {
            id: 'p5',
            nom: 'Feuilleté aux champignons',
            description: 'Mélange de champignons et sauce morilles',
            prix: 20.00,
            section: 'Nos entrées',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc7', label: 'Champignon', color: 'bg-green-100', textColor: 'text-green-700' },
                { id: 'mc8', label: 'Herbe sèche', color: 'bg-purple-100', textColor: 'text-purple-700' }
            ]
        },
        {
            id: 'p6',
            nom: 'Crevettes Royales sautées à l\'huile d\'olive & noix st-jacques',
            description: 'Sur lit de julienne de légumes et sauce exotique',
            prix: 28.00,
            section: 'Nos entrées',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc9', label: 'Crustacé', color: 'bg-red-100', textColor: 'text-red-700' },
                { id: 'mc10', label: 'Mollusque', color: 'bg-orange-100', textColor: 'text-orange-700' },
                { id: 'mc11', label: 'Épices exotiques', color: 'bg-purple-100', textColor: 'text-purple-700' }
            ]
        },
        {
            id: 'p7',
            nom: 'Filet de bœuf grillé',
            description: 'Sauce au poivre, pommes duchesse',
            prix: 32.00,
            section: 'Nos viandes',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc12', label: 'Viande rouge', color: 'bg-red-100', textColor: 'text-red-700' }
            ]
        },
        {
            id: 'p8',
            nom: 'Poulet fermier rôti',
            description: 'Sauce aux herbes, légumes de saison',
            prix: 26.00,
            section: 'Nos viandes',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc13', label: 'Volaille', color: 'bg-orange-100', textColor: 'text-orange-700' }
            ]
        }
    ];
}

type TableauMenuProps = {
    pointDeVenteId: string;
    restaurantId?: number; // ID du restaurant pour récupérer les données de l'API
};

export default function TableauMenu({ pointDeVenteId, restaurantId = 1 }: TableauMenuProps) {
    const { t } = useTranslation();
    const { i18n } = useI18n();
    
    // Données statiques (commentées pour utiliser l'API)
    // const [plats, setPlats] = useState<Plat[]>(() => createInitialData());
    
    // Données de l'API
    const [apiDishes, setApiDishes] = useState<Dish[]>([]);
    const [menuPlats, setMenuPlats] = useState<Plat[]>([]);
    const [hasOverrides, setHasOverrides] = useState(false);
    const [hasUserModifications, setHasUserModifications] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [editingPlatId, setEditingPlatId] = useState<string | null>(null);
    const storageKey = useMemo(() => `${API_MENU_STORAGE_PREFIX}${restaurantId}`, [restaurantId]);

    // Mapping des numéros vers les clés d'arômes (commence à 0)
    const getAromaKeyFromNumber = (aromaNumber: string): string => {
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
        
        return aromaMap[aromaNumber] || aromaNumber;
    };

    // Fonction pour traduire les arômes
    const translateAroma = (aromaKey: string) => {
        const translatedKey = getAromaKeyFromNumber(aromaKey);
        const translationKey = `menu.aromas.${translatedKey}`;
        const translation = t(translationKey);
        
        if (translation && translation !== translationKey) {
            return translation;
        }
        
        // Fallback: transformer la clé camelCase en texte lisible
        return translatedKey
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/^./, match => match.toUpperCase());
    };

    const sanitizePlat = (plat: any, fallbackId: string): Plat | null => {
        if (!plat || typeof plat !== 'object') {
            return null;
        }

        const id = typeof plat.id === 'string' ? plat.id : fallbackId;
        const nom = typeof plat.nom === 'string' ? plat.nom : '';
        if (!nom) {
            return null;
        }

        const description = typeof plat.description === 'string' ? plat.description : undefined;
        let prixValue: number | undefined;
        if (typeof plat.prix === 'number') {
            prixValue = plat.prix;
        } else if (typeof plat.prix === 'string') {
            const parsed = parseFloat(plat.prix);
            prixValue = Number.isFinite(parsed) ? parsed : undefined;
        }

        const section = typeof plat.section === 'string' ? plat.section : '';
        const pointsDeVente = Array.isArray(plat.pointsDeVente)
            ? plat.pointsDeVente.map((value: any) => Boolean(value))
            : [true];

        const motsCles = Array.isArray(plat.motsCles)
            ? plat.motsCles
                .filter((mot: any) => mot && typeof mot === 'object' && typeof mot.label === 'string')
                .map((mot: any, index: number) => ({
                    id: typeof mot.id === 'string' ? mot.id : `${id}-mot-${index}`,
                    label: mot.label,
                    color: typeof mot.color === 'string' ? mot.color : undefined,
                    textColor: typeof mot.textColor === 'string' ? mot.textColor : undefined,
                    puce: typeof mot.puce === 'boolean' ? mot.puce : Boolean(mot.puceColor),
                    puceColor: typeof mot.puceColor === 'string' ? mot.puceColor : undefined,
                }))
            : [];

        return {
            id,
            nom,
            description,
            prix: prixValue,
            section,
            pointsDeVente,
            motsCles,
        };
    };

    const sanitizePlatsArray = (plats: any[]): Plat[] => {
        return plats
            .map((plat, index) => sanitizePlat(plat, `override-${index}-${Date.now()}`))
            .filter((plat): plat is Plat => Boolean(plat));
    };

    const persistMenuPlats = (plats: Plat[]) => {
        if (typeof window === 'undefined') {
            return;
        }
        try {
            if (plats.length === 0) {
                window.localStorage.removeItem(storageKey);
            } else {
                window.localStorage.setItem(storageKey, JSON.stringify(plats));
            }
        } catch (storageError) {
            console.error('Erreur lors de la sauvegarde du menu API dans le stockage local :', storageError);
        }
    };

    // Fonction pour convertir un plat de l'API au format attendu par l'interface
    const convertApiDishToPlat = (dish: Dish): Plat => {
        // Traduire le nom du plat selon la langue
        const dishName = i18n.language === 'en' 
            ? (dish.dish_name?.en || dish.dish_name?.['en-US'] || dish.dish_name?.fr || `Dish ${dish.dish_id}`)
            : (dish.dish_name?.fr || dish.dish_name?.en || dish.dish_name?.['en-US'] || `Plat ${dish.dish_id}`);
            
        const dishType = i18n.language === 'en'
            ? (dish.dish_type?.en || dish.dish_type?.['en-US'] || dish.dish_type?.fr || 'Not specified')
            : (dish.dish_type?.fr || dish.dish_type?.en || dish.dish_type?.['en-US'] || 'Non spécifié');
        
        // Créer des mots-clés basés sur les catégories alimentaires (arômes)
        const motsCles: MotCle[] = [];
        
        // Arôme principal (food_cat_1)
        if (dish.food_cat_1) {
            const translatedAroma = translateAroma(dish.food_cat_1);
            const aromaKey = getAromaKeyFromNumber(dish.food_cat_1);
            const colors = getAromaColorByType(aromaKey, true); // true = arôme principal
            
        motsCles.push({
            id: `mc-api-${dish.dish_id}-1`,
            label: translatedAroma,
            color: colors.bg,
            textColor: colors.text,
            puce: true,
            puceColor: colors.dot
        });
        }
        
        // Arômes secondaires (food_cat_2 et food_cat_3)
        if (dish.food_cat_2) {
            const translatedAroma = translateAroma(dish.food_cat_2);
            const aromaKey = getAromaKeyFromNumber(dish.food_cat_2);
            const colors = getAromaColorByType(aromaKey, false); // false = arôme secondaire
            motsCles.push({
                id: `mc-api-${dish.dish_id}-2`,
                label: translatedAroma,
                color: colors.bg,
                textColor: colors.text,
                puce: true, // TOUJOURS afficher la puce
                puceColor: colors.dot
            });
        }
        
        if (dish.food_cat_3) {
            const translatedAroma = translateAroma(dish.food_cat_3);
            const aromaKey = getAromaKeyFromNumber(dish.food_cat_3);
            const colors = getAromaColorByType(aromaKey, false); // false = arôme secondaire
            motsCles.push({
                id: `mc-api-${dish.dish_id}-3`,
                label: translatedAroma,
                color: colors.bg,
                textColor: colors.text,
                puce: true, // TOUJOURS afficher la puce
                puceColor: colors.dot
            });
        }


        return {
            id: `api-${dish.dish_id}`,
            nom: dishName,
            description: '', // Pas de description dans l'API pour l'instant
            prix: 0, // Pas de prix dans l'API pour l'instant
            section: dishType, // Le type devient la section
            pointsDeVente: [true], // Seulement le restaurant 1
            motsCles: motsCles
        };
    };

    // Charger les éventuelles surcharges depuis le stockage local
    useEffect(() => {
        setHasOverrides(false);
        setHasUserModifications(false);
        if (typeof window === 'undefined') {
            return;
        }
        try {
            const stored = window.localStorage.getItem(storageKey);
            if (!stored) {
                setMenuPlats([]);
                return;
            }
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                const sanitized = sanitizePlatsArray(parsed);
                if (sanitized.length > 0) {
                    setMenuPlats(sanitized);
                    setHasOverrides(true);
                    return;
                }
            }
            setMenuPlats([]);
        } catch (storageError) {
            console.error('Erreur lors du chargement du menu API depuis le stockage local :', storageError);
            setMenuPlats([]);
        }
    }, [storageKey]);

    // Récupérer les données de l'API
    useEffect(() => {
        const fetchDishes = async () => {
            setIsLoading(true);
            setError(null);
            try {
                console.log('Récupération des plats pour le restaurant', restaurantId);
                const data = await recommendationsService.getRestaurantDishes(restaurantId);
                console.log('Plats récupérés:', data);
                setApiDishes(data);
            } catch (err) {
                console.error('Erreur lors de la récupération des plats:', err);
                setError(err instanceof Error ? err.message : t('common.error'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchDishes();
    }, [restaurantId]);

    // Mettre à jour la liste des plats à partir des données API si aucune surcharge
    useEffect(() => {
        if (apiDishes.length === 0) {
            if (!hasOverrides) {
                setMenuPlats([]);
            }
            return;
        }

        const converted = apiDishes.map(convertApiDishToPlat);
        setMenuPlats((prev) => {
            if (hasOverrides) {
                const existingIds = new Set(prev.map((plat) => plat.id));
                const nouveaux = converted.filter((plat) => !existingIds.has(plat.id));
                if (nouveaux.length === 0) {
                    return prev;
                }
                return [...prev, ...nouveaux];
            }
            return converted;
        });
    }, [apiDishes, hasOverrides, i18n.language, t]);

    // Persister les modifications si nécessaire
    useEffect(() => {
        if (!hasOverrides && !hasUserModifications) {
            return;
        }
        persistMenuPlats(menuPlats);
    }, [menuPlats, hasOverrides, hasUserModifications]);

    // Filtrer les plats selon le point de vente actif
    const platsFiltres = menuPlats.filter(plat => {
        const pointDeVenteIndex = parseInt(pointDeVenteId) - 1;
        return plat.pointsDeVente[pointDeVenteIndex];
    });

    // Grouper les plats par type (section) pour créer des tableaux séparés
    const platsGroupes = useMemo(() => {
        const groupes: { [key: string]: Plat[] } = {};
        platsFiltres.forEach(plat => {
            const type = plat.section; // Le type devient la clé de groupement
            if (!groupes[type]) {
                groupes[type] = [];
            }
            groupes[type].push(plat);
        });
        return groupes;
    }, [platsFiltres]);

    const columns = useMemo(() => [
        { key: 'nom', label: 'Nom du plat' },
        { key: 'prix', label: 'Prix' },
        { key: 'actions', label: '' },
    ], []);

    function togglePointDeVente(platId: string, index: number) {
        // Pour les données de l'API, on ne peut pas modifier directement
        // Cette fonctionnalité pourrait être implémentée avec une API de mise à jour
        setMenuPlats((prev) => prev.map((plat) => {
            if (plat.id !== platId) {
                return plat;
            }
            const nextPoints = [...plat.pointsDeVente];
            const targetIndex = index;
            while (nextPoints.length <= targetIndex) {
                nextPoints.push(false);
            }
            nextPoints[targetIndex] = !nextPoints[targetIndex];
            return {
                ...plat,
                pointsDeVente: nextPoints,
            };
        }));
        setHasUserModifications(true);
        setHasOverrides(true);
    }

    function startEditing(platId: string) {
        setEditingPlatId(platId);
        setExpanded(prev => ({ ...prev, [platId]: !prev[platId] }));
    }

    function cancelEditing() {
        setEditingPlatId(null);
    }

    // Hooks pour les mutations API
    const updateDishMutation = useUpdateDish(restaurantId);
    const deleteDishMutation = useDeleteDish(restaurantId);

    async function savePlat(plat: Plat) {
        // Vérifier si c'est un plat de l'API (commence par "api-")
        if (plat.id.startsWith('api-')) {
            try {
                // Mettre à jour via l'API
                await updateDishMutation.mutateAsync({
                    id: plat.id,
                    plat: plat
                });
                // Mettre à jour localement immédiatement pour un feedback visuel
                setMenuPlats((prev) =>
                    prev.map((item) => (item.id === plat.id ? { ...item, ...plat } : item))
                );
                setEditingPlatId(null);
                setExpanded(prev => ({ ...prev, [plat.id]: false }));
            } catch (error) {
                console.error('Erreur lors de la mise à jour du plat:', error);
                // L'erreur sera gérée par React Query
            }
        } else {
            // Pour les plats locaux (non-API), garder l'ancien comportement
            setEditingPlatId(null);
            setMenuPlats((prev) =>
                prev.map((item) => (item.id === plat.id ? { ...item, ...plat } : item))
            );
            setHasUserModifications(true);
            setHasOverrides(true);
            setExpanded(prev => ({ ...prev, [plat.id]: false }));
        }
    }

    async function deletePlat(platId: string) {
        // Vérifier si c'est un plat de l'API (commence par "api-")
        if (platId.startsWith('api-')) {
            try {
                // Supprimer via l'API
                await deleteDishMutation.mutateAsync(platId);
                // Mettre à jour localement immédiatement pour un feedback visuel
                setMenuPlats((prev) => prev.filter((plat) => plat.id !== platId));
                setEditingPlatId(null);
                setExpanded(prev => {
                    const next = { ...prev };
                    delete next[platId];
                    return next;
                });
            } catch (error) {
                console.error('Erreur lors de la suppression du plat:', error);
                // L'erreur sera gérée par React Query
            }
        } else {
            // Pour les plats locaux (non-API), garder l'ancien comportement
            setEditingPlatId(null);
            setMenuPlats((prev) => prev.filter((plat) => plat.id !== platId));
            setHasUserModifications(true);
            setHasOverrides(true);
            setExpanded(prev => {
                const next = { ...prev };
                delete next[platId];
                return next;
            });
        }
    }

    // Affichage de l'état de chargement
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-6 py-6 text-lg text-gray-900 flex items-center justify-between bg-[#D5D9EB] rounded-t-xl">
                    <div className="flex items-center gap-2">
                        <span>Menu du Point de Vente #{pointDeVenteId}</span>
                        <Tag label={t('common.loading')} color="bg-[#EEF4FF]" textColor="text-indigo-700" />
                    </div>
                </div>
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E5BA6]"></div>
                    <span className="ml-3 text-gray-600">{t('test.dishes.loading')}</span>
                </div>
            </div>
        );
    }

    // Affichage de l'erreur
    if (error) {
        return (
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-6 py-6 text-lg text-gray-900 flex items-center justify-between bg-[#D5D9EB] rounded-t-xl">
                    <div className="flex items-center gap-2">
                        <span>Menu du Point de Vente #{pointDeVenteId}</span>
                        <Tag label={t('common.error')} color="bg-red-100" textColor="text-red-700" />
                    </div>
                </div>
                <div className="px-6 py-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">{t('common.error')}</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>Impossible de charger les plats du restaurant {restaurantId}.</p>
                                    <p className="mt-1 text-xs">{t('common.error')}: {error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Affichage des tableaux groupés par type
    return (
        <div className="space-y-8">
            {Object.entries(platsGroupes).map(([type, platsDuType]) => (
                <div key={type} className="bg-white rounded-xl border border-gray-200">
                    <div className="px-6 py-6 text-lg text-gray-900 flex items-center justify-between bg-[#D5D9EB] rounded-t-xl">
                        <div className="flex items-center gap-2">
                            <span>{type}</span>
                            <Tag label={`${platsDuType.length} ${t('common.elements')}`} color="bg-[#EEF4FF]" textColor="text-indigo-700" />
                        </div>
                    </div>
                    <div className="">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <tbody className="align-center text-center text-gray-900">
                                    {platsDuType.map((plat) => {
                                const isOpen = !!expanded[plat.id];
                                return (
                                    <React.Fragment key={plat.id}>
                                        <tr className="border-t border-gray-200">
                                                                                         <td className="px-6 py-4">
                                                 <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                                                     <div className="font-medium text-sm text-left">{plat.nom}</div>
                                                     {plat.description && (
                                                         <div className="text-sm text-left text-gray-600">{plat.description}</div>
                                                     )}
                                                 </div>
                                             </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-4">

                                                    {/* Mots-clés */}
                                                    <div className="flex space-x-2">
                                                        {plat.motsCles.map((motCle) => (
                                                            <Tag
                                                                key={motCle.id}
                                                                label={motCle.label}
                                                                color={motCle.color}
                                                                textColor={motCle.textColor}
                                                                puce={motCle.puce}
                                                                puceColor={motCle.puceColor}
                                                            />
                                                        ))}
                                                    </div>

                                                    {/* Bouton d'action */}
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => startEditing(plat.id)}
                                                            className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                                                        >
                                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M14.1665 2.49999C14.3854 2.28112 14.6452 2.1075 14.9312 1.98905C15.2171 1.8706 15.5236 1.80963 15.8332 1.80963C16.1427 1.80963 16.4492 1.8706 16.7352 1.98905C17.0211 2.1075 17.281 2.28112 17.4998 2.49999C17.7187 2.71886 17.8923 2.97869 18.0108 3.26466C18.1292 3.55063 18.1902 3.85713 18.1902 4.16665C18.1902 4.47618 18.1292 4.78268 18.0108 5.06865C17.8923 5.35461 17.7187 5.61445 17.4998 5.83332L6.24984 17.0833L1.6665 18.3333L2.9165 13.75L14.1665 2.49999Z" stroke="#535862" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                                                                 {isOpen && (
                                             <tr className="transition-all duration-300 ease-in-out animate-in slide-in-from-top-2">
                                                 <td colSpan={3} className="px-6 py-4 bg-white">
                                                    <FormulaireModificationPlat
                                                        plat={plat}
                                                        onSave={savePlat}
                                                        onCancel={cancelEditing}
                                                        onDelete={deletePlat}
                                                        restaurantId={restaurantId}
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
