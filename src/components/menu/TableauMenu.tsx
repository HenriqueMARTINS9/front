"use client";
import React, { useMemo, useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import Tag from '../common/Tag';
import Button from '../common/Button';
import FormulaireModificationPlat from './FormulaireModificationPlat';
import { recommendationsService } from '@/lib/api';
import { Dish } from '@/lib/api';
import { useTranslation } from '@/lib/useTranslation';
import { useTranslation as useI18n } from 'react-i18next';
import { getAromaColors } from '@/lib/aromaColors';
import { useUpdateDish, useDeleteDish } from '@/lib/hooks';
import { getRestaurantId } from '@/lib/auth';

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


type TableauMenuProps = {
    pointDeVenteId: string;
    restaurantId?: number; // ID du restaurant pour récupérer les données de l'API
};

export default function TableauMenu({ pointDeVenteId, restaurantId }: TableauMenuProps) {
    const { t } = useTranslation();
    const { i18n } = useI18n();
    
    // Récupérer le restaurant ID depuis localStorage si non fourni
    const actualRestaurantId = restaurantId ?? getRestaurantId() ?? 1;
    
    // Données statiques (commentées pour utiliser l'API)
    // const [plats, setPlats] = useState<Plat[]>(() => createInitialData());
    
    // Données de l'API uniquement
    const [apiDishes, setApiDishes] = useState<Dish[]>([]);
    const [menuPlats, setMenuPlats] = useState<Plat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [editingPlatId, setEditingPlatId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<Record<string, number>>({});
    const itemsPerPage = 10;

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



    // Fonction pour convertir un plat de l'API au format attendu par l'interface
    const convertApiDishToPlat = (dish: Dish): Plat => {
        // Créer des mots-clés basés sur les catégories alimentaires (arômes)
        const motsCles: MotCle[] = [];
        
        // Arôme principal (food_cat_1)
        if (dish.food_cat_1) {
            const aromaKey = getAromaKeyFromNumber(String(dish.food_cat_1));
            const colors = getAromaColors(aromaKey);
            
            if (colors) {
                motsCles.push({
                    id: `mc-api-${dish.dish_id}-1`,
                    label: aromaKey, // Utiliser la clé au lieu du label traduit
                    color: colors.bg,
                    textColor: colors.text,
                    puce: true,
                    puceColor: colors.puce
                });
            }
        }
        
        // Arômes secondaires (food_cat_2 et food_cat_3)
        if (dish.food_cat_2) {
            const aromaKey = getAromaKeyFromNumber(String(dish.food_cat_2));
            const colors = getAromaColors(aromaKey);
            if (colors) {
                motsCles.push({
                    id: `mc-api-${dish.dish_id}-2`,
                    label: aromaKey, // Utiliser la clé au lieu du label traduit
                    color: colors.bg,
                    textColor: colors.text,
                    puce: true, // TOUJOURS afficher la puce
                    puceColor: colors.puce
                });
            }
        }
        
        if (dish.food_cat_3) {
            const aromaKey = getAromaKeyFromNumber(String(dish.food_cat_3));
            const colors = getAromaColors(aromaKey);
            if (colors) {
                motsCles.push({
                    id: `mc-api-${dish.dish_id}-3`,
                    label: aromaKey, // Utiliser la clé au lieu du label traduit
                    color: colors.bg,
                    textColor: colors.text,
                    puce: true, // TOUJOURS afficher la puce
                    puceColor: colors.puce
                });
            }
        }


        // Toujours utiliser les valeurs FR comme valeurs par défaut pour compatibilité
        const convertedPlat = {
            id: `api-${dish.dish_id}`,
            nom: dish.dish_name?.fr || dish.dish_name?.['en-US'] || dish.dish_name?.en || `Plat ${dish.dish_id}`, // Valeur par défaut en FR
            nomFr: dish.dish_name?.fr || undefined,
            nomEn: dish.dish_name?.['en-US'] || dish.dish_name?.en || undefined,
            description: dish.dish_description?.fr || dish.dish_description?.['en-US'] || dish.dish_description?.en || '', // Valeur par défaut en FR
            descriptionFr: dish.dish_description?.fr || undefined,
            descriptionEn: dish.dish_description?.['en-US'] || dish.dish_description?.en || undefined,
            prix: 0, // Pas de prix dans l'API pour l'instant
            section: dish.dish_type?.fr || dish.dish_type?.['en-US'] || dish.dish_type?.en || 'Non spécifié', // Valeur par défaut en FR
            sectionFr: dish.dish_type?.fr || undefined,
            sectionEn: dish.dish_type?.['en-US'] || dish.dish_type?.en || undefined,
            pointsDeVente: [true], // Seulement le restaurant 1
            motsCles: motsCles
        };
        
        // Debug: vérifier les valeurs converties pour TOUS les plats
        console.log(`convertApiDishToPlat - Plat ID ${dish.dish_id}:`, {
            'dish.dish_name': dish.dish_name,
            'dish.dish_name.fr': dish.dish_name?.fr,
            'dish.dish_name.en-US': dish.dish_name?.['en-US'],
            'dish.dish_type': dish.dish_type,
            'dish.dish_type.fr': dish.dish_type?.fr,
            'dish.dish_type.en-US': dish.dish_type?.['en-US'],
            'dish.dish_description': dish.dish_description,
            'convertedPlat.nomFr': convertedPlat.nomFr,
            'convertedPlat.nomEn': convertedPlat.nomEn,
            'convertedPlat.descriptionFr': convertedPlat.descriptionFr,
            'convertedPlat.descriptionEn': convertedPlat.descriptionEn,
            'convertedPlat.sectionFr': convertedPlat.sectionFr,
            'convertedPlat.sectionEn': convertedPlat.sectionEn,
            'convertedPlat complet': convertedPlat
        });
        
        return convertedPlat;
    };


    // Récupérer les données de l'API
    useEffect(() => {
        const fetchDishes = async () => {
            setIsLoading(true);
            setError(null);
            try {
                console.log('Récupération des plats pour le restaurant', actualRestaurantId);
                const data = await recommendationsService.getRestaurantDishes(actualRestaurantId);
                console.log('Plats récupérés depuis API:', data);
                // Debug: vérifier les valeurs EN dans les plats
                data.forEach((dish, index) => {
                    console.log(`Plat ${index} (ID: ${dish.dish_id}):`, {
                        'dish_name.fr': dish.dish_name?.fr,
                        'dish_name.en-US': dish.dish_name?.['en-US'],
                        'dish_name.en': dish.dish_name?.en,
                        'dish_type.fr': dish.dish_type?.fr,
                        'dish_type.en-US': dish.dish_type?.['en-US'],
                        'dish_type.en': dish.dish_type?.en,
                        'dish_description.fr': dish.dish_description?.fr,
                        'dish_description.en-US': dish.dish_description?.['en-US'],
                        'dish_description.en': dish.dish_description?.en
                    });
                });
                setApiDishes(data);
            } catch (err) {
                console.error('Erreur lors de la récupération des plats:', err);
                setError(err instanceof Error ? err.message : t('common.error'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchDishes();
    }, [actualRestaurantId]);

    // Mettre à jour la liste des plats à partir des données API uniquement
    useEffect(() => {
        if (apiDishes.length === 0) {
            setMenuPlats([]);
            return;
        }

        console.log('TableauMenu - Langue actuelle:', i18n.language);
        const converted = apiDishes.map(convertApiDishToPlat);
        if (converted[0]) {
            console.log('TableauMenu - Premier plat - nomEn:', converted[0].nomEn, 'sectionEn:', converted[0].sectionEn);
        }
        setMenuPlats(converted);
    }, [apiDishes, i18n.language, t]);

    // Filtrer les plats selon le point de vente actif
    const platsFiltres = menuPlats.filter(plat => {
        const pointDeVenteIndex = parseInt(pointDeVenteId) - 1;
        return plat.pointsDeVente[pointDeVenteIndex];
    });

    // Grouper les plats par type (section) pour créer des tableaux séparés
    const platsGroupes = useMemo(() => {
        const groupes: { [key: string]: Plat[] } = {};
        platsFiltres.forEach(plat => {
            // Utiliser la section EN si la langue est en anglais et que la section EN existe
            const type = i18n.language === 'en' && plat.sectionEn 
                ? plat.sectionEn 
                : (plat.sectionFr || plat.section); // Sinon utiliser la section FR ou la section par défaut
            if (!groupes[type]) {
                groupes[type] = [];
            }
            groupes[type].push(plat);
        });
        return groupes;
    }, [platsFiltres, i18n.language]);

    const columns = useMemo(() => [
        { key: 'nom', label: 'Nom du plat' },
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
    }

    function startEditing(platId: string) {
        setEditingPlatId(platId);
        setExpanded(prev => ({ ...prev, [platId]: !prev[platId] }));
    }

    function cancelEditing() {
        setEditingPlatId(null);
    }

    // Hooks pour les mutations API
    const updateDishMutation = useUpdateDish(actualRestaurantId);
    const deleteDishMutation = useDeleteDish(actualRestaurantId);

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
                                    <p>Impossible de charger les plats du restaurant {actualRestaurantId}.</p>
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
                            <span>
                                {(() => {
                                    // Le type vient déjà du groupement qui utilise sectionEn si en anglais
                                    // Mais vérifions aussi le premier plat pour être sûr
                                    const firstPlat = platsDuType[0];
                                    if (i18n.language === 'en' && firstPlat?.sectionEn) {
                                        return firstPlat.sectionEn;
                                    }
                                    return type;
                                })()}
                            </span>
                            <Tag label={`${platsDuType.length} ${t('common.elements')}`} color="bg-[#EEF4FF]" textColor="text-indigo-700" />
                        </div>
                    </div>
                    <div className="">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <tbody className="align-center text-center text-gray-900">
                                    {(() => {
                                        const pageKey = type;
                                        const currentPageForType = currentPage[pageKey] || 1;
                                        const totalPages = Math.ceil(platsDuType.length / itemsPerPage);
                                        const startIndex = (currentPageForType - 1) * itemsPerPage;
                                        const endIndex = startIndex + itemsPerPage;
                                        const paginatedPlats = platsDuType.slice(startIndex, endIndex);
                                        
                                        // Réinitialiser la page si elle dépasse le nombre total de pages
                                        if (currentPageForType > totalPages && totalPages > 0) {
                                            setCurrentPage(prev => ({ ...prev, [pageKey]: 1 }));
                                        }
                                        
                                        return paginatedPlats.map((plat) => {
                                const isOpen = !!expanded[plat.id];
                                return (
                                    <React.Fragment key={plat.id}>
                                        <tr className="border-t border-gray-200">
                                                                                         <td className="px-6 py-4">
                                                 <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                                                     <div className="font-medium text-sm text-left">
                                                         {(() => {
                                                             const currentLang = i18n.language;
                                                             const nom = currentLang === 'en' 
                                                                 ? (plat.nomEn || plat.nom)
                                                                 : (plat.nomFr || plat.nom);
                                                             if (currentLang === 'en' && plat.id === 'api-0') {
                                                                 console.log('Affichage nom - Langue:', currentLang, 'nomEn:', plat.nomEn, 'nom:', plat.nom, 'résultat:', nom);
                                                             }
                                                             return nom;
                                                         })()}
                                                     </div>
                                                     {(() => {
                                                         const description = i18n.language === 'en' 
                                                             ? (plat.descriptionEn || plat.description)
                                                             : (plat.descriptionFr || plat.description);
                                                         return description ? (
                                                             <div className="text-sm text-left text-gray-600">
                                                                 {description}
                                                             </div>
                                                         ) : null;
                                                     })()}
                                                 </div>
                                             </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-4">

                                                    {/* Mots-clés */}
                                                    <div className="flex space-x-2">
                                                        {plat.motsCles.map((motCle) => {
                                                            // Convertir les anciens labels français en clés d'arômes
                                                            const oldLabelMap: Record<string, string> = {
                                                                'Légume vert': 'greenVegetable',
                                                                'Viande rouge': 'redMeat',
                                                                'Viande blanche': 'whiteMeat',
                                                                'Volaille': 'whiteMeat',
                                                                'Poisson': 'finFish',
                                                                'Crustacé': 'shellfish',
                                                                'Mollusque': 'mollusk',
                                                                'Solanacée': 'nightshade',
                                                                'Champignon': 'funghi',
                                                                'Fromage dur': 'nuttyHardCheese',
                                                                'Fromage bleu': 'pungentBlueCheese',
                                                                'Fromage doux': 'delicateButteryCheese',
                                                                'Herbe fraîche': 'aromaticGreenHerb',
                                                                'Herbe sèche': 'dryHerb',
                                                                'Épices exotiques': 'exoticSpice',
                                                                'Viande séchée': 'curedMeat',
                                                                'Faisselle': 'sourCheeseCream',
                                                                'Fromage salé': 'saltyCrumblyCheese'
                                                            };
                                                            
                                                            // Utiliser la clé d'arôme (soit directement, soit convertie depuis l'ancien label)
                                                            const aromaKey = oldLabelMap[motCle.label] || motCle.label;
                                                            
                                                            // Traduire le label si c'est une clé d'arôme
                                                            const translationKey = `menu.aromas.${aromaKey}`;
                                                            const translatedLabel = t(translationKey);
                                                            // Si la traduction existe (ne retourne pas la clé), l'utiliser, sinon utiliser le label original
                                                            const displayLabel = translatedLabel !== translationKey ? translatedLabel : motCle.label;
                                                            
                                                            return (
                                                                <Tag
                                                                    key={motCle.id}
                                                                    label={displayLabel}
                                                                    color={motCle.color}
                                                                    textColor={motCle.textColor}
                                                                    puce={motCle.puce}
                                                                    puceColor={motCle.puceColor}
                                                                />
                                                            );
                                                        })}
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
                                                 <td colSpan={2} className="px-6 py-4 bg-white">
                                                    {(() => {
                                                        console.log('TableauMenu - Plat passé au FormulaireModificationPlat:', JSON.stringify(plat, null, 2));
                                                        return (
                                                            <FormulaireModificationPlat
                                                                plat={plat}
                                                                onSave={savePlat}
                                                                onCancel={cancelEditing}
                                                                onDelete={deletePlat}
                                                                restaurantId={restaurantId}
                                                            />
                                                        );
                                                    })()}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })})()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {(() => {
                        const pageKey = type;
                        const currentPageForType = currentPage[pageKey] || 1;
                        const totalPages = Math.ceil(platsDuType.length / itemsPerPage);
                        if (totalPages <= 1) return null;
                        
                        return (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    {t('common.showingResults', {
                                        start: (currentPageForType - 1) * itemsPerPage + 1,
                                        end: Math.min(currentPageForType * itemsPerPage, platsDuType.length),
                                        total: platsDuType.length
                                    }) || `Affichage de ${(currentPageForType - 1) * itemsPerPage + 1} à ${Math.min(currentPageForType * itemsPerPage, platsDuType.length)} sur ${platsDuType.length} plats`}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => ({ ...prev, [pageKey]: Math.max(1, (prev[pageKey] || 1) - 1) }))}
                                        disabled={currentPageForType === 1}
                                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {t('common.previous') || 'Précédent'}
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPageForType <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPageForType >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPageForType - 2 + i;
                                            }
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(prev => ({ ...prev, [pageKey]: pageNum }))}
                                                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                                        currentPageForType === pageNum
                                                            ? 'bg-[#4E5BA6] text-white'
                                                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => ({ ...prev, [pageKey]: Math.min(totalPages, (prev[pageKey] || 1) + 1) }))}
                                        disabled={currentPageForType === totalPages}
                                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {t('common.next') || 'Suivant'}
                                    </button>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            ))}
        </div>
    );
}
