'use client';
import React from 'react';
import { useRestaurantDishes } from '@/lib/hooks';
import { Dish } from '@/lib/api';
import SectionMenu from './SectionMenu';
import type { Plat } from './TableauMenu';
import { useTranslation } from '@/lib/useTranslation';

// Type MotCle aligné avec TableauMenu (doit correspondre exactement)
type MotCle = {
    id: string;
    label: string;
    color: string;
    textColor: string;
    puce: boolean;
    puceColor: string;
};

type ApiMenuIntegrationProps = {
    restaurantId: number;
};

export default function ApiMenuIntegration({ restaurantId }: ApiMenuIntegrationProps) {
    const { t } = useTranslation();
    const { data: dishes, isLoading, error } = useRestaurantDishes(restaurantId);

    // Fonction pour convertir un plat de l'API au format attendu par l'interface
    const convertApiDishToPlat = (dish: Dish): Plat => {
        const dishName = dish.dish_name?.fr || dish.dish_name?.['en-US'] || dish.dish_name?.en || `Plat ${dish.dish_id}`;
        const dishType = dish.dish_type?.fr || dish.dish_type?.['en-US'] || dish.dish_type?.en || 'Non spécifié';
        
        // Déterminer la section basée sur le type de plat
        let section = 'Nos entrées';
        const typeLower = dishType.toLowerCase();
        
        if (typeLower.includes('main') || typeLower.includes('principal') || typeLower.includes('course')) {
            // Déterminer si c'est un plat de viande, poisson ou autre
            if (dish.food_cat_1 === 1 || dish.food_cat_2 === 1) {
                section = 'Nos viandes';
            } else if (dish.food_cat_1 === 2 || dish.food_cat_2 === 2) {
                section = 'Nos poissons';
            } else {
                section = 'Suggestions du chef';
            }
        } else if (typeLower.includes('dessert')) {
            section = 'Nos desserts maison';
        } else if (typeLower.includes('starter') || typeLower.includes('entrée')) {
            section = 'Nos entrées';
        } else {
            // Par défaut, mettre dans les suggestions
            section = 'Suggestions du chef';
        }

        // Créer des mots-clés basés sur les catégories alimentaires
        const motsCles = [] as MotCle[];
        if (dish.food_cat_1) {
            motsCles.push({
                id: `mc-api-${dish.dish_id}-1`,
                label: `Catégorie ${dish.food_cat_1}`,
                color: 'bg-blue-100',
                textColor: 'text-blue-700',
                puce: true,
                puceColor: '#3B82F6'
            });
        }
        if (dish.food_cat_2) {
            motsCles.push({
                id: `mc-api-${dish.dish_id}-2`,
                label: `Catégorie ${dish.food_cat_2}`,
                color: 'bg-green-100',
                textColor: 'text-green-700',
                puce: true,
                puceColor: '#10B981'
            });
        }
        if (dish.food_cat_3) {
            motsCles.push({
                id: `mc-api-${dish.dish_id}-3`,
                label: `Catégorie ${dish.food_cat_3}`,
                color: 'bg-purple-100',
                textColor: 'text-purple-700',
                puce: true,
                puceColor: '#8B5CF6'
            });
        }

        // Ajouter le type de plat comme mot-clé principal
        const typeMotCle: MotCle = {
            id: `mc-api-${dish.dish_id}-type`,
            label: dishType,
            color: 'bg-orange-100',
            textColor: 'text-orange-700',
            puce: true,
            puceColor: '#F97316'
        };
        motsCles.unshift(typeMotCle);

        return {
            id: `api-${dish.dish_id}`,
            nom: dishName, // Pour compatibilité avec l'affichage
            nomFr: dish.dish_name?.fr || undefined,
            nomEn: dish.dish_name?.['en-US'] || dish.dish_name?.en || undefined,
            description: '', // Pas de description dans l'API pour l'instant
            descriptionFr: undefined,
            descriptionEn: undefined,
            prix: 0, // Pas de prix dans l'API pour l'instant
            section: section,
            pointsDeVente: [true], // Un seul point de vente
            motsCles: motsCles satisfies MotCle[]
        } satisfies Plat;
    };

    // Grouper les plats par section
    const groupDishesBySection = (dishes: Dish[]) => {
        const sections: { [key: string]: Plat[] } = {
            'Nos entrées': [],
            'Nos viandes': [],
            'Nos poissons': [],
            'Nos pâtes fraîches': [],
            'Suggestions du chef': [],
            'Nos desserts maison': []
        };

        dishes.forEach(dish => {
            const plat = convertApiDishToPlat(dish);
            const section = plat.section;
            
            if (sections[section]) {
                sections[section].push(plat);
            } else {
                // Si la section n'existe pas, l'ajouter aux suggestions
                sections['Suggestions du chef'].push(plat);
            }
        });

        return sections;
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E5BA6]"></div>
                        <span className="ml-3 text-gray-600">{t('test.dishes.loading')}</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-sm">
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
                                <p className="mt-1 text-xs">Vérifiez votre connexion et réessayez.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!dishes || dishes.length === 0) {
        return (
            <div className="space-y-8">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="text-center py-8 text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun plat trouvé</h3>
                        <p className="mt-1 text-sm text-gray-500">Ce restaurant n&apos;a pas encore de plats disponibles.</p>
                    </div>
                </div>
            </div>
        );
    }

    const sectionsData = groupDishesBySection(dishes);

    return (
        <div className="space-y-8">
            {/* En-tête avec informations sur les plats de l'API */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="text-sm font-medium text-blue-800">🍽️ Plats VirtualSomm (API)</h3>
                            <p className="text-xs text-blue-600 mt-1">
                                Restaurant ID: {restaurantId} • {dishes.length} plats • Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            API Live
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {dishes.length} plats
                        </span>
                    </div>
                </div>
            </div>

            {/* Afficher les sections avec des plats */}
            {Object.entries(sectionsData).map(([sectionTitle, plats]) => {
                if (plats.length === 0) return null;
                
                return (
                    <SectionMenu
                        key={sectionTitle}
                        titre={sectionTitle}
                        plats={plats}
                        onSavePlat={() => {}} // Pas de modification pour les plats de l'API
                        onDeletePlat={() => {}} // Pas de suppression pour les plats de l'API
                        isApiSection={true} // Indicateur pour les plats de l'API
                    />
                );
            })}
        </div>
    );
}
