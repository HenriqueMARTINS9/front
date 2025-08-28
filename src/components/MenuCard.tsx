import Card from './Card';
import SubCard from './SubCard';


export default function MenuCard() {
    return (
        <Card title='Menus' number='4 Points de vente'>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SubCard
                        key={i}
                        title={`Restaurant ${i + 1}`}
                        count={15}
                        date="8 août 2025"
                        alert={i === 1 ? 'Les arômes d’un plat sont manquants' : undefined}
                    />
                ))}
            </div>
        </Card>
    );
}