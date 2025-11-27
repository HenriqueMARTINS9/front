"use client";
import React from 'react';
import { getTagColors } from '@/lib/tagColors';

type Format = {
    id: string;
    nom: string;
    capacite?: string;
    prix: number;
};

type FormatsDisponiblesProps = {
    formats: Format[];
    wineType?: string;
};

export default function FormatsDisponibles({ formats, wineType }: FormatsDisponiblesProps) {
    // Le texte reste toujours gris, pas de changement de couleur selon le type de vin
    const textColor = 'text-gray-900';
    
    // Filtrer les formats avec un prix > 0
    const formatsWithPrice = formats.filter(format => {
        const prix = typeof format.prix === 'number' ? format.prix : parseFloat(String(format.prix) || '0');
        return prix > 0;
    });
    
    // Ne pas afficher le composant s'il n'y a aucun format avec un prix > 0
    if (formatsWithPrice.length === 0) {
        return null;
    }
    
    return (
        <div className="space-y-3"> 
            <table>
                <thead>
                    <tr>
                        <th className="py-1 font-medium text-left text-sm text-gray-700">Formats disponibles</th>
                        <th className="py-1 font-medium text-left text-sm text-gray-700">Prix</th>
                    </tr>
                </thead>
                <tbody>
                    {formatsWithPrice.map((format, index) => (
                        <tr
                            key={format.id || `${format.nom}-${index}`}
                            className="text-sm"
                        >
                            <td className={`py-1 pr-12 ${textColor}`}>
                                {format.nom}
                            </td>
                            <td className={`py-1 ${textColor}`}>
                                {typeof format.prix === 'number' && !isNaN(format.prix) 
                                    ? format.prix.toFixed(2) 
                                    : '0.00'} CHF
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
