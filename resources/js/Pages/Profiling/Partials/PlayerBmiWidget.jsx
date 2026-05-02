import React, { useMemo } from 'react';
import { Shield } from 'lucide-react';

export default function PlayerBmiWidget({ player }) {
    const bmiData = useMemo(() => {
        if (!player.weight || !player.height) return { value: null, status: 'Belum Lengkap', color: 'text-zinc-500 dark:text-zinc-400', bg: 'bg-zinc-100 dark:bg-zinc-900', border: 'border-zinc-200 dark:border-zinc-800' };
        
        const heightInMeters = player.height / 100;
        const bmi = (player.weight / (heightInMeters * heightInMeters)).toFixed(1);
        
        if (bmi < 18.5) return { value: bmi, status: 'Underweight', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800/50' };
        if (bmi >= 18.5 && bmi <= 24.9) return { value: bmi, status: 'Ideal', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800/50' };
        if (bmi >= 25 && bmi <= 29.9) return { value: bmi, status: 'Overweight', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800/50' };
        
        return { value: bmi, status: 'Obese', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800/50' };
    }, [player.weight, player.height]);

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 flex flex-col transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-inner">
                    <Shield size={20} strokeWidth={2} className="text-zinc-500 dark:text-zinc-400" />
                </div>
                <h3 className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Body Mass Index</h3>
            </div>
            <div className="flex items-end gap-3 mb-3 relative z-10">
                <span className={`text-5xl font-black tabular-nums tracking-tighter ${bmiData.value ? 'text-zinc-900 dark:text-white' : 'text-zinc-300 dark:text-zinc-700'}`}>
                    {bmiData.value || 'N/A'}
                </span>
            </div>
            <div className="mb-2 relative z-10">
                <span className={`px-3 py-1.5 rounded-lg border shadow-sm inline-flex items-center justify-center font-bold text-xs tracking-wide ${bmiData.bg} ${bmiData.color} ${bmiData.border}`}>
                    Status: {bmiData.status}
                </span>
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-500 leading-relaxed font-medium mt-auto relative z-10">
                Rasio ideal <strong className="text-emerald-600 dark:text-emerald-400">18.5 - 24.9</strong> untuk meminimalisir risiko cedera beban sendi.
            </p>
        </div>
    );
}