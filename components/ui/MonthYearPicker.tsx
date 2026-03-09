'use client'

import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { colors } from '@/themes/colors';

interface MonthYearPickerProps {
    selectedMonth: number;
    selectedYear: number;
    onChange: (month: number, year: number) => void;
    className?: string;
}

export default function MonthYearPicker({
    selectedMonth,
    selectedYear,
    onChange,
    className = ''
}: MonthYearPickerProps) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

    return (
        <div className={`flex items-center gap-4 bg-muted-bg/30 dark:bg-card/40 backdrop-blur-xl p-3 rounded-2xl lg:rounded-3xl border border-border-default dark:border-border-divider/30 transition-all hover:border-primary-500/30 ${className}`}>
            <div className="flex items-center gap-3 pl-4 pr-2 border-r border-border-divider/20 py-1">
                <Calendar className="w-4 h-4 text-primary-500" />
                <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.25em] whitespace-nowrap">Period Filter</span>
            </div>

            <div className="flex items-center gap-2 pr-1">
                <div className="relative group/pick">
                    <select
                        value={selectedMonth}
                        onChange={(e) => onChange(e.target.value === 'all' ? 0 : parseInt(e.target.value), selectedYear)}
                        className="appearance-none pl-4 pr-10 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl bg-card border border-border-divider/30 text-text-primary outline-none transition-all cursor-pointer hover:bg-muted-bg dark:hover:bg-white/10 focus:ring-2 focus:ring-primary-500/50"
                    >
                        <option value="all" className="bg-card text-text-primary">All Months</option>
                        {months.map((month, index) => (
                            <option key={month} value={index + 1} className="bg-card text-text-primary">
                                {month}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted/40 dark:text-white/40 group-hover/pick:text-primary-400 transition-colors pointer-events-none" />
                </div>

                <div className="relative group/pick">
                    <select
                        value={selectedYear}
                        onChange={(e) => onChange(selectedMonth, e.target.value === 'all' ? 0 : parseInt(e.target.value))}
                        className="appearance-none pl-4 pr-10 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl bg-card border border-border-divider/30 text-text-primary outline-none transition-all cursor-pointer hover:bg-muted-bg dark:hover:bg-white/10 focus:ring-2 focus:ring-primary-500/50"
                    >
                        <option value="all" className="bg-card text-text-primary">All Years</option>
                        {years.map((year) => (
                            <option key={year} value={year} className="bg-card text-text-primary">
                                {year}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted/40 dark:text-white/40 group-hover/pick:text-primary-400 transition-colors pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
