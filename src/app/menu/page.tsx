'use client';
import { useState } from 'react';
import Sidebar from '@/components/SideBar';
import Header from '@/components/Header';
import Button from '@/components/Button';
import SectionMenu from '@/components/SectionMenu';
import PointsDeVenteTabs from '@/components/PointsDeVenteTabs';
import ModalNouveauPlat from '@/components/ModalNouveauPlat';
import TableauMenu from '@/components/TableauMenu';
import type { Plat } from '@/components/TableauMenu';
import { useTranslation } from '@/lib/useTranslation';

export default function MenuPage() {
    const { t } = useTranslation();
    
    // État pour le modal d'ajout de plat
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // État pour les points de vente (seulement restaurant 1)
    const [pointsDeVente, setPointsDeVente] = useState([
        { id: '1', nom: 'Restaurant #1', actif: true },
    ]);
    const [activeTabId, setActiveTabId] = useState('1');

    // Données des sections de menu
    const [entrees, setEntrees] = useState<Plat[]>([
        {
            id: 'e1',
            nom: 'Salade verte',
            description: '',
            prix: 12.00,
            section: 'Nos entrées',
            pointsDeVente: [true],
            motsCles: [{ id: 'mc1', label: 'Légume vert', color: 'bg-green-100', textColor: 'text-green-700' }]
        },
        {
            id: 'e2',
            nom: 'Salade mêlée',
            description: '',
            prix: 14.00,
            section: 'Nos entrées',
            pointsDeVente: [true],
            motsCles: [{ id: 'mc2', label: 'Légume vert', color: 'bg-green-100', textColor: 'text-green-700' }]
        },
        {
            id: 'e3',
            nom: 'Gaspacho andalou',
            description: 'Perles de melon et lard grillé',
            prix: 16.00,
            section: 'Nos entrées',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc3', label: 'Solanacée', color: 'bg-green-100', textColor: 'text-green-700' },
                { id: 'mc4', label: 'Viande séchée', color: 'bg-red-100', textColor: 'text-red-700' }
            ]
        },
        {
            id: 'e4',
            nom: 'Carpaccio de tomate à l\'ancienne',
            description: 'Vinaigrette balsamique, sorbet basilic maison',
            prix: 18.00,
            section: 'Nos entrées',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc5', label: 'Solanacée', color: 'bg-green-100', textColor: 'text-green-700' },
                { id: 'mc6', label: 'Herbe fraîche aromatique', color: 'bg-purple-100', textColor: 'text-purple-700' }
            ]
        },
        {
            id: 'e5',
            nom: 'Feuilleté aux champignons',
            description: 'Mélange de champignons et sauce morilles',
            prix: 20.00,
            section: 'Nos entrées',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc7', label: 'Champignon', color: 'bg-green-100', textColor: 'text-green-700' },
                { id: 'mc8', label: 'Herbe sèche', color: 'bg-purple-100', textColor: 'text-purple-700' }
            ]
        },
        {
            id: 'e6',
            nom: 'Crevettes Royales sautées à l\'huile d\'olive & noix st-jacques',
            description: 'Sur lit de julienne de légumes et sauce exotique',
            prix: 28.00,
            section: 'Nos entrées',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc9', label: 'Crustacé', color: 'bg-red-100', textColor: 'text-red-700' },
                { id: 'mc10', label: 'Mollusque', color: 'bg-orange-100', textColor: 'text-orange-700' },
                { id: 'mc11', label: 'Épices exotiques', color: 'bg-purple-100', textColor: 'text-purple-700' }
            ]
        }
    ]);

    const [viandes, setViandes] = useState<Plat[]>([
        {
            id: 'v1',
            nom: 'Entrecôte de la Tour',
            description: '',
            prix: 32.00,
            section: 'Nos viandes',
            pointsDeVente: [true],
            motsCles: [{ id: 'mc12', label: 'Viande rouge', color: 'bg-red-100', textColor: 'text-red-700' }]
        },
        {
            id: 'v2',
            nom: 'Filet de bœuf',
            description: '',
            prix: 35.00,
            section: 'Nos viandes',
            pointsDeVente: [true],
            motsCles: [{ id: 'mc13', label: 'Viande rouge', color: 'bg-red-100', textColor: 'text-red-700' }]
        },
        {
            id: 'v3',
            nom: 'Filet de bœuf Landais',
            description: 'Nappé dans son jus de cuisson & foie gras de canard poêlé, pommes de terre grenailles à l\'huile d\'olive et thym, légumes de saison',
            prix: 38.00,
            section: 'Nos viandes',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc14', label: 'Viande rouge', color: 'bg-red-100', textColor: 'text-red-700' },
                { id: 'mc15', label: 'Légume racine', color: 'bg-green-100', textColor: 'text-green-700' },
                { id: 'mc16', label: 'Herbe résineuse', color: 'bg-purple-100', textColor: 'text-purple-700' }
            ]
        },
        {
            id: 'v4',
            nom: 'Tartare de bœuf 180gr',
            description: 'Toasts et beurre',
            prix: 26.00,
            section: 'Nos viandes',
            pointsDeVente: [true],
            motsCles: [{ id: 'mc17', label: 'Viande rouge', color: 'bg-red-100', textColor: 'text-red-700' }]
        }
    ]);

    const [poissons, setPoissons] = useState<Plat[]>([
        {
            id: 'p1',
            nom: 'Spécialité du Chef : Assiette exotique',
            description: 'Mélange de fruits de mer, coulis de crustacés, Julienne de légumes et riz créole',
            prix: 32.00,
            section: 'Nos poissons',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc18', label: 'Crustacé', color: 'bg-red-100', textColor: 'text-red-700' },
                { id: 'mc19', label: 'Épices exotiques', color: 'bg-purple-100', textColor: 'text-purple-700' },
                { id: 'mc20', label: 'Légume vert', color: 'bg-green-100', textColor: 'text-green-700' }
            ]
        },
        {
            id: 'p2',
            nom: 'Filets de perche meunière',
            description: 'Sauce au beurre blanc citronnée',
            prix: 28.00,
            section: 'Nos poissons',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc21', label: 'Poisson', color: 'bg-red-100', textColor: 'text-red-700' },
                { id: 'mc22', label: 'Herbe sèche', color: 'bg-purple-100', textColor: 'text-purple-700' }
            ]
        },
        {
            id: 'p3',
            nom: 'Filet de féra du lac Léman',
            description: 'Sauce au beurre blanc citronnée ou coulis de crustacés',
            prix: 30.00,
            section: 'Nos poissons',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc23', label: 'Poisson', color: 'bg-red-100', textColor: 'text-red-700' },
                { id: 'mc24', label: 'Crustacé', color: 'bg-red-100', textColor: 'text-red-700' }
            ]
        }
    ]);

    const [pates, setPates] = useState<Plat[]>([
        {
            id: 'pa1',
            nom: 'Tagliatelles sauce morilles et parmesan',
            description: '',
            prix: 24.00,
            section: 'Nos pâtes fraîches',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc25', label: 'Champignon', color: 'bg-green-100', textColor: 'text-green-700' },
                { id: 'mc26', label: 'Fromage sec, salé et umami', color: 'bg-orange-100', textColor: 'text-orange-700' }
            ]
        },
        {
            id: 'pa2',
            nom: 'Tagliatelles végétariennes',
            description: '',
            prix: 20.00,
            section: 'Nos pâtes fraîches',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc27', label: 'Légume vert', color: 'bg-green-100', textColor: 'text-green-700' },
                { id: 'mc28', label: 'Légume alliacé', color: 'bg-green-100', textColor: 'text-green-700' }
            ]
        },
        {
            id: 'pa3',
            nom: 'Tagliatelles aux crevettes royale',
            description: 'Crème citronnée et Julienne de légumes',
            prix: 26.00,
            section: 'Nos pâtes fraîches',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc29', label: 'Crustacé', color: 'bg-red-100', textColor: 'text-red-700' },
                { id: 'mc30', label: 'Légume vert', color: 'bg-green-100', textColor: 'text-green-700' }
            ]
        }
    ]);

    const [suggestions, setSuggestions] = useState<Plat[]>([
        {
            id: 's1',
            nom: 'Salade gourmande de printemps',
            description: 'Composée : mélange de fruits de mer, Avocat et tomates cœur de bœuf',
            prix: 22.00,
            section: 'Suggestions du chef',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc31', label: 'Crustacé', color: 'bg-red-100', textColor: 'text-red-700' },
                { id: 'mc32', label: 'Légume vert', color: 'bg-green-100', textColor: 'text-green-700' },
                { id: 'mc33', label: 'Solanacée', color: 'bg-green-100', textColor: 'text-green-700' }
            ]
        },
        {
            id: 's2',
            nom: 'Langue de bœuf',
            description: 'Sauce aux câpres et pommes de terre écrasées',
            prix: 24.00,
            section: 'Suggestions du chef',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc34', label: 'Viande rouge', color: 'bg-red-100', textColor: 'text-red-700' },
                { id: 'mc35', label: 'Légume racine', color: 'bg-green-100', textColor: 'text-green-700' }
            ]
        },
        {
            id: 's3',
            nom: 'Suprême de poulet sauce aux morilles',
            description: 'Légumes du marché et pommes de terre grenailles',
            prix: 26.00,
            section: 'Suggestions du chef',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc36', label: 'Viande blanche', color: 'bg-red-100', textColor: 'text-red-700' },
                { id: 'mc37', label: 'Champignon', color: 'bg-green-100', textColor: 'text-green-700' },
                { id: 'mc38', label: 'Légume racine', color: 'bg-green-100', textColor: 'text-green-700' }
            ]
        },
        {
            id: 's4',
            nom: 'Filet de Bar poêlé, sauce vierge',
            description: 'Riz et légumes',
            prix: 28.00,
            section: 'Suggestions du chef',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc39', label: 'Poisson', color: 'bg-red-100', textColor: 'text-red-700' },
                { id: 'mc40', label: 'Légume vert', color: 'bg-green-100', textColor: 'text-green-700' }
            ]
        },
        {
            id: 's5',
            nom: 'Tagliata de bœuf',
            description: 'Huile parfumée aux truffes et son lit de mesclun, Grano Padano, tomate cerise et pommes de terre frites',
            prix: 32.00,
            section: 'Suggestions du chef',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc41', label: 'Viande rouge', color: 'bg-red-100', textColor: 'text-red-700' },
                { id: 'mc42', label: 'Fromage sec, salé et umami', color: 'bg-orange-100', textColor: 'text-orange-700' },
                { id: 'mc43', label: 'Solanacée', color: 'bg-green-100', textColor: 'text-green-700' }
            ]
        }
    ]);

    const [desserts, setDesserts] = useState<Plat[]>([
        {
            id: 'd1',
            nom: 'Douceur de soleil',
            description: 'Entremet aux fruits de la passion et noisettes',
            prix: 12.00,
            section: 'Nos desserts maison',
            pointsDeVente: [true],
            motsCles: [{ id: 'mc44', label: 'Épices pâtissières', color: 'bg-purple-100', textColor: 'text-purple-700' }]
        },
        {
            id: 'd2',
            nom: 'Moelleux au chocolat et glace vanille',
            description: '',
            prix: 10.00,
            section: 'Nos desserts maison',
            pointsDeVente: [true],
            motsCles: [{ id: 'mc45', label: 'Épices pâtissières', color: 'bg-purple-100', textColor: 'text-purple-700' }]
        },
        {
            id: 'd3',
            nom: 'Crème brûlée à la vanille',
            description: '',
            prix: 8.00,
            section: 'Nos desserts maison',
            pointsDeVente: [true],
            motsCles: [{ id: 'mc46', label: 'Épices pâtissières', color: 'bg-purple-100', textColor: 'text-purple-700' }]
        },
        {
            id: 'd4',
            nom: 'Dessert du jour',
            description: '',
            prix: 9.00,
            section: 'Nos desserts maison',
            pointsDeVente: [true],
            motsCles: [{ id: 'mc47', label: 'Épices pâtissières', color: 'bg-purple-100', textColor: 'text-purple-700' }]
        },
        {
            id: 'd5',
            nom: 'Carpaccio d\'ananas au sirop de thym',
            description: 'Glace romarin maison',
            prix: 11.00,
            section: 'Nos desserts maison',
            pointsDeVente: [true],
            motsCles: [
                { id: 'mc48', label: 'Épices pâtissières', color: 'bg-purple-100', textColor: 'text-purple-700' },
                { id: 'mc49', label: 'Herbe résineuse', color: 'bg-purple-100', textColor: 'text-purple-700' }
            ]
        }
    ]);

    const handleTabChange = (id: string) => {
        setActiveTabId(id);
        setPointsDeVente(prev => 
            prev.map(point => ({
                ...point,
                actif: point.id === id
            }))
        );
    };


    // Fonctions de gestion des plats
    const handleSavePlat = (plat: Plat, setter: React.Dispatch<React.SetStateAction<Plat[]>>) => {
        setter(prev => prev.map(p => p.id === plat.id ? plat : p));
    };

    const handleDeletePlat = (platId: string, setter: React.Dispatch<React.SetStateAction<Plat[]>>) => {
        setter(prev => prev.filter(p => p.id !== platId));
    };

    // Fonction pour ajouter un nouveau plat
    const handleAddPlat = (platData: Omit<Plat, 'id'>) => {
        const newPlat: Plat = {
            ...platData,
            id: `plat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };

        // Ajouter le plat à la section appropriée
        switch (platData.section) {
            case 'Entrée':
                setEntrees(prev => [...prev, newPlat]);
                break;
            case 'Plat':
                // Ajouter aux viandes par défaut, mais on pourrait créer une nouvelle section "Plats"
                setViandes(prev => [...prev, newPlat]);
                break;
            case 'Dessert':
                setDesserts(prev => [...prev, newPlat]);
                break;
            default:
                setEntrees(prev => [...prev, newPlat]);
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

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

                                                 <Button
                             onClick={() => {/* TODO: Modifier/ajouter une section */ }}
                             className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-xs"
                         >
                             Modifier / ajouter une section
                             <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M9.1665 3.33332H3.33317C2.89114 3.33332 2.46722 3.50891 2.15466 3.82147C1.8421 4.13403 1.6665 4.55796 1.6665 4.99999V16.6667C1.6665 17.1087 1.8421 17.5326 2.15466 17.8452C2.46722 18.1577 2.89114 18.3333 3.33317 18.3333H14.9998C15.4419 18.3333 15.8658 18.1577 16.1783 17.8452C16.4909 17.5326 16.6665 17.1087 16.6665 16.6667V10.8333M15.4165 2.08332C15.748 1.7518 16.1977 1.56555 16.6665 1.56555C17.1353 1.56555 17.585 1.7518 17.9165 2.08332C18.248 2.41484 18.4343 2.86448 18.4343 3.33332C18.4343 3.80216 18.248 4.2518 17.9165 4.58332L9.99984 12.5L6.6665 13.3333L7.49984 9.99999L15.4165 2.08332Z" stroke="#535862" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
                             </svg>
                         </Button>

                                                 <Button
                             onClick={() => {/* TODO: Importer un menu */ }}
                             className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-xs"
                         >
                             Importer un menu
                             <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M13.3335 12.3333L10.0002 9M10.0002 9L6.66688 12.3333M10.0002 9V16.5M16.9919 14.325C17.8047 13.8819 18.4467 13.1807 18.8168 12.3322C19.1868 11.4836 19.2637 10.536 19.0354 9.63891C18.807 8.74179 18.2865 7.94626 17.5558 7.37787C16.8251 6.80948 15.9259 6.50061 15.0002 6.5H13.9502C13.698 5.52436 13.2278 4.61861 12.5752 3.85082C11.9225 3.08304 11.1042 2.47321 10.182 2.06717C9.25967 1.66113 8.25734 1.46946 7.25031 1.50657C6.24328 1.54367 5.25777 1.80858 4.36786 2.28138C3.47795 2.75419 2.7068 3.42258 2.1124 4.23631C1.51799 5.05005 1.11579 5.98794 0.936028 6.97949C0.756269 7.97104 0.803632 8.99044 1.07456 9.96105C1.34548 10.9317 1.83291 11.8282 2.50021 12.5833" stroke="#535862" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                             </svg>
                         </Button>

                                                 <Button
                             onClick={() => {/* TODO: Exporter un menu */ }}
                             className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-xs"
                         >
                             Exporter un menu
                             <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M6.66649 13.1667L9.99982 16.5M9.99982 16.5L13.3332 13.1667M9.99982 16.5V9.00001M17.3998 14.075C18.1243 13.5655 18.6676 12.8385 18.9509 11.9993C19.2342 11.1601 19.2427 10.2525 18.9752 9.40819C18.7076 8.56387 18.178 7.82675 17.4632 7.30381C16.7484 6.78087 15.8855 6.49931 14.9998 6.50001H13.9498C13.6992 5.52323 13.2302 4.61605 12.5783 3.84674C11.9263 3.07743 11.1083 2.46606 10.1858 2.05863C9.26338 1.65121 8.26053 1.45836 7.25276 1.4946C6.245 1.53084 5.25858 1.79523 4.36778 2.26786C3.47698 2.74049 2.70501 3.40905 2.10998 4.2232C1.51495 5.03735 1.11237 5.97588 0.93254 6.96813C0.752714 7.96038 0.800331 8.9805 1.07181 9.95169C1.34328 10.9229 1.83154 11.8198 2.49982 12.575" stroke="#535862" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                             </svg>
                         </Button>
                    </div>

                    {/* Tableaux des plats récupérés de l'API */}
                    <TableauMenu pointDeVenteId="1" restaurantId={0} />

                    {/* Séparateur visuel */}
                    <div className="border-t border-gray-200 my-8">
                        <div className="text-center">
                            <span className="bg-[#F8F9FC] px-4 py-2 text-sm text-gray-500 rounded-full border border-gray-200">
                                📋 {t('menu.sections.staticDishes')}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Nos entrées */}
                        <SectionMenu
                            titre={t('menu.sections.entrees')}
                            plats={entrees}
                            onSavePlat={(plat) => handleSavePlat(plat, setEntrees)}
                            onDeletePlat={(platId) => handleDeletePlat(platId, setEntrees)}
                            restaurantId={0}
                        />

                        {/* Nos viandes */}
                        <SectionMenu
                            titre={t('menu.sections.meats')}
                            plats={viandes}
                            onSavePlat={(plat) => handleSavePlat(plat, setViandes)}
                            onDeletePlat={(platId) => handleDeletePlat(platId, setViandes)}
                            restaurantId={0}
                        />

                        {/* Nos poissons */}
                        <SectionMenu
                            titre={t('menu.sections.fish')}
                            plats={poissons}
                            onSavePlat={(plat) => handleSavePlat(plat, setPoissons)}
                            onDeletePlat={(platId) => handleDeletePlat(platId, setPoissons)}
                            restaurantId={0}
                        />

                        {/* Nos pâtes fraîches */}
                        <SectionMenu
                            titre={t('menu.sections.pasta')}
                            plats={pates}
                            onSavePlat={(plat) => handleSavePlat(plat, setPates)}
                            onDeletePlat={(platId) => handleDeletePlat(platId, setPates)}
                            restaurantId={0}
                        />

                        {/* Suggestions du chef */}
                        <SectionMenu
                            titre={t('menu.sections.suggestions')}
                            plats={suggestions}
                            onSavePlat={(plat) => handleSavePlat(plat, setSuggestions)}
                            onDeletePlat={(platId) => handleDeletePlat(platId, setSuggestions)}
                            restaurantId={0}
                        />

                        {/* Nos desserts maison */}
                        <SectionMenu
                            titre={t('menu.sections.desserts')}
                            plats={desserts}
                            onSavePlat={(plat) => handleSavePlat(plat, setDesserts)}
                            onDeletePlat={(platId) => handleDeletePlat(platId, setDesserts)}
                            restaurantId={0}
                        />
                    </div>
                </div>
            </main>

            {/* Modal pour ajouter un nouveau plat */}
            <ModalNouveauPlat 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleAddPlat}
                restaurantId={0}
            />
        </div>
    );
}