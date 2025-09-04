import React from 'react';

interface CheckboxProps {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    id?: string;
    name?: string;
    // Personnalisation des couleurs
    colors?: {
        unchecked?: string;
        checked?: string;
        focus?: string;
        disabled?: string;
    };
    // Personnalisation de la taille
    size?: 'sm' | 'md' | 'lg';
    // Personnalisation de l'icône de check
    checkIcon?: React.ReactNode;
    children?: React.ReactNode;
}

export default function Checkbox({
    checked = false,
    onChange,
    disabled = false,
    className = '',
    id,
    name,
    colors = {
        unchecked: 'border-gray-300 bg-white',
        checked: 'border-[#7F56D9] bg-[#7F56D9]',
        focus: '',
        disabled: 'border-gray-200 bg-gray-100'
    },
    size = 'md',
    checkIcon,
    children
}: CheckboxProps) {
    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    const defaultCheckIcon = (
        <svg
            className="absolute inset-0 pointer-events-none"
            viewBox="0 0 10 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M9 1L3.5 6.5L1 4"
                stroke="white"
                strokeWidth="1.6666"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!disabled && onChange) {
            onChange(e.target.checked);
        }
    };

    const getColorClasses = () => {
        if (disabled) return colors.disabled || 'border-gray-200 bg-gray-100';
        if (checked) return colors.checked || 'border-[#7F56D9] bg-[#7F56D9]';
        return colors.unchecked || 'border-gray-300 bg-white';
    };

    return (
        <label className={`inline-flex items-center cursor-pointer ${disabled ? 'cursor-not-allowed' : ''} ${className}`}>
            <div className={`relative ${sizeClasses[size]}`}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={handleChange}
                    disabled={disabled}
                    id={id}
                    name={name}
                    className={`peer appearance-none border rounded transition-all bg-white duration-200 ${getColorClasses()} ${colors.focus || ''} ${sizeClasses[size]}`}
                />
                {checked && (
                    <div className="absolute inset-0 mt-1 flex items-center justify-center">
                        {checkIcon || <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 1L3.5 6.5L1 4" stroke="#7F56D9" strokeWidth="1.6666" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        }
                    </div>
                )}
            </div>
            {children && (
                <span className={`ml-2 ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
                    {children}
                </span>
            )}
        </label>
    );
}
