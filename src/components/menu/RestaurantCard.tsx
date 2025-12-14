import { AlertCircle } from 'lucide-react';


export default function RestaurantCard({ name, plats, date, alert }: { name: string; plats: number; date: string; alert?: string }) {
    return (
        <div className="bg-white rounded-lg p-4 shadow text-sm">
            <div className="font-semibold text-gray-800 mb-1">{name}</div>
            <div className="text-gray-600 mb-1">{plats} plats</div>
            <div className="text-gray-400 text-xs mb-2">Dernière modification le {date}</div>
            {alert && (
                <div className="text-xs text-red-600 bg-red-100 inline-flex items-center gap-1 px-2 py-1 rounded">
                    <AlertCircle className="w-4 h-4" /> {alert}
                </div>
            )}
        </div>
    );
}