"use client";
import React, { useState } from 'react';
import InputField from './InputField';
import Checkbox from './Checkbox';
import List from './List';
import Button from './Button';
import type { Plat } from './TableauMenu';

type FormulaireModificationPlatProps = {
    plat: Plat;
    onSave: (plat: Plat) => void;
    onCancel: () => void;
    onDelete: (platId: string) => void;
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

export default function FormulaireModificationPlat({ plat, onSave, onCancel, onDelete }: FormulaireModificationPlatProps) {
    // États pour les champs de saisie
    const [nom, setNom] = useState(plat.nom);
    const [description, setDescription] = useState(plat.description || '');
    const [section, setSection] = useState(plat.section);
    const [pointsDeVente, setPointsDeVente] = useState(plat.pointsDeVente);
    
    // Séparer les arômes en principal et secondaires
    const aromePrincipal = plat.motsCles.length > 0 ? [plat.motsCles[0]] : [];
    const aromesSecondaires = plat.motsCles.length > 1 ? plat.motsCles.slice(1) : [];
    
    const [aromePrincipalList, setAromePrincipalList] = useState<{ id: string; label: string; color: string; textColor: string }[]>(aromePrincipal.length > 0 ? aromePrincipal : [{ id: 'temp', label: '', color: 'bg-green-100', textColor: 'text-green-700' }]);
    const [aromesSecondairesList, setAromesSecondairesList] = useState<{ id: string; label: string; color: string; textColor: string }[]>(aromesSecondaires);

    // Gestionnaires pour les points de vente
    const handlePointDeVenteChange = (index: number, checked: boolean) => {
        const newPointsDeVente = [...pointsDeVente] as [boolean, boolean, boolean, boolean];
        newPointsDeVente[index] = checked;
        setPointsDeVente(newPointsDeVente);
    };

    const handleAromePrincipalChange = (items: any[]) => {
        setAromePrincipalList(items.map(item => ({
            id: item.id,
            label: item.label || '',
            color: item.color || 'bg-green-100',
            textColor: item.textColor || 'text-green-700'
        })));
    };

    const handleAromesSecondairesChange = (items: any[]) => {
        setAromesSecondairesList(items.map(item => ({
            id: item.id,
            label: item.label || '',
            color: item.color || 'bg-green-100',
            textColor: item.textColor || 'text-green-700'
        })));
    };

    return (
        <div className="space-y-6 overflow-visible">
            {/* Formulaire de modification */}
            <div className="grid grid-cols-12 gap-6 items-start text-left overflow-visible">
                <div className="col-span-6 pt-6">
                    <InputField
                        type="text"
                        value={nom}
                        onChange={setNom}
                        label="Nom du plat"
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
                <div className="col-span-6" />
                <div className="col-span-6">
                    <InputField
                        type="text"
                        value={description}
                        onChange={setDescription}
                        label="Description supplémentaire"
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
                <div className="col-span-6" />
                
                <div className="col-span-8">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-green-600 text-sm font-bold">i</span>
                            </div>
                            <div className="text-sm text-green-800">
                                <p className="mb-2">
                                    Ajouter les arômes permet à VirtualSomm d'associer au mieux les vins aux plats. Choisissez les arômes se rapprochant le plus du plat, avec l'arôme principal en premier, puis l'arôme secondaire, etc.
                                </p>
                                <p className="font-medium mb-1">Exemple : Faux filet de bœuf façon Steakhouse</p>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>Arôme principal : Viande rouge</li>
                                    <li>Arôme secondaire : Herbe sèche</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section dans le menu */}
                <div className="col-span-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Section dans le menu</label>
                    <div className="flex flex-col space-y-3">
                        {['Entrée', 'Plat', 'Dessert'].map((sectionOption) => (
                            <Checkbox
                                key={sectionOption}
                                id={`section-${sectionOption}`}
                                checked={section === sectionOption}
                                onChange={() => setSection(sectionOption)}
                                size="md"
                                colors={{
                                    unchecked: 'border-gray-300 bg-white',
                                    checked: 'border-[#7C3AED] bg-[#7C3AED]',
                                    focus: 'focus:ring-[#C4B5FD]'
                                }}
                            >
                                <span className="text-sm text-gray-700">{sectionOption}</span>
                            </Checkbox>
                        ))}
                    </div>
                </div>
                <div className="col-span-6" />

                {/* Arôme principal */}
                <div className="col-span-6">
                    <div className="flex items-center gap-2 mb-3">
                        <label className="block text-sm font-medium text-gray-700">Arôme principal</label>
                        <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 text-xs font-bold">i</span>
                        </div>
                    </div>

                    <List
                        items={aromePrincipalList}
                        onItemsChange={handleAromePrincipalChange}
                        fields={[
                            {
                                key: 'label',
                                label: 'Arôme principal',
                                type: 'select',
                                options: optionsAromes,
                                width: 'full'
                            }
                        ]}
                        addButtonText="Ajouter l'arôme principal"
                        emptyMessage="Aucun arôme principal ajouté"
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
                <div className="col-span-6"/>
                {/* Arômes secondaires */}
                <div className="col-span-6">
                    <div className="flex items-center gap-2 mb-3">
                        <label className="block text-sm font-medium text-gray-700">Arômes secondaires</label>
                        <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 text-xs font-bold">i</span>
                        </div>
                    </div>

                    <List
                        items={aromesSecondairesList}
                        onItemsChange={handleAromesSecondairesChange}
                        fields={[
                            {
                                key: 'label',
                                label: 'Arôme secondaire',
                                type: 'select',
                                placeholder: 'Sélectionner un arôme secondaire',
                                options: optionsAromes,
                                width: 'full'
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
                        onSave({
                            ...plat,
                            nom,
                            description: description || undefined,
                            prix: plat.prix, // Garder le prix existant
                            section,
                            pointsDeVente,
                            motsCles: [...aromePrincipalList, ...aromesSecondairesList]
                        });
                    }} 
                    className="!bg-[#7F56D9] !text-white hover:!bg-[#6941C6] focus:!outline-none focus:!ring-2 focus:!ring-purple-100 focus:!border-purple-300 focus:!shadow-xs transition-colors duration-200"
                >
                    Sauvegarder
                </Button>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            onDelete(plat.id);
                        }}
                        className="px-5 py-2.5 rounded-md bg-[#F5F3FF] text-[#7C3AED] font-medium hover:bg-[#EDE9FE] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] transition"
                    >
                        Supprimer ce plat
                    </button>
                </div>
            </div>
        </div>
    );
}
