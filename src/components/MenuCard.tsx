import Card from './Card';
import SubCard from './SubCard';
import { useAllRestaurantDishes } from '@/lib/hooks';

export default function MenuCard() {
    const { data: dishesCount, isLoading } = useAllRestaurantDishes();

    if (isLoading) {
        return (
            <Card title='Menus' number='4 Points de vente'>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-20 bg-gray-200 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card title='Menus' number='4 Points de vente'>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SubCard
                        key={i}
                        title={`Restaurant ${i + 1}`}
                        count={dishesCount?.[`restaurant${i + 1}` as keyof typeof dishesCount] || 0}
                        date="8 août 2025"
                        alert={i === 1 ? "Les arômes d'un plat sont manquants" : undefined}
                    />
                ))}
            </div>
        </Card>
    );
}