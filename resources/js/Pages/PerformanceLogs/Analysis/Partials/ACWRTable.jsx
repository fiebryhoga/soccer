// resources/js/Pages/PerformanceLogs/Analysis/Partials/ACWRTable.jsx

import React from 'react';
import { CalendarDays, Activity, Coffee, TrendingUp, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

export default function ACWRTable({ data }) {
    
    // MEMBALIK DATA: Tanggal Terbaru ada di Atas
    const listData = [...data].reverse();

    const formatNum = (num, isDec = false) => {
        if (!num || isNaN(num)) return isDec ? '0.00' : '0';
        return isDec ? Number(num).toFixed(2) : (Number.isInteger(num) ? num.toString() : Number(num).toFixed(1));
    };

    // Style Badge Status Modern (Shadcn Vibe)
    const getACWRStatus = (acwr) => {
        if (acwr === 0) return null;
        if (acwr <= 1.3) return { 
            text: 'Optimal', 
            icon: <ShieldCheck size={12} strokeWidth={3} />, 
            style: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/50',
            valColor: 'text-emerald-600 dark:text-emerald-500'
        };
        if (acwr <= 1.5) return { 
            text: 'Caution', 
            icon: <AlertTriangle size={12} strokeWidth={3} />, 
            style: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/50',
            valColor: 'text-amber-600 dark:text-amber-500'
        };
        return { 
            text: 'Danger', 
            icon: <TrendingUp size={12} strokeWidth={3} />, 
            style: 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-900/50',
            valColor: 'text-red-600 dark:text-red-500'
        };
    };

    return (
        <div className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden flex flex-col transition-colors">
            
            {/* HEADER */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100  tracking-wide">
                        Log Harian EWMA
                    </h3>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Daftar detail beban harian dan rasio ACWR.
                    </p>
                </div>
                <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400  tracking-widest bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-md shadow-sm">
                    Terbaru di Atas
                </span>
            </div>
            
            {/* LIST CONTAINER */}
            <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {listData.map((day, idx) => {
                    const isOff = day.type === 'off' || day.title === 'off';
                    const status = getACWRStatus(day.acwr);

                    // JIKA HARI LIBUR (OFF)
                    if (isOff) {
                        return (
                            <div key={idx} className="p-4 flex items-center gap-4 bg-zinc-50/30 dark:bg-[#0c0c0e] hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                                <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-zinc-400 dark:text-zinc-600 border border-zinc-200 dark:border-zinc-800">
                                    <Coffee size={18} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-500">{day.day_name}</p>
                                    <h4 className="text-sm font-semibold text-zinc-400 dark:text-zinc-600 mt-0.5">Day Off</h4>
                                </div>
                            </div>
                        );
                    }

                    // JIKA ADA SESI AKTIF
                    return (
                        <div key={idx} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-950 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                            
                            {/* Kiri: Identitas Sesi */}
                            <div className="flex items-start md:items-center gap-3.5 w-full md:w-1/3">
                                <div className="p-2.5 bg-zinc-900 dark:bg-zinc-100 rounded-lg text-white dark:text-zinc-900 shadow-sm shrink-0">
                                    <CalendarDays size={18} strokeWidth={2.5} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 truncate">{day.day_name}</p>
                                    <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100  tracking-tight mt-0.5 truncate pr-2">
                                        {day.name}
                                    </h4>
                                </div>
                            </div>

                            {/* Tengah: Metrik Mini (Val, Acute, Chronic) */}
                            <div className="flex items-center gap-3 sm:gap-6 w-full md:w-auto pl-12 md:pl-0 tabular-nums">
                                <div className="flex flex-col gap-1 border-l-2 border-zinc-200 dark:border-zinc-800 pl-3 sm:pl-4">
                                    <span className="text-[10px] font-black text-zinc-400  tracking-widest flex items-center gap-1">
                                        <Activity size={10} /> Metrik
                                    </span>
                                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{formatNum(day.val, true)}</span>
                                </div>
                                <div className="flex flex-col gap-1 border-l-2 border-zinc-200 dark:border-zinc-800 pl-3 sm:pl-4">
                                    <span className="text-[10px] font-black text-blue-500 dark:text-blue-400  tracking-widest">
                                        Acute
                                    </span>
                                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{formatNum(day.acute, true)}</span>
                                </div>
                                <div className="flex flex-col gap-1 border-l-2 border-zinc-200 dark:border-zinc-800 pl-3 sm:pl-4">
                                    <span className="text-[10px] font-black text-purple-500 dark:text-purple-400  tracking-widest">
                                        Chronic
                                    </span>
                                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{formatNum(day.chronic, true)}</span>
                                </div>
                            </div>

                            {/* Kanan: Hasil ACWR & Badge Status */}
                            <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t border-zinc-100 dark:border-zinc-800/50 md:border-0">
                                <div className="flex flex-col md:items-end">
                                    <span className="text-[10px] font-black text-zinc-400  tracking-widest">Rasio ACWR</span>
                                    <span className={`text-xl font-black tabular-nums leading-none mt-1 ${status?.valColor || 'text-zinc-900 dark:text-zinc-100'}`}>
                                        {formatNum(day.acwr, true)}
                                    </span>
                                </div>
                                
                                {status && (
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-bold tracking-widest text-[10px] shadow-sm ${status.style}`}>
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