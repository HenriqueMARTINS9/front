import { getTagColors } from '@/lib/tagColors';

export default function Tag({ count, label, color, textColor, borderColor, puce = false }: { count?: number; label: string; color?: string; textColor?: string, borderColor?: string, puce?: boolean }) {
    const colors = getTagColors(label);
    const finalColor = color || colors.bg;
    const finalTextColor = textColor || colors.text;
    
    return (
        <div className={`flex items-center gap-1 ${finalColor} ${finalTextColor} px-2 py-1 rounded-full text-xs font-medium`}>
            {count !== undefined && count !== null && <span className={`px-2 py-0.5 bg-white rounded-xl border border-[${borderColor}]`}>{count}</span>}
            {puce && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.puce }}></span>}
            <span>{label}</span>
        </div>
    );
}