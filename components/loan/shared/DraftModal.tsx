'use client';

import React from 'react';
import { DraftItem } from '@/types/loan.types';

interface DraftModalProps {
    isOpen: boolean;
    drafts: DraftItem[];
    onClose: () => void;
    onLoad: (draftId: string) => void;
    onDelete: (draftId: string) => void;
}

export const DraftModal: React.FC<DraftModalProps> = ({
    isOpen,
    drafts,
    onClose,
    onLoad,
    onDelete,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-blue-950/90 border border-blue-500/40 rounded-[2.5rem] shadow-2xl shadow-blue-500/20 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between p-8 border-b border-blue-500/20 bg-blue-900/30">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                            <h3 className="text-sm font-black text-blue-100 uppercase tracking-[0.2em]">Saved Drafts</h3>
                        </div>
                        <p className="text-[10px] text-blue-300/60 font-black uppercase tracking-[0.1em]">Load a previously saved loan application</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center bg-blue-800/40 hover:bg-blue-700/50 border border-blue-500/40 rounded-xl text-blue-300 transition-all active:scale-95"
                    >
                        <span className="text-xl leading-none">✕</span>
                    </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {drafts.length === 0 && (
                        <div className="p-12 text-center">
                            <div className="text-[10px] font-black text-blue-300/40 uppercase tracking-[0.3em] italic">No saved drafts found</div>
                        </div>
                    )}
                    <div className="divide-y divide-blue-500/10">
                        {drafts.map((draft) => (
                            <div key={draft.id} className="p-6 flex items-center justify-between group hover:bg-blue-500/10 transition-colors">
                                <div className="space-y-1">
                                    <p className="font-black text-blue-100 uppercase tracking-tight group-hover:text-blue-300 transition-colors">{draft.name || 'Unnamed Draft'}</p>
                                    <div className="flex items-center gap-3">
                                        <p className="text-[10px] text-blue-300/60 font-bold uppercase tracking-widest">
                                            {new Date(draft.savedAt).toLocaleString()}
                                        </p>
                                        <span className="w-1 h-1 bg-blue-500/50 rounded-full" />
                                        <p className="text-[9px] px-2 py-0.5 bg-blue-500/20 rounded-full text-blue-300 font-black uppercase tracking-widest border border-blue-500/30">
                                            Step {draft.currentStep || 1}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onLoad(draft.id)}
                                        className="h-10 px-6 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/30 active:scale-95"
                                    >
                                        Load
                                    </button>
                                    <button
                                        onClick={() => onDelete(draft.id)}
                                        className="h-10 px-4 bg-blue-900/40 hover:bg-rose-500/10 hover:text-rose-400 border border-blue-500/30 rounded-xl text-blue-300/70 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-blue-900/20 border-t border-blue-500/10 text-center">
                    <p className="text-[9px] text-blue-300/30 font-black uppercase tracking-[0.2em]">Drafts are stored securely on the server</p>
                </div>
            </div>
        </div>
    );
};
