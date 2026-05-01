import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, UserCheck } from 'lucide-react';

export default function PlayerACWRTable({ days, columns, playerName }) {
    // Balik urutan agar hari ini berada paling atas tabel
    const listData = [...days].reverse(); 

    const formatNum = (num, isStat = false) => (!num || isNaN(num)) ? (isStat ? '0.00' : '0') : (isStat ? Number(num).toFixed(2) : (Number.isInteger(num) ? num.toString() : Number(num).toFixed(1)));

    const activeCol = columns.length > 0 ? columns[0] : null;
    if (!activeCol) return null;

    return (
        <div className="w-full">
            <div className="flex items-end justify-between px-4 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                        <UserCheck size={16} className="text-emerald-500" /> ACWR Daily Log: {playerName}
                    </h3>
                    <p className="text-[11px] font-medium text-zinc-500 mt-1">Rolling 7:28 Days untuk <span className="font-bold">{activeCol.label}</span></p>
                </div>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800">
                <table className="w-full text-left border-collapse tabular-nums">
                <thead className="sticky top-0 bg-zinc-50/95 dark:bg-[#111113]/95 backdrop-blur-sm z-10 border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                            <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tanggal</th>
                            <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Daily Load</th>
                            <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">EWMA Acute</th>
                            <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">EWMA Chronic</th>
                            <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">ACWR Ratio</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                        {listData.map((day) => {
                            const stats = day.stats[activeCol.id];
                            if (!stats) return null;

                            const isUnderload = stats.acwr > 0 && stats.acwr < 0.8;
                            const isDanger = stats.acwr > 1.5;
                            const isSweetSpot = stats.acwr >= 0.8 && stats.acwr <= 1.5;

                            let badgeClass = 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400';
                            let icon = null;
                            if (isSweetSpot) { badgeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'; icon = <CheckCircle2 size={12}/>; }
                            else if (isDanger) { badgeClass = 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'; icon = <ShieldAlert size={12}/>; }
                            else if (isUnderload) { badgeClass = 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'; icon = <AlertTriangle size={12}/>; }

                            return (
                                <tr key={day.idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{day.name}</div>
                                        <div className="text-[10px] font-medium text-zinc-500 truncate max-w-[150px]">{day.title}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 text-right">{formatNum(stats.dailyLoad, true)}</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-zinc-500 text-right">{formatNum(stats.acuteLoad, true)}</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-zinc-500 text-right">{formatNum(stats.chronicLoad, true)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${badgeClass}`}>
                                            {formatNum(stats.acwr, true)} {icon}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {listData.length === 0 && (
                            <tr><td colSpan="5" className="p-8 text-center text-xs font-semibold text-zinc-500">Tidak ada data di rentang waktu ini.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}