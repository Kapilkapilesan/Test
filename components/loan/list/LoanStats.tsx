'use client';

import React from 'react';
import { FileText, TrendingUp, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { LoanStats as LoanStatsType } from '@/types/loan.types';
import { colors } from '@/themes/colors';

interface LoanStatsProps {
    stats: LoanStatsType;
}

export function LoanStats({ stats }: LoanStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
            <div className="bg-card rounded-2xl border border-border-default p-4 group transition-all hover:shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                        style={{ backgroundColor: `${colors.primary[600]}15` }}
                    >
                        <FileText className="w-4 h-4" style={{ color: colors.primary[600] }} />
                    </div>
                </div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-0.5">Total Loans</p>
                <p className="text-xl font-black text-text-primary leading-tight">{stats.total_count}</p>
            </div>

            <div className="bg-card rounded-2xl border border-border-default p-4 group transition-all hover:shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center transition-colors shadow-sm">
                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest px-1.5 py-0.5 bg-green-50 dark:bg-green-900/20 rounded-md">
                        {stats.total_count > 0 ? ((stats.active_count / stats.total_count) * 100).toFixed(0) : 0}%
                    </span>
                </div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-0.5">Active Loans</p>
                <p className="text-xl font-black text-text-primary leading-tight">{stats.active_count}</p>
            </div>

            <div className="bg-card rounded-2xl border border-border-default p-4 group transition-all hover:shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center transition-colors shadow-sm">
                        <CheckCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                        {stats.total_count > 0 ? ((stats.completed_count / (stats.total_count + stats.completed_count)) * 100).toFixed(0) : 0}%
                    </span>
                </div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-0.5">Completed Loans</p>
                <p className="text-xl font-black text-text-primary leading-tight">{stats.completed_count || 0}</p>
            </div>

            <div className="bg-card rounded-2xl border border-border-default p-4 group transition-all hover:shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                        style={{ backgroundColor: `${colors.primary[600]}15` }}
                    >
                        <DollarSign className="w-4 h-4" style={{ color: colors.primary[600] }} />
                    </div>
                </div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-0.5">Total Disbursed</p>
                <p className="text-xl font-black text-text-primary leading-tight">LKR {(Number(stats.total_disbursed) / 1000).toFixed(0)}K</p>
            </div>

            <div className="bg-card rounded-2xl border border-border-default p-4 group transition-all hover:shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center transition-colors shadow-sm">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                </div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-0.5">Outstanding</p>
                <p className="text-xl font-black text-text-primary leading-tight">LKR {(Number(stats.total_outstanding) / 1000).toFixed(0)}K</p>
            </div>
        </div>
    );
}
