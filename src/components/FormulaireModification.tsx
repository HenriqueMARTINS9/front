"use client";
import React, { useState } from 'react';
import MotsCles from './MotsCles';
import Button from './Button';
import Checkbox from './Checkbox';
import RadioButton from './RadioButton';
import Select from './Select';
import InputField from './InputField';
import InputRow from './InputRow';
import List from './List';
import type { Wine } from './TableauVin';
import { useTranslation } from '@/lib/useTranslation';

type FormulaireModificationProps = {
    wine: Wine;
    onSave: (wine: Wine) => void;
    onCancel: () => void;
    onDelete: (wineId: string) => void;
    onDataChange?: (data: { cepages?: any[], formats?: any[] }) => void;
};



export default function FormulaireModification({ wine, onSave, onCancel, onDelete, onDataChange }: FormulaireModificationProps) {
    const { t } = useTranslation();
    
    // États pour les checkboxes des restaurants
    const [restaurantChecks, setRestaurantChecks] = useState<boolean[]>(wine.pointsDeVente);
    
    // État pour le type de vin sélectionné
    const [selectedWineType, setSelectedWineType] = useState<Wine['type']>('Blanc');
    
    // État pour la checkbox "proportions inconnues"
    const [unknownProportions, setUnknownProportions] = useState(false);

    // États pour les champs de saisie
    const [wineName, setWineName] = useState(wine.name);
    const [millesime, setMillesime] = useState(wine.millesime);
    const [subname, setSubname] = useState(wine.subname || '');
    const [aocRegion, setAocRegion] = useState(wine.aocRegion || '');
    const [pays, setPays] = useState(wine.pays || '');
    
    // États pour les listes
    const [cepages, setCepages] = useState(wine.cepages.map(c => ({
        id: c.id,
        nom: c.nom,
        pourcentage: c.pourcentage
    })));
    
    const [format, setFormat] = useState(() => {
        // Prendre le premier format s'il existe, sinon valeurs par défaut
        const firstFormat = wine.formats[0];
        return {
            nom: firstFormat?.nom || '',
            prix: firstFormat?.prix || 0
        };
    });
    
    // const [motsCles, setMotsCles] = useState(wine.motsCles.map(mc => ({
    //     id: mc.id,
    //     label: mc.label,
    //     color: mc.color,
    //     textColor: mc.textColor
    // })));
    
    // Gestionnaires pour les listes
    const handleCepagesChange = (items: any[]) => {
        const newCepages = items.map(item => ({
            id: item.id,
            nom: item.nom || '',
            pourcentage: item.pourcentage || 0
        }));
        setCepages(newCepages);
        onDataChange?.({ cepages: newCepages });
    };
    
    const handleFormatChange = (field: string, value: any) => {
        const newFormat = {
            ...format,
            [field]: value
        };
        setFormat(newFormat);
        // Convertir en format de liste pour la compatibilité
        onDataChange?.({ formats: [newFormat] });
    };
    
    // const handleMotsClesChange = (items: any[]) => {
    //     const newMotsCles = items.map(item => ({
    //         id: item.id,
    //         label: item.label || '',
    //         color: item.color || 'bg-[#FFFAEB]',
    //         textColor: item.textColor || 'text-[#B54708]'
    //     }));
    //     setMotsCles(newMotsCles);
    // };

    // Gestionnaires pour les checkboxes des restaurants
    const handleRestaurantCheck = (index: number, checked: boolean) => {
        const newChecks = [...restaurantChecks];
        newChecks[index] = checked;
        setRestaurantChecks(newChecks);
    };

    // Gestionnaire pour le type de vin
    const handleWineTypeChange = (type: string) => {
        setSelectedWineType(type as Wine['type']);
    };

    return (
        <div className="space-y-6">
            {/* Formulaire de modification */}
            <div className="grid grid-cols-12 gap-6 items-stretch">
                <div className="col-span-6 pt-6">
                    <InputField
                        type="text"
                        value={wineName}
                        onChange={setWineName}
                        label="Nom du vin"
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
                <div className="col-span-1 pt-6">
                    <InputField
                        type="number"
                        value={millesime}
                        onChange={(value) => setMillesime(Number(value))}
                        label="Millésime"
                        size="md"
                        width="full"
                        className="min-w-[120px]"
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
                <div className="col-span-1" />
                {restaurantChecks.map((checked: boolean, idx: number) => (
                    <div key={idx} className="col-span-1 h-full">
                        <label className="flex flex-col justify-around items-center h-full text-center">
                            <div className="text-xs text-gray-700">Restaurant {idx + 1}</div>

                            <Checkbox
                                checked={checked}
                                onChange={(isChecked) => handleRestaurantCheck(idx, isChecked)}
                                size="md"
                                colors={{
                                    unchecked: 'border-gray-300',
                                    checked: 'border-[#7F56D9]',
                                    focus: 'focus:ring-[#C4B5FD]'
                                }}
                            />
                        </label>
                    </div>
                ))}

                <div className="col-span-6">
                    <InputField
                        type="text"
                        value={subname}
                        onChange={setSubname}
                        label="Domaine"
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
                <div className="col-span-1" />
                <div className="col-span-6">
                    <InputField
                        type="text"
                        value={aocRegion}
                        onChange={setAocRegion}
                        label="Région / AOC"
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
                
                <div className="col-span-4">
                    <InputField
                        type="text"
                        value={pays}
                        onChange={setPays}
                        label="Pays"
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
                {/* Type de vin */}
                <div className="col-span-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Type de vin</label>
                    <div className="grid grid-cols-2 gap-3 items-start">
                        {['Mousseux', 'Rosé', 'Blanc', 'Fortifié', 'Rouge', 'Sweet', 'Old White', 'Sparkling', 'Red', 'White'].map((type) => (
                            <RadioButton
                                key={type}
                                name={`type-${wine.id}`}
                                value={type}
                                checked={type === selectedWineType}
                                onChange={() => handleWineTypeChange(type)}
                                size="lg"
                                colors={{
                                    unchecked: 'border-gray-300 bg-white',
                                    checked: 'border-[#7C3AED] bg-white',
                                    focus: 'focus:ring-[#C4B5FD]',
                                    dot: 'bg-[#7C3AED]'
                                }}
                                className="flex items-center justify-start"
                            >
                                <span className="text-sm text-gray-700">{type}</span>
                            </RadioButton>
                        ))}
                    </div>
                </div>
                <div className="col-span-9" />
                {/* Cépage(s) */}
                <div className="col-span-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cépage(s)</label>
                    <div className="flex items-start gap-3 mb-3">
                        <Checkbox
                            id={`unknown-proportions-${wine.id}`}
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
                                <div className="text-sm text-gray-700">Je ne connais pas les proportions de l'assemblage</div>
                                <p className="text-xs text-gray-500 mt-1">Ajouter les % permet une plus grande précision des recommandations proposées à vos clients.</p>
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
                            addButton: 'bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition-colors duration-200'
                        }}
                    />
                    )}
                </div>
                <div className="col-span-6" />
                {/* Format du vin */}
                <div className="col-span-6">
                    <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Format</label>
                            <Select
                                value={format.nom}
                                onChange={(value) => handleFormatChange('nom', value)}
                                options={[
                                    { value: 'Magnum (150 cl)', label: 'Magnum (150 cl)' },
                                    { value: 'Bouteille (75 cl)', label: 'Bouteille (75 cl)' },
                                    { value: 'Désirée (50 cl)', label: 'Désirée (50 cl)' },
                                    { value: 'Demi-bouteille (37.5 cl)', label: 'Demi-bouteille (37.5 cl)' },
                                    { value: 'Verre (10 cl)', label: 'Verre (10 cl)' }
                                ]}
                                placeholder="Sélectionner un format"
                                size="md"
                                width="full"
                                position="top"
                                colors={{
                                    background: 'bg-white',
                                    border: 'border-gray-300',
                                    text: 'text-gray-900',
                                    placeholder: 'placeholder-gray-500',
                                    focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs',
                                    hover: ''
                                }}
                            />
                        </div>
                        <div className="flex-shrink-0 w-[130px]">
                            <InputField
                                type="number"
                                value={format.prix.toString()}
                                onChange={(value) => handleFormatChange('prix', parseFloat(value) || 0)}
                                label="Prix"
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
                                    label: 'text-gray-700'
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-span-6" />
                {/* Mots clefs descriptifs - Désactivé */}
                {/* <div className="col-span-6">
                    <MotsCles 
                        motsCles={motsCles}
                        wineType={selectedWineType}
                        editable={true}
                        onMotsClesChange={handleMotsClesChange}
                        addButtonColor="bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition-colors duration-200"
                    />
                </div> */}
            </div>



            {/* Boutons d'action */}
            <div className="flex gap-6 pt-4">
                <Button onClick={() => {
                    // S'assurer que le prix est un nombre
                    const formatWithNumericPrice = {
                        ...format,
                        prix: typeof format.prix === 'string' ? parseFloat(format.prix) || 0 : format.prix || 0
                    };
                    
                    onSave({
                        ...wine,
                        type: selectedWineType,
                        pointsDeVente: restaurantChecks as [boolean],
                        cepages: cepages,
                        formats: [formatWithNumericPrice], // Convertir en liste pour la compatibilité
                        // motsCles: motsCles.filter(mc => mc.label.trim() !== ''), // Filtrer les mots-clés vides
                        name: wineName,
                        subname: subname,
                        millesime: millesime,
                        aocRegion: aocRegion,
                        pays: pays
                    });
                }} className="!bg-[#7F56D9] !text-white hover:!bg-[#6941C6] focus:!outline-none focus:!ring-2 focus:!ring-purple-100 focus:!border-purple-300 focus:!shadow-xs transition-colors duration-200">{t('common.save')}</Button>
                <div className="flex gap-3">
                    <button
                        onClick={() => onDelete(wine.id)}
                        className="px-5 py-2.5 rounded-md bg-[#F5F3FF] text-[#7C3AED] font-medium hover:bg-[#EDE9FE] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] transition"
                    >
                        {t('wines.wine.delete')}
                    </button>
                </div>
            </div>
        </div>
    );
}
