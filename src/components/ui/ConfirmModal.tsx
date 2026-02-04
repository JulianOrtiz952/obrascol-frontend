'use client';

import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, Trash2, Box, Check } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'success';
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger'
}: ConfirmModalProps) {
    const getColors = () => {
        switch (variant) {
            case 'danger':
                return {
                    icon: <Box className="w-12 h-12 text-rose-500" />,
                    bg: 'bg-rose-50',
                    button: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                };
            case 'warning':
                return {
                    icon: <AlertTriangle className="w-12 h-12 text-amber-500" />,
                    bg: 'bg-amber-50',
                    button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                };
            case 'success':
                return {
                    icon: <Check className="w-12 h-12 text-emerald-500" />,
                    bg: 'bg-emerald-50',
                    button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                };
            default:
                return {
                    icon: <AlertTriangle className="w-12 h-12 text-slate-500" />,
                    bg: 'bg-slate-50',
                    button: 'bg-slate-600 hover:bg-slate-700 shadow-slate-600/20'
                };
        }
    };

    const colors = getColors();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="">
            <div className="text-center p-4">
                <div className={`mx-auto w-20 h-20 ${colors.bg} rounded-full flex items-center justify-center mb-6`}>
                    {colors.icon}
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    {message}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 px-4 py-2.5 text-white rounded-xl font-semibold transition-all shadow-lg ${colors.button}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
