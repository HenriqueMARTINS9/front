"use client";
import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import InputField from '../common/InputField';
import Checkbox from '../common/Checkbox';
import List from '../common/List';
import Select from '../common/Select';
import type { Plat } from './TableauMenu';
import { recommendationsService } from '@/lib/api';
import { Dish } from '@/lib/api';
import { useTranslation } from '@/lib/useTranslation';
import { useCreateDish } from '@/lib/hooks';
import { getRestaurantId } from '@/lib/auth';
import { getAromaColors } from '@/lib/aromaColors';

type AromeItem = {
    id: string;
    label: string;
    color: string;
    textColor: string;
    puce?: boolean;
    puceColor?: string;
};

type ModalNouveauPlatProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (platData: Omit<Plat, 'id'>) => void;
    restaurantId?: number; // ID du restaurant pour récupérer les types de plats
    existingSections?: string[];
};

// Les options d'arômes seront traduites dynamiquement dans le composant
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

export default function ModalNouveauPlat({ isOpen, onClose, onSave, restaurantId, existingSections = [] }: ModalNouveauPlatProps) {
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language === 'en';
    
    // Récupérer le restaurant ID depuis localStorage si non fourni
    const actualRestaurantId = restaurantId ?? getRestaurantId() ?? 1;
    
    // Hook pour créer un plat via l'API
    const createDishMutation = useCreateDish(actualRestaurantId);
    
    // États pour les champs de saisie
    const [nomFr, setNomFr] = useState('');
    const [nomEn, setNomEn] = useState('');
    const [descriptionFr, setDescriptionFr] = useState('');
    const [descriptionEn, setDescriptionEn] = useState('');
    const [sectionFr, setSectionFr] = useState('');
    const [sectionEn, setSectionEn] = useState('');
    
    // États pour les sections
    const [sections, setSections] = useState<Array<{ fr: string; en: string }>>([]);
    const [sectionsSelectionnees, setSectionsSelectionnees] = useState<boolean[]>([]);
    const [creerNouvelleSection, setCreerNouvelleSection] = useState(false);
    const [isLoadingSections, setIsLoadingSections] = useState(false);

    // États pour les arômes
    const [aromePrincipal, setAromePrincipal] = useState<string>('');
    const [aromesSecondaires, setAromesSecondaires] = useState<AromeItem[]>([]);

    // États pour les erreurs de validation
    const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
    
    // État pour le modal d'exemples
    const [showExamplesModal, setShowExamplesModal] = useState(false);

    // Effet pour réinitialiser le formulaire quand le modal s'ouvre
    useEffect(() => {
        if (isOpen) {
            // Réinitialiser tous les états lors de l'ouverture du modal
            setNomFr('');
            setNomEn('');
            setDescriptionFr('');
            setDescriptionEn('');
            setSectionFr('');
            setSectionEn('');
            setSectionsSelectionnees([]);
            setCreerNouvelleSection(false);
            setAromePrincipal('');
            setAromesSecondaires([]);
            setErrors({});
        }
    }, [isOpen]);

    // Effet pour récupérer les types de plats de l'API
    useEffect(() => {
        const fetchSections = async () => {
            if (!isOpen) return; // Ne récupérer que quand le modal est ouvert
            
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
                
                // Initialiser les sections sélectionnées (aucune sélectionnée par défaut)
                setSectionsSelectionnees(sectionsArray.map(() => false));
            } catch (error) {
                console.error('Erreur lors de la récupération des types de plats:', error);
                setSections([]);
            } finally {
                setIsLoadingSections(false);
            }
        };

        fetchSections();
    }, [isOpen, actualRestaurantId]);

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

    // Gestionnaire pour l'arôme principal (un seul arôme)
    const handleAromePrincipalChange = (value: string) => {
        setAromePrincipal(value);
    };

    const handleAromesSecondairesChange = (items: any[]) => {
        setAromesSecondaires(items.map(item => {
            const label = item.label || '';
            const colors = getAromaColors(label) || { bg: 'bg-gray-100', text: 'text-gray-700', puce: '#6B7280' };
            return {
            id: item.id,
                label: label,
                color: item.color || colors.bg,
                textColor: item.textColor || colors.text,
                puce: typeof item.puce === 'boolean' ? item.puce : Boolean(label?.trim()),
                puceColor: typeof item.puceColor === 'string' ? item.puceColor : colors.puce
            };
        }));
    };

    // Fonction de validation
    const validateForm = () => {
        const newErrors: { [key: string]: boolean } = {};

        if (!nomFr.trim()) {
            newErrors.nomFr = true;
        }
        if (!nomEn.trim()) {
            newErrors.nomEn = true;
        }
        // Vérifier que les sections FR et EN sont saisies
        if (!sectionFr.trim()) {
            newErrors.sectionFr = true;
        }
        if (!sectionEn.trim()) {
            newErrors.sectionEn = true;
        }
        // Vérifier qu'un arôme principal est sélectionné
        if (!aromePrincipal || aromePrincipal.trim() === '') {
            newErrors.aromePrincipal = true;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Gestionnaire pour la soumission
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        // Combiner tous les arômes (arôme principal + arômes secondaires)
        const tousLesAromes: AromeItem[] = [];
        
        // Ajouter l'arôme principal s'il est sélectionné
        if (aromePrincipal && aromePrincipal.trim() !== '') {
            const colors = getAromaColors(aromePrincipal) || { bg: 'bg-gray-100', text: 'text-gray-700', puce: '#6B7280' };
            tousLesAromes.push({
                id: 'principal-1',
                label: aromePrincipal,
                color: colors.bg,
                textColor: colors.text,
                puce: true,
                puceColor: colors.puce
            });
        }
        
        // Ajouter les arômes secondaires avec leurs couleurs
        aromesSecondaires.filter(a => a.label.trim()).forEach(arome => {
            const colors = getAromaColors(arome.label) || { bg: 'bg-gray-100', text: 'text-gray-700', puce: '#6B7280' };
            tousLesAromes.push({
                ...arome,
                color: colors.bg,
                textColor: colors.text,
                puce: true,
                puceColor: colors.puce
            });
        });

        const platData: Omit<Plat, 'id'> = {
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
            pointsDeVente: [true, true, true, true], // Par défaut tous les restaurants
            motsCles: tousLesAromes.map((arome, index) => ({
                id: `mc${index + 1}`,
                label: arome.label,
                color: arome.color,
                textColor: arome.textColor,
                puce: typeof arome.puce === 'boolean' ? arome.puce : Boolean(arome.label?.trim()),
                puceColor: arome.puceColor || ''
            }))
        };

        try {
            // Créer le plat via l'API
            const createdPlat = await createDishMutation.mutateAsync(platData);
            
            // Appeler le callback onSave avec le plat créé (qui a maintenant un ID)
            onSave(platData);
            onClose();
            
            // Réinitialiser le formulaire
            setNomFr('');
            setNomEn('');
            setDescriptionFr('');
            setDescriptionEn('');
            setSectionFr('');
            setSectionEn('');
            setAromePrincipal('');
            setAromesSecondaires([]);
            setErrors({});
        } catch (error) {
            console.error('Erreur lors de la création du plat:', error);
            // L'erreur sera gérée par React Query, mais on peut aussi afficher un message à l'utilisateur
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#0000005F] bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-300">
            <div className="bg-gray-50 rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] shadow-sm focus:shadow-sm focus:shadow-gray-100 focus:shadow-[4px] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                <div className="p-8 overflow-y-auto flex-1">
                    {/* Header */}
                    <div className="mb-6">
                        <h2 className="text-4xl font-bold text-gray-900 mb-2">{t('menu.addDish')}</h2>
                        <p className="text-gray-900 text-md">{t('common.fillFieldsPrecisely')}</p>
                    </div>

                    <div className="space-y-6">
                        {/* Nom du plat - Deux colonnes */}
                        <div className="grid grid-cols-2 gap-4">
                            {isEnglish ? (
                                <>
                                    {/* Anglais à gauche si site en anglais */}
                                    <div className="text-gray-700">
                                        <InputField
                                            type="text"
                                            value={nomEn}
                                            onChange={setNomEn}
                                            label={`${t('menu.dish.name')} (${t('common.english')})`}
                                            placeholder="Green salad"
                                            size="md"
                                            width="full"
                                            colors={{
                                                background: 'bg-white',
                                                border: 'border-gray-300',
                                                text: 'text-gray-900',
                                                placeholder: 'placeholder-gray-500',
                                                focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                                hover: '',
                                                error: 'border-red-500'
                                            }}
                                            error={errors.nomEn ? t('common.dishNameRequired') : undefined}
                                        />
                                    </div>
                                    {/* Français à droite si site en anglais */}
                                    <div className="text-gray-700">
                                        <InputField
                                            type="text"
                                            value={nomFr}
                                            onChange={setNomFr}
                                            label={`${t('menu.dish.name')} (${t('common.french')})`}
                                            placeholder="Salade verte"
                                            size="md"
                                            width="full"
                                            colors={{
                                                background: 'bg-white',
                                                border: 'border-gray-300',
                                                text: 'text-gray-900',
                                                placeholder: 'placeholder-gray-500',
                                                focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                                hover: '',
                                                error: 'border-red-500'
                                            }}
                                            error={errors.nomFr ? t('common.dishNameRequired') : undefined}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Français à gauche si site en français */}
                                    <div className="text-gray-700">
                                        <InputField
                                            type="text"
                                            value={nomFr}
                                            onChange={setNomFr}
                                            label={`${t('menu.dish.name')} (${t('common.french')})`}
                                            placeholder="Salade verte"
                                            size="md"
                                            width="full"
                                            colors={{
                                                background: 'bg-white',
                                                border: 'border-gray-300',
                                                text: 'text-gray-900',
                                                placeholder: 'placeholder-gray-500',
                                                focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                                hover: '',
                                                error: 'border-red-500'
                                            }}
                                            error={errors.nomFr ? t('common.dishNameRequired') : undefined}
                                        />
                                    </div>
                                    {/* Anglais à droite si site en français */}
                                    <div className="text-gray-700">
                                        <InputField
                                            type="text"
                                            value={nomEn}
                                            onChange={setNomEn}
                                            label={`${t('menu.dish.name')} (${t('common.english')})`}
                                            placeholder="Green salad"
                                            size="md"
                                            width="full"
                                            colors={{
                                                background: 'bg-white',
                                                border: 'border-gray-300',
                                                text: 'text-gray-900',
                                                placeholder: 'placeholder-gray-500',
                                                focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                                hover: '',
                                                error: 'border-red-500'
                                            }}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Description - Deux colonnes */}
                        <div className="grid grid-cols-2 gap-4">
                            {isEnglish ? (
                                <>
                                    {/* Anglais à gauche si site en anglais */}
                                    <div className="text-gray-700">
                                        <InputField
                                            type="text"
                                            value={descriptionEn}
                                            onChange={setDescriptionEn}
                                            label={`${t('menu.dish.description')} (${t('common.english')})`}
                                            placeholder="Description"
                                            size="md"
                                            width="full"
                                            colors={{
                                                background: 'bg-white',
                                                border: 'border-gray-300',
                                                text: 'text-gray-900',
                                                placeholder: 'placeholder-gray-500',
                                                focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                                hover: '',
                                                error: 'border-red-500'
                                            }}
                                        />
                                    </div>
                                    {/* Français à droite si site en anglais */}
                                    <div className="text-gray-700">
                                        <InputField
                                            type="text"
                                            value={descriptionFr}
                                            onChange={setDescriptionFr}
                                            label={`${t('menu.dish.description')} (${t('common.french')})`}
                                            placeholder="Description"
                                            size="md"
                                            width="full"
                                            colors={{
                                                background: 'bg-white',
                                                border: 'border-gray-300',
                                                text: 'text-gray-900',
                                                placeholder: 'placeholder-gray-500',
                                                focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                                hover: '',
                                                error: 'border-red-500'
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
                                            value={descriptionFr}
                                            onChange={setDescriptionFr}
                                            label={`${t('menu.dish.description')} (${t('common.french')})`}
                                            placeholder="Description"
                                            size="md"
                                            width="full"
                                            colors={{
                                                background: 'bg-white',
                                                border: 'border-gray-300',
                                                text: 'text-gray-900',
                                                placeholder: 'placeholder-gray-500',
                                                focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                                hover: '',
                                                error: 'border-red-500'
                                            }}
                                        />
                                    </div>
                                    {/* Anglais à droite si site en français */}
                                    <div className="text-gray-700">
                                        <InputField
                                            type="text"
                                            value={descriptionEn}
                                            onChange={setDescriptionEn}
                                            label={`${t('menu.dish.description')} (${t('common.english')})`}
                                            placeholder="Description"
                                            size="md"
                                            width="full"
                                            colors={{
                                                background: 'bg-white',
                                                border: 'border-gray-300',
                                                text: 'text-gray-900',
                                                placeholder: 'placeholder-gray-500',
                                                focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                                hover: '',
                                                error: 'border-red-500'
                                            }}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Section */}
                        <div>
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
                                                                        border: errors.sectionEn && !sectionEn.trim() ? 'border-red-500' : 'border-gray-300',
                                                                        text: 'text-gray-900',
                                                                        placeholder: 'placeholder-gray-500',
                                                                        focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                                                        hover: '',
                                                                        error: 'border-red-500'
                                                                    }}
                                                                    error={errors.sectionEn && creerNouvelleSection && !sectionEn.trim() ? t('common.sectionRequired') : undefined}
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
                                                                        border: errors.sectionFr && !sectionFr.trim() ? 'border-red-500' : 'border-gray-300',
                                                                        text: 'text-gray-900',
                                                                        placeholder: 'placeholder-gray-500',
                                                                        focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                                                        hover: '',
                                                                        error: 'border-red-500'
                                                                    }}
                                                                    error={errors.sectionFr && creerNouvelleSection && !sectionFr.trim() ? t('common.sectionRequired') : undefined}
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
                                                                        border: errors.sectionFr && !sectionFr.trim() ? 'border-red-500' : 'border-gray-300',
                                                                        text: 'text-gray-900',
                                                                        placeholder: 'placeholder-gray-500',
                                                                        focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                                                        hover: '',
                                                                        error: 'border-red-500'
                                                                    }}
                                                                    error={errors.sectionFr && creerNouvelleSection && !sectionFr.trim() ? t('common.sectionRequired') : undefined}
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
                                                                        border: errors.sectionEn && !sectionEn.trim() ? 'border-red-500' : 'border-gray-300',
                                                                        text: 'text-gray-900',
                                                                        placeholder: 'placeholder-gray-500',
                                                                        focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                                                        hover: '',
                                                                        error: 'border-red-500'
                                                                    }}
                                                                    error={errors.sectionEn && creerNouvelleSection && !sectionEn.trim() ? t('common.sectionRequired') : undefined}
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
                            {errors.sectionFr && !creerNouvelleSection && !sectionFr && (
                                <p className="text-red-500 text-sm mt-1">{t('common.sectionRequired')}</p>
                            )}
                            {errors.sectionEn && !creerNouvelleSection && !sectionEn && (
                                <p className="text-red-500 text-sm mt-1">{t('common.sectionRequired')}</p>
                            )}
                        </div>

                        {/* Encadré vert avec instructions */}
                        <div className="bg-green-50 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-[#12B76A] bg-transparent flex items-center justify-center">
                                    <span className="text-[#12B76A] text-xs font-bold">i</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-green-800 mb-2">
                                        {t('menu.dish.aromaInfo')}
                                    </p>
                                    <p className="text-sm text-green-800 font-medium">
                                        {t('menu.dish.aromaExample')}
                                    </p>
                                    <ul className="text-sm text-green-800 mt-1 ml-4 list-disc">
                                        <li>{t('menu.dish.aromaExampleMain')}</li>
                                        <li>{t('menu.dish.aromaExampleSecondary')}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Arôme principal */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className={`block text-sm font-medium ${errors.aromePrincipal ? 'text-red-700' : 'text-gray-700'}`}>
                                    {t('menu.dish.mainAroma')} <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowExamplesModal(true)}
                                    className="w-5 h-5 rounded-full border-2 border-black hover:bg-gray-100 flex items-center justify-center transition-colors"
                                    title="Voir les exemples d'arômes"
                                >
                                    <span className="text-black text-xs font-bold">i</span>
                                </button>
                            </div>
                            <Select
                                value={aromePrincipal}
                                onChange={handleAromePrincipalChange}
                                options={createOptionsAromes(t)}
                                placeholder={t('common.selectMainAroma')}
                                size="md"
                                width="full"
                                colors={{
                                    background: 'bg-white',
                                    border: errors.aromePrincipal ? 'border-red-500' : 'border-gray-300',
                                    text: 'text-gray-900',
                                    placeholder: 'placeholder-gray-500',
                                    focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                    hover: ''
                                }}
                            />
                            {errors.aromePrincipal && (
                                <p className="text-red-500 text-sm mt-1">{t('common.mainAromaRequired')}</p>
                            )}
                        </div>

                        {/* Arômes secondaires */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">{t('menu.dish.secondaryAromas')} ({t('common.add')})</label>
                            <List
                                items={aromesSecondaires}
                                onItemsChange={handleAromesSecondairesChange}
                                fields={[
                                    {
                                        key: 'label',
                                        label: 'Arôme',
                                        type: 'select',
                                        options: createOptionsAromes(t)
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
                                    addButton: 'bg-[#3E4784] text-white hover:bg-[#2D3A6B] hover:shadow-md transform transition-all duration-200 ease-in-out',
                                    deleteButton: 'text-gray-400',
                                    deleteButtonHover: '',
                                    optionHover: 'hover:bg-gray-50',
                                    optionSelected: 'bg-purple-50 text-purple-700'
                                }}
                            />
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
                            <div className="p-6 overflow-y-auto flex-1">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-white">{t('menu.dish.examplesTitle')}</h3>
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
                                
                                <div className="space-y-4">
                                    {/* Fromage */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-2">{t('menu.dish.examplesCategories.cheese')}</h3>
                                        <div className="space-y-1.5 text-sm text-white/90">
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
                                        <h3 className="text-lg font-semibold text-white mb-2">{t('menu.dish.examplesCategories.proteins')}</h3>
                                        <div className="space-y-1.5 text-sm text-white/90">
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
                                        <h3 className="text-lg font-semibold text-white mb-2">{t('menu.dish.examplesCategories.vegetables')}</h3>
                                        <div className="space-y-1.5 text-sm text-white/90">
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
                                        <h3 className="text-lg font-semibold text-white mb-3">{t('menu.dish.examplesCategories.spices')}</h3>
                                        <div className="space-y-2 text-sm text-white/90">
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

                {/* Boutons d'action - en dehors de la zone scrollable */}
                <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 flex justify-start gap-4">
                        <Button
                        type="button"
                        onClick={() => handleSubmit()}
                            className="bg-[#3E4784] text-white hover:bg-[#2D3A6B] hover:shadow-lg transform transition-all duration-200 ease-in-out"
                        >
                            Valider
                        </Button>
                        <Button
                        type="button"
                        onClick={() => onClose()}
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                        >
                            {t('common.cancel')}
                        </Button>
                </div>
            </div>
        </div>
    );
}
