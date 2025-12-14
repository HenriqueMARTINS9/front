'use client';
import React, { useState, useMemo } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import Tag from '../common/Tag';
import FormulaireModificationPlat from './FormulaireModificationPlat';
import type { Plat } from './TableauMenu';
import { useTranslation } from '@/lib/useTranslation';
import { useTranslation as useI18n } from 'react-i18next';
import { getRestaurantId } from '@/lib/auth';

type SectionMenuProps = {
    titre: string;
    plats: Plat[];
    onSavePlat: (plat: Plat) => void;
    onDeletePlat: (platId: string) => void;
    isApiSection?: boolean;
    restaurantId?: number;
    onRenameSection?: () => void;
    onDeleteSection?: () => void;
    isEditingTitle?: boolean;
    titleDraft?: string;
    onChangeTitleDraft?: (value: string) => void;
    onSubmitTitleEdit?: () => void;
    onCancelTitleEdit?: () => void;
    onStartTitleEdit?: () => void;
    titlePlaceholder?: string;
};

export default function SectionMenu({
    titre,
    plats,
    onSavePlat,
    onDeletePlat,
    isApiSection = false,
    restaurantId,
    onRenameSection,
    onDeleteSection,
    isEditingTitle = false,
    titleDraft = '',
    onChangeTitleDraft,
    onSubmitTitleEdit,
    onCancelTitleEdit,
    onStartTitleEdit,
    titlePlaceholder,
}: SectionMenuProps) {
    const { t } = useTranslation();
    const { i18n } = useI18n();
    // Récupérer le restaurant ID depuis localStorage si non fourni
    const actualRestaurantId = restaurantId ?? getRestaurantId() ?? 1;
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [editingPlatId, setEditingPlatId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

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

    const showSectionActions = (!!onRenameSection || (!!onDeleteSection && plats.length === 0)) && !isEditingTitle;
    const showDeleteOnly = !!onDeleteSection && plats.length === 0 && isEditingTitle;

    // Déterminer le titre à afficher selon la langue
    const displayTitle = useMemo(() => {
        if (isEditingTitle) {
            return titre; // Garder le titre original pendant l'édition
        }
        
        // Si la langue est en anglais, chercher la valeur EN dans les plats de la section
        if (i18n.language === 'en' && plats.length > 0) {
            // Prendre la sectionEn du premier plat qui a une valeur EN
            const platWithEn = plats.find(p => p.sectionEn);
            if (platWithEn?.sectionEn) {
                return platWithEn.sectionEn;
            }
        }
        
        // Sinon, utiliser le titre par défaut (qui est en FR)
        return titre;
    }, [titre, plats, i18n.language, isEditingTitle]);

    return (
        <div className="bg-white rounded-xl border border-gray-200">
            <div className={`px-6 py-6 text-lg font-medium text-gray-900 flex items-center justify-between rounded-t-xl ${isApiSection ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200' : 'bg-[#D5D9EB]'}`}>
                <div className="flex items-center gap-3 flex-wrap">
                    {isEditingTitle ? (
                        <div className="flex items-center gap-2">
                            <input
                                value={titleDraft}
                                onChange={(event) => onChangeTitleDraft?.(event.target.value)}
                                placeholder={titlePlaceholder}
                                className="w-56 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={onSubmitTitleEdit}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-indigo-200 bg-white text-indigo-600 transition-colors duration-150 hover:bg-indigo-50"
                                aria-label={t('common.save')}
                            >
                                <Check className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={onCancelTitleEdit}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition-colors duration-150 hover:bg-gray-50"
                                aria-label={t('common.cancel')}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : onStartTitleEdit ? (
                        <button
                            type="button"
                            onClick={onStartTitleEdit}
                            className="flex items-center gap-2 text-left"
                        >
                            <span className={`text-lg font-semibold ${displayTitle ? 'text-gray-900' : 'text-gray-500 italic'}`}>
                                {displayTitle || titlePlaceholder}
                            </span>
                        </button>
                    ) : (
                        <span className={`text-lg font-semibold ${displayTitle ? 'text-gray-900' : 'text-gray-500 italic'}`}>
                            {displayTitle || titlePlaceholder}
                        </span>
                    )}
                    {isApiSection && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            API
                        </span>
                    )}
                    <Tag label={`${plats.length} éléments`} color={isApiSection ? "bg-blue-100" : "bg-[#EEF4FF]"} textColor={isApiSection ? "text-blue-700" : "text-indigo-700"} />
                </div>
                {showSectionActions && (
                    <div className="flex items-center gap-2">
                        {onRenameSection && (
                            <button
                                onClick={onRenameSection}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 transition-colors duration-150 hover:bg-gray-50"
                                aria-label={t('menu.renameSection')}
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                        )}
                        {onDeleteSection && plats.length === 0 && (
                            <button
                                onClick={onDeleteSection}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 bg-white text-red-600 transition-colors duration-150 hover:bg-red-50"
                                aria-label={t('menu.deleteSection')}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                )}
                {showDeleteOnly && (
                    <button
                        onClick={onDeleteSection}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 bg-white text-red-600 transition-colors duration-150 hover:bg-red-50"
                        aria-label={t('menu.deleteSection')}
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>
            <div className="">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <tbody className="align-center text-center text-gray-900">
                            {(() => {
                                const totalPages = Math.ceil(plats.length / itemsPerPage);
                                const startIndex = (currentPage - 1) * itemsPerPage;
                                const endIndex = startIndex + itemsPerPage;
                                const paginatedPlats = plats.slice(startIndex, endIndex);
                                
                                // Réinitialiser la page si elle dépasse le nombre total de pages
                                if (currentPage > totalPages && totalPages > 0) {
                                    setCurrentPage(1);
                                }
                                
                                return paginatedPlats.map((plat) => {
                                const isOpen = !!expanded[plat.id];
                                return (
                                    <React.Fragment key={plat.id}>
                                        <tr className="border-t border-gray-200">
                                            <td className="px-6 py-4">
                                                <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                                                    <div className="font-medium text-sm text-left">
                                                        {i18n.language === 'en' 
                                                            ? (plat.nomEn || plat.nom)
                                                            : (plat.nomFr || plat.nom)}
                                                    </div>
                                                    {(() => {
                                                        const description = i18n.language === 'en' 
                                                            ? (plat.descriptionEn || plat.description)
                                                            : (plat.descriptionFr || plat.description);
                                                        return description ? (
                                                            <div className="text-sm text-left text-gray-600">
                                                                {description}
                                                            </div>
                                                        ) : null;
                                                    })()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-4">
                                                    {/* Mots-clés */}
                                                    <div className="flex space-x-2">
                                                        {plat.motsCles.map((motCle) => {
                                                            // Convertir les anciens labels français en clés d'arômes
                                                            const oldLabelMap: Record<string, string> = {
                                                                'Légume vert': 'greenVegetable',
                                                                'Viande rouge': 'redMeat',
                                                                'Viande blanche': 'whiteMeat',
                                                                'Volaille': 'whiteMeat',
                                                                'Poisson': 'finFish',
                                                                'Crustacé': 'shellfish',
                                                                'Mollusque': 'mollusk',
                                                                'Solanacée': 'nightshade',
                                                                'Champignon': 'funghi',
                                                                'Fromage dur': 'nuttyHardCheese',
                                                                'Fromage bleu': 'pungentBlueCheese',
                                                                'Fromage doux': 'delicateButteryCheese',
                                                                'Herbe fraîche': 'aromaticGreenHerb',
                                                                'Herbe sèche': 'dryHerb',
                                                                'Épices exotiques': 'exoticSpice',
                                                                'Viande séchée': 'curedMeat',
                                                                'Faisselle': 'sourCheeseCream',
                                                                'Fromage salé': 'saltyCrumblyCheese'
                                                            };
                                                            
                                                            // Utiliser la clé d'arôme (soit directement, soit convertie depuis l'ancien label)
                                                            const aromaKey = oldLabelMap[motCle.label] || motCle.label;
                                                            
                                                            // Traduire le label si c'est une clé d'arôme
                                                            const translationKey = `menu.aromas.${aromaKey}`;
                                                            const translatedLabel = t(translationKey);
                                                            // Si la traduction existe (ne retourne pas la clé), l'utiliser, sinon utiliser le label original
                                                            const displayLabel = translatedLabel !== translationKey ? translatedLabel : motCle.label;
                                                            
                                                            return (
                                                                <Tag
                                                                    key={motCle.id}
                                                                    label={displayLabel}
                                                                    color={motCle.color}
                                                                    textColor={motCle.textColor}
                                                                    puce={true}
                                                                    puceColor={motCle.puceColor}
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
                            })
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
