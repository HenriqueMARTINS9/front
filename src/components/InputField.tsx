import React, { forwardRef } from 'react';

interface InputFieldProps {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
    value?: string | number;
    onChange?: (value: string) => void;
    onBlur?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    id?: string;
    name?: string;
    label?: string;
    error?: string;
    helperText?: string;
    // Suffixe fixe (comme %, CHF, etc.)
    suffix?: string;
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
        label?: string;
        helperText?: string;
        suffix?: string;
    };
    // Personnalisation de la taille
    size?: 'sm' | 'md' | 'lg';
    // Largeur
    width?: 'auto' | 'full' | 'sm' | 'md' | 'lg';
    // Icône optionnelle
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(({
    type = 'text',
    value,
    onChange,
    onBlur,
    placeholder,
    disabled = false,
    required = false,
    className = '',
    id,
    name,
    label,
    error,
    helperText,
    suffix,
    colors = {
        background: 'bg-white',
        border: 'border-gray-300',
        text: 'text-gray-900',
        placeholder: 'placeholder-gray-500',
        focus: 'focus:ring-2 focus:border-[#D6BBFB] focus:outline-none focus:ring-[#F4EBFF] focus:shadow-xs',
        hover: '',
        disabled: 'bg-gray-100 text-gray-500 border-gray-200',
        error: 'border-red-300 focus:border-red-500 focus:ring-red-200',
        label: 'text-gray-700',
        helperText: 'text-gray-500',
        suffix: 'text-gray-500'
    },
    size = 'md',
    width = 'auto',
    icon,
    iconPosition = 'left'
}, ref) => {
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-3 py-2',
        lg: 'px-4 py-2.5 text-lg'
    };

    const widthClasses = {
        auto: 'w-auto',
        full: 'w-full',
        sm: 'w-20',
        md: 'w-24',
        lg: 'w-32'
    };

    // Fonction pour obtenir la largeur avec suffix
    const getWidthWithSuffix = () => {
        if (suffix) {
            return 'min-w-[120px]';
        }
        return widthClasses[width];
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!disabled && onChange) {
            let newValue = e.target.value;
            
            // Si on a un suffixe, on s'assure qu'il n'est pas inclus dans la valeur modifiée
            if (suffix && newValue.endsWith(suffix)) {
                newValue = newValue.slice(0, -suffix.length);
            }
            
            // Validation pour les pourcentages (0-100 avec 2 décimales)
            if (suffix === ' %') {
                // Permettre la saisie de nombres, points et virgules
                if (newValue && !/^[0-9.,]*$/.test(newValue)) {
                    return;
                }
                // Vérifier qu'il n'y a qu'une seule virgule ou un seul point
                const commaCount = (newValue.match(/,/g) || []).length;
                const dotCount = (newValue.match(/\./g) || []).length;
                if (commaCount + dotCount > 1) {
                    return;
                }
                // Limiter à 2 décimales seulement si on a un point
                const normalizedValue = newValue.replace(',', '.');
                if (normalizedValue.includes('.') && normalizedValue.split('.')[1]?.length > 2) {
                    return;
                }
                // Vérifier que la valeur est entre 0.00 et 100.00
                if (normalizedValue && normalizedValue !== '.') {
                    const numValue = parseFloat(normalizedValue);
                    if (!isNaN(numValue) && (numValue < 0 || numValue > 100)) {
                        return;
                    }
                }
            }
            
            // Validation pour les prix (2 décimales)
            if (suffix === ' CHF') {
                // Permettre la saisie de nombres, points et virgules
                if (newValue && !/^[0-9.,]*$/.test(newValue)) {
                    return;
                }
                // Vérifier qu'il n'y a qu'une seule virgule ou un seul point
                const commaCount = (newValue.match(/,/g) || []).length;
                const dotCount = (newValue.match(/\./g) || []).length;
                if (commaCount + dotCount > 1) {
                    return;
                }
                // Limiter à 2 décimales seulement si on a un point
                const normalizedValue = newValue.replace(',', '.');
                if (normalizedValue.includes('.') && normalizedValue.split('.')[1]?.length > 2) {
                    return;
                }
                // Vérifier que la valeur est entre 0.00 et 9999.99
                if (normalizedValue && normalizedValue !== '.') {
                    const numValue = parseFloat(normalizedValue);
                    if (!isNaN(numValue) && (numValue < 0 || numValue > 9999.99)) {
                        return;
                    }
                }
            }
            
            onChange(newValue);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (!disabled && onBlur) {
            let newValue = e.target.value;
            
            // Si on a un suffixe, on s'assure qu'il n'est pas inclus dans la valeur modifiée
            if (suffix && newValue.endsWith(suffix)) {
                newValue = newValue.slice(0, -suffix.length);
            }
            
            onBlur(newValue);
        }
    };

    // Calculer la valeur à afficher
    const displayValue = value || '';

    const getInputClasses = () => {
        const baseClasses = `
            border rounded-md transition-all duration-200 shadow-sm
            ${sizeClasses[size]}
            ${widthClasses[width]}
            ${colors.placeholder}
            focus:outline-none
        `;

        if (disabled) {
            return `${baseClasses} ${colors.disabled}`;
        }

        if (error) {
            return `${baseClasses} ${colors.error}`;
        }

        return `
            ${baseClasses}
            ${colors.background}
            ${colors.border}
            ${colors.text}
            ${colors.focus}
            ${colors.hover}
        `;
    };

    return (
        <div className={`${getWidthWithSuffix()} ${className}`}>
            {label && (
                <label 
                    htmlFor={id} 
                    className={`block text-sm font-medium mb-2 ${colors.label}`}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            
            <div className="relative">
                {icon && iconPosition === 'left' && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">
                            {icon}
                        </span>
                    </div>
                )}
                
                <input
                    ref={ref}
                    type={type}
                    value={displayValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    id={id}
                    name={name}
                    className={`
                        ${getInputClasses()}
                        ${icon && iconPosition === 'left' ? 'pl-10' : ''}
                        ${icon && iconPosition === 'right' ? 'pr-10' : ''}
                        ${suffix === ' CHF' ? 'pr-12 text-right' : ''}
                        ${suffix === ' %' ? 'pr-10 text-right' : ''}
                        ${suffix && suffix !== ' CHF' && suffix !== ' %' ? 'pr-12 text-right' : ''}
                    `}
                />
                
                {suffix && (
                    <div className={`absolute inset-y-0 right-0 flex items-center pointer-events-none ${
                        suffix === ' CHF' ? 'pr-3' : 
                        suffix === ' %' ? 'pr-3' : 
                        'pr-3'
                    }`}>
                        <span className={`${colors.suffix} text-sm`}>
                            {suffix}
                        </span>
                    </div>
                )}
                
                {icon && iconPosition === 'right' && !suffix && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">
                            {icon}
                        </span>
                    </div>
                )}
            </div>
            
            {error && (
                <p className="mt-1 text-sm text-red-600">
                    {error}
                </p>
            )}
            
            {helperText && !error && (
                <p className={`mt-1 text-xs ${colors.helperText}`}>
                    {helperText}
                </p>
            )}
        </div>
    );
});

InputField.displayName = 'InputField';

export default InputField;
