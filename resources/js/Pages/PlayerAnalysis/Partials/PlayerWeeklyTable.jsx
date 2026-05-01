// resources/js/Pages/Analysis/Partials/PlayerWeeklyTable.jsx

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, CalendarDays, Activity, Target, Zap, BarChart2 } from 'lucide-react';

export default function PlayerWeeklyTable({ weeks, activeCol, playerName }) {
    const [expandedWeeks, setExpandedWeeks] = useState({});
    
    // Data terbaru di atas
    const listData = [...(weeks || [])].reverse(); 

    const toggleWeek = (idx) => {
        setExpandedWeeks(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const formatNum = (num, isStat = false) => {
        if (!num || isNaN(num)) return isStat ? '0.00' : '0';
        return isStat ? Number(num).toFixed(2) : (Number.isInteger(num) ? num.toString() : Number(num).toFixed(1));
    };

    if (!activeCol) return null;

    return (
        <div className="w-full divide-y divide-zinc-200 dark:divide-zinc-800 flex flex-col max-h-[500px] overflow-y-auto custom-scrollbar">
            {listData.map((week) => {
                
                const stats = {
                    weeklyLoad: week.weeklyLoad,
                    meanDaily: week.meanDaily,
                    stdDev: week.stdDev,
                    monotony: week.monotony,
                    strain: week.strain
                };

                const isDangerMonotony = stats.monotony >= 2.0;

                return (
                    <div key={week.idx} className="p-3 sm:p-5 flex flex-col gap-3">
                        
                        <div className="flex items-center justify-between">
                            <h5 className="text-[11px] sm:text-xs font-black text-zinc-900 dark:text-white tracking-widest uppercase">
                                {week.dateRange}
                            </h5>
                        </div>

                        {/* Indikator Hitungan (Auto-Fit Grid) */}
                        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))' }}>
                            
                            <div className="bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-sm overflow-hidden">
                                <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest truncate">
                                    <Activity size={10} className="shrink-0" strokeWidth={3}/> <span className="truncate">Load</span>
                                </div>
                                <span className="text-xs font-black text-zinc-900 dark:text-white tabular-nums mt-1.5 truncate" title={formatNum(stats.weeklyLoad, true)}>
                                    {formatNum(stats.weeklyLoad, true)}
                                </span>
                            </div>
                            
                            <div className="bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-sm overflow-hidden">
                                <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest truncate">
                                    <BarChart2 size={10} className="shrink-0" strokeWidth={3}/> <span className="truncate">Mean/Day</span>
                                </div>
                                <span className="text-xs font-black text-zinc-900 dark:text-white tabular-nums mt-1.5 truncate" title={formatNum(stats.meanDaily, true)}>
                                    {formatNum(stats.meanDaily, true)}
                                </span>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-sm overflow-hidden">
                                <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest truncate">
                                    <Target size={10} className="shrink-0" strokeWidth={3}/> <span className="truncate">Std Dev</span>
                                </div>
                                <span className="text-xs font-black text-zinc-900 dark:text-white tabular-nums mt-1.5 truncate" title={formatNum(stats.stdDev, true)}>
                                    {formatNum(stats.stdDev, true)}
                                </span>
                            </div>

                            <div className={`p-2 rounded-lg border flex flex-col justify-between shadow-sm overflow-hidden ${isDangerMonotony ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}`}>
                                <div className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest truncate ${isDangerMonotony ? 'text-red-600 dark:text-red-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                    {isDangerMonotony && <AlertTriangle size={10} className="shrink-0" strokeWidth={3}/>} <span className="truncate">Monotony</span>
                                </div>
                                <span className={`text-xs font-black tabular-nums mt-1.5 truncate ${isDangerMonotony ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-white'}`} title={formatNum(stats.monotony, true)}>
                                    {formatNum(stats.monotony, true)}
                                </span>
                            </div>

                            <div className="bg-zinc-900 dark:bg-zinc-100 p-2 rounded-lg border border-transparent flex flex-col justify-between shadow-sm overflow-hidden">
                                <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest truncate">
                                    <Zap size={10} className="shrink-0 text-zinc-300 dark:text-zinc-600" strokeWidth={3}/> <span className="truncate">Strain</span>
                                </div>
                                <span className="text-xs font-black text-white dark:text-zinc-900 tabular-nums mt-1.5 truncate" title={formatNum(stats.strain, true)}>
                                    {formatNum(stats.strain, true)}
                                </span>
                            </div>

                        </div>

                        {/* Breakdown Harian (Auto-Fit) */}
                        <div className="pt-2">
                            <h4 className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                                <CalendarDays size={12} /> Laporan Harian: <span className="text-zinc-800 dark:text-zinc-200">{playerName}</span>
                            </h4>
                            <div className="grid gap-2 pt-1" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))' }}>
                                {week.days.map((day, dIdx) => {
                                    const val = day.metrics ? day.metrics[activeCol.id] : 0;
                                    const isOff = day.type === 'off';
                                    
                                    return (
                                        <div key={dIdx} className="flex flex-col p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden text-left">
                                            <span 
                                                className={`text-[9px] mb-1 uppercase tracking-widest w-full truncate ${isOff ? 'text-zinc-400 dark:text-zinc-600 font-bold' : 'font-black text-zinc-700 dark:text-zinc-300'}`}
                                                title={day.title}
                                            >
                                                {day.title}
                                            </span>
                                            <span 
                                                className={`text-xs tabular-nums font-black w-full truncate ${!val || val === 0 ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-900 dark:text-white'}`}
                                                title={formatNum(val)}
                                            >
                                                {formatNum(val)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                );
            })}
        </div>
    );
}