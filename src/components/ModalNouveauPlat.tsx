"use client";
import React, { useState } from 'react';
import Button from './Button';
import InputField from './InputField';
import Checkbox from './Checkbox';
import List from './List';
import Select from './Select';
import type { Plat } from './TableauMenu';

type ModalNouveauPlatProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (platData: Omit<Plat, 'id'>) => void;
};

const optionsAromes = [
    { value: 'viande-rouge', label: 'Viande rouge' },
    { value: 'viande-blanche', label: 'Viande blanche' },
    { value: 'volaille', label: 'Volaille' },
    { value: 'poisson', label: 'Poisson' },
    { value: 'crustace', label: 'Crustacé' },
    { value: 'mollusque', label: 'Mollusque' },
    { value: 'legume-vert', label: 'Légume vert' },
    { value: 'solanacee', label: 'Solanacée' },
    { value: 'champignon', label: 'Champignon' },
    { value: 'fromage-dur', label: 'Fromage pâte dure et noisettée' },
    { value: 'fromage-bleu', label: 'Fromage bleu puissant' },
    { value: 'fromage-doux', label: 'Fromage doux et beurré' },
    { value: 'herbe-fraiche', label: 'Herbe fraîche aromatique' },
    { value: 'herbe-seche', label: 'Herbe sèche' },
    { value: 'epices-exotiques', label: 'Épices exotiques' },
    { value: 'viande-sechee', label: 'Viande séchée' },
    { value: 'faisselle', label: 'Faisselle / crème aigre' },
    { value: 'fromage-sale', label: 'Fromage salé et friable' }
];

const sections = [
    'Entrée',
    'Plat',
    'Dessert'
];

export default function ModalNouveauPlat({ isOpen, onClose, onSave }: ModalNouveauPlatProps) {
    // États pour les champs de saisie
    const [nom, setNom] = useState('');
    const [description, setDescription] = useState('');
    const [prix, setPrix] = useState('');
    const [section, setSection] = useState('Entrée');
    const [sectionsSelectionnees, setSectionsSelectionnees] = useState<boolean[]>([true, false, false]);

    // États pour les arômes
    const [aromePrincipal, setAromePrincipal] = useState([{ id: '1', label: '', color: 'bg-green-100', textColor: 'text-green-700' }]);
    const [aromesSecondaires, setAromesSecondaires] = useState<{ id: string; label: string; color: string; textColor: string }[]>([]);

    // États pour les erreurs de validation
    const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

    // Gestionnaires pour les sections
    const handleSectionChange = (index: number, checked: boolean) => {
        const newSections = [...sectionsSelectionnees];
        newSections[index] = checked;
        setSectionsSelectionnees(newSections);
    };

    // Gestionnaires pour les arômes
    const handleAromePrincipalChange = (items: any[]) => {
        setAromePrincipal(items.map(item => ({
            id: item.id,
            label: item.label || '',
            color: item.color || 'bg-green-100',
            textColor: item.textColor || 'text-green-700'
        })));
    };

    const handleAromesSecondairesChange = (items: any[]) => {
        setAromesSecondaires(items.map(item => ({
            id: item.id,
            label: item.label || '',
            color: item.color || 'bg-green-100',
            textColor: item.textColor || 'text-green-700'
        })));
    };

    // Fonction de validation
    const validateForm = () => {
        const newErrors: { [key: string]: boolean } = {};

        if (!nom.trim()) {
            newErrors.nom = true;
        }
        if (!prix.trim()) {
            newErrors.prix = true;
        }
        if (!section.trim()) {
            newErrors.section = true;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Gestionnaire pour la soumission
    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }

        // S'assurer que le prix est un nombre
        const prixNumerique = parseFloat(prix) || 0;

        // Combiner tous les arômes
        const tousLesAromes = [...aromePrincipal.filter(a => a.label.trim()), ...aromesSecondaires.filter(a => a.label.trim())];

        const platData = {
            nom: nom,
            description: description,
            prix: prixNumerique,
            section: section,
            pointsDeVente: [true, true, true, true] as [boolean, boolean, boolean, boolean], // Par défaut tous les restaurants
            motsCles: tousLesAromes.map((arome, index) => ({
                id: `mc${index + 1}`,
                label: arome.label,
                color: arome.color,
                textColor: arome.textColor
            }))
        };

        onSave(platData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#0000005F] bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-300">
            <div className="bg-gray-50 rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] shadow-sm focus:shadow-sm focus:shadow-gray-100 focus:shadow-[4px] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                <div className="p-8 overflow-y-auto flex-1">
                    {/* Header */}
                    <div className="mb-6">
                        <h2 className="text-4xl font-bold text-gray-900 mb-2">Nouveau plat</h2>
                        <p className="text-gray-900 text-md">Remplir tous les champs le plus précisément possible afin d'assurer des recommendations optimales.</p>
                    </div>

                    <div className="space-y-6">
                        {/* Nom du plat */}
                        <div className="w-full text-gray-700">
                            <InputField
                                type="text"
                                value={nom}
                                onChange={setNom}
                                label="Nom du plat"
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
                                error={errors.nom ? "Le nom du plat est requis" : undefined}
                            />
                        </div>

                        {/* Description */}
                        <div className="w-full text-gray-700">
                            <InputField
                                type="text"
                                value={description}
                                onChange={setDescription}
                                label="Description supplémentaire"
                                placeholder="Description du plat"
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

                        {/* Points de vente */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Section dans le menu</label>
                            <div className="grid grid-cols-1 gap-4">
                                {sections.map((sectionName, index) => (
                                    <div key={index} className="flex items-start">
                                        <Checkbox
                                            checked={sectionsSelectionnees[index]}
                                            onChange={(value) => handleSectionChange(index, value)}
                                            colors={{
                                                unchecked: 'border-gray-300 bg-white',
                                                checked: 'border-[#7F56D9] bg-[#7F56D9]'
                                            }}
                                        />
                                        <span className="ml-3 text-sm text-gray-700">{sectionName}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Arôme principal */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Arôme principal</label>
                            <List
                                items={aromePrincipal}
                                onItemsChange={handleAromePrincipalChange}
                                fields={[
                                    {
                                        key: 'label',
                                        label: 'Arôme',
                                        type: 'select',
                                        options: optionsAromes.map(opt => ({ value: opt.value, label: opt.label }))
                                    }
                                ]}
                                addButtonText="Ajouter un arôme principal"
                                emptyMessage="Aucun arôme principal ajouté"
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

                        {/* Arômes secondaires */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Arômes secondaires (optionnel)</label>
                            <List
                                items={aromesSecondaires}
                                onItemsChange={handleAromesSecondairesChange}
                                fields={[
                                    {
                                        key: 'label',
                                        label: 'Arôme',
                                        type: 'select',
                                        options: optionsAromes.map(opt => ({ value: opt.value, label: opt.label }))
                                    }
                                ]}
                                addButtonText="Ajouter un arôme secondaire"
                                emptyMessage="Aucun arôme secondaire ajouté"
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
                    {/* Boutons d'action */}
                    <div className="flex justify-start gap-4 mt-10 pt-10">
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
