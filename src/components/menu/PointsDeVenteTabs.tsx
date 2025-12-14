'use client';
import React, { useState } from 'react';
import { Plus } from 'lucide-react';

type PointDeVente = {
    id: string;
    nom: string;
    actif: boolean;
};

type PointsDeVenteTabsProps = {
    pointsDeVente: PointDeVente[];
    onTabChange: (id: string) => void;
    activeTabId: string;
};

export default function PointsDeVenteTabs({
    pointsDeVente,
    onTabChange,
    activeTabId
}: PointsDeVenteTabsProps) {
    return (
        <div className="border-b border-[#AFB5D9]">
            <div className="flex items-start">
                <div className="flex-1 flex space-x-8">
                    {pointsDeVente.map((point, index) => (
                        <button
                            key={point.id}
                            onClick={() => onTabChange(point.id)}
                            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${index === 0 ? 'text-left' : 'text-center'} ${activeTabId === point.id
                                ? 'border-[#293056] text-[#293056]'
                                : 'border-transparent text-[#3E4784] hover:text-[#3E4784] hover:border-[#AFB5D9]'
                                }`}
                        >
                            {point.nom}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
