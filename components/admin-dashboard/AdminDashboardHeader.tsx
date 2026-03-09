'use client'

import React from 'react';
import { Sparkles, Calendar, Zap } from 'lucide-react';
import { colors } from '@/themes/colors';

interface AdminDashboardHeaderProps {
    userName: string;
}

export default function AdminDashboardHeader({ userName }: AdminDashboardHeaderProps) {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="relative overflow-hidden bg-card rounded-[2rem] lg:rounded-[2.5rem] border border-border-default transition-all duration-500 mb-8 w-full group">
            <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                {/* Greeting Section */}
                <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-text-primary tracking-tighter leading-none mb-4">
                        Welcome back, <br className="sm:hidden" />
                        <span style={{ color: colors.primary[600] }}>
                            {userName}
                        </span>
                    </h1>
                </div>

                {/* Status Widgets */}
                <div className="flex flex-col sm:flex-row gap-4 items-center self-end md:self-center">
                    <div className="flex items-center gap-4 bg-muted-bg/50 p-6 rounded-3xl border border-border-default/50 transition-colors hover:bg-card">
                        <div className="p-3.5 bg-card rounded-2xl border border-border-default">
                            <Calendar className="w-7 h-7" style={{ color: colors.primary[600] }} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Current Session</p>
                            <p className="text-base font-black text-text-primary tracking-tight">{today}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
