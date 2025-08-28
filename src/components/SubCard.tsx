import { AlertTriangle } from 'lucide-react';


export default function SubCard({
    title,
    count,
    date,
    alert,
}: {
    title: string;
    count: number;
    date: string;
    alert?: string;
}) {
    return (
        <div className="flex flex-col gap-3 border border-gray-200 rounded-lg p-6 text-sm bg-white min-h-[132px]">
            <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-black">{title}</span>
                <span className="text-sm text-regular text-black">{count} plats</span>
            </div>
            <div className="text-gray-400 text-xs">Dernière modification le {date}</div>
            {alert && (
                <div className="text-xs text-red-600 bg-red-100 inline-flex items-center gap-1 px-2 py-1 rounded">
                    <AlertTriangle className="w-4 h-4" /> {alert}
                </div>
            )}
        </div>
    );
}