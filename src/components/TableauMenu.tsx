"use client";
import React, { useMemo, useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import Tag from './Tag';
import Button from './Button';
import FormulaireModificationPlat from './FormulaireModificationPlat';
import { recommendationsService } from '@/lib/api';
import { Dish } from '@/lib/api';
import { useTranslation } from '@/lib/useTranslation';

type MotCle = {
    id: string;
    label: string;
    color: string;
    textColor: string;
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

export default function TableauMenu({ pointDeVenteId, restaurantId = 0 }: TableauMenuProps) {
    const { t } = useTranslation();
    
    // Données statiques (commentées pour utiliser l'API)
    // const [plats, setPlats] = useState<Plat[]>(() => createInitialData());
    
    // Données de l'API
    const [apiDishes, setApiDishes] = useState<Dish[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [editingPlatId, setEditingPlatId] = useState<string | null>(null);

    // Fonction pour convertir un plat de l'API au format attendu par l'interface
    const convertApiDishToPlat = (dish: Dish): Plat => {
        const dishName = dish.dish_name?.fr || dish.dish_name?.['en-US'] || dish.dish_name?.en || `Plat ${dish.dish_id}`;
        const dishType = dish.dish_type?.fr || dish.dish_type?.['en-US'] || dish.dish_type?.en || 'Non spécifié';
        
        // Créer des mots-clés basés sur les catégories alimentaires (arômes)
        const motsCles: MotCle[] = [];
        
        // Arôme principal (food_cat_1)
        if (dish.food_cat_1) {
            motsCles.push({
                id: `mc-api-${dish.dish_id}-1`,
                label: `Arôme principal: ${dish.food_cat_1}`,
                color: 'bg-blue-100',
                textColor: 'text-blue-700'
            });
        }
        
        // Arômes secondaires (food_cat_2 et food_cat_3)
        if (dish.food_cat_2) {
            motsCles.push({
                id: `mc-api-${dish.dish_id}-2`,
                label: `Arôme secondaire: ${dish.food_cat_2}`,
                color: 'bg-green-100',
                textColor: 'text-green-700'
            });
        }
        
        if (dish.food_cat_3) {
            motsCles.push({
                id: `mc-api-${dish.dish_id}-3`,
                label: `Arôme secondaire: ${dish.food_cat_3}`,
                color: 'bg-purple-100',
                textColor: 'text-purple-700'
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

    // Convertir les données de l'API en format Plat
    const plats = useMemo(() => {
        return apiDishes.map(convertApiDishToPlat);
    }, [apiDishes]);

    // Filtrer les plats selon le point de vente actif
    const platsFiltres = plats.filter(plat => {
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
        console.log(`Modification du point de vente ${index + 1} pour le plat ${platId} - Fonctionnalité non disponible avec l'API`);
    }

    function startEditing(platId: string) {
        setEditingPlatId(platId);
        setExpanded(prev => ({ ...prev, [platId]: !prev[platId] }));
    }

    function cancelEditing() {
        setEditingPlatId(null);
    }

    function savePlat(plat: Plat) {
        // Pour les données de l'API, on ne peut pas modifier directement
        // Cette fonctionnalité pourrait être implémentée avec une API de mise à jour
        console.log(`Sauvegarde du plat ${plat.id} - Fonctionnalité non disponible avec l'API`);
        setEditingPlatId(null);
        setExpanded(prev => ({ ...prev, [plat.id]: false }));
    }

    function deletePlat(platId: string) {
        // Pour les données de l'API, on ne peut pas supprimer directement
        // Cette fonctionnalité pourrait être implémentée avec une API de suppression
        console.log(`Suppression du plat ${platId} - Fonctionnalité non disponible avec l'API`);
        setEditingPlatId(null);
        setExpanded(prev => ({ ...prev, [platId]: false }));
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
                                                                puce={true}
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
