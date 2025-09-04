"use client";
import React from 'react';

type Cepage = {
    id: string;
    nom: string;
    pourcentage: number;
};

type CepageAssemblageProps = {
    cepages: Cepage[];
};

export default function CepageAssemblage({ cepages }: CepageAssemblageProps) {
    return (
        <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Cépage ou assemblage</p>
            
            <div className="flex flex-wrap gap-2">
                {cepages.map((cepage) => (
                    <div key={cepage.id} className="flex items-center">
                        <div className="bg-[#FFFAEB] border border-orange-500 rounded-l-lg  px-4 py-2.5">
                            <span className="text-sm font-semibold text-[#B54708]">{cepage.nom}</span>
                        </div>
                        <div className="bg-[#FFFAEB] border border-l-0 border-orange-500 rounded-r-lg px-4 py-2.5">
                            <span className="text-sm font-semibold text-[#B54708]">{cepage.pourcentage} %</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
