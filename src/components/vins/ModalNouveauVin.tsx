"use client";
import React, { useState, useRef, useEffect } from 'react';
import MotsCles from './MotsCles';
import Button from '../common/Button';
import Checkbox from '../common/Checkbox';
import RadioButton from '../common/RadioButton';
import Select from '../common/Select';
import InputField from '../common/InputField';
import InputRow from '../common/InputRow';
import List from '../common/List';
import { useTranslation } from '@/lib/useTranslation';
import { createCepagesOptions } from '@/lib/cepages';

type ModalNouveauVinProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (wineData: any) => void;
};

export default function ModalNouveauVin({ isOpen, onClose, onSave }: ModalNouveauVinProps) {
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language === 'en';
    
    // Mapping bidirectionnel entre types français et anglais
    const wineTypeTranslationMap: Record<string, string> = {
        // Français -> Anglais
        'Mousseux': 'Sparkling',
        'Blanc': 'White',
        'Rouge': 'Red',
        'Rosé': 'Rosé',
        'Orange': 'Orange',
        'Fortifié': 'Fortified',
        'Doux': 'Sweet',
        'Moelleux ou liquoreux': 'Old White',
        // Anglais -> Français
        'Sparkling': 'Mousseux',
        'White': 'Blanc',
        'Red': 'Rouge',
        'Fortified': 'Fortifié',
        'Sweet': 'Doux',
        'Old White': 'Moelleux ou liquoreux',
    };
    
    // Liste des types de vins avec leurs valeurs internes et traductions
    // Afficher uniquement ceux dans la langue choisie
    const wineTypes = isEnglish 
        ? [
            { value: 'Sparkling', label: t('common.sparklingWine') },
            { value: 'White', label: t('common.whiteWine') },
            { value: 'Red', label: t('common.redWine') },
            { value: 'Rosé', label: t('common.roseWine') },
            { value: 'Orange', label: t('common.orangeWine') },
            { value: 'Fortified', label: t('common.fortifiedWine') },
            { value: 'Sweet', label: t('common.sweetWine') },
            { value: 'Old White', label: t('common.oldWhiteWine') },
        ]
        : [
            { value: 'Mousseux', label: t('common.sparklingWine') },
            { value: 'Blanc', label: t('common.whiteWine') },
            { value: 'Rouge', label: t('common.redWine') },
            { value: 'Rosé', label: t('common.roseWine') },
            { value: 'Orange', label: t('common.orangeWine') },
            { value: 'Fortifié', label: t('common.fortifiedWine') },
            { value: 'Doux', label: t('common.sweetWine') },
            { value: 'Moelleux ou liquoreux', label: t('common.oldWhiteWine') },
        ];
    
    // États pour les checkboxes des restaurants (seulement restaurant 1)
    const [restaurantChecks, setRestaurantChecks] = useState<boolean[]>([true]);

    // État pour le type de vin sélectionné - initialiser avec le type par défaut selon la langue
    const [selectedWineType, setSelectedWineType] = useState(isEnglish ? 'White' : 'Blanc');
    
    // Traduire automatiquement le type sélectionné quand la langue change
    const previousLanguageRef = useRef<string>(i18n.language);
    useEffect(() => {
        // Ne traduire que si la langue a vraiment changé
        if (previousLanguageRef.current !== i18n.language) {
            previousLanguageRef.current = i18n.language;
            const translatedType = wineTypeTranslationMap[selectedWineType];
            if (translatedType) {
                // Vérifier si le type traduit existe dans la liste des types disponibles
                const translatedTypeExists = wineTypes.some(wt => wt.value === translatedType);
                if (translatedTypeExists && translatedType !== selectedWineType) {
                    setSelectedWineType(translatedType);
                }
            }
        }
    }, [i18n.language, selectedWineType, wineTypes]);

    // État pour la checkbox "proportions inconnues"
    const [unknownProportions, setUnknownProportions] = useState(false);

    // États pour les champs de saisie
    const [wineName, setWineName] = useState('');
    const [millesime, setMillesime] = useState('');
    const [domaine, setDomaine] = useState('');
    const [aocRegion, setAocRegion] = useState('');
    const [pays, setPays] = useState('');

    // États pour les listes
    const [cepages, setCepages] = useState([{ id: '1', nom: '', pourcentage: 0 }]);
    // Initialiser le format avec le premier format disponible (Magnum)
    const [format, setFormat] = useState({ nom: 'Magnum (150 cl)', prix: 0 });

    // Réinitialiser le formulaire quand le modal s'ouvre
    useEffect(() => {
        if (isOpen) {
            setWineName('');
            setMillesime('');
            setDomaine('');
            setAocRegion('');
            setPays('');
            setCepages([{ id: '1', nom: '', pourcentage: 0 }]);
            // Initialiser avec le premier format disponible (Magnum)
            setFormat({ nom: 'Magnum (150 cl)', prix: 0 });
            setErrors({});
            setSelectedWineType(isEnglish ? 'White' : 'Blanc');
            setUnknownProportions(false);
            setRestaurantChecks([true]);
        }
    }, [isOpen]);
    // const [motsCles, setMotsCles] = useState([{ id: '1', label: '', color: 'bg-[#FFFAEB]', textColor: 'text-[#B54708]' }]);

    // États pour les erreurs de validation
    const [errors, setErrors] = useState<{[key: string]: boolean}>({});

    // Références pour les champs
    const wineNameRef = useRef<HTMLInputElement>(null);
    const domaineRef = useRef<HTMLInputElement>(null);
    const millesimeRef = useRef<HTMLInputElement>(null);
    const aocRegionRef = useRef<HTMLInputElement>(null);
    const paysRef = useRef<HTMLInputElement>(null);

    // Gestionnaires pour les listes
    const handleCepagesChange = (items: any[]) => {
        setCepages(items.map(item => ({
            id: item.id,
            nom: item.nom || '',
            pourcentage: item.pourcentage || 0
        })));
    };

    const handleFormatChange = (field: string, value: any) => {
        console.log('handleFormatChange appelé:', { field, value });
        setFormat(prev => {
            const newFormat = {
            ...prev,
            [field]: value
            };
            console.log('Nouveau format:', newFormat);
            return newFormat;
        });
    };

    // const handleMotsClesChange = (items: any[]) => {
    //     setMotsCles(items.map(item => ({
    //         id: item.id,
    //         label: item.label || '',
    //         color: item.color || 'bg-[#FFFAEB]',
    //         textColor: item.textColor || 'text-[#B54708]'
    //     })));
    // };

    // Gestionnaires pour les checkboxes des restaurants
    const handleRestaurantCheck = (index: number, checked: boolean) => {
        const newChecks = [...restaurantChecks];
        newChecks[index] = checked;
        setRestaurantChecks(newChecks);
    };

    // Gestionnaire pour le type de vin
    const handleWineTypeChange = (type: string) => {
        setSelectedWineType(type);
    };

    // Fonction de validation
    const validateForm = () => {
        const newErrors: {[key: string]: boolean} = {};
        
        // Validation des champs obligatoires
        if (!wineName.trim()) {
            newErrors.wineName = true;
        }
        if (!domaine.trim()) {
            newErrors.domaine = true;
        }
        if (!millesime.trim()) {
            newErrors.millesime = true;
        }
        if (!aocRegion.trim()) {
            newErrors.aocRegion = true;
        }
        if (!pays.trim()) {
            newErrors.pays = true;
        }
        console.log('Vérification du format:', { formatNom: format.nom, formatNomTrim: format.nom?.trim(), isEmpty: !format.nom?.trim() });
        if (!format.nom || !format.nom.trim()) {
            newErrors.format = true;
        }

        setErrors(newErrors);
        
        const isValid = Object.keys(newErrors).length === 0;
        console.log('Validation du formulaire:', { isValid, errors: newErrors });

        // Focus sur le premier champ en erreur
        if (newErrors.wineName && wineNameRef.current) {
            wineNameRef.current.focus();
        } else if (newErrors.domaine && domaineRef.current) {
            domaineRef.current.focus();
        } else if (newErrors.millesime && millesimeRef.current) {
            millesimeRef.current.focus();
        } else if (newErrors.aocRegion && aocRegionRef.current) {
            aocRegionRef.current.focus();
        } else if (newErrors.pays && paysRef.current) {
            paysRef.current.focus();
        }

        return isValid;
    };

    // Gestionnaire pour la soumission
    const handleSubmit = (e?: React.MouseEvent<HTMLButtonElement>) => {
        // Empêcher le comportement par défaut si c'est un événement
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        console.log('handleSubmit appelé');
        
        if (!validateForm()) {
            console.log('Validation échouée, erreurs:', errors);
            return; // Arrêter si validation échoue
        }

        console.log('Validation réussie, création du vin...');

        // S'assurer que le prix est un nombre
        const prix = parseFloat(format.prix?.toString()) || 0;
        
        // Créer un objet vin avec la structure correcte
        const wineData = {
            nom: wineName,
            subname: domaine,
            type: selectedWineType,
            cepage: cepages.length > 0 ? cepages[0].nom : '',
            cepages: cepages.map(c => ({ 
                id: c.id, 
                nom: c.nom || '', // Le nom est maintenant l'ID (string)
                pourcentage: typeof c.pourcentage === 'string' ? parseFloat(c.pourcentage) || 0 : (c.pourcentage || 0)
            })),
            region: aocRegion,
            pays: pays,
            millesime: parseInt(millesime) || 2024,
            prix: prix,
            format: format.nom,
            formats: [{ id: '1', nom: format.nom, prix: prix }],
            restaurant: 'Restaurant Principal',
            pointsDeVente: restaurantChecks as [boolean],
            // motsCles: motsCles.filter(mc => mc.label.trim() !== '') // Filtrer les mots-clés vides
        };
        
        console.log('Données du vin à sauvegarder:', wineData);
        
        try {
        onSave(wineData);
        onClose();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-[#0000005F] bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-300"
        >
            <div className="bg-gray-50 rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] shadow-sm focus:shadow-sm focus:shadow-gray-100 focus:shadow-[4px] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                <div className="p-8 overflow-y-auto flex-1">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-4xl font-bold text-gray-900 mb-2">{t('common.newWine')}</h2>
                    <p className="text-gray-900 text-md">{t('common.fillFieldsPrecisely')}</p>
                </div>

                <div className="space-y-6">
                    {/* Type de vin */}
                    <div>
                        <label className="block text-md font-medium text-gray-900 mb-3">{t('wines.wine.type')}</label>
                        <div className="grid grid-cols-3 gap-4">
                            {wineTypes.map((wineType) => (
                                <RadioButton
                                    key={wineType.value}
                                    name="wine-type"
                                    value={wineType.value}
                                    checked={selectedWineType === wineType.value}
                                    onChange={() => handleWineTypeChange(wineType.value)}
                                    size="lg"
                                    colors={{
                                        unchecked: 'border-gray-300 bg-white',
                                        checked: 'border-[#7F56D9] bg-purple-50',
                                        focus: 'focus:ring-[#C4B5FD]',
                                        dot: 'bg-[#7F56D9]'
                                    }}
                                    className="flex items-center justify-start"
                                >
                                    <span className="text-sm text-gray-700">{wineType.label}</span>
                                </RadioButton>
                            ))}
                        </div>
                    </div>

                    {/* Informations de base */}
                    <div className="space-y-6">
                        {/* Nom du vin - toute la ligne */}
                        <div className="w-full ">
                            <InputField
                                type="text"
                                value={wineName}
                                onChange={setWineName}
                                label={t('wines.wine.name')}
                                placeholder="Château La Pompe"
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
                                ref={wineNameRef}
                                error={errors.wineName ? t('common.wineNameRequired') : undefined}
                            />
                        </div>

                        {/* Domaine 3/4 + Millésime 1/4 */}
                        <div className="grid grid-cols-4 gap-6">
                            <div className="col-span-3 ">
                                <InputField
                                    type="text"
                                    value={domaine}
                                    onChange={setDomaine}
                                    label={t('common.domainProducer')}
                                    placeholder="Domaine de la Harpe"
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
                                    ref={domaineRef}
                                    error={errors.domaine ? t('common.domainRequired') : undefined}
                                />
                            </div>
                            <div className="col-span-1 ">
                                <InputField
                                    type="number"
                                    value={millesime}
                                    onChange={setMillesime}
                                    label={t('wines.wine.vintage')}
                                    placeholder="2021"
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
                                    ref={millesimeRef}
                                    error={errors.millesime ? t('common.vintageRequired') : undefined}
                                />
                            </div>
                        </div>

                        {/* Région AOC 4/6 + Pays 2/6 */}
                        <div className="grid grid-cols-6 gap-6">
                            <div className="col-span-4 ">
                                <InputField
                                    type="text"
                                    value={aocRegion}
                                    onChange={setAocRegion}
                                    label={t('wines.wine.region')}
                                    placeholder="La Côte"
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
                                    ref={aocRegionRef}
                                    error={errors.aocRegion ? t('common.regionRequired') : undefined}
                                />
                            </div>
                            <div className="col-span-2 ">
                                <InputField
                                    type="text"
                                    value={pays}
                                    onChange={setPays}
                                    label={t('wines.wine.country')}
                                    placeholder="Suisse"
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
                                    ref={paysRef}
                                    error={errors.pays ? t('common.countryRequired') : undefined}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cépage(s) */}
                    <div className="col-span-6">
                        <label className="block text-md font-medium text-gray-700 mb-2">{t('wines.wine.grape')}</label>
                        <div className="flex items-start gap-3 mb-3">
                            <Checkbox
                                id={`unknown-proportions`}
                                checked={unknownProportions}
                                onChange={setUnknownProportions}
                                size="md"
                                colors={{
                                    unchecked: 'border-gray-300 bg-white',
                                    checked: 'border-[#7C3AED] bg-[#7C3AED]',
                                    focus: 'focus:ring-[#C4B5FD]'
                                }}
                                className="mt-1"
                            >
                                <div>
                                    <div className="text-sm font-medium text-gray-700">{t('common.unknownProportions')}</div>
                                    <p className="text-sm text-gray-500 mt-1">{t('common.proportionsHelp')}</p>
                                </div>
                            </Checkbox>
                        </div>
                        {!unknownProportions && (
                        <List
                            items={cepages}
                            onItemsChange={handleCepagesChange}
                            fields={[
                                {
                                    key: 'nom',
                                    label: t('common.grapeVarietyName'),
                                    type: 'select',
                                    options: createCepagesOptions(),
                                    width: 'full'
                                },
                                {
                                    key: 'pourcentage',
                                    label: '%',
                                    type: 'text',
                                    placeholder: '10',
                                    suffix: ' %',
                                    width: 'full'
                                }
                            ]}
                            addButtonText={t('common.addGrapeVariety')}
                            emptyMessage={t('common.noGrapeVarieties')}
                            size="md"
                                showAddButton={!unknownProportions}
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
                                addButton: 'bg-[#3E4784] text-white hover:bg-[#2D3A6B] hover:shadow-md transform transition-all duration-200 ease-in-out',
                                optionHover: 'hover:bg-gray-50',
                                optionSelected: 'bg-purple-50 text-purple-700'
                            }}
                        />
                        )}
                    </div>

                    {/* Restaurants */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-3">{t('common.whichRestaurants')}</label>
                        <div className="grid grid-cols-1 gap-4">
                            {restaurantChecks.map((checked, index) => (
                                <div key={index} className="flex items-start">
                                    <Checkbox
                                        checked={checked}
                                        onChange={(value) => handleRestaurantCheck(index, value)}
                                        colors={{
                                            unchecked: 'border-gray-300 bg-white',
                                            checked: 'border-[#7F56D9] bg-[#7F56D9]'
                                        }}
                                    />
                                    <span className="ml-3 text-sm text-gray-700 baseline align-">{t('common.restaurant')} {index + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Format du vin */}
                    <div className="grid grid-cols-3 gap-6 items-end">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-3">{t('common.format')}</label>
                            <Select
                                value={format.nom || ''}
                                onChange={(value) => {
                                    console.log('Select onChange appelé avec valeur:', value);
                                    handleFormatChange('nom', value);
                                }}
                                options={[
                                    { value: 'Magnum (150 cl)', label: t('common.magnum') },
                                    { value: 'Bouteille (75 cl)', label: t('common.bottle') },
                                    { value: 'Désirée (50 cl)', label: t('common.desired') },
                                    { value: 'Demi-bouteille (37.5 cl)', label: t('common.halfBottle') },
                                    { value: 'Verre (10 cl)', label: t('common.glass') }
                                ]}
                                placeholder={t('common.format')}
                                size="md"
                                width="full"
                                position="top"
                                colors={{
                                    background: 'bg-white',
                                    border: errors.format ? 'border-red-500' : 'border-gray-300',
                                    text: 'text-gray-900',
                                    placeholder: 'placeholder-gray-500',
                                    focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                    hover: ''
                                }}
                            />
                            {errors.format && (
                                <p className="text-red-500 text-sm mt-1">{t('common.formatRequired')}</p>
                            )}
                        </div>
                        <div className="flex-shrink-0 w-[130px]">
                            <label className="block text-sm font-medium text-gray-700 mb-3">{t('wines.wine.price')}</label>
                            <InputField
                                type="number"
                                value={format.prix.toString()}
                                onChange={(value) => handleFormatChange('prix', parseFloat(value) || 0)}
                                placeholder="42.00"
                                suffix=" CHF"
                                size="md"
                                width="full"
                                className=""
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
                    </div>

                    {/* Mots clés - Désactivé */}
                    {/* <div>
                        <MotsCles 
                            motsCles={motsCles}
                            wineType={selectedWineType}
                            editable={true}
                            onMotsClesChange={handleMotsClesChange}
                        />
                    </div> */}
                </div>
                </div>

                {/* Boutons d'action - en dehors de la zone scrollable */}
                <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 flex justify-start gap-4">
                    <Button
                        type="button"
                        onClick={() => {
                            handleSubmit();
                        }}
                        className="bg-[#3E4784] text-white hover:bg-[#2D3A6B] hover:shadow-lg transform transition-all duration-200 ease-in-out"
                    >
                        {t('common.validate')}
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            onClose();
                        }}
                        className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                    >
                        {t('common.cancel')}
                    </Button>
                </div>
             </div>
         </div>
     );
 }
