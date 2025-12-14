"use client";
import React from 'react';

type ButtonProps = {
    children: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    className?: string;
    disabled?: boolean;
};

export default function Button({ children, onClick, type = "button", className = "", disabled = false }: ButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60 transition-colors duration-200 ${className}`}
        >
            {children}
        </button>
    );
}


