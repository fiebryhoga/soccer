// resources/js/Pages/PerformanceLogs/Analysis/Partials/WeeklyTable.jsx

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, CalendarDays, Activity, Target, Zap, BarChart2 } from 'lucide-react';

export default function WeeklyTable({ weeks, columns }) {
    
    // We can still use expandedWeeks, but we might want to default it to open if it's a single card
    // or just let it behave normally.
    const [expandedWeeks, setExpandedWeeks] = useState({});
    
    // Membalik urutan: Data terbaru di atas
    const listData = [...weeks].reverse(); 

    const toggleWeek = (idx) => {
        setExpandedWeeks(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    // Format mutlak 2 angka desimal untuk semua kalkulasi Load, Strain, Monotony
    const formatNum = (num, isStat = false) => {
        if (!num || isNaN(num)) return isStat ? '0.00' : '0';
        return isStat ? Number(num).toFixed(2) : (Number.isInteger(num) ? num.toString() : Number(num).toFixed(1));
    };

    // Ambil kolom pertama dari columns prop. 
    // Jika kita berada dalam grid view, columns.length = 1.
    const activeCol = columns.length > 0 ? columns[0] : null;

    if (!activeCol) return null;

    return (
        <div className="w-full space-y-4">
            
            {/* Header Bagian - We can optionally hide this if it feels redundant in grid view, 
                but keeping it maintains consistency. */}
            <div className="flex items-end justify-between p-2">
                <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                        Detail Analisis per Minggu
                    </h3>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Menampilkan hasil perhitungan untuk metrik <span className="font-bold text-zinc-700 dark:text-zinc-300">{activeCol.label}</span>
                    </p>
                </div>
            </div>
            
            {/* List Akordeon (Cards) */}
            <div className="space-y-3 p-2">
                {listData.map((week) => {
                    const isExpanded = expandedWeeks[week.idx];
                    // Make sure we access the stats specifically for the activeCol
                    const stats = week.stats[activeCol.id];
                    const isDangerMonotony = stats?.monotony >= 2.0;

                    return (
                        <div key={week.idx} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden transition-all duration-200">
                            
                            {/* HEADER CARD (TRIGGER) */}
                            <button 
                                onClick={() => toggleWeek(week.idx)}
                                className="w-full p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-50/50 dark:bg-[#0c0c0e] hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-md text-zinc-500 dark:text-zinc-400">
                                        {isExpanded ? <ChevronUp size={16} strokeWidth={2.5}/> : <ChevronDown size={16} strokeWidth={2.5}/>}
                                    </div>
                                    <div>
                                        {/* Tanggal Miring sesuai permintaan */}
                                        <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 tracking-wide">
                                            {week.dateRange}
                                        </p>
                                    </div>
                                </div>

                                {/* QUICK STATS DI HEADER CARD (Hanya muncul jika Card Tertutup) */}
                                {!isExpanded && stats && (
                                    <div className="flex flex-wrap items-center gap-2 md:gap-4 pl-10 md:pl-0 tabular-nums">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800">
                                            <span className="text-zinc-400">Load:</span> 
                                            <span className="text-zinc-900 dark:text-zinc-100">{formatNum(stats.weeklyLoad, true)}</span>
                                        </div>
                                        <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${isDangerMonotony ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                                            <span className={isDangerMonotony ? 'text-red-400' : 'text-zinc-400'}>Monotony:</span> 
                                            <span className={isDangerMonotony ? 'text-red-600 dark:text-red-400 font-bold flex items-center gap-1' : 'text-zinc-900 dark:text-zinc-100'}>
                                                {formatNum(stats.monotony, true)}
                                                {isDangerMonotony && <AlertTriangle size={12} strokeWidth={3} />}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </button>

                            {/* BODY CARD (DETAIL) */}
                            {isExpanded && stats && (
                                <div className="p-4 md:p-5 border-t border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-top-2 duration-200">
                                    
                                    {/* WIDGET KALKULASI 5 KOTAK */}
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
                                        
                                        <div className="bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                                <Activity size={12} strokeWidth={3}/> Weekly Load
                                            </div>
                                            <span className="text-lg font-black text-zinc-900 dark:text-zinc-100 tabular-nums leading-none mt-1">
                                                {formatNum(stats.weeklyLoad, true)}
                                            </span>
                                        </div>
                                        
                                        <div className="bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                                <BarChart2 size={12} strokeWidth={3}/> Mean Daily
                                            </div>
                                            <span className="text-lg font-black text-zinc-900 dark:text-zinc-100 tabular-nums leading-none mt-1">
                                                {formatNum(stats.meanDaily, true)}
                                            </span>
                                        </div>

                                        <div className="bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                                <Target size={12} strokeWidth={3}/> Standard Dev
                                            </div>
                                            <span className="text-lg font-black text-zinc-900 dark:text-zinc-100 tabular-nums leading-none mt-1">
                                                {formatNum(stats.stdDev, true)}
                                            </span>
                                        </div>

                                        <div className={`p-3.5 rounded-lg border flex flex-col gap-1 col-span-2 md:col-span-1 ${isDangerMonotony ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20' : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/60'}`}>
                                            <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${isDangerMonotony ? 'text-red-500 dark:text-red-400' : 'text-zinc-400'}`}>
                                                {isDangerMonotony && <AlertTriangle size={12} strokeWidth={3}/>} Monotony
                                            </div>
                                            <span className={`text-lg font-black tabular-nums leading-none mt-1 ${isDangerMonotony ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                                {formatNum(stats.monotony, true)}
                                            </span>
                                        </div>

                                        <div className="bg-zinc-100 dark:bg-zinc-800/50 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 flex flex-col gap-1 col-span-2 md:col-span-1 shadow-sm">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                                                <Zap size={12} strokeWidth={3} className="text-zinc-700 dark:text-zinc-300"/> Strain
                                            </div>
                                            <span className="text-lg font-black text-zinc-900 dark:text-zinc-100 tabular-nums leading-none mt-1">
                                                {formatNum(stats.strain, true)}
                                            </span>
                                        </div>

                                    </div>

                                    {/* LIST HARIAN (Menggantikan baris tabel) */}
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <CalendarDays size={14} className="text-zinc-400"/> Breakdown Harian
                                        </h4>
                                        {/* Adjusted grid columns to better fit inside the 2-column parent grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                                            {week.days.map((day, dIdx) => {
                                                const val = day.averages[activeCol.id];
                                                const isOff = day.type === 'off';
                                                
                                                return (
                                                    <div key={dIdx} className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-[0_2px_4px_rgba(0,0,0,0.01)]">
                                                        <span className={`text-xs truncate pr-3 ${isOff ? 'italic text-zinc-400 dark:text-zinc-600 font-medium' : 'font-bold text-zinc-700 dark:text-zinc-300'}`}>
                                                            {day.title}
                                                        </span>
                                                        <span className={`text-sm tabular-nums font-black ${!val || val === 0 ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                                            {formatNum(val)}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}