"use client";
import React from 'react';
import Tag from './Tag';
import { getTagColors } from '@/lib/tagColors';

type MotCle = {
    id: string;
    label: string;
    color: string;
    textColor: string;
};

type MotsClesProps = {
    motsCles: MotCle[];
    wineType?: string; // Type de vin pour déterminer les couleurs
};

export default function MotsCles({ motsCles, wineType }: MotsClesProps) {
    // Si un type de vin est fourni, utiliser ses couleurs pour tous les mots-clés
    const wineTypeColors = wineType ? getTagColors(wineType) : null;
    
    return (
        <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Mots clefs descriptifs (automatique)</p>
            
            <div className="flex flex-wrap gap-2">
                {motsCles.map((motCle) => {
                    // Ajouter la puce pour les types de vins
                    const isTypeVin = ['Blanc', 'Rouge', 'Rosé', 'Mousseux', 'Fortifié', 'Moelleux ou liquoreux'].includes(motCle.label);
                    
                    // Utiliser les couleurs du type de vin si disponibles, sinon utiliser les couleurs du mot-clé
                    const colors = wineTypeColors ? {
                        color: wineTypeColors.bg,
                        textColor: wineTypeColors.text
                    } : {
                        color: motCle.color,
                        textColor: motCle.textColor
                    };
                    
                    return (
                        <Tag 
                            key={motCle.id} 
                            label={motCle.label} 
                            puce={isTypeVin}
                            color={colors.color}
                            textColor={colors.textColor}
                        />
                    );
                })}
            </div>
        </div>
    );
}
