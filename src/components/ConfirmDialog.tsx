'use client';
import { type ReactNode } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

type ConfirmDialogProps = {
    isOpen: boolean;
    title: string;
    description?: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
    icon?: ReactNode;
    confirmVariant?: 'primary' | 'danger';
};

export default function ConfirmDialog({
    isOpen,
    title,
    description,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
    icon,
    confirmVariant = 'danger',
}: ConfirmDialogProps) {
    if (!isOpen) {
        return null;
    }

    const confirmButtonClasses =
        confirmVariant === 'danger'
            ? 'bg-[#E5484D] border-[#E5484D] text-white hover:bg-[#B81D24] hover:border-[#B81D24]'
            : 'bg-[#4E5BA6] border-[#4E5BA6] text-white hover:bg-[#3D4A8A] hover:border-[#3D4A8A]';

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200">
                <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        {icon && <div className="text-[#E5484D]">{icon}</div>}
                        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="rounded-full p-1 text-gray-400 hover:text-gray-600 transition-colors duration-150"
                        aria-label={cancelLabel}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                {description && (
                    <div className="px-6 pt-4 text-sm text-gray-600">
                        {description}
                    </div>
                )}
                <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100">
                    <Button
                        onClick={onCancel}
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className={confirmButtonClasses}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}






