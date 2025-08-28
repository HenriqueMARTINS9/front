import Card from './Card';


export default function MembersCard() {
    return (
        <Card title='Membres et équipes'>
            <div className="flex justify-between text-gray-900">
                <div className="text-left">
                    <div className="text-3xl font-bold text-gray-900">3</div>
                    <div className="text-gray-900 text-lg">Membres enregistrés</div>
                </div>
                <div className="text-left">
                    <div className="text-3xl font-bold text-gray-900">4</div>
                    <div className="text-gray-900 text-lg">Équipes créées</div>
                </div>
            </div>
            <div className="text-gray-400 text-xs mt-4">Dernière modification le 8 août 2025</div>
        </Card>
    );
}