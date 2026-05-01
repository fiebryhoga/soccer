// resources/js/Pages/PerformanceLogs/Analysis/Partials/ACWRTable.jsx

import React from 'react';
import { CalendarDays, Activity, Coffee, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ACWRTable({ data }) {
    
    // Menerima data spesifik per metrik yang dikirim oleh parent
    const listData = [...(data || [])].reverse();

    const formatNum = (num, isDec = false) => {
        if (!num || isNaN(num)) return isDec ? '0.00' : '0';
        return isDec ? Number(num).toFixed(2) : (Number.isInteger(num) ? num.toString() : Number(num).toFixed(1));
    };

    const getACWRStatus = (acwr) => {
        if (acwr === 0) return null;
        if (acwr <= 1.3) return { 
            text: 'Optimal', 
            icon: <ShieldCheck size={10} strokeWidth={3} className="shrink-0" />, 
            style: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/50',
            valColor: 'text-emerald-600 dark:text-emerald-500'
        };
        if (acwr <= 1.5) return { 
            text: 'Caution', 
            icon: <AlertTriangle size={10} strokeWidth={3} className="shrink-0" />, 
            style: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/50',
            valColor: 'text-amber-600 dark:text-amber-500'
        };
        return { 
            text: 'Danger', 
            icon: <TrendingUp size={10} strokeWidth={3} className="shrink-0" />, 
            style: 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-900/50',
            valColor: 'text-red-600 dark:text-red-500'
        };
    };

    return (
        <div className="w-full bg-white dark:bg-zinc-950 flex flex-col h-full overflow-hidden transition-colors">
            
            <div className="p-3 lg:p-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
                <h3 className="text-xs font-black text-zinc-900 dark:text-white tracking-tight uppercase">
                    Log Harian EWMA
                </h3>
                <span className="text-[9px] font-black text-zinc-500 dark:text-zinc-400 tracking-widest bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded shadow-sm">
                    Terbaru di Atas
                </span>
            </div>
            
            <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800/60 flex-1 overflow-y-auto custom-scrollbar max-h-[500px]">
                {listData.map((day, idx) => {
                    const isOff = day.type === 'off' || day.title === 'off';
                    const status = getACWRStatus(day.acwr);

                    if (isOff) {
                        return (
                            <div key={idx} className="p-3 sm:p-4 flex items-center gap-3 bg-zinc-50/30 dark:bg-[#0c0c0e] hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                                <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-md text-zinc-400 dark:text-zinc-600 border border-zinc-200 dark:border-zinc-800">
                                    <Coffee size={14} strokeWidth={2.5} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 truncate">{day.day_name}</p>
                                    <h4 className="text-xs font-semibold text-zinc-400 dark:text-zinc-600 mt-0.5">Day Off</h4>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={idx} className="p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 bg-white dark:bg-zinc-950 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                            
                            <div className="flex items-start gap-3 w-full lg:w-1/3 min-w-0">
                                <div className="p-2 bg-zinc-900 dark:bg-zinc-100 rounded-md text-white dark:text-zinc-900 shadow-sm shrink-0">
                                    <CalendarDays size={14} strokeWidth={2.5} />
                                </div>
                                <div className="min-w-0 overflow-hidden">
                                    <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 truncate">{day.day_name}</p>
                                    <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 tracking-tight mt-0.5 truncate" title={day.name}>
                                        {day.name}
                                    </h4>
                                </div>
                            </div>

                            {/* Auto-Fit Grid untuk Kalkulasi (Rapi di semua ukuran grid parent) */}
                            <div className="grid gap-2 w-full" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))' }}>
                                <div className="flex flex-col gap-1 border-l-2 border-zinc-200 dark:border-zinc-800 pl-2.5">
                                    <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 tracking-widest truncate">
                                        Val
                                    </span>
                                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate" title={formatNum(day.val, true)}>{formatNum(day.val, true)}</span>
                                </div>
                                <div className="flex flex-col gap-1 border-l-2 border-zinc-200 dark:border-zinc-800 pl-2.5">
                                    <span className="text-[9px] font-black text-blue-500 dark:text-blue-400 tracking-widest truncate">
                                        Acute
                                    </span>
                                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate" title={formatNum(day.acute, true)}>{formatNum(day.acute, true)}</span>
                                </div>
                                <div className="flex flex-col gap-1 border-l-2 border-zinc-200 dark:border-zinc-800 pl-2.5">
                                    <span className="text-[9px] font-black text-purple-500 dark:text-purple-400 tracking-widest truncate">
                                        Chronic
                                    </span>
                                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate" title={formatNum(day.chronic, true)}>{formatNum(day.chronic, true)}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto mt-1 lg:mt-0 pt-2 lg:pt-0 border-t border-zinc-100 dark:border-zinc-800/50 lg:border-0 shrink-0">
                                <div className="flex flex-col lg:items-end">
                                    <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 tracking-widest">ACWR</span>
                                    <span className={`text-base font-black tabular-nums leading-none mt-1 ${status?.valColor || 'text-zinc-900 dark:text-zinc-100'}`}>
                                        {formatNum(day.acwr, true)}
                                    </span>
                                </div>
                                
                                {status && (
                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-bold tracking-widest text-[9px] shadow-sm shrink-0 uppercase ${status.style}`}>
                                        {status.icon}
                                        {status.text}
                                    </div>
                                )}
                            </div>
                            
                        </div>
                    );
                })}
            </div>
            
        </div>
    );
}