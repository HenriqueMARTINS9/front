"use client";
import React from 'react';
import Tag from './Tag';

type MotCle = {
    id: string;
    label: string;
    color: string;
    textColor: string;
};

type MotsClesProps = {
    motsCles: MotCle[];
};

export default function MotsCles({ motsCles }: MotsClesProps) {
    return (
        <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Mots clefs descriptifs (automatique)</p>
            
            <div className="flex flex-wrap gap-2">
                {motsCles.map((motCle) => {
                    // Ajouter la puce pour les types de vins
                    const isTypeVin = ['Blanc', 'Rouge', 'Rosé', 'Mousseux', 'Fortifié', 'Moelleux ou liquoreux'].includes(motCle.label);
                    
                    return (
                        <Tag 
                            key={motCle.id} 
                            label={motCle.label} 
                            puce={isTypeVin}
                        />
                    );
                })}
            </div>
        </div>
    );
}
