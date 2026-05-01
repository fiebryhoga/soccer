// resources/js/Pages/PerformanceLogs/Analysis/Partials/PlayerACWRTable.jsx

import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, UserCheck, CalendarDays, Activity, Target, TrendingUp, Coffee } from 'lucide-react';

export default function PlayerACWRTable({ days, activeCol, playerName }) {
    
    // Balik urutan agar hari terbaru berada paling atas
    const listData = [...(days || [])].reverse(); 

    const formatNum = (num, isStat = false) => {
        if (!num || isNaN(num)) return isStat ? '0.00' : '0';
        return isStat ? Number(num).toFixed(2) : (Number.isInteger(num) ? num.toString() : Number(num).toFixed(1));
    };

    if (!activeCol) return null;

    return (
        <div className="w-full divide-y divide-zinc-200 dark:divide-zinc-800 flex flex-col max-h-[500px] overflow-y-auto custom-scrollbar">
            
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900/30 sticky top-0 z-10 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
                <div>
                    <h3 className="text-xs font-black text-zinc-900 dark:text-white tracking-tight uppercase flex items-center gap-2">
                        <UserCheck size={14} className="text-emerald-500" />
                        Log Harian ACWR: {playerName}
                    </h3>
                </div>
                <span className="text-[9px] font-black text-zinc-500 dark:text-zinc-400 tracking-widest bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded shadow-sm">
                    Terbaru di Atas
                </span>
            </div>

            <div className="p-3 sm:p-5 flex flex-col gap-3">
                {listData.map((day, idx) => {
                    
                    const isOff = day.type === 'off' || day.title === 'off';
                    const stats = day.stats ? day.stats[activeCol.id] : null;

                    if (isOff || !stats) {
                        return (
                            <div key={idx} className="flex flex-col p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#0c0c0e] shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-md text-zinc-400 dark:text-zinc-600">
                                        <Coffee size={14} strokeWidth={2.5} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 truncate">{day.name}</p>
                                        <h4 className="text-xs font-semibold text-zinc-400 dark:text-zinc-600 mt-0.5">Day Off / Tidak Ada Sesi</h4>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    // Tentukan zona ACWR
                    const isUnderload = stats.acwr > 0 && stats.acwr < 0.8;
                    const isDanger = stats.acwr > 1.5;
                    const isSweetSpot = stats.acwr >= 0.8 && stats.acwr <= 1.5;

                    let badgeClass = 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800';
                    let valColor = 'text-zinc-900 dark:text-white';
                    let icon = null;

                    if (isSweetSpot) { 
                        badgeClass = 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50'; 
                        valColor = 'text-emerald-600 dark:text-emerald-400';
                        icon = <CheckCircle2 size={10} className="shrink-0" strokeWidth={3}/>; 
                    } else if (isDanger) { 
                        badgeClass = 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60'; 
                        valColor = 'text-red-600 dark:text-red-400';
                        icon = <ShieldAlert size={10} className="shrink-0" strokeWidth={3}/>; 
                    } else if (isUnderload) { 
                        badgeClass = 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50'; 
                        valColor = 'text-amber-600 dark:text-amber-500';
                        icon = <AlertTriangle size={10} className="shrink-0" strokeWidth={3}/>; 
                    }

                    return (
                        <div key={idx} className="flex flex-col p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.02)] gap-3 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-colors">
                            
                            {/* Identitas Hari */}
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-zinc-900 dark:bg-zinc-100 rounded-md text-white dark:text-zinc-900 shrink-0">
                                    <CalendarDays size={14} strokeWidth={2.5} />
                                </div>
                                <div className="min-w-0 flex-1 overflow-hidden">
                                    <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 truncate">{day.name}</p>
                                    <h4 className="text-xs font-black text-zinc-900 dark:text-white tracking-tight mt-0.5 truncate" title={day.title}>
                                        {day.title}
                                    </h4>
                                </div>
                            </div>

                            {/* Kotak-kotak Metrik (Auto-fit Grid, anti overflow!) */}
                            <div className="grid gap-2 w-full" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))' }}>
                                
                                <div className="flex flex-col gap-1 border-l-2 border-zinc-200 dark:border-zinc-800 pl-2.5">
                                    <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest truncate">
                                        Val
                                    </span>
                                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate" title={formatNum(stats.dailyLoad, true)}>{formatNum(stats.dailyLoad, true)}</span>
                                </div>
                                
                                <div className="flex flex-col gap-1 border-l-2 border-zinc-200 dark:border-zinc-800 pl-2.5">
                                    <span className="text-[9px] font-black text-orange-500 dark:text-orange-400 uppercase tracking-widest truncate">
                                        Acute
                                    </span>
                                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate" title={formatNum(stats.acuteLoad, true)}>{formatNum(stats.acuteLoad, true)}</span>
                                </div>
                                
                                <div className="flex flex-col gap-1 border-l-2 border-zinc-200 dark:border-zinc-800 pl-2.5">
                                    <span className="text-[9px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest truncate">
                                        Chronic
                                    </span>
                                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate" title={formatNum(stats.chronicLoad, true)}>{formatNum(stats.chronicLoad, true)}</span>
                                </div>

                                <div className={`flex flex-col gap-1 p-1.5 rounded border shadow-sm ${badgeClass}`}>
                                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest truncate">
                                        {icon} ACWR
                                    </div>
                                    <span className={`text-sm font-black tabular-nums truncate leading-none mt-1 ${valColor}`} title={formatNum(stats.acwr, true)}>
                                        {formatNum(stats.acwr, true)}
                                    </span>
                                </div>

                            </div>
                        </div>
                    );
                })}

                {listData.length === 0 && (
                    <div className="p-8 flex flex-col items-center justify-center text-center text-zinc-500 dark:text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl m-4">
                        <span className="text-xs font-bold uppercase tracking-widest">Tidak ada data log di rentang waktu ini</span>
                    </div>
                )}
            </div>
        </div>
    );
}