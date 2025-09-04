"use client";
import React, { useState } from 'react';
import InputRow from './InputRow';
import Button from './Button';

type ListItem = {
    id: string;
    [key: string]: any;
};

type ListProps = {
    items: ListItem[];
    onItemsChange: (items: ListItem[]) => void;
    title?: string;
    addButtonText?: string;
    emptyMessage?: string;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    showAddButton?: boolean;
    showDeleteButton?: boolean;
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
        addButton?: string;
        deleteButton?: string;
        deleteButtonHover?: string;
        optionHover?: string;
        optionSelected?: string;
    };
    fields?: Array<{
        key: string;
        label: string;
        type: 'text' | 'number' | 'select';
        placeholder?: string;
        options?: Array<{ value: string; label: string }>;
        suffix?: string;
        width?: string;
    }>;
};

export default function List({
    items,
    onItemsChange,
    title,
    addButtonText = 'Ajouter',
    emptyMessage = 'Aucun élément',
    disabled = false,
    size = 'md',
    className = '',
    showAddButton = true,
    showDeleteButton = true,
    colors = {},
    fields = []
}: ListProps) {
    const handleAdd = () => {
        const newItem: ListItem = {
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...fields.reduce((acc, field) => ({ ...acc, [field.key]: '' }), {})
        };
        onItemsChange([...items, newItem]);
    };

    const handleDelete = (id: string) => {
        onItemsChange(items.filter(item => item.id !== id));
    };

    const handleItemChange = (id: string, key: string, value: string) => {
        const updatedItems = items.map(item =>
            item.id === id ? { ...item, [key]: value } : item
        );
        onItemsChange(updatedItems);
    };

    const handleItemBlur = (id: string, key: string, value: string) => {
        let formattedValue = value;

        // Formatage automatique pour les prix
        if (key === 'prix' && value) {
            // Convertir la virgule en point pour le parsing
            const normalizedValue = value.replace(',', '.');
            const numValue = parseFloat(normalizedValue);
            if (!isNaN(numValue)) {
                // Formater avec une virgule pour l'affichage
                formattedValue = numValue.toFixed(2).replace('.', ',');
            }
        }

        const updatedItems = items.map(item =>
            item.id === id ? { ...item, [key]: formattedValue } : item
        );
        onItemsChange(updatedItems);
    };

    const getColumnWidth = (field: any) => {
        if (!field) return 'full';
        if (field.width) return field.width;
        if (field.type === 'select') return 'full';
        if (field.suffix) return 'sm';
        return 'full';
    };

    const convertOptionsToStringArray = (options?: Array<{ value: string; label: string }>) => {
        if (!options) return [];
        return options.map(option => option.label);
    };

    const renderInputRow = (item: ListItem) => {
        // Vérifier que fields a au moins un élément
        if (fields.length === 0) {
            return null;
        }

        const leftField = fields[0];
        const rightField = fields[1];

        return (
            <InputRow
                key={item.id}
                id={item.id}
                leftValue={item[leftField.key] || ''}
                rightValue={rightField ? (item[rightField.key] || '') : ''}
                leftSuffix={leftField.suffix}
                rightSuffix={rightField?.suffix}
                leftPlaceholder={!item[leftField.key] ? leftField.placeholder : ''}
                rightPlaceholder={rightField && !item[rightField.key] ? rightField.placeholder : ''}
                onLeftChange={(value) => handleItemChange(item.id, leftField.key, value)}
                onRightChange={rightField ? (value) => handleItemChange(item.id, rightField.key, value) : undefined}
                onLeftBlur={(value) => handleItemBlur(item.id, leftField.key, value)}
                onRightBlur={rightField ? (value) => handleItemBlur(item.id, rightField.key, value) : undefined}
                onDelete={handleDelete}
                leftType={leftField.type}
                rightType={rightField?.type}
                leftOptions={convertOptionsToStringArray(leftField.options)}
                rightOptions={convertOptionsToStringArray(rightField?.options)}
                size={size}
                leftWidth={getColumnWidth(leftField)}
                rightWidth={getColumnWidth(rightField)}
                disabled={disabled}
                showLeftInput={true}
                showRightInput={!!rightField}
                showDeleteButton={showDeleteButton}
                colors={{
                    background: colors.background,
                    border: colors.border,
                    text: colors.text,
                    placeholder: colors.placeholder,
                    focus: colors.focus,
                    hover: colors.hover,
                    disabled: colors.disabled,
                    error: colors.error,
                    suffix: colors.suffix,
                    deleteButton: colors.deleteButton,
                    deleteButtonHover: colors.deleteButtonHover,
                    optionHover: colors.optionHover,
                    optionSelected: colors.optionSelected
                }}
            />
        );
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {title && (
                <h3 className="text-sm font-medium text-gray-700">{title}</h3>
            )}

            <div className="space-y-2">
                {items.length === 0 ? (
                    <div className="text-left py-3 text-gray-500 text-sm">
                        {emptyMessage}
                    </div>
                ) : (
                    items.map(renderInputRow)
                )}
            </div>

            {showAddButton && (
                <Button
                    onClick={handleAdd}
                    disabled={disabled}
                    className={colors.addButton || 'bg-[#7F56D9] text-white hover:bg-[#6941C6] focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB] focus:shadow-xs transition-colors duration-200'}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 6.66675V13.3334M6.66669 10.0001H13.3334M18.3334 10.0001C18.3334 14.6025 14.6024 18.3334 10 18.3334C5.39765 18.3334 1.66669 14.6025 1.66669 10.0001C1.66669 5.39771 5.39765 1.66675 10 1.66675C14.6024 1.66675 18.3334 5.39771 18.3334 10.0001Z" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {addButtonText}
                </Button>
            )}
        </div>
    );
}
