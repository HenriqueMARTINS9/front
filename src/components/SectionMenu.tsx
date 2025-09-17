'use client';
import React, { useState } from 'react';
import { Pencil } from 'lucide-react';
import Tag from './Tag';
import FormulaireModificationPlat from './FormulaireModificationPlat';
import type { Plat } from './TableauMenu';

type SectionMenuProps = {
    titre: string;
    plats: Plat[];
    onSavePlat: (plat: Plat) => void;
    onDeletePlat: (platId: string) => void;
    isApiSection?: boolean;
    restaurantId?: number;
};

export default function SectionMenu({ titre, plats, onSavePlat, onDeletePlat, isApiSection = false, restaurantId = 0 }: SectionMenuProps) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [editingPlatId, setEditingPlatId] = useState<string | null>(null);

    function startEditing(platId: string) {
        setEditingPlatId(platId);
        setExpanded(prev => ({ ...prev, [platId]: !prev[platId] }));
    }

    function cancelEditing() {
        setEditingPlatId(null);
    }

    function savePlat(plat: Plat) {
        onSavePlat(plat);
        setEditingPlatId(null);
        setExpanded(prev => ({ ...prev, [plat.id]: false }));
    }

    function deletePlat(platId: string) {
        onDeletePlat(platId);
        setEditingPlatId(null);
        setExpanded(prev => ({ ...prev, [platId]: false }));
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200">
            <div className={`px-6 py-6 text-lg font-medium text-gray-900 flex items-center justify-between rounded-t-xl ${isApiSection ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200' : 'bg-[#D5D9EB]'}`}>
                <div className="flex items-center gap-2">
                    {titre}
                    {isApiSection && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            API
                        </span>
                    )}
                    <Tag label={`${plats.length} éléments`} color={isApiSection ? "bg-blue-100" : "bg-[#EEF4FF]"} textColor={isApiSection ? "text-blue-700" : "text-indigo-700"} />
                </div>
            </div>
            <div className="">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <tbody className="align-center text-center text-gray-900">
                            {plats.map((plat) => {
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
                                                        {plat.motsCles.map((motCle) => {        
                                                            return (
                                                                <Tag
                                                                    key={motCle.id}
                                                                    label={motCle.label}
                                                                    puce={true}
                                                                />
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Bouton d'action */}
                                                    <div className="flex items-center gap-2 ">
                                                        <button
                                                            onClick={() => startEditing(plat.id)}
                                                            className="text-gray-400 hover:text-gray-600 transition-colors duration-150 cursor-pointer"
                                                        >
                                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M14.1665 2.49999C14.3854 2.28112 14.6452 2.1075 14.9312 1.98905C15.2171 1.8706 15.5236 1.80963 15.8332 1.80963C16.1427 1.80963 16.4492 1.8706 16.7352 1.98905C17.0211 2.1075 17.281 2.28112 17.4998 2.49999C17.7187 2.71886 17.8923 2.97869 18.0108 3.26466C18.1292 3.55063 18.1902 3.85713 18.1902 4.16665C18.1902 4.47618 18.1292 4.78268 18.0108 5.06865C17.8923 5.35461 17.7187 5.61445 17.4998 5.83332L6.24984 17.0833L1.6665 18.3333L2.9165 13.75L14.1665 2.49999Z" stroke="#535862" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>

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
                                                        restaurantId={restaurantId}
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
