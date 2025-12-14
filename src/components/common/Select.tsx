import React, { useState, useRef, useEffect } from 'react';

interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface SelectProps {
    options: SelectOption[] | string[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    id?: string;
    name?: string;
    // Personnalisation des couleurs
    colors?: {
        background?: string;
        border?: string;
        text?: string;
        placeholder?: string;
        focus?: string;
        hover?: string;
        disabled?: string;
        optionHover?: string;
        optionSelected?: string;
    };
    // Personnalisation de la taille
    size?: 'sm' | 'md' | 'lg';
    // Personnalisation de l'icône
    icon?: React.ReactNode;
    // Position du dropdown
    position?: 'bottom' | 'top';
    // Largeur
    width?: 'auto' | 'full' | 'sm' | 'md' | 'lg';
}

export default function Select({
    options,
    value,
    onChange,
    placeholder = 'Sélectionner...',
    disabled = false,
    className = '',
    id,
    name,
    colors = {
        background: 'bg-white',
        border: 'border-gray-300',
        text: 'text-gray-900',
        placeholder: 'text-gray-500',
        focus: 'focus:ring-2 focus:border-[#D6BBFB] focus:outline-none focus:ring-[#F4EBFF] focus:shadow-xs',
        hover: '',
        disabled: 'bg-gray-100 text-gray-500',
        optionHover: 'hover:bg-gray-50',
        optionSelected: ''
    },
    size = 'md',
    icon,
    position = 'bottom',
    width = 'auto'
}: SelectProps) {
    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || '');
    const selectRef = useRef<HTMLDivElement>(null);

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-3 py-2',
        lg: 'px-4 py-2.5 text-lg'
    };

    const widthClasses = {
        auto: 'w-auto min-w-[120px]',
        full: 'w-full',
        sm: 'w-40',
        md: 'w-56',
        lg: 'w-72'
    };

    // Convertir les options en format standardisé
    const normalizedOptions: SelectOption[] = options.map(option =>
        typeof option === 'string' ? { value: option, label: option } : option
    );

    // Trouver l'option sélectionnée
    const selectedOption = normalizedOptions.find(option => option.value === selectedValue);

    // Gestionnaire de clic en dehors du select
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Mettre à jour la valeur sélectionnée quand la prop value change
    useEffect(() => {
        setSelectedValue(value || '');
    }, [value]);

    const handleSelect = (optionValue: string) => {
        setSelectedValue(optionValue);
        setOpen(false);
        if (onChange) {
            onChange(optionValue);
        }
    };

    const handleToggle = () => {
        if (!disabled) {
            setOpen(!open);
        }
    };

    return (
        <div ref={selectRef} className={`relative ${widthClasses[width]} ${className}`}>
            {/* Bouton principal */}
            <button
                type="button"
                onClick={handleToggle}
                disabled={disabled}
                className={`
                    w-full flex items-center justify-between
                    ${sizeClasses[size]}
                    rounded-md border transition-all duration-200
                    ${colors.background}
                    ${colors.border}
                    ${colors.text}
                    ${colors.focus}
                    ${colors.hover}
                    ${disabled ? colors.disabled : ''}
                    ${open ? 'ring-2 ring-[#C4B5FD] border-[#7C3AED]' : ''}
                `}
                id={id}
                name={name}
            >
                <span className={`${selectedValue ? colors.text : colors.placeholder || 'text-gray-500'}`} style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif' }}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                
                {icon || (
                    <svg 
                        className={`ml-2 h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </button>

                        {/* Dropdown */}
            <div className={`
                absolute z-50 w-full mt-1
                ${position === 'top' ? 'bottom-full mb-1' : 'top-full'}
                bg-white border border-gray-200 rounded-md shadow-lg
                max-h-60 overflow-auto
                transition-all duration-200 ease-in-out
                ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
            `}>
                {normalizedOptions.map((option, index) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        disabled={option.disabled}
                        className={`
                            w-full px-3 py-2 text-left text-sm
                            transition-colors duration-150
                            flex items-center justify-between
                            ${option.value === selectedValue ? 
                                (colors.optionSelected || 'bg-purple-50 text-purple-700') : 
                                colors.text
                            }
                            ${colors.optionHover}
                            ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            ${index === 0 ? 'rounded-t-md' : ''}
                            ${index === normalizedOptions.length - 1 ? 'rounded-b-md' : ''}
                        `}
                    >
                        <span className="whitespace-nowrap" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif' }}>{option.label}</span>
                        {option.value === selectedValue && (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="#7F56D9" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
