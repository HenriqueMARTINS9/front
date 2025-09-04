import React from 'react';

interface RadioButtonProps {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    id?: string;
    name?: string;
    value?: string;
    // Personnalisation des couleurs
    colors?: {
        unchecked?: string;
        checked?: string;
        focus?: string;
        disabled?: string;
        dot?: string;
    };
    // Personnalisation de la taille
    size?: 'sm' | 'md' | 'lg';
    // Personnalisation du dot
    dotIcon?: React.ReactNode;
    children?: React.ReactNode;
}

export default function RadioButton({
    checked = false,
    onChange,
    disabled = false,
    className = '',
    id,
    name,
    value,
    colors = {
        unchecked: 'border-gray-300 bg-white',
        checked: 'border-[#7C3AED] bg-white',
        focus: 'focus:ring-[#C4B5FD]',
        disabled: 'border-gray-200 bg-gray-100',
        dot: 'bg-[#7C3AED]'
    },
    size = 'md',
    dotIcon,
    children
}: RadioButtonProps) {
    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    const dotSizeClasses = {
        sm: 'w-1.5 h-1.5',
        md: 'w-2 h-2',
        lg: 'w-2.5 h-2.5'
    };

    const defaultDotIcon = (
        <div className={`rounded-full ${colors.dot || 'bg-[#7C3AED]'} ${dotSizeClasses[size]}`} />
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!disabled && onChange) {
            onChange(e.target.checked);
        }
    };

    const getColorClasses = () => {
        if (disabled) return colors.disabled || 'border-gray-200 bg-gray-100';
        if (checked) return colors.checked || 'border-[#7C3AED] bg-white';
        return colors.unchecked || 'border-gray-300 bg-white';
    };

    return (
        <label className={`inline-flex items-center cursor-pointer ${disabled ? 'cursor-not-allowed' : ''} ${className}`}>
            <div className={`relative ${sizeClasses[size]}`}>
                <input
                    type="radio"
                    checked={checked}
                    onChange={handleChange}
                    disabled={disabled}
                    id={id}
                    name={name}
                    value={value}
                    className={`peer appearance-none border rounded-full transition-all duration-200 ${getColorClasses()} ${colors.focus || 'focus:ring-2 focus:ring-[#C4B5FD]'} ${sizeClasses[size]}`}
                />
                {checked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {dotIcon || defaultDotIcon}
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
