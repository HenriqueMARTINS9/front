"use client";
import React, { useState, useEffect } from 'react';
import InputField from '../common/InputField';
import Checkbox from '../common/Checkbox';
import List from '../common/List';
import Button from '../common/Button';
import type { Plat } from './TableauMenu';
import { recommendationsService } from '@/lib/api';
import { Dish } from '@/lib/api';
import { useTranslation } from '@/lib/useTranslation';
import { getRestaurantId } from '@/lib/auth';
import { getAromaColors } from '@/lib/aromaColors';

type FormulaireModificationPlatProps = {
    plat: Plat;
    onSave: (plat: Plat) => void;
    onCancel: () => void;
    onDelete: (platId: string) => void;
    restaurantId?: number; // ID du restaurant pour récupérer les types de plats
};

// Les options d'arômes seront traduites dynamiquement dans le composant
// Utiliser les mêmes clés que dans ModalNouveauPlat
const optionsAromesKeys = [
    'saltyCrumblyCheese',
    'pungentBlueCheese',
    'sourCheeseCream',
    'delicateButteryCheese',
    'nuttyHardCheese',
    'fruityUmamiCheese',
    'drySaltyUmamiCheese',
    'mollusk',
    'finFish',
    'shellfish',
    'whiteMeat',
    'redMeat',
    'curedMeat',
    'strongMarinade',
    'cruciferousVegetable',
    'greenVegetable',
    'harvestVegetable',
    'allium',
    'nightshade',
    'bean',
    'funghi',
    'aromaticGreenHerb',
    'dryHerb',
    'resinousHerb',
    'exoticSpice',
    'bakingSpice',
    'umamiSpice',
    'redPepper',
    'tertiaryAromas',
    'redBlackFruits',
    'citrusFruits',
    'whiteFruits'
];

// Créer les options d'arômes avec les traductions
const createOptionsAromes = (t: (key: string) => string) => 
    optionsAromesKeys.map(key => ({
        value: key,
        label: t(`menu.aromas.${key}`)
    }));

export default function FormulaireModificationPlat({ plat, onSave, onCancel, onDelete, restaurantId }: FormulaireModificationPlatProps) {
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language === 'en';
    // Récupérer le restaurant ID depuis localStorage si non fourni
    const actualRestaurantId = restaurantId ?? getRestaurantId() ?? 1;
    
    // Fonction pour convertir un label d'arôme en sa clé correspondante
    const getAromaKeyFromLabel = (label: string): string => {
        // Si le label est déjà une clé (ex: 'redMeat'), la retourner telle quelle
        if (optionsAromesKeys.includes(label)) {
            return label;
        }
        
        // Chercher la clé correspondant au label traduit
        for (const key of optionsAromesKeys) {
            const translatedLabel = t(`menu.aromas.${key}`);
            if (translatedLabel.toLowerCase() === label.toLowerCase() || translatedLabel === label) {
                return key;
            }
        }
        
        // Mapper les anciennes clés vers les nouvelles
        const oldKeyMap: Record<string, string> = {
            'viande-rouge': 'redMeat',
            'viande-blanche': 'whiteMeat',
            'volaille': 'whiteMeat',
            'poisson': 'finFish',
            'crustace': 'shellfish',
            'mollusque': 'mollusk',
            'legume-vert': 'greenVegetable',
            'solanacee': 'nightshade',
            'champignon': 'funghi',
            'fromage-dur': 'nuttyHardCheese',
            'fromage-bleu': 'pungentBlueCheese',
            'fromage-doux': 'delicateButteryCheese',
            'herbe-fraiche': 'aromaticGreenHerb',
            'herbe-seche': 'dryHerb',
            'epices-exotiques': 'exoticSpice',
            'viande-sechee': 'curedMeat',
            'faisselle': 'sourCheeseCream',
            'fromage-sale': 'saltyCrumblyCheese'
        };
        
        if (oldKeyMap[label]) {
            return oldKeyMap[label];
        }
        
        // Si aucune correspondance, retourner le label original
        return label;
    };
    
    // Fonction pour convertir les arômes du plat au format attendu par la List
    const convertMotsClesToAromeItems = (motsCles: typeof plat.motsCles) => {
        const { getAromaColors } = require('@/lib/aromaColors');
        return motsCles.map((motCle, index) => {
            const aromaKey = getAromaKeyFromLabel(motCle.label);
            const colors = getAromaColors(aromaKey) || { bg: 'bg-gray-100', text: 'text-gray-700', puce: '#6B7280' };
            return {
                id: motCle.id || `arome-${index}`,
                label: aromaKey, // Stocker la clé pour le select
                color: motCle.color || colors.bg,
                textColor: motCle.textColor || colors.text,
                puce: motCle.puce !== undefined ? motCle.puce : true,
                puceColor: motCle.puceColor || colors.puce
            };
        });
    };
    
    // États pour les champs de saisie - Initialiser avec les valeurs du plat
    const getInitialValue = (value: string | undefined, fallback: string = '') => {
        return value !== undefined && value !== null && value !== '' ? value : fallback;
    };
    
    const [nomFr, setNomFr] = useState(() => getInitialValue(plat.nomFr, plat.nom || ''));
    const [nomEn, setNomEn] = useState(() => getInitialValue(plat.nomEn, ''));
    const [descriptionFr, setDescriptionFr] = useState(() => getInitialValue(plat.descriptionFr, plat.description || ''));
    const [descriptionEn, setDescriptionEn] = useState(() => getInitialValue(plat.descriptionEn, ''));
    const [sectionFr, setSectionFr] = useState(() => getInitialValue(plat.sectionFr, plat.section || ''));
    const [sectionEn, setSectionEn] = useState(() => getInitialValue(plat.sectionEn, ''));
    const [pointsDeVente, setPointsDeVente] = useState(plat.pointsDeVente);
    
    // États pour les sections dynamiques
    const [sections, setSections] = useState<Array<{ fr: string; en: string }>>([]);
    const [sectionsSelectionnees, setSectionsSelectionnees] = useState<boolean[]>([]);
    const [creerNouvelleSection, setCreerNouvelleSection] = useState(false);
    const [isLoadingSections, setIsLoadingSections] = useState(false);
    
    // État pour le modal d'exemples
    const [showExamplesModal, setShowExamplesModal] = useState(false);
    
    // Séparer les arômes en principal et secondaires et les convertir
    const allAromesInitial = convertMotsClesToAromeItems(plat.motsCles);
    const aromePrincipalInitial = allAromesInitial.length > 0 ? [allAromesInitial[0]] : [];
    const aromesSecondairesInitial = allAromesInitial.length > 1 ? allAromesInitial.slice(1) : [];
    
    const [aromePrincipalList, setAromePrincipalList] = useState<{ id: string; label: string; color: string; textColor: string; puce?: boolean; puceColor?: string }[]>(
        aromePrincipalInitial.length > 0 ? aromePrincipalInitial : [{ id: 'temp', label: '', color: 'bg-green-100', textColor: 'text-green-700', puce: false, puceColor: '' }]
    );
    const [aromesSecondairesList, setAromesSecondairesList] = useState<{ id: string; label: string; color: string; textColor: string; puce?: boolean; puceColor?: string }[]>(aromesSecondairesInitial);

    // Effet pour mettre à jour les valeurs quand le plat change
    useEffect(() => {
        // Mettre à jour toutes les valeurs, même si elles sont undefined (pour réinitialiser correctement)
        // Utiliser directement les valeurs du plat, sans fallback pour les valeurs EN
        const newNomFr = plat.nomFr !== undefined && plat.nomFr !== null ? plat.nomFr : (plat.nom || '');
        const newNomEn = plat.nomEn !== undefined && plat.nomEn !== null ? plat.nomEn : '';
        const newDescriptionFr = plat.descriptionFr !== undefined && plat.descriptionFr !== null ? plat.descriptionFr : (plat.description || '');
        const newDescriptionEn = plat.descriptionEn !== undefined && plat.descriptionEn !== null ? plat.descriptionEn : '';
        const newSectionFr = plat.sectionFr !== undefined && plat.sectionFr !== null ? plat.sectionFr : (plat.section || '');
        const newSectionEn = plat.sectionEn !== undefined && plat.sectionEn !== null ? plat.sectionEn : '';
        
        setNomFr(newNomFr);
        setNomEn(newNomEn);
        setDescriptionFr(newDescriptionFr);
        setDescriptionEn(newDescriptionEn);
        setSectionFr(newSectionFr);
        setSectionEn(newSectionEn);
        
        // Debug: vérifier les valeurs
        console.log('FormulaireModificationPlat - Valeurs du plat COMPLET:', JSON.stringify(plat, null, 2));
        console.log('FormulaireModificationPlat - Valeurs extraites:', {
            'plat.nomFr': plat.nomFr,
            'plat.nomEn': plat.nomEn,
            'plat.descriptionFr': plat.descriptionFr,
            'plat.descriptionEn': plat.descriptionEn,
            'plat.sectionFr': plat.sectionFr,
            'plat.sectionEn': plat.sectionEn,
            'newNomEn': newNomEn,
            'newDescriptionEn': newDescriptionEn,
            'newSectionEn': newSectionEn,
            'typeof plat.nomEn': typeof plat.nomEn,
            'plat.nomEn === undefined': plat.nomEn === undefined,
            'plat.nomEn === null': plat.nomEn === null
        });
    }, [plat]);

    // Effet pour mettre à jour les arômes quand le plat change
    useEffect(() => {
        const allAromes = convertMotsClesToAromeItems(plat.motsCles);
        const aromePrincipal = allAromes.length > 0 ? [allAromes[0]] : [];
        const aromesSecondaires = allAromes.length > 1 ? allAromes.slice(1) : [];
        
        setAromePrincipalList(aromePrincipal.length > 0 ? aromePrincipal : [{ id: 'temp', label: '', color: 'bg-green-100', textColor: 'text-green-700', puce: false, puceColor: '' }]);
        setAromesSecondairesList(aromesSecondaires);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [plat.motsCles, plat.id, t]); // Réinitialiser quand les mots-clés ou l'ID du plat changent

    // Effet pour récupérer les sections dynamiques
    useEffect(() => {
        const fetchSections = async () => {
            setIsLoadingSections(true);
            try {
                const dishes = await recommendationsService.getRestaurantDishes(actualRestaurantId);
                
                // Extraire les types uniques de plats avec leurs traductions FR et EN
                const sectionsMap = new Map<string, { fr: string; en: string }>();
                dishes.forEach(dish => {
                    const dishTypeFr = dish.dish_type?.fr || '';
                    const dishTypeEn = dish.dish_type?.['en-US'] || dish.dish_type?.en || '';
                    if (dishTypeFr || dishTypeEn) {
                        const key = dishTypeFr || dishTypeEn;
                        if (!sectionsMap.has(key)) {
                            sectionsMap.set(key, {
                                fr: dishTypeFr || dishTypeEn,
                                en: dishTypeEn || dishTypeFr
                            });
                        }
                    }
                });
                
                const sectionsArray = Array.from(sectionsMap.values());
                setSections(sectionsArray);
                
                // Vérifier si la section actuelle correspond à une section existante
                // Utiliser les valeurs du plat pour la détection initiale
                const currentSectionFr = plat.sectionFr || plat.section || '';
                const currentSectionEn = plat.sectionEn || '';
                const currentSectionIndex = sectionsArray.findIndex(
                    s => (s.fr === currentSectionFr && s.en === currentSectionEn) || 
                         (s.fr === currentSectionFr && !currentSectionEn) || 
                         (s.en === currentSectionEn && !currentSectionFr)
                );
                
                if (currentSectionIndex >= 0) {
                    // La section actuelle existe, la sélectionner
                    setSectionsSelectionnees(sectionsArray.map((_, idx) => idx === currentSectionIndex));
                    setCreerNouvelleSection(false);
                    // Mettre à jour les valeurs de section si elles ne sont pas déjà définies
                    if (!sectionFr && !sectionEn) {
                        const selectedSection = sectionsArray[currentSectionIndex];
                        setSectionFr(selectedSection.fr);
                        setSectionEn(selectedSection.en);
                    }
                } else if (currentSectionFr || currentSectionEn) {
                    // La section actuelle n'existe pas, activer le mode création
                    setSectionsSelectionnees(sectionsArray.map(() => false));
                    setCreerNouvelleSection(true);
                } else {
                    // Aucune section sélectionnée
                    setSectionsSelectionnees(sectionsArray.map(() => false));
                    setCreerNouvelleSection(false);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des types de plats:', error);
                setSections([]);
            } finally {
                setIsLoadingSections(false);
            }
        };

        fetchSections();
    }, [actualRestaurantId, plat.sectionFr, plat.sectionEn, plat.section]);
    
    // Gestionnaires pour les sections
    const handleSectionChange = (index: number, checked: boolean) => {
        const newSections = sections.map((_, idx) => idx === index ? checked : false);
        setSectionsSelectionnees(newSections);
        if (checked) {
            const selectedSection = sections[index];
            setSectionFr(selectedSection.fr);
            setSectionEn(selectedSection.en);
            setCreerNouvelleSection(false);
        } else {
            setSectionFr('');
            setSectionEn('');
        }
    };

    const handleToggleCreerSection = () => {
        if (creerNouvelleSection) {
            setCreerNouvelleSection(false);
            setSectionFr('');
            setSectionEn('');
        } else {
            setCreerNouvelleSection(true);
            // Décocher toutes les sections existantes
            setSectionsSelectionnees(sections.map(() => false));
            setSectionFr('');
            setSectionEn('');
        }
    };

    // Gestionnaires pour les points de vente
    const handlePointDeVenteChange = (index: number, checked: boolean) => {
        const newPointsDeVente = [...pointsDeVente] as [boolean, boolean, boolean, boolean];
        newPointsDeVente[index] = checked;
        setPointsDeVente(newPointsDeVente);
    };

    const handleAromePrincipalChange = (items: any[]) => {
        setAromePrincipalList(items.map(item => {
            const label = item.label || '';
            // Toujours recalculer les couleurs basées sur le label actuel
            const colors = getAromaColors(label) || { bg: 'bg-gray-100', text: 'text-gray-700', puce: '#6B7280' };
            return {
                id: item.id,
                label: label,
                color: colors.bg, // Utiliser la nouvelle couleur, pas l'ancienne
                textColor: colors.text, // Utiliser la nouvelle couleur de texte
                puce: item.puce !== undefined ? item.puce : true,
                puceColor: colors.puce // Utiliser la nouvelle couleur de puce
            };
        }));
    };

    const handleAromesSecondairesChange = (items: any[]) => {
        setAromesSecondairesList(items.map(item => {
            const label = item.label || '';
            // Toujours recalculer les couleurs basées sur le label actuel
            const colors = getAromaColors(label) || { bg: 'bg-gray-100', text: 'text-gray-700', puce: '#6B7280' };
            return {
                id: item.id,
                label: label,
                color: colors.bg, // Utiliser la nouvelle couleur, pas l'ancienne
                textColor: colors.text, // Utiliser la nouvelle couleur de texte
                puce: item.puce !== undefined ? item.puce : true,
                puceColor: colors.puce // Utiliser la nouvelle couleur de puce
            };
        }));
    };
    
    // Fonction pour convertir les clés d'arômes en objets MotCle pour la sauvegarde
    const convertAromeItemsToMotsCles = (items: { id: string; label: string; color: string; textColor: string; puce?: boolean; puceColor?: string }[]): typeof plat.motsCles => {
        return items
            .filter(item => item.label && item.label.trim())
            .map(item => {
                const aromaKey = item.label;
                const translatedLabel = t(`menu.aromas.${aromaKey}`);
                return {
                    id: item.id,
                    label: translatedLabel !== `menu.aromas.${aromaKey}` ? translatedLabel : aromaKey,
                    color: item.color,
                    textColor: item.textColor,
                    puce: item.puce !== undefined ? item.puce : true,
                    puceColor: item.puceColor || ''
                };
            });
    };

    return (
        <>
        <div className="space-y-6 overflow-visible">
            {/* Formulaire de modification */}
            <div className="grid grid-cols-12 gap-6 items-start text-left overflow-visible">
                {/* Nom du plat - Deux colonnes */}
                {isEnglish ? (
                    <>
                        {/* Anglais à gauche si site en anglais */}
                        <div className="col-span-6 pt-6">
                            <InputField
                                type="text"
                                value={nomEn}
                                onChange={setNomEn}
                                label={`${t('menu.dish.name')} (${t('common.english')})`}
                                size="md"
                                width="full"
                                colors={{
                                    background: 'bg-white',
                                    border: 'border-gray-300',
                                    text: 'text-gray-900',
                                    placeholder: 'placeholder-gray-500',
                                    focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                    hover: '',
                                    label: 'text-gray-700'
                                }}
                            />
                        </div>
                        {/* Français à droite si site en anglais */}
                        <div className="col-span-6 pt-6">
                            <InputField
                                type="text"
                                value={nomFr}
                                onChange={setNomFr}
                                label={`${t('menu.dish.name')} (${t('common.french')})`}
                                size="md"
                                width="full"
                                colors={{
                                    background: 'bg-white',
                                    border: 'border-gray-300',
                                    text: 'text-gray-900',
                                    placeholder: 'placeholder-gray-500',
                                    focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                    hover: '',
                                    label: 'text-gray-700'
                                }}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        {/* Français à gauche si site en français */}
                        <div className="col-span-6 pt-6">
                            <InputField
                                type="text"
                                value={nomFr}
                                onChange={setNomFr}
                                label={`${t('menu.dish.name')} (${t('common.french')})`}
                                size="md"
                                width="full"
                                colors={{
                                    background: 'bg-white',
                                    border: 'border-gray-300',
                                    text: 'text-gray-900',
                                    placeholder: 'placeholder-gray-500',
                                    focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                    hover: '',
                                    label: 'text-gray-700'
                                }}
                            />
                        </div>
                        {/* Anglais à droite si site en français */}
                        <div className="col-span-6 pt-6">
                            <InputField
                                type="text"
                                value={nomEn}
                                onChange={setNomEn}
                                label={`${t('menu.dish.name')} (${t('common.english')})`}
                                size="md"
                                width="full"
                                colors={{
                                    background: 'bg-white',
                                    border: 'border-gray-300',
                                    text: 'text-gray-900',
                                    placeholder: 'placeholder-gray-500',
                                    focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                    hover: '',
                                    label: 'text-gray-700'
                                }}
                            />
                        </div>
                    </>
                )}
                
                {/* Description - Deux colonnes */}
                {isEnglish ? (
                    <>
                        {/* Anglais à gauche si site en anglais */}
                        <div className="col-span-6">
                            <InputField
                                type="text"
                                value={descriptionEn}
                                onChange={setDescriptionEn}
                                label={`${t('menu.dish.description')} (${t('common.english')})`}
                                size="md"
                                width="full"
                                colors={{
                                    background: 'bg-white',
                                    border: 'border-gray-300',
                                    text: 'text-gray-900',
                                    placeholder: 'placeholder-gray-500',
                                    focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                    hover: '',
                                    label: 'text-gray-700'
                                }}
                            />
                        </div>
                        {/* Français à droite si site en anglais */}
                        <div className="col-span-6">
                            <InputField
                                type="text"
                                value={descriptionFr}
                                onChange={setDescriptionFr}
                                label={`${t('menu.dish.description')} (${t('common.french')})`}
                                size="md"
                                width="full"
                                colors={{
                                    background: 'bg-white',
                                    border: 'border-gray-300',
                                    text: 'text-gray-900',
                                    placeholder: 'placeholder-gray-500',
                                    focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                    hover: '',
                                    label: 'text-gray-700'
                                }}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        {/* Français à gauche si site en français */}
                        <div className="col-span-6">
                            <InputField
                                type="text"
                                value={descriptionFr}
                                onChange={setDescriptionFr}
                                label={`${t('menu.dish.description')} (${t('common.french')})`}
                                size="md"
                                width="full"
                                colors={{
                                    background: 'bg-white',
                                    border: 'border-gray-300',
                                    text: 'text-gray-900',
                                    placeholder: 'placeholder-gray-500',
                                    focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                    hover: '',
                                    label: 'text-gray-700'
                                }}
                            />
                        </div>
                        {/* Anglais à droite si site en français */}
                        <div className="col-span-6">
                            <InputField
                                type="text"
                                value={descriptionEn}
                                onChange={setDescriptionEn}
                                label={`${t('menu.dish.description')} (${t('common.english')})`}
                                size="md"
                                width="full"
                                colors={{
                                    background: 'bg-white',
                                    border: 'border-gray-300',
                                    text: 'text-gray-900',
                                    placeholder: 'placeholder-gray-500',
                                    focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                    hover: '',
                                    label: 'text-gray-700'
                                }}
                            />
                        </div>
                    </>
                )}
                
                {/* Section */}
                <div className="col-span-12">
                    <label className="block text-sm font-medium text-gray-700 mb-3">{t('menu.dish.section')}</label>
                    {isLoadingSections ? (
                        <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7F56D9]"></div>
                            <span className="ml-2 text-sm text-gray-500">{t('common.loadingSections')}</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                {sections.map((section, index) => {
                                    const displayName = isEnglish ? (section.en || section.fr) : (section.fr || section.en);
                                    return (
                                        <div key={index} className="flex items-start">
                                            <Checkbox
                                                checked={sectionsSelectionnees[index] && !creerNouvelleSection}
                                                onChange={(value) => handleSectionChange(index, value)}
                                                colors={{
                                                    unchecked: 'border-gray-300 bg-white',
                                                    checked: 'border-[#7F56D9] bg-[#7F56D9]'
                                                }}
                                                disabled={creerNouvelleSection}
                                            />
                                            <span className={`ml-3 text-sm text-gray-700 ${creerNouvelleSection ? 'text-gray-400' : ''}`}>{displayName}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Option pour créer une nouvelle section */}
                            <div className="pt-2 border-t border-gray-200">
                                <div className="flex items-start mb-3">
                                    <Checkbox
                                        checked={creerNouvelleSection}
                                        onChange={handleToggleCreerSection}
                                        colors={{
                                            unchecked: 'border-gray-300 bg-white',
                                            checked: 'border-[#7F56D9] bg-[#7F56D9]'
                                        }}
                                    />
                                    <span className="ml-3 text-sm font-medium text-gray-700">{t('menu.createNewSection')}</span>
                                </div>
                                {creerNouvelleSection && (
                                    <div className="ml-8 mt-2">
                                        <div className="grid grid-cols-2 gap-4">
                                            {isEnglish ? (
                                                <>
                                                    {/* Anglais à gauche si site en anglais */}
                                                    <div className="text-gray-700">
                                                        <InputField
                                                            type="text"
                                                            value={sectionEn}
                                                            onChange={setSectionEn}
                                                            label={`${t('menu.dish.section')} (${t('common.english')})`}
                                                            placeholder="Starter"
                                                            size="md"
                                                            width="full"
                                                            colors={{
                                                                background: 'bg-white',
                                                                border: 'border-gray-300',
                                                                text: 'text-gray-900',
                                                                placeholder: 'placeholder-gray-500',
                                                                focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                                                hover: '',
                                                                label: 'text-gray-700'
                                                            }}
                                                        />
                                                    </div>
                                                    {/* Français à droite si site en anglais */}
                                                    <div className="text-gray-700">
                                                        <InputField
                                                            type="text"
                                                            value={sectionFr}
                                                            onChange={setSectionFr}
                                                            label={`${t('menu.dish.section')} (${t('common.french')})`}
                                                            placeholder="Entrée"
                                                            size="md"
                                                            width="full"
                                                            colors={{
                                                                background: 'bg-white',
                                                                border: 'border-gray-300',
                                                                text: 'text-gray-900',
                                                                placeholder: 'placeholder-gray-500',
                                                                focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                                                hover: '',
                                                                label: 'text-gray-700'
                                                            }}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    {/* Français à gauche si site en français */}
                                                    <div className="text-gray-700">
                                                        <InputField
                                                            type="text"
                                                            value={sectionFr}
                                                            onChange={setSectionFr}
                                                            label={`${t('menu.dish.section')} (${t('common.french')})`}
                                                            placeholder="Entrée"
                                                            size="md"
                                                            width="full"
                                                            colors={{
                                                                background: 'bg-white',
                                                                border: 'border-gray-300',
                                                                text: 'text-gray-900',
                                                                placeholder: 'placeholder-gray-500',
                                                                focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                                                hover: '',
                                                                label: 'text-gray-700'
                                                            }}
                                                        />
                                                    </div>
                                                    {/* Anglais à droite si site en français */}
                                                    <div className="text-gray-700">
                                                        <InputField
                                                            type="text"
                                                            value={sectionEn}
                                                            onChange={setSectionEn}
                                                            label={`${t('menu.dish.section')} (${t('common.english')})`}
                                                            placeholder="Starter"
                                                            size="md"
                                                            width="full"
                                                            colors={{
                                                                background: 'bg-white',
                                                                border: 'border-gray-300',
                                                                text: 'text-gray-900',
                                                                placeholder: 'placeholder-gray-500',
                                                                focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                                                hover: '',
                                                                label: 'text-gray-700'
                                                            }}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="col-span-8">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-green-600 text-sm font-bold">i</span>
                            </div>
                            <div className="text-sm text-green-800">
                                <p className="mb-2">
                                    {t('menu.dish.aromaInfo')}
                                </p>
                                <p className="font-medium mb-1">Exemple : Faux filet de bœuf façon Steakhouse</p>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>{t('menu.dish.aromaExampleMain')}</li>
                                    <li>{t('menu.dish.aromaExampleSecondary')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Arôme principal */}
                <div className="col-span-6">
                    <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">{t('menu.dish.mainAroma')}</label>
                        <button
                            type="button"
                            onClick={() => setShowExamplesModal(true)}
                            className="w-5 h-5 rounded-full border-2 border-black hover:bg-gray-100 flex items-center justify-center transition-colors"
                            title="Voir les exemples d'arômes"
                        >
                            <span className="text-black text-xs font-bold">i</span>
                        </button>
                    </div>

                    <List
                        items={aromePrincipalList}
                        onItemsChange={handleAromePrincipalChange}
                        fields={[
                            {
                                key: 'label',
                                label: t('menu.dish.mainAroma'),
                                type: 'select',
                                options: createOptionsAromes(t),
                                width: 'full'
                            }
                        ]}
                        addButtonText={t('menu.dish.addAroma')}
                        emptyMessage={t('menu.dish.noMainAroma')}
                        size="md"
                        showAddButton={false}
                        showDeleteButton={false}
                        colors={{
                            background: 'bg-white',
                            border: 'border-gray-300',
                            text: 'text-gray-900',
                            placeholder: 'placeholder-gray-500 text-md',
                            focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                            hover: '',
                            suffix: 'text-gray-500',
                            deleteButton: 'text-gray-400',
                            deleteButtonHover: '',
                            optionHover: 'hover:bg-gray-50',
                            optionSelected: 'bg-purple-50 text-purple-700',
                            addButton: 'bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition-colors duration-200'
                        }}
                    />
                </div>
                {/* Arômes secondaires */}
                <div className="col-span-12">
                    <label className="block text-sm font-medium text-gray-700 mb-3">{t('menu.dish.secondaryAromas')} ({t('common.add')})</label>

                    <List
                        items={aromesSecondairesList}
                        onItemsChange={handleAromesSecondairesChange}
                        fields={[
                            {
                                key: 'label',
                                label: t('menu.dish.secondaryAromas'),
                                type: 'select',
                                placeholder: t('common.selectSecondaryAroma'),
                                options: createOptionsAromes(t),
                                width: 'full'
                            }
                        ]}
                        addButtonText={t('menu.dish.addSecondaryAroma')}
                        emptyMessage={t('menu.dish.noSecondaryAromas')}
                        size="md"
                        colors={{
                            background: 'bg-white',
                            border: 'border-gray-300',
                            text: 'text-gray-900',
                            placeholder: 'placeholder-gray-500',
                            focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                            hover: '',
                            suffix: 'text-gray-500',
                            deleteButton: 'text-gray-400',
                            deleteButtonHover: '',
                            optionHover: 'hover:bg-gray-50',
                            optionSelected: 'bg-purple-50 text-purple-700',
                            addButton: 'bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition-colors duration-200'
                        }}
                    />
                </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-6 pt-6">
                <Button 
                    onClick={() => {
                        const allAromes = [...aromePrincipalList, ...aromesSecondairesList];
                        const motsCles = convertAromeItemsToMotsCles(allAromes);
                        onSave({
                            ...plat,
                            nom: nomFr || nomEn, // Pour compatibilité avec l'affichage
                            nomFr: nomFr.trim() || undefined,
                            nomEn: nomEn.trim() || undefined,
                            description: descriptionFr || descriptionEn, // Pour compatibilité avec l'affichage
                            descriptionFr: descriptionFr.trim() || undefined,
                            descriptionEn: descriptionEn.trim() || undefined,
                            prix: 0, // Prix retiré des menus
                            section: sectionFr || sectionEn, // Pour compatibilité avec l'affichage
                            sectionFr: sectionFr.trim() || undefined,
                            sectionEn: sectionEn.trim() || undefined,
                            pointsDeVente,
                            motsCles
                        });
                    }} 
                    className="!bg-[#7F56D9] !text-white hover:!bg-[#6941C6] focus:!outline-none focus:!ring-2 focus:!ring-purple-100 focus:!border-purple-300 focus:!shadow-xs transition-colors duration-200"
                >
                    {t('common.save')}
                </Button>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            onDelete(plat.id);
                        }}
                        className="px-5 py-2.5 rounded-md bg-[#F5F3FF] text-[#7C3AED] font-medium hover:bg-[#EDE9FE] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] transition"
                    >
                        {t('menu.dish.delete')}
                    </button>
                </div>
            </div>
        </div>

        {/* Modal d'exemples d'arômes */}
        {showExamplesModal && (
                <div 
                    className="fixed inset-0 bg-[#0000005F] bg-opacity-50 flex items-center justify-center z-[60] animate-in fade-in duration-300"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowExamplesModal(false);
                        }
                    }}
                >
                    <div className="bg-[#3E4784] rounded-xl max-w-3xl w-full mx-4 max-h-[80vh] shadow-lg overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="p-6 overflow-y-auto flex-1 text-left">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-white text-left">{t('menu.dish.examplesTitle')}</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowExamplesModal(false)}
                                    className="w-8 h-8 rounded-full border-2 border-white bg-transparent hover:bg-white/10 flex items-center justify-center transition-colors"
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 4L4 12M4 4L12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-4 text-left">
                                {/* Fromage */}
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2 text-left">{t('menu.dish.examplesCategories.cheese')}</h3>
                                    <div className="space-y-1.5 text-sm text-white/90 text-left">
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.saltyCrumblyCheese')}</span> {t('menu.dish.examplesItems.saltyCrumblyCheese')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.pungentBlueCheese')}</span> {t('menu.dish.examplesItems.pungentBlueCheese')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.sourCheeseCream')}</span> {t('menu.dish.examplesItems.sourCheeseCream')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.delicateButteryCheese')}</span> {t('menu.dish.examplesItems.delicateButteryCheese')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.nuttyHardCheese')}</span> {t('menu.dish.examplesItems.nuttyHardCheese')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.fruityUmamiCheese')}</span> {t('menu.dish.examplesItems.fruityUmamiCheese')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.drySaltyUmamiCheese')}</span> {t('menu.dish.examplesItems.drySaltyUmamiCheese')}</div>
                                    </div>
                                </div>
                                
                                {/* Protéines */}
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2 text-left">{t('menu.dish.examplesCategories.proteins')}</h3>
                                    <div className="space-y-1.5 text-sm text-white/90 text-left">
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.mollusk')}</span> {t('menu.dish.examplesItems.mollusk')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.finFish')}</span> {t('menu.dish.examplesItems.finFish')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.shellfish')}</span> {t('menu.dish.examplesItems.shellfish')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.whiteMeat')}</span> {t('menu.dish.examplesItems.whiteMeat')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.redMeat')}</span> {t('menu.dish.examplesItems.redMeat')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.curedMeat')}</span> {t('menu.dish.examplesItems.curedMeat')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.strongMarinade')}</span> {t('menu.dish.examplesItems.strongMarinade')}</div>
                                    </div>
                                </div>
                                
                                {/* Légumes */}
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2 text-left">{t('menu.dish.examplesCategories.vegetables')}</h3>
                                    <div className="space-y-1.5 text-sm text-white/90 text-left">
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.cruciferousVegetable')}</span> {t('menu.dish.examplesItems.cruciferousVegetable')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.greenVegetable')}</span> {t('menu.dish.examplesItems.greenVegetable')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.harvestVegetable')}</span> {t('menu.dish.examplesItems.harvestVegetable')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.allium')}</span> {t('menu.dish.examplesItems.allium')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.nightshade')}</span> {t('menu.dish.examplesItems.nightshade')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.bean')}</span> {t('menu.dish.examplesItems.bean')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.funghi')}</span> {t('menu.dish.examplesItems.funghi')}</div>
                                    </div>
                                </div>
                                
                                {/* Épices et herbes aromatiques */}
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-3 text-left">{t('menu.dish.examplesCategories.spices')}</h3>
                                    <div className="space-y-2 text-sm text-white/90 text-left">
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.aromaticGreenHerb')}</span> {t('menu.dish.examplesItems.aromaticGreenHerb')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.dryHerb')}</span> {t('menu.dish.examplesItems.dryHerb')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.resinousHerb')}</span> {t('menu.dish.examplesItems.resinousHerb')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.exoticSpice')}</span> {t('menu.dish.examplesItems.exoticSpice')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.bakingSpice')}</span> {t('menu.dish.examplesItems.bakingSpice')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.umamiSpice')}</span> {t('menu.dish.examplesItems.umamiSpice')}</div>
                                        <div><span className="font-medium text-white">{t('menu.dish.examples.redPepper')}</span> {t('menu.dish.examplesItems.redPepper')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                            
                        {/* Bouton de fermeture */}
                        <div className="px-6 py-4 border-t border-white/20 flex justify-end">
                            <Button
                                type="button"
                                onClick={() => setShowExamplesModal(false)}
                                className="bg-white text-[#3E4784] hover:bg-white/90 transition-colors duration-200"
                            >
                                {t('common.close')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
