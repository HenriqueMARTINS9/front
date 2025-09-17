import Card from './Card';
import SubCard from './SubCard';
import { useAllRestaurantDishes } from '@/lib/hooks';
import { useTranslation } from '@/lib/useTranslation';

export default function MenuCard() {
    const { data: dishesCount, isLoading } = useAllRestaurantDishes();
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <Card title={t('home.menus.title')} number={t('home.menus.subtitle')}>
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

    return (
        <Card title={t('home.menus.title')} number={t('home.menus.subtitle')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableRestaurants.map((restaurant) => (
                    <SubCard
                        key={restaurant.id}
                        title={restaurant.name}
                        count={restaurant.count}
                        date="8 août 2025"
                        alert={restaurant.count === 0 ? t('common.missingAromas') : undefined}
                    />
                ))}
            </div>
        </Card>
    );
}