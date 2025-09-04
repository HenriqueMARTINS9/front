"use client";
import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Plus } from 'lucide-react';
import Tag from './Tag';
import Button from './Button';
import FormulaireModification from './FormulaireModification';
import CepageAssemblage from './CepageAssemblage';
import FormatsDisponibles from './FormatsDisponibles';
import MotsCles from './MotsCles';

type Cepage = {
    id: string;
    nom: string;
    pourcentage: number;
};

type Format = {
    id: string;
    nom: string;
    capacite: string;
    prix: number;
};

type MotCle = {
    id: string;
    label: string;
    color: string;
    textColor: string;
};

export type Wine = {
    id: string;
    name: string;
    subname?: string;
    millesime: number;
    type: 'Mousseux' | 'Rosé' | 'Blanc' | 'Fortifié' | 'Rouge' | 'Moelleux ou liquoreux';
    pointsDeVente: [boolean, boolean, boolean, boolean];
    aocRegion?: string;
    pays?: string;
    cepages: Cepage[];
    formats: Format[];
    motsCles: MotCle[];
};

function createInitialData(): Wine[] {
    return [
        {
            id: 'w1',
            name: 'Domaine de la Harpe',
            subname: 'Domaine de la Harpe',
            millesime: 2021,
            type: 'Blanc',
            pointsDeVente: [true, true, true, true],
            aocRegion: 'La Côte',
            pays: 'Suisse',
            cepages: [
                { id: 'c1', nom: 'Chasselas', pourcentage: 100 }
            ],
            formats: [
                { id: 'f1', nom: 'Bouteille', capacite: '75 cl', prix: 36.00 },
                { id: 'f2', nom: 'Demi-bouteille', capacite: '37.5 cl', prix: 24.50 }
            ],
            motsCles: [
                { id: 'mc1', label: 'Frais & léger', color: 'bg-[#FFFAEB]', textColor: 'text-[#B54708]' },
                { id: 'mc2', label: 'Fruit blanc discret', color: 'bg-[#FFFAEB]', textColor: 'text-[#B54708]' },
                { id: 'mc3', label: 'Finale douce', color: 'bg-[#FFFAEB]', textColor: 'text-[#B54708]' }
            ]
        },
        {
            id: 'w2',
            name: 'Château de Vinzel - Grand Cru',
            millesime: 2023,
            type: 'Blanc',
            pointsDeVente: [true, false, true, true],
            aocRegion: 'La Côte',
            pays: 'Suisse',
            cepages: [
                { id: 'c2', nom: 'Chasselas', pourcentage: 100 }
            ],
            formats: [
                { id: 'f3', nom: 'Magnum', capacite: '150 cl', prix: 42.00 },
                { id: 'f4', nom: 'Bouteille', capacite: '75 cl', prix: 42.00 },
                { id: 'f5', nom: 'Désirée', capacite: '50 cl', prix: 42.00 },
                { id: 'f6', nom: 'Demi-bouteille', capacite: '37.5 cl', prix: 42.00 },
                { id: 'f7', nom: 'Verre', capacite: '10 cl', prix: 42.00 }
            ],
            motsCles: [
                { id: 'mc4', label: 'Label 1', color: 'bg-[#FFFAEB]', textColor: 'text-[#B54708]' },
                { id: 'mc5', label: 'Label 2', color: 'bg-[#FFFAEB]', textColor: 'text-[#B54708]' },
                { id: 'mc6', label: 'Label 3', color: 'bg-[#FFFAEB]', textColor: 'text-[#B54708]' },
                { id: 'mc7', label: 'Label 4', color: 'bg-[#FFFAEB]', textColor: 'text-[#B54708]' }
            ]
        },
        {
            id: 'w3',
            name: 'Sauvignon - Domaine de Chantegrive',
            millesime: 2022,
            type: 'Blanc',
            pointsDeVente: [true, false, false, true],
            aocRegion: 'Bordeaux',
            pays: 'France',
            cepages: [
                { id: 'c3', nom: 'Sauvignon Blanc', pourcentage: 100 }
            ],
            formats: [
                { id: 'f8', nom: 'Bouteille', capacite: '75 cl', prix: 28.00 }
            ],
            motsCles: [
                { id: 'mc8', label: 'Fruité', color: 'bg-[#FFFAEB]', textColor: 'text-[#B54708]' },
                { id: 'mc9', label: 'Minéral', color: 'bg-[#FFFAEB]', textColor: 'text-[#B54708]' }
            ]
        },
    ];
}

export default function TableauVin() {
    const [wines, setWines] = useState<Wine[]>(() => createInitialData());
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [editingWineId, setEditingWineId] = useState<string | null>(null);

    const columns = useMemo(() => [
        { key: 'name', label: 'Nom du vin' },
        { key: 'millesime', label: 'Millésime' },
        { key: 'type', label: 'Type' },
        { key: 'pdv1', label: 'PdV #1' },
        { key: 'pdv2', label: 'PdV #2' },
        { key: 'pdv3', label: 'PdV #3' },
        { key: 'pdv4', label: 'PdV #4' },
        { key: 'actions', label: '' },
    ], []);

    function togglePointDeVente(wineId: string, index: number) {
        setWines(prev => prev.map(w => {
            if (w.id !== wineId) return w;
            const next: Wine = {
                ...w,
                pointsDeVente: w.pointsDeVente.map((v, i) => i === index ? !v : v) as [boolean, boolean, boolean, boolean],
            };
            return next;
        }));
    }

    function toggleExpanded(wineId: string) {
        setExpanded(prev => ({ ...prev, [wineId]: !prev[wineId] }));
    }

    function startEditing(wineId: string) {
        setEditingWineId(wineId);
        setExpanded(prev => ({ ...prev, [wineId]: false }));
    }

    function cancelEditing() {
        setEditingWineId(null);
    }

    function saveWine(wine: Wine) {
        setEditingWineId(null);
    }

    function deleteWine(wineId: string) {
        setWines(prev => prev.filter(w => w.id !== wineId));
        setEditingWineId(null);
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-6 text-lg text-gray-900 flex items-center justify-between bg-[#D5D9EB] rounded-t-xl">
                <div className="flex items-center gap-2">
                    Vins
                    <Tag label="17 vins" color="bg-[#EEF4FF]" textColor="text-indigo-700" />
                </div>
            </div>
            <div className="">
                <div className="overflow-x-auto">
                    <table className="min-w-full ">
                        <thead>
                            <tr className="text-left text-gray-600 text-xs font-medium bg-gray-50">
                                {columns.map((c) => (
                                    <th key={c.key} className={`px-6 py-3 text-center ${c.key === 'name' ? 'w-2/5 text-left' : 'w-auto'} pr-6`}>{c.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="align-center text-center text-gray-900">
                            {wines.map((wine) => {
                                const isOpen = !!expanded[wine.id];
                                return (
                                    <React.Fragment key={wine.id}>
                                        <tr className={`border-t border-gray-200 transition-opacity transition-transform duration-500 ease-in-out ${editingWineId === wine.id ? 'opacity-0 scale-95 absolute' : 'opacity-100 scale-100 relative'}`}>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-sm text-left">{wine.name}</div>
                                                {wine.subname && (
                                                    <div className="text-sm text-left text-gray-600">{wine.subname}</div>
                                                )}
                                            </td>
                                            <td className="px-10 py-3 text-sm text-gray-900">
                                                <Tag 
                                                    label={wine.type} 
                                                    puce={true}
                                                />
                                            </td>
                                            <td className="px-10 py-3 text-sm text-gray-900">{wine.millesime}</td>
                                            {wine.pointsDeVente.map((checked, idx) => (
                                                <td key={idx} className="px-10 py-3">
                                                    <label className="inline-flex items-center select-none w-4 h-4">
                                                        <input
                                                            type="checkbox"
                                                            className="appearance-none absolute forced-colors:appearance-auto cursor-pointer h-4 w-4 rounded-4xl border border-gray-500 text-gray-600 focus:ring-gray-500 checked:bg-gray-500"
                                                            checked={checked}
                                                            onChange={() => togglePointDeVente(wine.id, idx)}
                                                        />
                                                        {checked && <svg className="forced-colors:hidden absolute mx-0.75" width="10" height="7" viewBox="0 0 10 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M8.33341 1.5L3.75008 6.08333L1.66675 4" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                                                        </svg>}
                                                    </label>
                                                </td>
                                            ))}
                                            <td className="px-6 py-3">
                                                <div className={`flex items-center gap-6 justify-end transition-all duration-500 ease-in-out ${editingWineId === wine.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                                                    <button
                                                        aria-label={isOpen ? 'Replier' : 'Déplier'}
                                                        onClick={() => toggleExpanded(wine.id)}
                                                        className="transition-all duration-300 rounded p-1"
                                                    >
                                                        <svg className={`transform transition duration-300 ${isOpen ? 'rotate-180 opacity-0' : 'opacity-100'}`} width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M11 6.5L6 1.5L1 6.5" stroke="#535862" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                                                        </svg>
                                                        <svg className={`transform transition duration-300 ${isOpen ? 'rotate-180 opacity-100' : 'opacity-0'}`} width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M11 6.5L6 1.5L1 6.5" stroke="#535862" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        aria-label="Modifier"
                                                        onClick={() => startEditing(wine.id)}
                                                        className="transition-all duration-300 rounded p-1"
                                                    >
                                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M14.1665 2.49999C14.3854 2.28112 14.6452 2.1075 14.9312 1.98905C15.2171 1.8706 15.5236 1.80963 15.8332 1.80963C16.1427 1.80963 16.4492 1.8706 16.7352 1.98905C17.0211 2.1075 17.281 2.28112 17.4998 2.49999C17.7187 2.71886 17.8923 2.97869 18.0108 3.26466C18.1292 3.55063 18.1902 3.85713 18.1902 4.16665C18.1902 4.47618 18.1292 4.78268 18.0108 5.06865C17.8923 5.35461 17.7187 5.61445 17.4998 5.83332L6.24984 17.0833L1.6665 18.3333L2.9165 13.75L14.1665 2.49999Z" stroke="#535862" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {/* Ligne pour les détails */}
                                        <tr className="bg-white text-left">
                                            <td colSpan={8} className="py-0">
                                                <div
                                                    className={`transition-[max-height,opacity,padding] duration-500 ease-in-out overflow-hidden w-full ${isOpen ? 'max-h-[1000px] opacity-100 py-6 px-6' : 'max-h-0 opacity-0 py-0 px-6'}`}
                                                    style={{ borderTop: isOpen ? '1px solid #e5e7eb' : 'none' }}
                                                >
                                                    <div className="space-y-6">
                                                        {/* AOC / Région et Pays */}
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700">{wine.aocRegion || 'Non spécifié'}</p>
                                                            <p className="text-sm text-gray-700">{wine.pays || 'Non spécifié'}</p>
                                                        </div>

                                                        {/* Cépage ou assemblage */}
                                                        <CepageAssemblage cepages={wine.cepages} />

                                                        {/* Formats disponibles et Prix */}
                                                        <FormatsDisponibles formats={wine.formats} />

                                                        {/* Mots clefs descriptifs */}
                                                        <MotsCles motsCles={wine.motsCles} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        
                                        {/* Ligne pour le formulaire de modification */}
                                        <tr className="bg-white text-left">
                                            <td colSpan={8} className="py-0">
                                                <div
                                                    className={`transition-[max-height,opacity,padding] duration-500 ease-in-out overflow-hidden w-full ${editingWineId === wine.id ? 'max-h-[2000px] opacity-100 py-6 px-6' : 'max-h-0 opacity-0 py-0 px-6'}`}
                                                    style={{ borderTop: editingWineId === wine.id ? '1px solid #e5e7eb' : 'none' }}
                                                >
                                                    <div className="transform transition-all duration-500 ease-in-out">
                                                        <FormulaireModification
                                                            wine={wine}
                                                            onSave={saveWine}
                                                            onCancel={cancelEditing}
                                                            onDelete={deleteWine}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}


