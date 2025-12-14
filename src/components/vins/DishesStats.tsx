'use client';
import React from 'react';
import { useRestaurantDishes } from '@/lib/hooks';
import Card from '../common/Card';
import { useTranslation } from '@/lib/useTranslation';

type DishesStatsProps = {
    restaurantId: number;
};

export default function DishesStats({ restaurantId }: DishesStatsProps) {
    const { t } = useTranslation();
    const { data: dishes, isLoading, error } = useRestaurantDishes(restaurantId);

    if (isLoading) {
        return (
            <Card title="Statistiques des Plats" number={t('common.loading')}>
                <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4E5BA6]"></div>
                    <span className="ml-2 text-gray-600">{t('common.loading')}</span>
                </div>
            </Card>
        );
    }

    if (error || !dishes) {
        return (
            <Card title="Statistiques des Plats" number={t('common.error')}>
                <div className="text-center py-4 text-red-500">
                    Impossible de charger les statistiques
                </div>
            </Card>
        );
    }

    // Calculer les statistiques
    const totalDishes = dishes.length;
    const dishTypes = dishes.reduce((acc, dish) => {
        const type = dish.dish_type?.fr || dish.dish_type?.en || 'Non spécifié';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const foodCategories = dishes.reduce((acc, dish) => {
        if (dish.food_cat_1) acc[dish.food_cat_1] = (acc[dish.food_cat_1] || 0) + 1;
        if (dish.food_cat_2) acc[dish.food_cat_2] = (acc[dish.food_cat_2] || 0) + 1;
        if (dish.food_cat_3) acc[dish.food_cat_3] = (acc[dish.food_cat_3] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    return (
        <Card title='Statistiques des Plats' number={`${totalDishes} ${t('common.elements')}`}>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">{t('test.dishes.differentTypes')}</h4>
                        <div className="space-y-1">
                            {Object.entries(dishTypes).map(([type, count]) => (
                                <div key={type} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{type}</span>
                                    <span className="font-medium">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">{t('test.dishes.differentCategories')}</h4>
                        <div className="space-y-1">
                            {Object.entries(foodCategories).slice(0, 5).map(([category, count]) => (
                                <div key={category} className="flex justify-between text-sm">
                                    <span className="text-gray-600">Cat. {category}</span>
                                    <span className="font-medium">{count}</span>
                                </div>
                            ))}
                            {Object.keys(foodCategories).length > 5 && (
                                <div className="text-xs text-gray-500">
                                    +{Object.keys(foodCategories).length - 5} autres...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                        Restaurant ID: {restaurantId} | Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
                    </div>
                </div>
            </div>
        </Card>
    );
}
