"use client";
import React from 'react';
import { getTagColors } from '@/lib/tagColors';
import { getCepageNameById } from '@/lib/cepages';
import { useTranslation } from '@/lib/useTranslation';

type Cepage = {
    id: string;
    nom: string;
    pourcentage: number;
};

type CepageAssemblageProps = {
    cepages: Cepage[];
    wineType?: string;
};

export default function CepageAssemblage({ cepages, wineType }: CepageAssemblageProps) {
    const { t } = useTranslation();
    const wineTypeColors = wineType ? getTagColors(wineType) : null;
    
    // Mapping direct des couleurs de bordure par type de vin
    const borderColorMap: Record<string, string> = {
        'Blanc': 'border-[#B54708]',
        'White': 'border-[#B54708]',
        'Mousseux': 'border-[#B54708]',
        'Sparkling': 'border-[#B54708]',
        'Rouge': 'border-[#B42318]',
        'Red': 'border-[#B42318]',
        'Rosé': 'border-[#C11574]',
        'Fortifié': 'border-[#C11574]',
        'Sweet': 'border-[#C4320A]',
        'Doux': 'border-[#C4320A]',
        'Old White': 'border-[#15803D]',
        'Moelleux ou liquoreux': 'border-[#C4320A]',
        'Orange': 'border-[#C4320A]'
    };
    
    // Couleurs par défaut si pas de type de vin
    const defaultColors = {
        bg: 'bg-[#FFFAEB]',
        border: 'border-[#B54708]',
        text: 'text-[#B54708]'
    };
    
    // Couleurs basées sur le type de vin
    const colors = wineTypeColors ? {
        bg: wineTypeColors.bg,
        border: wineType ? borderColorMap[wineType] || 'border-[#000000]' : 'border-[#000000]',
        text: wineTypeColors.text
    } : defaultColors;
    
    return (
        <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">{t('common.grapeVarietyOrBlend')}</p>
            
            <div className="flex flex-wrap gap-2">
                {cepages.map((cepage) => {
                    // Convertir l'ID en nom si c'est un ID numérique
                    const cepageId = typeof cepage.nom === 'string' && !isNaN(Number(cepage.nom))
                        ? parseInt(cepage.nom, 10)
                        : -1;
                    const cepageName = cepageId !== -1 
                        ? getCepageNameById(cepageId) 
                        : (cepage.nom || '');
                    
                    return (
                        <div key={cepage.id} className="flex items-center">
                            <div className={`${colors.bg} border ${colors.border} rounded-l-lg px-4 py-2.5`}>
                                <span className={`text-sm font-semibold ${colors.text}`}>{cepageName}</span>
                            </div>
                            <div className={`${colors.bg} border border-l-0 ${colors.border} rounded-r-lg px-4 py-2.5`}>
                                <span className={`text-sm font-semibold ${colors.text}`}>{cepage.pourcentage} %</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
