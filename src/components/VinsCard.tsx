import { AlertTriangle } from 'lucide-react';
import Card from './Card';
import Tag from './Tag';

export default function VinsCard() {
    return (
        <Card title='Vins' number='45' subtitle='Références enregistrées'>

            {/* Alerte */}
            <div className="flex items-center justify-between bg-red-50 text-red-600 px-3 py-2 rounded text-xs font-medium">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    2 fiches vins à compléter
                </div>
                <button className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded">
                    Mettre à jour
                </button>
            </div>


            {/* Tags */}
            <div className="grid grid-flow-col grid-cols-2 grid-rows-4 gap-4">
                <Tag color="bg-yellow-100" textColor="text-yellow-700" borderColor="text-yellow-400" count={4} label="Vins mousseux" />
                <Tag color="bg-yellow-100" textColor="text-yellow-700" borderColor="text-yellow-400" count={12} label="Vins blancs" />
                <Tag color="bg-red-100" textColor="text-red-700" borderColor="text-yellow-400" count={17} label="Vins rouges" />
                <Tag color="bg-pink-100" textColor="text-pink-700" borderColor="text-yellow-400" count={5} label="Vins rosés" />
                <Tag color="bg-violet-100" textColor="text-violet-700" borderColor="text-yellow-400" count={38} label="Bouteille (75 cl)" />
                <Tag color="bg-violet-100" textColor="text-violet-700" borderColor="text-yellow-400" count={9} label="Vins au verre (10 cl)" />
            </div>


            <div className="text-gray-400 text-xs mt-4">Dernière modification le 8 août 2025</div>
        </Card>
    );
}