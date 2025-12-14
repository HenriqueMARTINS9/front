"use client";
import React, { useEffect, useState } from 'react';

type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
    type: NotificationType;
    message: string;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export default function Notification({ 
    type, 
    message, 
    isVisible, 
    onClose, 
    duration = 5000 
}: NotificationProps) {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setIsAnimating(true);
            const timer = setTimeout(() => {
                setIsAnimating(false);
                setTimeout(onClose, 300); // Attendre la fin de l'animation
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                );
            case 'error':
                return (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 6.66667V10M10 13.3333H10.0083M18.3333 10C18.3333 14.6024 14.6024 18.3333 10 18.3333C5.39763 18.3333 1.66667 14.6024 1.66667 10C1.66667 5.39763 5.39763 1.66667 10 1.66667C14.6024 1.66667 18.3333 5.39763 18.3333 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                );
            case 'info':
                return (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 6.66667V10M10 13.3333H10.0083M18.3333 10C18.3333 14.6024 14.6024 18.3333 10 18.3333C5.39763 18.3333 1.66667 14.6024 1.66667 10C1.66667 5.39763 5.39763 1.66667 10 1.66667C14.6024 1.66667 18.3333 5.39763 18.3333 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                );
        }
    };

    const getStyles = () => {
        const baseStyles = "fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300";
        
        switch (type) {
            case 'success':
                return `${baseStyles} bg-green-50 border border-green-200 text-green-800`;
            case 'error':
                return `${baseStyles} bg-red-50 border border-red-200 text-red-800`;
            case 'info':
                return `${baseStyles} bg-blue-50 border border-blue-200 text-blue-800`;
        }
    };

    if (!isVisible) return null;

    return (
        <div className={`${getStyles()} ${isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
            <div className="flex-shrink-0">
                {getIcon()}
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium">{message}</p>
            </div>
            <button
                onClick={() => {
                    setIsAnimating(false);
                    setTimeout(onClose, 300);
                }}
                className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </div>
    );
}
