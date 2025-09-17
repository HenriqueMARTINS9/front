'use client';
import React from 'react';
import { useRestaurantDishes } from '@/lib/hooks';
import { Dish } from '@/lib/api';
import Card from './Card';

type RestaurantDishesProps = {
    restaurantId: number;
    title?: string;
};

export default function RestaurantDishes({ restaurantId, title }: RestaurantDishesProps) {
    const { data: dishes, isLoading, error } = useRestaurantDishes(restaurantId);

    if (isLoading) {
        return (
            <Card title={title || `Plats du Restaurant ${restaurantId}`} number="Chargement...">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E5BA6]"></div>
                    <span className="ml-3 text-gray-600">Chargement des plats...</span>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card title={title || `Plats du Restaurant ${restaurantId}`} number="Erreur">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Erreur de chargement</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>Impossible de charger les plats du restaurant {restaurantId}.</p>
                                <p className="mt-1 text-xs">Vérifiez votre connexion et réessayez.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    if (!dishes || dishes.length === 0) {
        return (
            <Card title={title || `Plats du Restaurant ${restaurantId}`} number="0 plats">
                <div className="text-center py-8 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun plat trouvé</h3>
                    <p className="mt-1 text-sm text-gray-500">Ce restaurant n'a pas encore de plats disponibles.</p>
                </div>
            </Card>
        );
    }

    return (
        <Card title={title || `Plats du Restaurant ${restaurantId}`} number={`${dishes.length} plats`}>
            <div className="space-y-4">
                <div className="grid gap-4">
                    {dishes.map((dish, index) => (
                        <div key={dish.dish_id || index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {dish.dish_name?.fr || dish.dish_name?.en || `Plat ${dish.dish_id}`}
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                                ID: {dish.dish_id}
                                            </span>
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                                Type: {dish.dish_type?.fr || dish.dish_type?.en || 'Non spécifié'}
                                            </span>
                                        </div>
                                        
                                        <div className="mt-3">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Composition alimentaire:</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                                {dish.food_cat_1 && (
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        <span className="font-medium">Catégorie 1:</span> {dish.food_cat_1} ({dish.food_cat_1_percent}%)
                                                    </div>
                                                )}
                                                {dish.food_cat_2 && (
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        <span className="font-medium">Catégorie 2:</span> {dish.food_cat_2} ({dish.food_cat_2_percent}%)
                                                    </div>
                                                )}
                                                {dish.food_cat_3 && (
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        <span className="font-medium">Catégorie 3:</span> {dish.food_cat_3} ({dish.food_cat_3_percent}%)
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}
