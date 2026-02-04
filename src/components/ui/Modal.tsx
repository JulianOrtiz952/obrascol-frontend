'use client';

import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
    secondaryContent?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, size = '2xl', secondaryContent }: ModalProps) {
    const sizeClasses = {
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
    };
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    <div className="relative flex items-center justify-center gap-6 w-full max-w-[95vw]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={cn(
                                "relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]",
                                sizeClasses[size]
                            )}
                        >
                            <header className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                                <h2 className="text-lg md:text-xl font-bold text-slate-900 line-clamp-1">{title}</h2>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 md:p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </header>
                            <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar">
                                {children}
                            </div>
                        </motion.div>

                        {secondaryContent && (
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                transition={{ delay: 0.1 }}
                                className="hidden lg:block w-80 shrink-0 self-stretch"
                            >
                                {secondaryContent}
                            </motion.div>
                        )}
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
