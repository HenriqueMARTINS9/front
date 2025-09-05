"use client";
import React, { useState, useRef } from 'react';
import MotsCles from './MotsCles';
import Button from './Button';
import Checkbox from './Checkbox';
import RadioButton from './RadioButton';
import Select from './Select';
import InputField from './InputField';
import InputRow from './InputRow';
import List from './List';

type ModalNouveauVinProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (wineData: any) => void;
};

export default function ModalNouveauVin({ isOpen, onClose, onSave }: ModalNouveauVinProps) {
    // États pour les checkboxes des restaurants
    const [restaurantChecks, setRestaurantChecks] = useState<boolean[]>([true, true, true, false]);

    // État pour le type de vin sélectionné
    const [selectedWineType, setSelectedWineType] = useState('Blanc');

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
    const [formats, setFormats] = useState([{ id: '1', nom: '', capacite: '', prix: 0 }]);

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

    const handleFormatsChange = (items: any[]) => {
        setFormats(items.map(item => ({
            id: item.id,
            nom: item.nom || '',
            capacite: item.capacite || '',
            prix: item.prix || 0
        })));
    };

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
        if (cepages.length === 0 || !cepages[0].nom.trim()) {
            newErrors.cepages = true;
        }
        if (formats.length === 0 || !formats[0].nom.trim()) {
            newErrors.formats = true;
        }

        setErrors(newErrors);

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

        return Object.keys(newErrors).length === 0;
    };

    // Gestionnaire pour la soumission
    const handleSubmit = () => {
        if (!validateForm()) {
            return; // Arrêter si validation échoue
        }

        // S'assurer que le prix est un nombre
        const prix = formats.length > 0 ? parseFloat(formats[0].prix?.toString()) || 0 : 0;
        
        // Créer un objet vin avec la structure correcte
        const wineData = {
            nom: wineName,
            subname: domaine,
            type: selectedWineType,
            cepage: cepages.length > 0 ? cepages[0].nom : '',
            region: aocRegion,
            pays: pays,
            millesime: parseInt(millesime) || 2024,
            prix: prix,
            restaurant: 'Restaurant Principal',
            pointsDeVente: restaurantChecks as [boolean, boolean, boolean, boolean],
            motsCles: [
                { id: 'mc1', label: 'Nouveau vin', color: 'bg-[#FFFAEB]', textColor: 'text-[#B54708]' }
            ]
        };
        onSave(wineData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#0000005F] bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-300">
            <div className="bg-gray-50 rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] shadow-sm focus:shadow-sm focus:shadow-gray-100 focus:shadow-[4px] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                <div className="p-8 overflow-y-auto flex-1">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-4xl font-bold text-gray-900 mb-2">Nouveau vin</h2>
                    <p className="text-gray-900 text-md">Remplir tous les champs le plus précisément possible afin d'assurer des recommendations optimales.</p>
                </div>

                <div className="space-y-6">
                    {/* Type de vin */}
                    <div>
                        <label className="block text-md font-medium text-gray-900 mb-3">Type de vin</label>
                        <div className="grid grid-cols-3 gap-4">
                            <RadioButton
                                name="wine-type"
                                value="Mousseux"
                                checked={selectedWineType === 'Mousseux'}
                                onChange={() => handleWineTypeChange('Mousseux')}
                                size="lg"
                                colors={{
                                    unchecked: 'border-gray-300 bg-white',
                                    checked: 'border-[#7F56D9] bg-white',
                                    focus: 'focus:ring-[#C4B5FD]',
                                    dot: 'bg-[#7F56D9]'
                                }}
                                className="flex items-center justify-start"
                            >
                                <span className="text-sm text-gray-700">Vin mousseux</span>
                            </RadioButton>
                            <RadioButton
                                name="wine-type"
                                value="Blanc"
                                checked={selectedWineType === 'Blanc'}
                                onChange={() => handleWineTypeChange('Blanc')}
                                size="lg"
                                colors={{
                                    unchecked: 'border-gray-300 bg-white',
                                    checked: 'border-[#7F56D9] bg-purple-50',
                                    focus: 'focus:ring-[#C4B5FD]',
                                    dot: 'bg-[#7F56D9]'
                                }}
                                className="flex items-center justify-start"
                            >
                                <span className="text-sm text-gray-700">Vin blanc</span>
                            </RadioButton>
                            <RadioButton
                                name="wine-type"
                                value="Rouge"
                                checked={selectedWineType === 'Rouge'}
                                onChange={() => handleWineTypeChange('Rouge')}
                                size="lg"
                                colors={{
                                    unchecked: 'border-gray-300 bg-white',
                                    checked: 'border-[#7F56D9] bg-purple-50',
                                    focus: 'focus:ring-[#C4B5FD]',
                                    dot: 'bg-[#7F56D9]'
                                }}
                                className="flex items-center justify-start"
                            >
                                <span className="text-sm text-gray-700">Vin rouge</span>
                            </RadioButton>
                            <RadioButton
                                name="wine-type"
                                value="Rosé"
                                checked={selectedWineType === 'Rosé'}
                                onChange={() => handleWineTypeChange('Rosé')}
                                size="lg"
                                colors={{
                                    unchecked: 'border-gray-300 bg-white',
                                    checked: 'border-[#7F56D9] bg-purple-50',
                                    focus: 'focus:ring-[#C4B5FD]',
                                    dot: 'bg-[#7F56D9]'
                                }}
                                className="flex items-center justify-start"
                            >
                                <span className="text-sm text-gray-700">Vin rosé</span>
                            </RadioButton>
                            <RadioButton
                                name="wine-type"
                                value="Orange"
                                checked={selectedWineType === 'Orange'}
                                onChange={() => handleWineTypeChange('Orange')}
                                size="lg"
                                colors={{
                                    unchecked: 'border-gray-300 bg-white',
                                    checked: 'border-[#7F56D9] bg-purple-50',
                                    focus: 'focus:ring-[#C4B5FD]',
                                    dot: 'bg-[#7F56D9]'
                                }}
                                className="flex items-center justify-start"
                            >
                                <span className="text-sm text-gray-700">Vin orange</span>
                            </RadioButton>
                            <RadioButton
                                name="wine-type"
                                value="Fortifié"
                                checked={selectedWineType === 'Fortifié'}
                                onChange={() => handleWineTypeChange('Fortifié')}
                                size="lg"
                                colors={{
                                    unchecked: 'border-gray-300 bg-white',
                                    checked: 'border-[#7F56D9] bg-purple-50',
                                    focus: 'focus:ring-[#C4B5FD]',
                                    dot: 'bg-[#7F56D9]'
                                }}
                                className="flex items-center justify-start"
                            >
                                <span className="text-sm text-gray-700">Vin fortifié</span>
                            </RadioButton>
                            <RadioButton
                                name="wine-type"
                                value="moelleux / liquoreux"
                                checked={selectedWineType === 'moelleux / liquoreux'}
                                onChange={() => handleWineTypeChange('moelleux / liquoreux')}
                                size="lg"
                                colors={{
                                    unchecked: 'border-gray-300 bg-white',
                                    checked: 'border-[#7F56D9] bg-purple-50',
                                    focus: 'focus:ring-[#C4B5FD]',
                                    dot: 'bg-[#7F56D9]'
                                }}
                                className="flex items-center justify-start"
                            >
                                <span className="text-sm text-gray-700">Vin moelleux / liquoreux</span>
                            </RadioButton>
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
                                label="Nom du vin"
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
                                error={errors.wineName ? "Le nom du vin est requis" : undefined}
                            />
                        </div>

                        {/* Domaine 3/4 + Millésime 1/4 */}
                        <div className="grid grid-cols-4 gap-6">
                            <div className="col-span-3 ">
                                <InputField
                                    type="text"
                                    value={domaine}
                                    onChange={setDomaine}
                                    label="Domaine / producteur"
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
                                    error={errors.domaine ? "Le domaine est requis" : undefined}
                                />
                            </div>
                            <div className="col-span-1 ">
                                <InputField
                                    type="number"
                                    value={millesime}
                                    onChange={setMillesime}
                                    label="Millésime"
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
                                    error={errors.millesime ? "Le millésime est requis" : undefined}
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
                                    label="Région / AOC"
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
                                    error={errors.aocRegion ? "La région est requise" : undefined}
                                />
                            </div>
                            <div className="col-span-2 ">
                                <InputField
                                    type="text"
                                    value={pays}
                                    onChange={setPays}
                                    label="Pays"
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
                                    error={errors.pays ? "Le pays est requis" : undefined}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cépage(s) */}
                    <div className="col-span-6">
                        <label className="block text-md font-medium text-gray-700 mb-2">Cépage(s)</label>
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
                                    <div className="text-sm font-medium text-gray-700">Je ne connais pas les proportions de l'assemblage</div>
                                    <p className="text-sm text-gray-500 mt-1">Ajouter les % permet une plus grande précision des recommandations proposées à vos clients.</p>
                                </div>
                            </Checkbox>
                        </div>
                        <List
                            items={cepages}
                            onItemsChange={handleCepagesChange}
                            fields={[
                                {
                                    key: 'nom',
                                    label: 'Nom du cépage',
                                    type: 'text',
                                    placeholder: 'Nom du cépage',
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
                            addButtonText="Ajouter un cépage"
                            emptyMessage="Aucun cépage ajouté"
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
                                addButton: 'bg-[#3E4784] text-white hover:bg-[#2D3A6B] hover:shadow-md transform transition-all duration-200 ease-in-out',
                                optionHover: 'hover:bg-gray-50',
                                optionSelected: 'bg-purple-50 text-purple-700'
                            }}
                        />
                        {errors.cepages && (
                            <p className="text-red-500 text-sm mt-1">Au moins un cépage est requis</p>
                        )}
                    </div>

                    {/* Restaurants */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-3">Dans quels restaurants ce vin est-il disponible ?</label>
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
                                    <span className="ml-3 text-sm text-gray-700 baseline align-">Restaurant {index + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Formats disponibles */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Formats disponibles</label>
                        <List
                            items={formats}
                            onItemsChange={handleFormatsChange}
                            title=""
                            addButtonText="Ajouter un format"
                            colors={{
                                background: 'bg-white',
                                border: 'border-gray-300',
                                text: 'text-gray-900',
                                placeholder: 'placeholder-gray-500',
                                focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                hover: '',
                                addButton: 'bg-[#3E4784] text-white hover:bg-[#2D3A6B] hover:shadow-md transform transition-all duration-200 ease-in-out',
                                deleteButton: '',
                                deleteButtonHover: '',
                                suffix: 'text-gray-500',
                                optionHover: 'hover:bg-gray-50',
                                optionSelected: ''
                            }}
                            fields={[
                                {
                                    key: 'nom', label: 'Format', type: 'select', options: [
                                        { value: 'Magnum (150 cl)', label: 'Magnum (150 cl)' },
                                        { value: 'Bouteille (75 cl)', label: 'Bouteille (75 cl)' },
                                        { value: 'Désirée (50 cl)', label: 'Désirée (50 cl)' },
                                        { value: 'Demi-bouteille (37.5 cl)', label: 'Demi-bouteille (37.5 cl)' },
                                        { value: 'Verre (10 cl)', label: 'Verre (10 cl)' }
                                    ]
                                },
                                { key: 'prix', label: 'Prix (CHF)', type: 'text', placeholder: '42.00', suffix: ' CHF', width: 'full' }
                            ]}
                        />
                        {errors.formats && (
                            <p className="text-red-500 text-sm mt-1">Au moins un format est requis</p>
                        )}
                    </div>

                    {/* Mots clés */}
                    <div>
                        <MotsCles motsCles={[
                            {id: '1', label: 'Label', color: 'bg-[#FFFAEB]', textColor: 'text-[#B54708]'},
                            {id: '2', label: 'Label', color: 'bg-[#FFFAEB]', textColor: 'text-[#B54708]'},
                            {id: '3', label: 'Label', color: 'bg-[#FFFAEB]', textColor: 'text-[#B54708]'},
                            {id: '4', label: 'Label', color: 'bg-[#FFFAEB]', textColor: 'text-[#B54708]'}
                            ]} />
                    </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-start gap-4 mt-8 pt-6">
                    <Button
                        onClick={handleSubmit}
                        className="bg-[#3E4784] text-white hover:bg-[#2D3A6B] hover:shadow-lg transform transition-all duration-200 ease-in-out"
                    >
                        Valider
                    </Button>
                    <Button
                        onClick={onClose}
                        className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                    >
                        Annuler
                    </Button>

                                 </div>
                </div>
             </div>
         </div>
     );
 }
