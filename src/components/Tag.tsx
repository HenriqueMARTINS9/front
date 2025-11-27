import { getTagColors } from '@/lib/tagColors';

export default function Tag({ count, label, color, textColor, borderColor, puce = false, puceColor }: { count?: number; label: string; color?: string; textColor?: string, borderColor?: string, puce?: boolean, puceColor?: string }) {
    const colors = getTagColors(label);
    const finalColor = color || colors.bg;
    const finalTextColor = textColor || colors.text;
    
    // Déterminer la couleur de la puce
    let finalPuceColor: string;
    if (puceColor) {
        // Si puceColor est fourni (pour les arômes), utiliser le mapping Tailwind -> CSS
        finalPuceColor = puceColor === 'bg-red-600' ? '#DC2626' :
                        puceColor === 'bg-red-500' ? '#EF4444' :
                        puceColor === 'bg-green-600' ? '#16A34A' :
                        puceColor === 'bg-green-500' ? '#22C55E' :
                        puceColor === 'bg-blue-600' ? '#2563EB' :
                        puceColor === 'bg-blue-500' ? '#3B82F6' :
                        puceColor === 'bg-yellow-600' ? '#CA8A04' :
                        puceColor === 'bg-yellow-500' ? '#EAB308' :
                        '#6B7280'; // gris par défaut
    } else {
        // Si pas de puceColor fourni (pour les vins), utiliser getTagColors
        finalPuceColor = colors.puce;
    }
    
    
    // Ne pas afficher le tag si le compteur est à 0
    if (count !== undefined && count !== null && count === 0) {
        return null;
    }
    

    return (
        <div className={`inline-flex items-center gap-1 ${finalColor} ${finalTextColor} ${count !== undefined && count !== null ? 'px-2 py-1' : 'px-2 py-0.5'} rounded-full text-xs font-medium`}>
            {count !== undefined && count !== null && <span className={`px-2 py-0.5 bg-white rounded-xl border border-[${borderColor}]`}>{count}</span>}
            {puce && (
                <span 
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{
                        backgroundColor: finalPuceColor
                    }}
                ></span>
            )}
            <span className="whitespace-nowrap">{label}</span>
        </div>
    );
}