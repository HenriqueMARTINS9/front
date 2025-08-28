export default function Tag({ count, label, color, textColor, borderColor }: { count: number; label: string; color: string; textColor: string, borderColor: string }) {
    return (
        <div className={`flex items-center gap-1 ${color} ${textColor} px-2 py-1 rounded-full text-xs font-medium`}>
            <span className={`px-2 py-0.5 bg-white rounded-xl border border-[${borderColor}]`}>{count}</span>
            <span>{label}</span>
        </div>
    );
}