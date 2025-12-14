import React from 'react';
import InputField from './InputField';
import Select from './Select';

interface InputRowProps {
    // Données de la ligne
    id: string;
    leftValue?: string | number;
    rightValue?: string | number;
    leftSuffix?: string;
    rightSuffix?: string;
    leftPlaceholder?: string;
    rightPlaceholder?: string;
    
    // Gestionnaires d'événements
    onLeftChange?: (value: string) => void;
    onRightChange?: (value: string) => void;
    onLeftBlur?: (value: string) => void;
    onRightBlur?: (value: string) => void;
    onDelete?: (id: string) => void;
    
    // Configuration des inputs
    leftType?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'select';
    rightType?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'select';
    
    // Options pour les Select
    leftOptions?: string[] | Array<{ value: string; label: string }>;
    rightOptions?: string[] | Array<{ value: string; label: string }>;
    
    // Personnalisation
    className?: string;
    disabled?: boolean;
    
    // Personnalisation des couleurs
    colors?: {
        background?: string;
        border?: string;
        text?: string;
        placeholder?: string;
        focus?: string;
        hover?: string;
        disabled?: string;
        error?: string;
        suffix?: string;
        deleteButton?: string;
        deleteButtonHover?: string;
        optionHover?: string;
        optionSelected?: string;
    };
    
    // Tailles
    size?: 'sm' | 'md' | 'lg';
    
    // Affichage conditionnel
    showLeftInput?: boolean;
    showRightInput?: boolean;
    showDeleteButton?: boolean;
    
    // Largeurs
    leftWidth?: 'auto' | 'full' | 'sm' | 'md' | 'lg';
    rightWidth?: 'auto' | 'full' | 'sm' | 'md' | 'lg';
}

export default function InputRow({
    id,
    leftValue = '',
    rightValue = '',
    leftSuffix,
    rightSuffix,
    leftPlaceholder,
    rightPlaceholder,
    onLeftChange,
    onRightChange,
    onLeftBlur,
    onRightBlur,
    onDelete,
    leftType = 'text',
    rightType = 'text',
    leftOptions = [],
    rightOptions = [],
    className = '',
    disabled = false,
    colors = {
        background: 'bg-white',
        border: 'border-gray-300',
        text: 'text-gray-900',
        placeholder: 'placeholder-gray-500',
        focus: 'focus:ring-2 focus:border-[#D6BBFB] focus:outline-none focus:ring-[#F4EBFF] focus:shadow-xs',
        hover: 'hover:border-gray-400',
        disabled: 'bg-gray-100 text-gray-500 border-gray-200',
        error: 'border-red-300 focus:border-red-500 focus:ring-red-200',
        suffix: 'text-gray-500',
        deleteButton: 'text-gray-400',
        deleteButtonHover: '',
        optionHover: 'hover:bg-gray-50',
        optionSelected: ''
    },
    size = 'md',
    showLeftInput = true,
    showRightInput = true,
    showDeleteButton = true,
    leftWidth = 'full',
    rightWidth = 'auto'
}: InputRowProps) {
    
    const handleDelete = () => {
        if (!disabled && onDelete) {
            onDelete(id);
        }
    };

    const renderLeftInput = () => {
        if (leftType === 'select') {
            return (
                <Select
                    options={leftOptions}
                    value={leftValue as string}
                    onChange={onLeftChange}
                    placeholder={leftPlaceholder}
                    disabled={disabled}
                    size={size}
                    width={leftWidth}
                    colors={{
                        background: colors.background,
                        border: colors.border,
                        text: colors.text,
                        focus: colors.focus,
                        hover: colors.hover,
                        disabled: colors.disabled,
                        optionHover: colors.optionHover,
                        optionSelected: colors.optionSelected
                    }}
                />
            );
        }

        return (
            <InputField
                type={leftType}
                value={leftValue}
                onChange={onLeftChange}
                onBlur={onLeftBlur}
                placeholder={leftPlaceholder}
                disabled={disabled}
                suffix={leftSuffix}
                size={size}
                width={leftWidth}
                colors={{
                    background: colors.background,
                    border: colors.border,
                    text: colors.text,
                    placeholder: colors.placeholder,
                    focus: colors.focus,
                    hover: colors.hover,
                    disabled: colors.disabled,
                    error: colors.error,
                    suffix: colors.suffix
                }}
            />
        );
    };

    const renderRightInput = () => {
        if (rightType === 'select') {
            return (
                <Select
                    options={rightOptions}
                    value={rightValue as string}
                    onChange={onRightChange}
                    placeholder={rightPlaceholder}
                    disabled={disabled}
                    size={size}
                    width={rightWidth}
                    colors={{
                        background: colors.background,
                        border: colors.border,
                        text: colors.text,
                        focus: colors.focus,
                        hover: colors.hover,
                        disabled: colors.disabled,
                        optionHover: colors.optionHover,
                        optionSelected: colors.optionSelected
                    }}
                />
            );
        }

        return (
            <InputField
                type={rightType}
                value={rightValue}
                onChange={onRightChange}
                onBlur={onRightBlur}
                placeholder={rightPlaceholder}
                disabled={disabled}
                suffix={rightSuffix}
                size={size}
                width={rightWidth}
                className="text-right"
                colors={{
                    background: colors.background,
                    border: colors.border,
                    text: colors.text,
                    placeholder: colors.placeholder,
                    focus: colors.focus,
                    hover: colors.hover,
                    disabled: colors.disabled,
                    error: colors.error,
                    suffix: colors.suffix
                }}
            />
        );
    };

    // Calculer les classes de colonnes
    const getLeftColClass = () => {
        if (!showLeftInput) return '';
        if (showRightInput && showDeleteButton) return 'col-span-7';
        if (showRightInput || showDeleteButton) return 'col-span-9';
        return 'col-span-12';
    };
    
    const getRightColClass = () => {
        if (!showRightInput) return '';
        if (showDeleteButton) return 'col-span-5';
        return 'col-span-4';
    };
    
    return (
        <div className={`grid grid-cols-12 gap-6 items-center ${className}`}>
            {/* Input de gauche */}
            {showLeftInput && (
                <div className={getLeftColClass()}>
                    {renderLeftInput()}
                </div>
            )}
            
            {/* Input de droite avec bouton de suppression dans la même colonne */}
            {showRightInput && (
                <div className={getRightColClass()}>
                    <div className="flex items-center gap-0">
                        <div className="flex-1">
                            {renderRightInput()}
                        </div>
                        {/* Bouton de suppression */}
                        {showDeleteButton && (
                            <div className="ml-6 flex items-center justify-center flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={disabled}
                                    className={`
                                        w-10 h-10 flex items-center justify-center
                                        transition-all duration-200
                                        text-gray-500 hover:text-red-500
                                        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}   
                                        flex-shrink-0
                                    `}
                                    title="Supprimer"
                                >
                                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                                        <path d="M10 6L6 10M6 6L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
