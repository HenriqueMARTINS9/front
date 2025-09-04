"use client";
import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Plus } from 'lucide-react';
import Tag from './Tag';
import Button from './Button';
import FormulaireModificationPlat from './FormulaireModificationPlat';

type MotCle = {
    id: string;
    label: string;
    color: string;
    textColor: string;
};

export type Plat = {
    id: string;
    nom: string;
    description?: string;
    prix?: number;
    section: string;
    pointsDeVente: [boolean, boolean, boolean, boolean];
    motsCles: MotCle[];
};

function createInitialData(): Plat[] {
    return [
        {
            id: 'p1',
            nom: 'Salade verte',
            description: 'Salade fraîche du jardin',
            prix: 12.00,
            section: 'Nos entrées',
            pointsDeVente: [true, true, true, true],
            motsCles: [
                { id: 'mc1', label: 'Légume vert', color: 'bg-green-100', textColor: 'text-green-700' }
            ]
        },
        {
            id: 'p2',
            nom: 'Salade mêlée',
            description: 'Mélange de salades variées',
            prix: 14.00,
            section: 'Nos entrées',
            pointsDeVente: [true, true, true, false],
            motsCles: [
                { id: 'mc2', label: 'Légume vert', color: 'bg-green-100', textColor: 'text-green-700' }
            ]
        },
        {
            id: 'p3',
            nom: 'Gaspacho andalou',
            description: 'Perles de melon et lard grillé',
            prix: 16.00,
            section: 'Nos entrées',
            pointsDeVente: [true, false, true, true],
            motsCles: [
                { id: 'mc3', label: 'Solanacée', color: 'bg-green-100', textColor: 'text-green-700' },
                { id: 'mc4', label: 'Viande séchée', color: 'bg-red-100', textColor: 'text-red-700' }
            ]
        },
        {
            id: 'p4',
            nom: 'Carpaccio de tomate à l\'ancienne',
            description: 'Vinaigrette balsamique, sorbet basilic maison',
            prix: 18.00,
            section: 'Nos entrées',
            pointsDeVente: [true, true, false, true],
            motsCles: [
                { id: 'mc5', label: 'Solanacée', color: 'bg-green-100', textColor: 'text-green-700' },
                { id: 'mc6', label: 'Herbe fraîche aromatique', color: 'bg-purple-100', textColor: 'text-purple-700' }
            ]
        },
        {
            id: 'p5',
            nom: 'Feuilleté aux champignons',
            description: 'Mélange de champignons et sauce morilles',
            prix: 20.00,
            section: 'Nos entrées',
            pointsDeVente: [false, true, true, true],
            motsCles: [
                { id: 'mc7', label: 'Champignon', color: 'bg-green-100', textColor: 'text-green-700' },
                { id: 'mc8', label: 'Herbe sèche', color: 'bg-purple-100', textColor: 'text-purple-700' }
            ]
        },
        {
            id: 'p6',
            nom: 'Crevettes Royales sautées à l\'huile d\'olive & noix st-jacques',
            description: 'Sur lit de julienne de légumes et sauce exotique',
            prix: 28.00,
            section: 'Nos entrées',
            pointsDeVente: [true, true, true, true],
            motsCles: [
                { id: 'mc9', label: 'Crustacé', color: 'bg-red-100', textColor: 'text-red-700' },
                { id: 'mc10', label: 'Mollusque', color: 'bg-orange-100', textColor: 'text-orange-700' },
                { id: 'mc11', label: 'Épices exotiques', color: 'bg-purple-100', textColor: 'text-purple-700' }
            ]
        },
        {
            id: 'p7',
            nom: 'Filet de bœuf grillé',
            description: 'Sauce au poivre, pommes duchesse',
            prix: 32.00,
            section: 'Nos viandes',
            pointsDeVente: [true, true, true, true],
            motsCles: [
                { id: 'mc12', label: 'Viande rouge', color: 'bg-red-100', textColor: 'text-red-700' }
            ]
        },
        {
            id: 'p8',
            nom: 'Poulet fermier rôti',
            description: 'Sauce aux herbes, légumes de saison',
            prix: 26.00,
            section: 'Nos viandes',
            pointsDeVente: [true, true, false, true],
            motsCles: [
                { id: 'mc13', label: 'Volaille', color: 'bg-orange-100', textColor: 'text-orange-700' }
            ]
        }
    ];
}

type TableauMenuProps = {
    pointDeVenteId: string;
};

export default function TableauMenu({ pointDeVenteId }: TableauMenuProps) {
    const [plats, setPlats] = useState<Plat[]>(() => createInitialData());
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [editingPlatId, setEditingPlatId] = useState<string | null>(null);

    // Filtrer les plats selon le point de vente actif
    const platsFiltres = plats.filter(plat => {
        const pointDeVenteIndex = parseInt(pointDeVenteId) - 1;
        return plat.pointsDeVente[pointDeVenteIndex];
    });

    const columns = useMemo(() => [
        { key: 'nom', label: 'Nom du plat' },
        { key: 'section', label: 'Section' },
        { key: 'prix', label: 'Prix' },
        { key: 'pdv1', label: 'PdV #1' },
        { key: 'pdv2', label: 'PdV #2' },
        { key: 'pdv3', label: 'PdV #3' },
        { key: 'pdv4', label: 'PdV #4' },
        { key: 'actions', label: '' },
    ], []);

    function togglePointDeVente(platId: string, index: number) {
        setPlats(prev => prev.map(p => {
            if (p.id !== platId) return p;
            const next: Plat = {
                ...p,
                pointsDeVente: p.pointsDeVente.map((v, i) => i === index ? !v : v) as [boolean, boolean, boolean, boolean],
            };
            return next;
        }));
    }

    function startEditing(platId: string) {
        setEditingPlatId(platId);
        setExpanded(prev => ({ ...prev, [platId]: !prev[platId] }));
    }

    function cancelEditing() {
        setEditingPlatId(null);
    }

    function savePlat(plat: Plat) {
        setPlats(prev => prev.map(p => p.id === plat.id ? plat : p));
        setEditingPlatId(null);
        setExpanded(prev => ({ ...prev, [plat.id]: false }));
    }

    function deletePlat(platId: string) {
        setPlats(prev => prev.filter(p => p.id !== platId));
        setEditingPlatId(null);
        setExpanded(prev => ({ ...prev, [platId]: false }));
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-6 text-lg text-gray-900 flex items-center justify-between bg-[#D5D9EB] rounded-t-xl">
                <div className="flex items-center gap-2">
                    Plats
                    <Tag label={`${platsFiltres.length} plats`} color="bg-[#EEF4FF]" textColor="text-indigo-700" />
                </div>
            </div>
            <div className="">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <tbody className="align-center text-center text-gray-900">
                            {platsFiltres.map((plat) => {
                                const isOpen = !!expanded[plat.id];
                                return (
                                    <React.Fragment key={plat.id}>
                                        <tr className="border-t border-gray-200">
                                                                                         <td className="px-6 py-4">
                                                 <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                                                     <div className="font-medium text-sm text-left">{plat.nom}</div>
                                                     {plat.description && (
                                                         <div className="text-sm text-left text-gray-600">{plat.description}</div>
                                                     )}
                                                 </div>
                                             </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-4">

                                                    {/* Mots-clés */}
                                                    <div className="flex space-x-2">
                                                        {plat.motsCles.map((motCle) => (
                                                            <Tag
                                                                key={motCle.id}
                                                                label={motCle.label}
                                                                color={motCle.color}
                                                                textColor={motCle.textColor}
                                                                puce={true}
                                                            />
                                                        ))}
                                                    </div>

                                                    {/* Bouton d'action */}
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => startEditing(plat.id)}
                                                            className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                                                                 {isOpen && (
                                             <tr className="transition-all duration-300 ease-in-out animate-in slide-in-from-top-2">
                                                 <td colSpan={8} className="px-6 py-4 bg-white">
                                                    <FormulaireModificationPlat
                                                        plat={plat}
                                                        onSave={savePlat}
                                                        onCancel={cancelEditing}
                                                        onDelete={deletePlat}
                                                    />
                                                </td>
                                            </tr>
                                        )}
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
