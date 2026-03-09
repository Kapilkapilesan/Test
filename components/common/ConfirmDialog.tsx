'use client'

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { colors } from '@/themes/colors';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'warning'
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: 'bg-rose-500/10',
            iconColor: 'text-rose-500',
            button: 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20'
        },
        warning: {
            icon: `bg-amber-500/10`,
            iconColor: `text-amber-500`,
            button: `bg-amber-600 hover:bg-amber-500 shadow-amber-500/20`
        },
        info: {
            icon: `bg-primary-500/10`,
            iconColor: `text-primary-500`,
            button: `bg-primary-600 hover:bg-primary-500 shadow-primary-500/20`
        }
    };

    const styles = variantStyles[variant];

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[12px] flex items-center justify-center z-[100] p-4 animate-in fade-in duration-500">
            <div className="bg-card/90 dark:bg-card/95 backdrop-blur-md rounded-[2.5rem] max-w-sm w-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-border-default/50 overflow-hidden animate-in zoom-in-95 duration-500 transform transition-all">
                <div className="p-8">
                    <div className="flex flex-col items-center text-center gap-6">
                        <div className={`w-16 h-16 ${styles.icon} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ring-4 ring-card/50`}>
                            <AlertTriangle className={`w-8 h-8 ${styles.iconColor}`} />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter leading-tight">
                                {title}
                            </h3>
                            <div className="text-xs font-bold text-text-secondary leading-relaxed uppercase tracking-tight opacity-80">
                                {message}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 pb-8 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => {
                            onConfirm();
                            onCancel();
                        }}
                        className={`flex-1 px-4 py-3 text-white rounded-xl transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-95 ${styles.button}`}
                    >
                        {confirmText}
                    </button>
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 border border-border-default bg-muted-bg/50 text-text-muted rounded-xl hover:bg-hover hover:text-text-primary transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] active:scale-95"
                    >
                        {cancelText}
                    </button>
                </div>

                <button
                    onClick={onCancel}
                    className="absolute top-6 right-6 p-2 hover:bg-muted-bg text-text-muted hover:text-danger-500 rounded-xl transition-all duration-300 group"
                >
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                </button>
            </div>
        </div>
    );
}
