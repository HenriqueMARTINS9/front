"use client";
import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Plus } from 'lucide-react';
import Tag from '../common/Tag';
import Button from '../common/Button';
import FormulaireModification from './FormulaireModification';
import CepageAssemblage from './CepageAssemblage';
import FormatsDisponibles from './FormatsDisponibles';
import MotsCles from './MotsCles';
import { type Vin } from '@/lib/api';
import { useUpdateVin, useDeleteVin } from '@/lib/hooks';
import { getTagColors } from '@/lib/tagColors';
import { useTranslation } from '@/lib/useTranslation';
import { getRestaurantId } from '@/lib/auth';
import { getCepageNameById } from '@/lib/cepages';

type Cepage = {
    id: string;
    nom: string;
    pourcentage: number;
};

type Format = {
    id: string;
    nom: string;
    capacite?: string;
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
    type: 'Mousseux' | 'Rosé' | 'Blanc' | 'Fortifié' | 'Rouge' | 'Sweet' | 'Old White' | 'Sparkling' | 'Red' | 'White' | 'Moelleux ou liquoreux';
    pointsDeVente: [boolean];
    aocRegion?: string;
    pays?: string;
    cepages: Cepage[];
    formats: Format[];
    motsCles: MotCle[];
};

type TableauVinProps = {
    vins: Vin[];
    restaurantId?: number;
};


export default function TableauVin({ vins, restaurantId }: TableauVinProps) {
    const { t, i18n } = useTranslation();
    // Récupérer le restaurant ID depuis localStorage si non fourni
    const actualRestaurantId = restaurantId ?? getRestaurantId() ?? 1;
    
    // Fonction pour traduire les types de vins
    const translateWineType = (wineType: string) => {
        // Mapping direct des types de vins (gérer les deux langues)
        const wineTypeMap: Record<string, string> = {
            // Types français
            'mousseux': i18n.language === 'en' ? 'Sparkling' : 'Mousseux',
            'blanc': i18n.language === 'en' ? 'White' : 'Blanc',
            'rouge': i18n.language === 'en' ? 'Red' : 'Rouge',
            'rosé': 'Rosé',
            'orange': 'Orange',
            'fortifié': i18n.language === 'en' ? 'Fortified' : 'Fortifié',
            'doux': i18n.language === 'en' ? 'Sweet' : 'Doux',
            'moelleux ou liquoreux': i18n.language === 'en' ? 'Old White' : 'Moelleux ou liquoreux',
            // Types anglais
            'sparkling': i18n.language === 'en' ? 'Sparkling' : 'Mousseux',
            'white': i18n.language === 'en' ? 'White' : 'Blanc',
            'red': i18n.language === 'en' ? 'Red' : 'Rouge',
            'fortified': i18n.language === 'en' ? 'Fortified' : 'Fortifié',
            'sweet': i18n.language === 'en' ? 'Sweet' : 'Doux',
            'old white': i18n.language === 'en' ? 'Old White' : 'Moelleux ou liquoreux',
        };
        
        const typeKey = wineType.toLowerCase();
        return wineTypeMap[typeKey] || wineType;
    };
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [editingWineId, setEditingWineId] = useState<string | null>(null);
    const [localVins, setLocalVins] = useState<Vin[]>(vins);
    const [editingData, setEditingData] = useState<Record<string, { cepages: any[], formats: any[] }>>({});
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    const updateVinMutation = useUpdateVin(actualRestaurantId);
    const deleteVinMutation = useDeleteVin(actualRestaurantId);

    // Mettre à jour les vins locaux quand les props changent
    React.useEffect(() => {
        setLocalVins(vins);
    }, [vins]);

    const columns = useMemo(() => [
        { key: 'name', label: t('common.wineName') },
        { key: 'millesime', label: t('common.vintage') },
        { key: 'type', label: t('common.type') },
        { key: 'pdv1', label: t('common.restaurantNumber') },
        { key: 'actions', label: '' },
    ], [t]);

    async function togglePointDeVente(wineId: string, index: number) {
        const wine = localVins.find(v => v.id === wineId);
        if (!wine) return;

        const newPointsDeVente = [...wine.pointsDeVente] as [boolean];
        newPointsDeVente[index] = !newPointsDeVente[index];

        // Mettre à jour localement immédiatement
        setLocalVins(prev => prev.map(v =>
            v.id === wineId
                ? { ...v, pointsDeVente: newPointsDeVente }
                : v
        ));

        try {
            await updateVinMutation.mutateAsync({
                id: wineId,
                vin: { pointsDeVente: newPointsDeVente }
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du point de vente:', error);
        }
    }

    function toggleExpanded(wineId: string) {
        setExpanded(prev => ({ ...prev, [wineId]: !prev[wineId] }));
    }

    function startEditing(wineId: string) {
        setEditingWineId(wineId);
        setExpanded(prev => ({ ...prev, [wineId]: false }));
    }

    function updateEditingData(wineId: string, data: { cepages?: any[], formats?: any[] }) {
        setEditingData(prev => ({
            ...prev,
            [wineId]: {
                ...prev[wineId],
                ...data
            }
        }));
    }

    function cancelEditing() {
        setEditingWineId(null);
    }

    async function saveWine(wine: Vin | Wine) {
        try {
            console.log('saveWine - vin reçu:', JSON.stringify(wine, null, 2));
            console.log('saveWine - wine.formats:', JSON.stringify(wine.formats, null, 2));
            
            // Mettre à jour les mots-clés avec la couleur du type de vin
            const wineTypeColors = getTagColors(wine.type);
            const updatedMotsCles = wine.motsCles.map(motCle => ({
                ...motCle,
                color: wineTypeColors.bg,
                textColor: wineTypeColors.text
            }));

            // Mettre à jour localement immédiatement avec le vin complet, en incluant les formats
            setLocalVins(prev => prev.map(v =>
                v.id === wine.id
                    ? { ...v, ...wine, motsCles: updatedMotsCles, formats: wine.formats || v.formats || [] }
                    : v
            ));

            // Préparer les données pour la mutation
            // S'assurer que toutes les valeurs sont préservées, même si elles sont vides
            // Gérer les deux types : Vin et Wine
            const isVin = 'nom' in wine;
            const vinData: Vin = {
                id: wine.id,
                // Utiliser 'nom' si c'est un Vin, sinon 'name' si c'est un Wine
                nom: isVin ? (wine as Vin).nom : (wine as Wine).name || '',
                subname: wine.subname || '',
                type: wine.type || 'Blanc',
                cepage: wine.cepages && wine.cepages.length > 0 ? wine.cepages[0].nom : (isVin ? (wine as Vin).cepage : '') || '',
                cepages: wine.cepages || [],
                region: isVin ? (wine as Vin).region : (wine as Wine).aocRegion || '',
                pays: wine.pays || '',
                millesime: wine.millesime || 0,
                prix: wine.formats && wine.formats.length > 0 ? wine.formats[0].prix : (isVin ? (wine as Vin).prix : 0) || 0,
                restaurant: isVin ? (wine as Vin).restaurant : `Restaurant ${restaurantId}`,
                pointsDeVente: wine.pointsDeVente || [true],
                motsCles: updatedMotsCles,
                formats: wine.formats || []
            };
            
            // Vérifier que toutes les valeurs critiques sont présentes
            if (!vinData.nom || vinData.nom.trim() === '') {
                console.error('saveWine - Nom du vin manquant ou vide:', vinData);
            }
            if (!vinData.formats || vinData.formats.length === 0) {
                console.error('saveWine - Formats manquants:', vinData);
            }
            
            console.log('saveWine - vinData complet avant mutation:', JSON.stringify(vinData, null, 2));
            console.log('saveWine - vinData.formats avant mutation:', JSON.stringify(vinData.formats, null, 2));

            // Mettre à jour le vin avec les nouveaux mots-clés et le type
            // IMPORTANT: S'assurer que cepages et formats sont inclus pour la conversion
            const updatedVin = await updateVinMutation.mutateAsync({
                id: wine.id,
                vin: vinData
            });
            
            // L'API ne retourne pas toujours les données complètes après la mise à jour
            // Utiliser les données qu'on a préparées (vinData) pour mettre à jour localVins
            // plutôt que la réponse de l'API qui peut être incomplète
            setLocalVins(prev => prev.map(v =>
                v.id === wine.id
                    ? { 
                        ...v, 
                        ...vinData, 
                        motsCles: updatedMotsCles,
                        formats: vinData.formats || wine.formats || []
                    }
                    : v
            ));
            
            // Forcer un refetch des vins depuis l'API pour s'assurer que les données sont à jour
            // Cela sera fait automatiquement par l'invalidation des queries dans useUpdateVin
            // mais on peut aussi le faire manuellement si nécessaire
            
            setEditingWineId(null);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du vin:', error);
        }
    }

    async function deleteWine(wineId: string) {
        try {
            // Mettre à jour localement immédiatement
            setLocalVins(prev => prev.filter(v => v.id !== wineId));
            await deleteVinMutation.mutateAsync(wineId);
            setEditingWineId(null);
        } catch (error) {
            console.error('Erreur lors de la suppression du vin:', error);
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-6 text-lg text-gray-900 flex items-center justify-between bg-[#D5D9EB] rounded-t-xl">
                <div className="flex items-center gap-2">
                    {i18n.language === 'en' ? 'Wines' : 'Vins'}
                    <Tag label={`${localVins.filter((wine) => {
                        if (!searchQuery.trim()) return true;
                        const searchLower = searchQuery.toLowerCase();
                        return wine.nom?.toLowerCase().includes(searchLower) || 
                               wine.subname?.toLowerCase().includes(searchLower);
                    }).length} ${i18n.language === 'en' ? 'wines' : 'vins'}`} color="bg-[#EEF4FF]" textColor="text-indigo-700" />
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={i18n.language === 'en' ? 'Search by name...' : 'Rechercher par nom...'}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1); // Réinitialiser à la première page lors de la recherche
                            }}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4E5BA6] focus:border-transparent"
                        />
                        <svg 
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
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
                            {(() => {
                                const filteredVins = localVins.filter((wine) => {
                                    if (!searchQuery.trim()) return true;
                                    const searchLower = searchQuery.toLowerCase();
                                    return wine.nom?.toLowerCase().includes(searchLower) || 
                                           wine.subname?.toLowerCase().includes(searchLower);
                                });
                                const totalPages = Math.ceil(filteredVins.length / itemsPerPage);
                                const startIndex = (currentPage - 1) * itemsPerPage;
                                const endIndex = startIndex + itemsPerPage;
                                const paginatedVins = filteredVins.slice(startIndex, endIndex);
                                
                                // Réinitialiser la page si elle dépasse le nombre total de pages
                                if (currentPage > totalPages && totalPages > 0) {
                                    setCurrentPage(1);
                                }
                                
                                return paginatedVins.map((wine) => {
                                const isOpen = !!expanded[wine.id];
                                return (
                                    <React.Fragment key={wine.id}>
                                        <tr className={`border-t border-gray-200 transition-opacity transition-transform duration-500 ease-in-out ${editingWineId === wine.id ? 'opacity-0 scale-95 absolute' : 'opacity-100 scale-100 relative'}`}>
                                            <td className="px-6 py-4">
                                                <div className="text-left">
                                                    <div className="font-medium text-sm text-gray-900">{wine.nom}</div>
                                                    {wine.subname && (
                                                        <div className="text-sm text-gray-500 mt-1">{wine.subname}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-10 py-3 text-sm text-gray-900">{wine.millesime}</td>
                                            <td className="px-10 py-3 text-sm text-gray-900">
                                                <Tag
                                                    label={translateWineType(wine.type)}
                                                    puce={true}
                                                />
                                            </td>
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
                                                            <path d="M8.33341 1.5L3.75008 6.08333L1.66675 4" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
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
                                                            <path d="M11 6.5L6 1.5L1 6.5" stroke="#535862" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        <svg className={`transform transition duration-300 ${isOpen ? 'rotate-180 opacity-100' : 'opacity-0'}`} width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M11 6.5L6 1.5L1 6.5" stroke="#535862" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        aria-label={t('common.modify')}
                                                        onClick={() => startEditing(wine.id)}
                                                        className="transition-all duration-300 rounded p-1"
                                                    >
                                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M14.1665 2.49999C14.3854 2.28112 14.6452 2.1075 14.9312 1.98905C15.2171 1.8706 15.5236 1.80963 15.8332 1.80963C16.1427 1.80963 16.4492 1.8706 16.7352 1.98905C17.0211 2.1075 17.281 2.28112 17.4998 2.49999C17.7187 2.71886 17.8923 2.97869 18.0108 3.26466C18.1292 3.55063 18.1902 3.85713 18.1902 4.16665C18.1902 4.47618 18.1292 4.78268 18.0108 5.06865C17.8923 5.35461 17.7187 5.61445 17.4998 5.83332L6.24984 17.0833L1.6665 18.3333L2.9165 13.75L14.1665 2.49999Z" stroke="#535862" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
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
                                                            <p className="text-sm font-medium text-gray-700">{wine.region || t('common.notSpecified')}</p>
                                                            <p className="text-sm text-gray-700">{wine.pays || t('common.notSpecified')}</p>
                                                        </div>

                                                        {/* Cépage ou assemblage */}
                                                        <CepageAssemblage 
                                                            cepages={editingData[wine.id]?.cepages || wine.cepages || [{ id: '1', nom: wine.cepage, pourcentage: 100 }]} 
                                                            wineType={wine.type} 
                                                        />

                                                        {/* Formats disponibles et Prix */}
                                                        <FormatsDisponibles 
                                                            formats={editingData[wine.id]?.formats || wine.formats || [{ id: '1', nom: 'Bouteille (75 cl)', prix: wine.prix }]} 
                                                            wineType={wine.type} 
                                                        />
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
                                                            wine={{
                                                                id: wine.id,
                                                                name: wine.nom,
                                                                subname: wine.subname,
                                                                millesime: wine.millesime,
                                                                type: wine.type as any,
                                                                pointsDeVente: wine.pointsDeVente,
                                                                aocRegion: wine.region,
                                                                pays: wine.pays,
                                                                cepages: wine.cepages && wine.cepages.length > 0 
                                                                    ? wine.cepages 
                                                                    : [{ id: '1', nom: wine.cepage, pourcentage: 100 }],
                                                                formats: wine.formats && wine.formats.length > 0
                                                                    ? wine.formats
                                                                    : [{ id: '1', nom: 'Bouteille (75 cl)', prix: wine.prix }],
                                                                motsCles: wine.motsCles
                                                            }}
                                                            onDataChange={(data) => updateEditingData(wine.id, data)}
                                                            onSave={(wineData) => {
                                                                // S'assurer que le prix est un nombre (même logique que l'ajout)
                                                                const prix = wineData.formats.length > 0 ? parseFloat(wineData.formats[0].prix?.toString()) || 0 : 0;
                                                                
                                                                // Convertir tous les prix des formats en nombres
                                                                const formatsWithNumericPrices = wineData.formats.map(format => ({
                                                                    ...format,
                                                                    prix: typeof format.prix === 'string' ? parseFloat(format.prix) || 0 : format.prix || 0
                                                                }));
                                                                
                                                                // Mettre à jour editingData avec les nouveaux formats (avec prix numériques)
                                                                setEditingData(prev => ({
                                                                    ...prev,
                                                                    [wineData.id]: {
                                                                        cepages: wineData.cepages || [],
                                                                        formats: formatsWithNumericPrices
                                                                    }
                                                                }));
                                                                
                                                                saveWine({
                                                                    id: wineData.id,
                                                                    // Préserver le nom original si wineData.name est vide
                                                                    nom: wineData.name && wineData.name.trim() !== '' ? wineData.name : wine.nom,
                                                                    subname: wineData.subname || wine.subname || '',
                                                                    type: wineData.type || wine.type,
                                                                    cepage: wineData.cepages[0]?.nom || wine.cepage || '', // Pour compatibilité
                                                                    cepages: wineData.cepages || wine.cepages || [], // IMPORTANT: Inclure cepages pour la conversion
                                                                    region: wineData.aocRegion || wine.region || '',
                                                                    pays: wineData.pays || wine.pays || '',
                                                                    millesime: wineData.millesime !== undefined ? wineData.millesime : wine.millesime,
                                                                    prix: prix !== undefined ? prix : wine.prix,
                                                                    restaurant: wine.restaurant,
                                                                    pointsDeVente: wineData.pointsDeVente || wine.pointsDeVente || [true],
                                                                    motsCles: wineData.motsCles || wine.motsCles || [],
                                                                    formats: wineData.formats || wine.formats || []
                                                                });
                                                                
                                                                // Forcer la mise à jour de l'affichage en fermant et rouvrant les détails
                                                                setTimeout(() => {
                                                                    setExpanded(prev => ({ ...prev }));
                                                                }, 100);
                                                            }}
                                                            onCancel={cancelEditing}
                                                            onDelete={deleteWine}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                );
                            })})()}
                        </tbody>
                    </table>
                </div>
                {(() => {
                    const filteredVins = localVins.filter((wine) => {
                        if (!searchQuery.trim()) return true;
                        const searchLower = searchQuery.toLowerCase();
                        return wine.nom?.toLowerCase().includes(searchLower) || 
                               wine.subname?.toLowerCase().includes(searchLower);
                    });
                    const totalPages = Math.ceil(filteredVins.length / itemsPerPage);
                    if (totalPages <= 1) return null;
                    
                    return (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                {i18n.language === 'en' 
                                    ? `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, filteredVins.length)} of ${filteredVins.length} wines`
                                    : `Affichage de ${(currentPage - 1) * itemsPerPage + 1} à ${Math.min(currentPage * itemsPerPage, filteredVins.length)} sur ${filteredVins.length} vins`
                                }
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {i18n.language === 'en' ? 'Previous' : 'Précédent'}
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                                    currentPage === pageNum
                                                        ? 'bg-[#4E5BA6] text-white'
                                                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {i18n.language === 'en' ? 'Next' : 'Suivant'}
                                </button>
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}


