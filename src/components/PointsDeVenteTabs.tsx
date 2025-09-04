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
    onAddPointDeVente: () => void;
    activeTabId: string;
};

export default function PointsDeVenteTabs({
    pointsDeVente,
    onTabChange,
    onAddPointDeVente,
    activeTabId
}: PointsDeVenteTabsProps) {
    const maxPointsDeVente = 6;
    const canAddMore = pointsDeVente.length < maxPointsDeVente;

    return (
        <div className="border-b border-[#AFB5D9]">
            <div className="flex items-start">
                <div className="flex-1 flex space-x-8 justify-between">
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
                    <button
                        onClick={onAddPointDeVente}
                        disabled={!canAddMore}
                        className={`ml-4 p-2 rounded-full transition-colors duration-200 ${
                            canAddMore 
                                ? 'bg-gray-100 hover:bg-gray-200' 
                                : 'bg-gray-50 cursor-not-allowed'
                        }`}
                        title={canAddMore ? "Ajouter un point de vente" : "Maximum 5 points de vente autorisés"}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.99984 6.66667V13.3333M6.6665 10H13.3332M18.3332 10C18.3332 14.6024 14.6022 18.3333 9.99984 18.3333C5.39746 18.3333 1.6665 14.6024 1.6665 10C1.6665 5.39763 5.39746 1.66667 9.99984 1.66667C14.6022 1.66667 18.3332 5.39763 18.3332 10Z" stroke={canAddMore ? "#3E4784" : "#9CA3AF"} strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
