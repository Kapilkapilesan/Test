
import React from 'react';
import { Wallet, CheckCircle2, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { colors } from '@/themes/colors';
import { CollectionStats as StatsType } from '../../services/collection.types';

interface CollectionStatsProps {
    stats: StatsType;
}

export function CollectionStats({ stats }: CollectionStatsProps) {
    // Updated logic: Positive (+) is Debt/Red, Negative (-) is Advance/Green
    const netArrears = stats.arrears;

    // Determine styling based on net arrears value
    const getArrearsStyle = () => {
        if (netArrears > 0) {
            return {
                bgAccent: 'bg-rose-50/50',
                iconBg: 'bg-rose-500',
                shadow: 'shadow-rose-200',
                textColor: 'text-rose-600',
                subtitleColor: 'text-rose-400',
                subtitle: 'Debt (Overdue)',
                Icon: TrendingUp
            };
        } else if (netArrears < 0) {
            return {
                bgAccent: 'bg-emerald-50/50',
                iconBg: 'bg-emerald-500',
                shadow: 'shadow-emerald-200',
                textColor: 'text-emerald-600',
                subtitleColor: 'text-emerald-400',
                subtitle: 'Advance (Credit)',
                Icon: TrendingDown
            };
        } else {
            return {
                bgAccent: 'bg-gray-50/50',
                iconBg: 'bg-gray-400',
                shadow: 'shadow-gray-200',
                textColor: 'text-gray-600',
                subtitleColor: 'text-gray-400',
                subtitle: 'On track',
                Icon: Minus
            };
        }
    };

    const arrearsStyle = getArrearsStyle();
    const ArrearsIcon = arrearsStyle.Icon;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="bg-card rounded-2xl border border-border-default/50 p-5 hover:shadow-sm transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110 opacity-10" style={{ backgroundColor: colors.primary[500] }} />
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${colors.primary[600]}20`, color: colors.primary[600], border: `1px solid ${colors.primary[600]}30` }}>
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1 group-hover:text-text-secondary transition-colors">Total Due Today</p>
                        <p className="text-2xl font-black text-text-primary tracking-tight">LKR {stats.totalDue.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-2xl border border-border-default/50 p-5 hover:shadow-sm transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Total Collected</p>
                        <p className="text-2xl font-black text-emerald-500 tracking-tight">LKR {stats.collected.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-2xl border border-border-default/50 p-5 hover:shadow-sm transition-all group overflow-hidden relative">
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 opacity-10 transition-transform group-hover:scale-110 ${arrearsStyle.textColor.replace('text', 'bg')}`} />
                <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-12 h-12 ${arrearsStyle.iconBg.replace('bg', 'bg-opacity-10 bg')} ${arrearsStyle.textColor} border border-current/20 rounded-xl flex items-center justify-center shadow-sm`}>
                        <ArrearsIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Total Arrears</p>
                        <p className={`text-[10px] ${arrearsStyle.subtitleColor} font-bold uppercase tracking-tight mb-0.5`}>{arrearsStyle.subtitle}</p>
                        <p className={`text-2xl font-black ${arrearsStyle.textColor} tracking-tight`}>
                            LKR {netArrears > 0 ? '+' : ''}{netArrears.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
