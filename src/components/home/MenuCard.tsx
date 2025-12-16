"use client";
import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import SubCard from '../menu/SubCard';
import { useAllRestaurantDishes, useDishesWithoutPrincipalAroma } from '@/lib/hooks';
import { useTranslation } from '@/lib/useTranslation';
import { getLastModifiedDate, formatLastModifiedDate } from '@/lib/auth';

export default function MenuCard() {
    const { data: dishesCount, isLoading } = useAllRestaurantDishes();
    const { count: dishesWithoutAromaCount, isLoading: isLoadingAromaCheck } = useDishesWithoutPrincipalAroma();
    const { t } = useTranslation();
    const lastModified = getLastModifiedDate();
    const formattedDate = formatLastModifiedDate(lastModified) || '8 août 2025';
    
    // Utiliser useState pour éviter l'erreur d'hydratation
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Pendant le SSR et le premier rendu, ne pas afficher le skeleton pour éviter l'erreur d'hydratation
    if (!mounted || isLoading) {
        return (
            <Card title={t('home.menus.title')} number={t('home.menus.subtitle', { count: 1, plural: '' })}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </Card>
        );
    }

    // Créer un tableau des restaurants disponibles basé sur les données
    const availableRestaurants = Object.entries(dishesCount || {}).map(([key, count]) => ({
        id: key,
        name: `${t('home.menus.restaurant')} ${key.replace('restaurant', '')}`,
        count: count || 0
    }));

    // Compter le nombre de restaurants (sales points)
    const salesPointsCount = availableRestaurants.length;

    return (
        <Card title={t('home.menus.title')} number={t('home.menus.subtitle', { count: salesPointsCount, plural: salesPointsCount > 1 ? 's' : '' })}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableRestaurants.map((restaurant) => (
                    <SubCard
                        key={restaurant.id}
                        title={restaurant.name}
                        count={restaurant.count}
                        date={formattedDate}
                        alert={!isLoadingAromaCheck && dishesWithoutAromaCount > 0 ? t('common.missingAromas') : undefined}
                    />
                ))}
            </div>
        </Card>
    );
}