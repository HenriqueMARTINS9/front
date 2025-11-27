import { AlertTriangle } from 'lucide-react';
import Card from './Card';
import Tag from './Tag';
import { getTagColors } from '@/lib/tagColors';
import { useWineStats } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/useTranslation';

export default function VinsCard() {
    const { data: stats, isLoading, isOffline } = useWineStats();
    const router = useRouter();
    const { t } = useTranslation();

    const handleUpdateClick = () => {
        router.push('/vins');
    };

    if (isLoading) {
        return (
            <Card title={t('home.wines.title')} number='45' subtitle={t('common.registeredReferences')}>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="grid grid-flow-col grid-cols-2 grid-rows-4 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-12 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card title={t('home.wines.title')} number={stats.total.toString()} subtitle={t('common.registeredReferences')}>
            {isOffline && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800 text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
{t('common.offlineMode')}
                    </div>
                </div>
            )}

            {/* Alerte 
            <div className="flex items-center justify-between bg-red-50 text-red-600 px-3 py-2 rounded text-xs font-medium">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {stats.incomplete} fiche{stats.incomplete > 1 ? 's' : ''} vin{stats.incomplete > 1 ? 's' : ''} à compléter
                </div>
                <button 
                    onClick={handleUpdateClick}
                    className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded hover:bg-red-200 transition-colors duration-200 cursor-pointer"
                >
                    Mettre à jour
                </button>
            </div>*/}

            {/* Tags organisés en deux colonnes */}
            <div className="grid grid-cols-2 gap-6">
                {/* Colonne 1: Types de vins */}
                <div className="space-y-3">
                    
                    <div className="flex flex-wrap gap-2">
                        <Tag 
                            color={getTagColors('mousseux').bg} 
                            textColor={getTagColors('mousseux').text} 
                            count={stats.mousseux} 
                            label={`${t('home.wines.sparkling')}`} 
                        />
                        <Tag 
                            color={getTagColors('blanc').bg} 
                            textColor={getTagColors('blanc').text} 
                            count={stats.blanc} 
                            label={`${t('home.wines.white')}`} 
                        />
                        <Tag 
                            color={getTagColors('rouge').bg} 
                            textColor={getTagColors('rouge').text} 
                            count={stats.rouge} 
                            label={`${t('home.wines.red')}`} 
                        />
                        <Tag 
                            color={getTagColors('rosé').bg} 
                            textColor={getTagColors('rosé').text} 
                            count={stats.rose} 
                            label={`${t('home.wines.rose')}`} 
                        />
                        <Tag 
                            color={getTagColors('sweet').bg} 
                            textColor={getTagColors('sweet').text} 
                            count={stats.sweet} 
                            label={`${t('home.wines.sweet')}`} 
                        />
                        <Tag 
                            color={getTagColors('oldWhite').bg} 
                            textColor={getTagColors('oldWhite').text} 
                            count={stats.oldWhite} 
                            label={`${t('home.wines.oldWhite')}`} 
                        />
                        <Tag 
                            color={getTagColors('fortifié').bg} 
                            textColor={getTagColors('fortifié').text} 
                            count={stats.fortifie} 
                            label={t('common.fortified')} 
                        />
                    </div>
                </div>

                {/* Colonne 2: Contenants */}
                <div className="space-y-3">
                    
                    <div className="flex flex-wrap gap-2">
                        <Tag 
                            color="bg-[#F4F3FF]" 
                            textColor="text-[#5925DC]" 
                            count={stats.bouteille} 
                            label={`${t('home.wines.bottle')}`} 
                        />
                        <Tag 
                            color="bg-[#F4F3FF]" 
                            textColor="text-[#5925DC]" 
                            count={stats.verre} 
                            label={`${t('home.wines.glass')}`} 
                        />
                        <Tag 
                            color="bg-[#F4F3FF]" 
                            textColor="text-[#5925DC]" 
                            count={stats.magnum} 
                            label={t('common.magnum')} 
                        />
                        <Tag 
                            color="bg-[#F4F3FF]" 
                            textColor="text-[#5925DC]" 
                            count={stats.demiBouteille} 
                            label={t('common.halfBottle')} 
                        />
                        <Tag 
                            color="bg-[#F4F3FF]" 
                            textColor="text-[#5925DC]" 
                            count={stats.desiree} 
                            label={t('common.desired')} 
                        />
                    </div>
                </div>
            </div>

            <div className="text-gray-400 text-xs mt-4">{t('common.lastModifiedDate')}</div>
        </Card>
    );
}