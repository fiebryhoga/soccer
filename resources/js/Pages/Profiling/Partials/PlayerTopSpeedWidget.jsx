import React from 'react';
import { Zap } from 'lucide-react';

export default function PlayerTopSpeedWidget({ topSpeedValue }) {
    
    // Fallback formatter khusus widget ini
    const formatNum = (num) => {
        if (!num || isNaN(num)) return '0';
        return Number.isInteger(Number(num)) ? num.toString() : Number(num).toFixed(2);
    };

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 flex flex-col transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 dark:bg-orange-500/10 blur-3xl rounded-full pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="p-2.5 bg-orange-50 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800/50 shadow-inner">
                    <Zap size={20} strokeWidth={2.5} className="text-orange-500" />
                </div>
                <h3 className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Top Speed / Max Velocity</h3>
            </div>
            <div className="flex items-end gap-2 mb-3 relative z-10">
                <span className={`text-5xl font-black tabular-nums tracking-tighter ${topSpeedValue > 0 ? 'text-zinc-900 dark:text-white' : 'text-zinc-300 dark:text-zinc-700'}`}>
                    {topSpeedValue > 0 ? formatNum(topSpeedValue) : '0'} 
                </span>
                <span className="text-lg font-bold text-zinc-400 dark:text-zinc-600 mb-1.5">km/h</span>
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-500 leading-relaxed font-medium mt-auto relative z-10">
                Kecepatan maksimal (*All-Time High*) yang pernah dicapai oleh pemain ini di seluruh riwayat rekornya.
            </p>
        </div>
    );
}