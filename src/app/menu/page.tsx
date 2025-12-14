'use client';
import { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/layout/SideBar';
import Header from '@/components/layout/Header';
import Button from '@/components/common/Button';
import SectionMenu from '@/components/menu/SectionMenu';
import PointsDeVenteTabs from '@/components/menu/PointsDeVenteTabs';
import ModalNouveauPlat from '@/components/menu/ModalNouveauPlat';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type { Plat } from '@/components/menu/TableauMenu';
import { useTranslation } from '@/lib/useTranslation';
import { useRestaurantDishes, useDeleteDish } from '@/lib/hooks';
import { convertDishToPlat } from '@/lib/api';

const CUSTOM_SECTIONS_STORAGE_KEY = 'virtualsomm_custom_sections';

type CustomSection = {
    id: string;
    titre: string;
    plats: Plat[];
};

export default function MenuPage() {
    const { t } = useTranslation();
    
    // État pour le modal d'ajout de plat
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // État pour les points de vente (seulement restaurant 1)
    const [pointsDeVente, setPointsDeVente] = useState([
        { id: '1', nom: 'Restaurant #1', actif: true },
    ]);
    const [activeTabId, setActiveTabId] = useState('1');
    const [customSections, setCustomSections] = useState<CustomSection[]>([]);
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    const [sectionNameDraft, setSectionNameDraft] = useState('');
    const [sectionPendingDeletion, setSectionPendingDeletion] = useState<CustomSection | null>(null);
    // Mémoriser les sections supprimées pour éviter qu'elles réapparaissent lors du refetch
    const [deletedSectionNames, setDeletedSectionNames] = useState<Set<string>>(new Set());
    
    // Récupérer les plats de l'API (le restaurant ID sera récupéré automatiquement depuis le localStorage)
    const { data: apiDishes, isLoading: isLoadingApi } = useRestaurantDishes();
    const deleteDishMutation = useDeleteDish();
    
    // Convertir et grouper les plats de l'API par section
    // Exclure les sections qui sont déjà dans customSections pour éviter les doublons
    const apiSections = useMemo(() => {
        if (!apiDishes || apiDishes.length === 0) return [];
        
        const customSectionNames = new Set(customSections.map(s => s.titre.toLowerCase()));
        const sectionsMap: { [key: string]: CustomSection } = {};
        
        apiDishes.forEach((dish) => {
            const plat = convertDishToPlat(dish, 1);
            const sectionName = plat.section || t('menu.sections.staticDishes');
            
            // Ne pas ajouter si la section existe déjà dans customSections
            if (customSectionNames.has(sectionName.toLowerCase())) {
                return;
            }
            
            if (!sectionsMap[sectionName]) {
                sectionsMap[sectionName] = {
                    id: `api-section-${sectionName}`,
                    titre: sectionName,
                    plats: []
                };
            }
            
            sectionsMap[sectionName].plats.push(plat);
        });
        
        // Filtrer les sections vides (sans plats) et les sections supprimées
        return Object.values(sectionsMap).filter(section => 
            section.plats.length > 0 && !deletedSectionNames.has(section.titre.toLowerCase())
        );
    }, [apiDishes, customSections, deletedSectionNames, t]);
    
    // Fusionner les sections API et personnalisées pour éviter les doublons
    // Les sections personnalisées ont la priorité
    const allSections = useMemo(() => {
        const merged: CustomSection[] = [...customSections];
        const customNames = new Set(customSections.map(s => s.titre.toLowerCase()));
        
        // Ajouter seulement les sections API qui n'existent pas déjà dans customSections
        apiSections.forEach(apiSection => {
            if (!customNames.has(apiSection.titre.toLowerCase())) {
                merged.push(apiSection);
            }
        });
        
        return merged;
    }, [customSections, apiSections]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        try {
            const storedSections = window.localStorage.getItem(CUSTOM_SECTIONS_STORAGE_KEY);
            if (!storedSections) {
                return;
            }
            const parsedSections = JSON.parse(storedSections);
            if (!Array.isArray(parsedSections)) {
                return;
            }
            setCustomSections(
                parsedSections
                    .filter((section: any) => section && typeof section === 'object')
                    .map((section: any) => ({
                        id: typeof section.id === 'string' ? section.id : `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        titre: typeof section.titre === 'string' ? section.titre : '',
                        plats: Array.isArray(section.plats)
                            ? section.plats
                                .filter((plat: any) => plat && typeof plat === 'object')
                                .map((plat: any) => ({
                                    id: typeof plat.id === 'string' ? plat.id : `plat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                    nom: typeof plat.nom === 'string' ? plat.nom : '',
                                    nomFr: typeof plat.nomFr === 'string' ? plat.nomFr : undefined,
                                    nomEn: typeof plat.nomEn === 'string' ? plat.nomEn : undefined,
                                    description: typeof plat.description === 'string' ? plat.description : undefined,
                                    descriptionFr: typeof plat.descriptionFr === 'string' ? plat.descriptionFr : undefined,
                                    descriptionEn: typeof plat.descriptionEn === 'string' ? plat.descriptionEn : undefined,
                                    prix: typeof plat.prix === 'number' ? plat.prix : undefined,
                                    section: typeof plat.section === 'string' ? plat.section : '',
                                    sectionFr: typeof plat.sectionFr === 'string' ? plat.sectionFr : undefined,
                                    sectionEn: typeof plat.sectionEn === 'string' ? plat.sectionEn : undefined,
                                    pointsDeVente: Array.isArray(plat.pointsDeVente) ? plat.pointsDeVente : [],
                                    motsCles: Array.isArray(plat.motsCles) ? plat.motsCles : [],
                                }))
                            : [],
                    }))
            );
        } catch (error) {
            console.error('Erreur lors du chargement des sections personnalisées depuis le stockage local :', error);
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        try {
            if (customSections.length === 0) {
                window.localStorage.removeItem(CUSTOM_SECTIONS_STORAGE_KEY);
                return;
            }
            window.localStorage.setItem(CUSTOM_SECTIONS_STORAGE_KEY, JSON.stringify(customSections));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des sections personnalisées dans le stockage local :', error);
        }
    }, [customSections]);

    const handleTabChange = (id: string) => {
        setActiveTabId(id);
        setPointsDeVente(prev => 
            prev.map(point => ({
                ...point,
                actif: point.id === id
            }))
        );
    };


    // Fonction pour ajouter un nouveau plat
    const handleAddPlat = (platData: Omit<Plat, 'id'>) => {
        // S'assurer que description et motsCles sont bien inclus, ainsi que toutes les propriétés FR/EN
        const newPlat: Plat = {
            nom: platData.nom || '',
            nomFr: platData.nomFr,
            nomEn: platData.nomEn,
            description: platData.description || '',
            descriptionFr: platData.descriptionFr,
            descriptionEn: platData.descriptionEn,
            prix: platData.prix || 0,
            section: platData.section || '',
            sectionFr: platData.sectionFr,
            sectionEn: platData.sectionEn,
            pointsDeVente: platData.pointsDeVente || [true],
            motsCles: platData.motsCles || [],
            id: `plat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };

        const sectionName = platData.section?.trim() || t('menu.sections.staticDishes');

        setCustomSections(prev => {
            const existingIndex = prev.findIndex(section => section.titre.toLowerCase() === sectionName.toLowerCase());
            if (existingIndex !== -1) {
                const updatedSections = [...prev];
                updatedSections[existingIndex] = {
                    ...updatedSections[existingIndex],
                    plats: [...updatedSections[existingIndex].plats, newPlat],
                };
                return updatedSections;
            }

            return [
                ...prev,
                {
                    id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    titre: sectionName,
                    plats: [newPlat],
                },
            ];
        });
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSaveCustomPlat = (sectionId: string, updatedPlat: Plat) => {
        setCustomSections(prev =>
            prev.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        plats: section.plats.map(plat => plat.id === updatedPlat.id ? updatedPlat : plat),
                    }
                    : section
            )
        );
    };

    const handleDeleteCustomPlat = async (sectionId: string, platId: string) => {
        // Vérifier si c'est un plat de l'API (commence par "api-")
        if (platId.startsWith('api-')) {
            try {
                // Supprimer via l'API
                await deleteDishMutation.mutateAsync(platId);
                // La liste sera automatiquement rafraîchie via React Query
            } catch (error) {
                console.error('Erreur lors de la suppression du plat:', error);
            }
        } else {
            // Pour les plats personnalisés, supprimer de la section
        setCustomSections(prev =>
            prev.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        plats: section.plats.filter(plat => plat.id !== platId),
                    }
                    : section
            )
        );
        }
    };

    const handleStartRenameSection = (sectionId: string) => {
        const section = customSections.find(item => item.id === sectionId);
        if (!section) return;
        setEditingSectionId(sectionId);
        setSectionNameDraft(section.titre);
    };

    const handleChangeSectionNameDraft = (value: string) => {
        setSectionNameDraft(value);
    };

    const handleCancelSectionNameEdit = (sectionId: string) => {
        const section = customSections.find(item => item.id === sectionId);
        if (section && !section.titre.trim() && section.plats.length === 0) {
            setCustomSections(prev => prev.filter(item => item.id !== sectionId));
        }
        setEditingSectionId(null);
        setSectionNameDraft('');
    };

    const handleSubmitSectionName = (sectionId: string) => {
        const trimmed = sectionNameDraft.trim();
        if (!trimmed) {
            window.alert(t('menu.sectionNameRequired'));
            return;
        }

        const exists = customSections.some(
            item => item.id !== sectionId && item.titre.toLowerCase() === trimmed.toLowerCase()
        );
        if (exists) {
            window.alert(t('menu.sectionAlreadyExists'));
            return;
        }

        setCustomSections(prev =>
            prev.map(item =>
                item.id === sectionId
                    ? {
                        ...item,
                        titre: trimmed,
                        plats: item.plats.map(plat => ({
                            ...plat,
                            section: trimmed,
                        })),
                    }
                    : item
            )
        );
        setEditingSectionId(null);
        setSectionNameDraft('');
    };

    const handleRequestRemoveSection = (sectionId: string) => {
        const section = customSections.find(item => item.id === sectionId);
        if (!section) return;
        setSectionPendingDeletion(section);
    };

    const handleCancelRemoveSection = () => {
        setSectionPendingDeletion(null);
    };

    const handleConfirmRemoveSection = () => {
        if (!sectionPendingDeletion) return;
        
        // Supprimer la section des sections personnalisées
        setCustomSections(prev => prev.filter(item => item.id !== sectionPendingDeletion.id));
        
        // Mémoriser le nom de la section supprimée pour éviter qu'elle réapparaisse lors du refetch
        setDeletedSectionNames(prev => {
            const newSet = new Set(prev);
            newSet.add(sectionPendingDeletion.titre.toLowerCase());
            return newSet;
        });
        
        if (editingSectionId === sectionPendingDeletion.id) {
            setEditingSectionId(null);
            setSectionNameDraft('');
        }
        setSectionPendingDeletion(null);
    };

    const customSectionNames = useMemo(
        () => customSections.map(section => section.titre),
        [customSections]
    );

    return (
        <div className="flex h-screen bg-[#F8F9FC]">
            <Sidebar />

            <main className="flex-1 overflow-y-scroll scrollbar-hide">
                <Header title={t('menu.title')} />

                <div className="px-10 py-10 space-y-8">
                    {/* Tabs des points de vente */}
                    <PointsDeVenteTabs
                        pointsDeVente={pointsDeVente}
                        onTabChange={handleTabChange}
                        activeTabId={activeTabId}
                    />
                    
                    <div className="flex gap-4">
                        <Button
                            onClick={handleOpenModal}
                            className="bg-[#4E5BA6] border-[#4E5BA6] text-white hover:bg-[#3D4A8A] hover:border-[#3D4A8A] transition-colors duration-200"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.0001 6.66667V13.3333M6.66675 10H13.3334M18.3334 10C18.3334 14.6024 14.6025 18.3333 10.0001 18.3333C5.39771 18.3333 1.66675 14.6024 1.66675 10C1.66675 5.39763 5.39771 1.66667 10.0001 1.66667C14.6025 1.66667 18.3334 5.39763 18.3334 10Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {t('menu.addDish')}
                        </Button>

                                                {/*<Button
                             onClick={() => TODO: Importer un menu }}
                             className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-xs"
                         >
                             Importer un menu
                             <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M13.3335 12.3333L10.0002 9M10.0002 9L6.66688 12.3333M10.0002 9V16.5M16.9919 14.325C17.8047 13.8819 18.4467 13.1807 18.8168 12.3322C19.1868 11.4836 19.2637 10.536 19.0354 9.63891C18.807 8.74179 18.2865 7.94626 17.5558 7.37787C16.8251 6.80948 15.9259 6.50061 15.0002 6.5H13.9502C13.698 5.52436 13.2278 4.61861 12.5752 3.85082C11.9225 3.08304 11.1042 2.47321 10.182 2.06717C9.25967 1.66113 8.25734 1.46946 7.25031 1.50657C6.24328 1.54367 5.25777 1.80858 4.36786 2.28138C3.47795 2.75419 2.7068 3.42258 2.1124 4.23631C1.51799 5.05005 1.11579 5.98794 0.936028 6.97949C0.756269 7.97104 0.803632 8.99044 1.07456 9.96105C1.34548 10.9317 1.83291 11.8282 2.50021 12.5833" stroke="#535862" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                             </svg>
                         </Button>

                        <Button
                            onClick={() => { TODO: Exporter un menu  }}
                            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-xs"
                        >
                             Exporter un menu
                             <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M6.66649 13.1667L9.99982 16.5M9.99982 16.5L13.3332 13.1667M9.99982 16.5V9.00001M17.3998 14.075C18.1243 13.5655 18.6676 12.8385 18.9509 11.9993C19.2342 11.1601 19.2427 10.2525 18.9752 9.40819C18.7076 8.56387 18.178 7.82675 17.4632 7.30381C16.7484 6.78087 15.8855 6.49931 14.9998 6.50001H13.9498C13.6992 5.52323 13.2302 4.61605 12.5783 3.84674C11.9263 3.07743 11.1083 2.46606 10.1858 2.05863C9.26338 1.65121 8.26053 1.45836 7.25276 1.4946C6.245 1.53084 5.25858 1.79523 4.36778 2.26786C3.47698 2.74049 2.70501 3.40905 2.10998 4.2232C1.51495 5.03735 1.11237 5.97588 0.93254 6.96813C0.752714 7.96038 0.800331 8.9805 1.07181 9.95169C1.34328 10.9229 1.83154 11.8198 2.49982 12.575" stroke="#535862" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                             </svg>
                         </Button>*/}
                    </div>

                    {/* Toutes les sections (API + personnalisées, fusionnées) */}
                    {!isLoadingApi && allSections.length > 0 && (
                        <div className="space-y-6">
                            {allSections.map((section) => {
                                const isCustomSection = customSections.some(s => s.id === section.id);
                                return (
                                <SectionMenu
                                    key={section.id}
                                    titre={section.titre}
                                    plats={section.plats}
                                        onSavePlat={(plat) => {
                                            if (isCustomSection) {
                                                handleSaveCustomPlat(section.id, plat);
                                            } else {
                                                // Pour les sections API, on pourrait créer une section personnalisée
                                                // ou mettre à jour via l'API
                                            }
                                        }}
                                        onDeletePlat={(platId) => {
                                            handleDeleteCustomPlat(section.id, platId);
                                        }}
                                    onRenameSection={() => handleStartRenameSection(section.id)}
                                    onDeleteSection={() => handleRequestRemoveSection(section.id)}
                                    onStartTitleEdit={() => handleStartRenameSection(section.id)}
                                    isEditingTitle={editingSectionId === section.id}
                                    titleDraft={editingSectionId === section.id ? sectionNameDraft : ''}
                                    onChangeTitleDraft={(value) => {
                                        if (editingSectionId === section.id) {
                                            handleChangeSectionNameDraft(value);
                                        }
                                    }}
                                    onSubmitTitleEdit={() => handleSubmitSectionName(section.id)}
                                    onCancelTitleEdit={() => handleCancelSectionNameEdit(section.id)}
                                    titlePlaceholder={t('menu.newSectionPlaceholder')}
                                />
                                );
                            })}
                        </div>
                    )}

                    {/* Séparateur visuel 
                    <div className="border-t border-gray-200 my-8">
                        <div className="text-center">
                            <span className="bg-[#F8F9FC] px-4 py-2 text-sm text-gray-500 rounded-full border border-gray-200">
                                📋 {t('menu.sections.staticDishes')}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-8">*/}
                        {/* Nos entrées 
                        <SectionMenu
                            titre={t('menu.sections.entrees')}
                            plats={entrees}
                            onSavePlat={(plat) => handleSavePlat(plat, setEntrees)}
                            onDeletePlat={(platId) => handleDeletePlat(platId, setEntrees)}
                            restaurantId={0}
                        />*/}

                        {/* Nos viandes
                        <SectionMenu
                            titre={t('menu.sections.meats')}
                            plats={viandes}
                            onSavePlat={(plat) => handleSavePlat(plat, setViandes)}
                            onDeletePlat={(platId) => handleDeletePlat(platId, setViandes)}
                            restaurantId={0}
                        /> */}

                        {/* Nos poissons 
                        <SectionMenu
                            titre={t('menu.sections.fish')}
                            plats={poissons}
                            onSavePlat={(plat) => handleSavePlat(plat, setPoissons)}
                            onDeletePlat={(platId) => handleDeletePlat(platId, setPoissons)}
                            restaurantId={0}
                        />*/}

                        {/* Nos pâtes fraîches 
                        <SectionMenu
                            titre={t('menu.sections.pasta')}
                            plats={pates}
                            onSavePlat={(plat) => handleSavePlat(plat, setPates)}
                            onDeletePlat={(platId) => handleDeletePlat(platId, setPates)}
                            restaurantId={0}
                        />*/}

                        {/* Suggestions du chef 
                        <SectionMenu
                            titre={t('menu.sections.suggestions')}
                            plats={suggestions}
                            onSavePlat={(plat) => handleSavePlat(plat, setSuggestions)}
                            onDeletePlat={(platId) => handleDeletePlat(platId, setSuggestions)}
                            restaurantId={0}
                        />*/}

                        {/* Nos desserts maison
                        <SectionMenu
                            titre={t('menu.sections.desserts')}
                            plats={desserts}
                            onSavePlat={(plat) => handleSavePlat(plat, setDesserts)}
                            onDeletePlat={(platId) => handleDeletePlat(platId, setDesserts)}
                            restaurantId={0}
                        /> 
                    </div> */}
                </div>
            </main>

            {/* Modal pour ajouter un nouveau plat */}
            <ModalNouveauPlat 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleAddPlat}
                existingSections={customSectionNames}
            />
            <ConfirmDialog
                isOpen={!!sectionPendingDeletion}
                title={t('menu.deleteSection')}
                description={
                    sectionPendingDeletion
                        ? t('menu.confirmDeleteSection', {
                            section: sectionPendingDeletion.titre || t('menu.newSectionPlaceholder'),
                        })
                        : ''
                }
                confirmLabel={t('common.delete')}
                cancelLabel={t('common.cancel')}
                onConfirm={handleConfirmRemoveSection}
                onCancel={handleCancelRemoveSection}
            />
        </div>
    );
}