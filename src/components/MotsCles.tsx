"use client";
import React from 'react';
import Tag from './Tag';
import List from './List';
import { getTagColors } from '@/lib/tagColors';

type MotCle = {
    id: string;
    label: string;
    color: string;
    textColor: string;
};

type MotsClesProps = {
    motsCles: MotCle[];
    wineType?: string; // Type de vin pour déterminer les couleurs
    editable?: boolean; // Nouveau prop pour indiquer si les mots-clés sont modifiables
    onMotsClesChange?: (motsCles: MotCle[]) => void; // Callback pour les modifications
    addButtonColor?: string; // Couleur personnalisée pour le bouton d'ajout
};

export default function MotsCles({ motsCles, wineType, editable = false, onMotsClesChange, addButtonColor }: MotsClesProps) {
    // Si un type de vin est fourni, utiliser ses couleurs pour tous les mots-clés
    const wineTypeColors = wineType ? getTagColors(wineType) : null;
    
    // Gestionnaire pour les modifications des mots-clés
    const handleMotsClesChange = (items: any[]) => {
        if (onMotsClesChange) {
            const newMotsCles = items.map(item => ({
                id: item.id,
                label: item.label || '',
                color: wineTypeColors?.bg || 'bg-[#FFFAEB]',
                textColor: wineTypeColors?.text || 'text-[#B54708]'
            }));
            onMotsClesChange(newMotsCles);
        }
    };
    
    // Si les mots-clés sont modifiables, utiliser le composant List
    if (editable) {
        return (
            <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Mots clés descriptifs</p>
                <List
                    items={motsCles}
                    onItemsChange={handleMotsClesChange}
                    fields={[
                        {
                            key: 'label',
                            label: 'Mot-clé',
                            type: 'text',
                            placeholder: 'Ex: Fruité, Épicé, Minéral...',
                            width: 'full'
                        }
                    ]}
                    addButtonText="Ajouter un mot-clé"
                    emptyMessage="Aucun mot-clé ajouté"
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
                        addButton: addButtonColor || 'bg-[#3E4784] text-white hover:bg-[#2D3A6B] hover:shadow-md transform transition-all duration-200 ease-in-out',
                        optionHover: 'hover:bg-gray-50',
                        optionSelected: 'bg-purple-50 text-purple-700'
                    }}
                />
            </div>
        );
    }
    
    // Affichage en lecture seule (comportement original)
    return (
        <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Mots clefs descriptifs (automatique)</p>
            
            <div className="flex flex-wrap gap-2">
                {motsCles.map((motCle) => {
                    // Ajouter la puce pour les types de vins
                    const isTypeVin = ['Blanc', 'Rouge', 'Rosé', 'Mousseux', 'Fortifié', 'Moelleux ou liquoreux'].includes(motCle.label);
                    
                    // Utiliser les couleurs du type de vin si disponibles, sinon utiliser les couleurs du mot-clé
                    const colors = wineTypeColors ? {
                        color: wineTypeColors.bg,
                        textColor: wineTypeColors.text
                    } : {
                        color: motCle.color,
                        textColor: motCle.textColor
                    };
                    
                    return (
                        <Tag 
                            key={motCle.id} 
                            label={motCle.label} 
                            puce={isTypeVin}
                            color={colors.color}
                            textColor={colors.textColor}
                        />
                    );
                })}
            </div>
        </div>
    );
}
