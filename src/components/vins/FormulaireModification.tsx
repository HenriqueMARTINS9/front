"use client";
import React, { useState, useEffect, useRef } from 'react';
import MotsCles from './MotsCles';
import Button from '../common/Button';
import Checkbox from '../common/Checkbox';
import RadioButton from '../common/RadioButton';
import Select from '../common/Select';
import InputField from '../common/InputField';
import InputRow from '../common/InputRow';
import List from '../common/List';
import type { Wine } from './TableauVin';
import { useTranslation } from '@/lib/useTranslation';
import { createCepagesOptions, getCepageNameById, getCepageIdByName } from '@/lib/cepages';

type FormulaireModificationProps = {
    wine: Wine;
    onSave: (wine: Wine) => void;
    onCancel: () => void;
    onDelete: (wineId: string) => void;
    onDataChange?: (data: { cepages?: any[], formats?: any[] }) => void;
};



export default function FormulaireModification({ wine, onSave, onCancel, onDelete, onDataChange }: FormulaireModificationProps) {
    const { t } = useTranslation();
    const previousWineRef = useRef<string>('');
    
    // États pour les checkboxes des restaurants
    const [restaurantChecks, setRestaurantChecks] = useState<boolean[]>(wine.pointsDeVente);
    
    // État pour le type de vin sélectionné - utiliser le type du vin
    const [selectedWineType, setSelectedWineType] = useState<Wine['type']>(wine.type);
    
    // État pour la checkbox "proportions inconnues" - vérifier si le vin n'a pas de cépages ou si les pourcentages sont à 0
    const [unknownProportions, setUnknownProportions] = useState(
        wine.cepages.length === 0 || wine.cepages.every(c => c.pourcentage === 0)
    );

    // États pour les champs de saisie - initialiser avec les valeurs du vin
    const [wineName, setWineName] = useState(wine.name || '');
    const [millesime, setMillesime] = useState(wine.millesime || 0);
    const [subname, setSubname] = useState(wine.subname || '');
    const [aocRegion, setAocRegion] = useState(wine.aocRegion || '');
    const [pays, setPays] = useState(wine.pays || '');
    
    // États pour les listes
    const [cepages, setCepages] = useState(() => {
        // Si le vin a des cépages, les utiliser, sinon liste vide
        if (wine.cepages && wine.cepages.length > 0) {
            return wine.cepages.map(c => {
                let normalizedNom = c.nom || '';
                
                console.log('Initialisation cepages - c.nom:', c.nom, 'type:', typeof c.nom);
                
                // Si le nom est déjà un ID numérique (string), vérifier qu'il est valide
                if (typeof normalizedNom === 'string' && !isNaN(Number(normalizedNom)) && normalizedNom !== '') {
                    const id = parseInt(normalizedNom, 10);
                    console.log('Initialisation cepages - parsed ID:', id, 'isValid:', id >= 0 && id < 92);
                    // Vérifier que l'ID est valide (entre 0 et 91)
                    if (id >= 0 && id < 92) {
                        normalizedNom = id.toString();
                    } else {
                        // ID invalide (comme 96), réinitialiser à vide pour forcer la sélection
                        console.warn('Initialisation cepages - ID invalide:', id, 'réinitialisation');
                        normalizedNom = '';
                    }
                } else {
                    // Si c'est un nom de cépage, le convertir en ID
                    const cepageId = getCepageIdByName(normalizedNom);
                    console.log('Initialisation cepages - nom:', normalizedNom, 'cepageId:', cepageId);
                    normalizedNom = cepageId !== -1 ? cepageId.toString() : '';
                }
                
                console.log('Initialisation cepages - normalizedNom final:', normalizedNom);
                
                return {
                    id: c.id,
                    nom: normalizedNom,
                    pourcentage: c.pourcentage || 0
                };
            });
        }
        // Pas de valeur par défaut, liste vide
        return [];
    });
    
    const [format, setFormat] = useState(() => {
        // Prendre le premier format s'il existe
        const firstFormat = wine.formats?.[0];
        if (firstFormat) {
            return {
                id: firstFormat.id || `format-${Date.now()}`,
                nom: firstFormat.nom || '',
                prix: firstFormat.prix || 0
            };
        }
        // Si aucun format n'existe, retourner un objet vide (pas de valeur par défaut)
        return {
            id: `format-${Date.now()}`,
            nom: '',
            prix: 0
        };
    });
    
    // Mettre à jour tous les champs quand le vin change
    useEffect(() => {
        // Créer une signature du vin pour détecter les changements réels
        // Inclure le format complet pour détecter les changements de format
        const formatSignature = wine.formats?.[0] ? `${wine.formats[0].nom}-${wine.formats[0].prix}` : '';
        const wineSignature = `${wine.id}-${formatSignature}-${JSON.stringify(wine.cepages)}-${wine.name}-${wine.type}-${wine.millesime}`;
        
        // Ne mettre à jour que si le vin a réellement changé
        if (previousWineRef.current === wineSignature) {
            return;
        }
        
        previousWineRef.current = wineSignature;
        
        console.log('FormulaireModification - Mise à jour des valeurs pour le vin:', wine.id);
        console.log('FormulaireModification - wine complet:', JSON.stringify(wine, null, 2));
        console.log('FormulaireModification - wine.formats:', JSON.stringify(wine.formats, null, 2));
        
        // Mettre à jour les champs de base - préserver les valeurs existantes
        setWineName(wine.name || wine.nom || '');
        setMillesime(wine.millesime || 0);
        setSubname(wine.subname || '');
        setAocRegion(wine.aocRegion || wine.region || '');
        setPays(wine.pays || '');
        setSelectedWineType(wine.type);
        setRestaurantChecks(wine.pointsDeVente || [true]);
        
        // Mettre à jour les cépages
        if (wine.cepages && wine.cepages.length > 0) {
            const normalizedCepages = wine.cepages.map(c => {
                let normalizedNom = c.nom || '';
                
                // Si le nom est déjà un ID numérique (string), vérifier qu'il est valide
                if (typeof normalizedNom === 'string' && !isNaN(Number(normalizedNom)) && normalizedNom !== '') {
                    const id = parseInt(normalizedNom, 10);
                    if (id >= 0 && id < 92) {
                        normalizedNom = id.toString();
                    } else {
                        normalizedNom = '';
                    }
                } else {
                    // Si c'est un nom de cépage, le convertir en ID
                    const cepageId = getCepageIdByName(normalizedNom);
                    normalizedNom = cepageId !== -1 ? cepageId.toString() : '';
                }
                
                return {
                    id: c.id,
                    nom: normalizedNom,
                    pourcentage: c.pourcentage || 0
                };
            });
            console.log('FormulaireModification - Cépages normalisés:', normalizedCepages);
            setCepages(normalizedCepages);
            setUnknownProportions(normalizedCepages.every(c => c.pourcentage === 0));
        } else {
            setCepages([]);
            setUnknownProportions(true);
        }
        
        // Mettre à jour le format - s'assurer qu'on récupère bien le format depuis wine.formats
        const firstFormat = wine.formats?.[0];
        if (firstFormat && firstFormat.nom) {
            const newFormat = {
                id: firstFormat.id || `format-${Date.now()}`,
                nom: firstFormat.nom, // Utiliser directement le nom du format (ex: "Magnum (150 cl)", "Bouteille (75 cl)")
                prix: firstFormat.prix || 0
            };
            console.log('FormulaireModification - Format mis à jour depuis wine.formats:', newFormat);
            setFormat(newFormat);
        } else {
            // Fallback si aucun format n'existe
            const defaultFormat = {
                id: `format-${Date.now()}`,
                nom: 'Bouteille (75 cl)',
                prix: 0
            };
            console.log('FormulaireModification - Format par défaut utilisé:', defaultFormat);
            setFormat(defaultFormat);
        }
    }, [wine]);
    
    // const [motsCles, setMotsCles] = useState(wine.motsCles.map(mc => ({
    //     id: mc.id,
    //     label: mc.label,
    //     color: mc.color,
    //     textColor: mc.textColor
    // })));
    
    // Gestionnaires pour les listes
    const handleCepagesChange = (items: any[]) => {
        const newCepages = items.map(item => {
            // Normaliser le nom : s'assurer que c'est toujours un ID valide (string)
            let normalizedNom = item.nom || '';
            
            console.log('handleCepagesChange - item.nom:', item.nom, 'type:', typeof item.nom);
            
            // Si c'est déjà un ID numérique (string), le garder tel quel
            if (typeof normalizedNom === 'string' && !isNaN(Number(normalizedNom)) && normalizedNom !== '') {
                // Vérifier que l'ID est valide (entre 0 et 91)
                const id = parseInt(normalizedNom, 10);
                console.log('handleCepagesChange - parsed ID:', id, 'isValid:', id >= 0 && id < 92);
                if (id >= 0 && id < 92) {
                    normalizedNom = id.toString();
                } else {
                    // ID invalide, essayer de convertir le nom en ID (mais "96" n'est pas un nom, donc ça ne marchera pas)
                    // Dans ce cas, on doit réinitialiser à une valeur vide pour forcer l'utilisateur à sélectionner
                    console.warn('handleCepagesChange - ID invalide:', id, 'réinitialisation');
                    normalizedNom = '';
                }
            } else {
                // Si c'est un nom de cépage, le convertir en ID
                const cepageId = getCepageIdByName(normalizedNom);
                console.log('handleCepagesChange - nom:', normalizedNom, 'cepageId:', cepageId);
                normalizedNom = cepageId !== -1 ? cepageId.toString() : '';
            }
            
            console.log('handleCepagesChange - normalizedNom final:', normalizedNom);
            
            return {
                id: item.id,
                nom: normalizedNom,
                pourcentage: item.pourcentage || 0
            };
        });
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
                        label={t('common.wineName')}
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
                        label={t('common.vintage')}
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
                            <div className="text-xs text-gray-700">{t('common.restaurant')} {idx + 1}</div>

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
                        label={t('common.domainProducer')}
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
                        label={t('common.regionAOC')}
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
                        label={t('wines.wine.country')}
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
                    <label className="block text-sm font-medium text-gray-700 mb-3">{t('common.wineType')}</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.grapeVarieties')}</label>
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
                                <div className="text-sm text-gray-700">{t('common.unknownProportions')}</div>
                                <p className="text-xs text-gray-500 mt-1">{t('common.proportionsHelp')}</p>
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
                            addButton: 'bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition-colors duration-200'
                        }}
                    />
                    )}
                </div>
                <div className="col-span-6" />
                {/* Format du vin */}
                <div className="col-span-6">
                    <div className="grid grid-cols-3 gap-6 items-end">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-3">{t('common.format')}</label>
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
                                placeholder={t('common.selectFormat')}
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
                                    hover: ''
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
                    try {
                        // Validation du format
                        if (!format.nom || format.nom.trim() === '') {
                            console.error('FormulaireModification - Format invalide:', format);
                            alert(t('common.formatRequired') || 'Le format est requis');
                            return;
                        }
                        
                        // S'assurer que le prix est un nombre
                        const formatWithNumericPrice = {
                            id: format.id || `format-${Date.now()}`,
                            nom: format.nom.trim(),
                            prix: typeof format.prix === 'string' ? parseFloat(format.prix) || 0 : format.prix || 0
                        };
                        
                        // Validation des champs requis - utiliser la valeur originale si le champ est vide
                        const finalWineName = wineName && wineName.trim() !== '' ? wineName.trim() : (wine.name || wine.nom || '');
                        if (!finalWineName || finalWineName.trim() === '') {
                            console.error('FormulaireModification - Nom du vin manquant (champ vide et pas de valeur originale)');
                            alert(t('common.wineNameRequired') || 'Le nom du vin est requis');
                            return;
                        }
                        
                        // S'assurer que les cépages sont valides, mais préserver les cépages existants
                        // Si proportions inconnues, utiliser un tableau vide
                        const validCepages = unknownProportions 
                            ? [] 
                            : cepages.filter(c => c.nom && c.nom.trim() !== '');
                        
                        console.log('FormulaireModification - Sauvegarde du vin:', {
                            name: wineName,
                            format: formatWithNumericPrice,
                            cepages: validCepages,
                            cepagesOriginaux: cepages,
                            unknownProportions,
                            millesime,
                            type: selectedWineType
                        });
                        
                        // Préparer l'objet vin en préservant toutes les propriétés existantes
                        // S'assurer que toutes les valeurs sont préservées, même si elles sont vides
                        const wineToSave: Wine = {
                            ...wine,
                            // Préserver l'ID et toutes les propriétés existantes
                            id: wine.id,
                            type: selectedWineType,
                            pointsDeVente: restaurantChecks as [boolean],
                            // Utiliser les cépages filtrés, ou un tableau vide si proportions inconnues
                            cepages: validCepages,
                            formats: [formatWithNumericPrice],
                            // Mettre à jour avec les valeurs du formulaire
                            // Utiliser la valeur finale calculée (qui utilise la valeur originale si le champ est vide)
                            name: finalWineName,
                            subname: subname && subname.trim() !== '' ? subname.trim() : (wine.subname || ''),
                            millesime: millesime !== undefined && millesime !== null ? millesime : (wine.millesime || 0),
                            aocRegion: aocRegion && aocRegion.trim() !== '' ? aocRegion.trim() : (wine.aocRegion || wine.region || ''),
                            pays: pays && pays.trim() !== '' ? pays.trim() : (wine.pays || ''),
                            // Préserver les mots-clés existants
                            motsCles: wine.motsCles || []
                        };
                        
                        // Vérifier que toutes les valeurs critiques sont présentes
                        if (!wineToSave.name || wineToSave.name.trim() === '') {
                            console.error('FormulaireModification - Nom du vin manquant après préparation:', wineToSave);
                        }
                        if (!wineToSave.formats || wineToSave.formats.length === 0) {
                            console.error('FormulaireModification - Formats manquants après préparation:', wineToSave);
                        }
                        
                        console.log('FormulaireModification - Objet vin complet à sauvegarder:', JSON.stringify(wineToSave, null, 2));
                        
                        onSave(wineToSave);
                    } catch (error) {
                        console.error('FormulaireModification - Erreur lors de la préparation de la sauvegarde:', error);
                        alert(t('common.saveError') || 'Une erreur est survenue lors de la sauvegarde');
                    }
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
