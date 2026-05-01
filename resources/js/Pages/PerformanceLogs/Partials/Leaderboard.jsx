// resources/js/Pages/PerformanceLogs/Partials/Leaderboard.jsx

import React, { useMemo, useState } from 'react';
import { Medal, Crown, ArrowUpDown } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS, MATCH_EXCEL_COLUMNS } from '@/Constants/metrics';

export default function Leaderboard({ log, playersData }) {
    const isMatch = log.type === 'match';
    
    // 1. Dapatkan kolom metrik yang bisa di-ranking
    const rankableColumns = useMemo(() => {
        const columns = isMatch ? MATCH_EXCEL_COLUMNS : FIXED_EXCEL_COLUMNS;
        // Exclude kolom yang bukan metrik angka
        const excluded = ['selected', 'selected_hr4', 'selected_hr5', 'selected_pl', 'sort_order'];
        return columns.filter(col => !excluded.includes(col.id));
    }, [isMatch]);

    // State untuk Dropdown filter perankingan
    const [sortMetric, setSortMetric] = useState(rankableColumns[0]?.id || 'total_distance');

    // 2. Logika Perankingan Dinamis & Rata-rata Tim
    const { rankedPlayers, teamAverage, selectedMetricLabel } = useMemo(() => {
        if (!playersData) return { rankedPlayers: [], teamAverage: 0, selectedMetricLabel: '' };

        let active = playersData.filter(p => p.is_playing !== false);
        
        // Ambil label/judul kolom metrik yang sedang aktif
        const activeColDef = rankableColumns.find(c => c.id === sortMetric);
        const label = activeColDef?.header || activeColDef?.label || sortMetric.replace(/_/g, ' ').toUpperCase();

        // Bersihkan dan urutkan data
        let totalVal = 0;
        let validCount = 0;

        const playersWithValues = active.map(player => {
            const rawVal = player.metrics?.[sortMetric];
            const numVal = parseFloat(rawVal) || 0;
            
            if (numVal > 0) {
                totalVal += numVal;
                validCount++;
            }

            return { ...player, metricValue: numVal };
        });

        // Urutkan Descending (Tertinggi ke Terendah)
        playersWithValues.sort((a, b) => b.metricValue - a.metricValue);

        const avg = validCount > 0 ? (totalVal / validCount).toFixed(2) : 0;

        return { 
            rankedPlayers: playersWithValues, 
            teamAverage: avg,
            selectedMetricLabel: label
        };
    }, [playersData, sortMetric, rankableColumns]);

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
            
            {/* Header & Filter Leaderboard */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Medal className="text-amber-500" size={20} /> 
                        Player Ranking
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1 font-semibold">
                        Rata-rata Tim untuk metrik ini: <span className="text-zinc-800 dark:text-zinc-200 font-bold">{teamAverage}</span>
                    </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider whitespace-nowrap">Urutkan Berdasarkan:</span>
                    <select 
                        value={sortMetric}
                        onChange={(e) => setSortMetric(e.target.value)}
                        className="w-full md:w-64 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-bold px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer shadow-sm"
                    >
                        {rankableColumns.map(col => (
                            <option key={col.id} value={col.id}>
                                {col.header || col.label || col.id.replace(/_/g, ' ').toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Top 3 Podium (Hanya tampil jika ada minimal 3 pemain) */}
            {rankedPlayers.length >= 3 && (
                <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-b from-transparent to-zinc-50 dark:to-zinc-900/20 border-b border-zinc-200 dark:border-zinc-800">
                    
                    {/* Peringkat 2 - Perak */}
                    <div className="flex flex-col items-center justify-end mt-8">
                        <div className="relative bg-white dark:bg-zinc-900 border-2 border-slate-300 dark:border-slate-600 w-full rounded-2xl p-4 text-center shadow-lg shadow-slate-200/50 dark:shadow-none">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-700 p-2 rounded-full border-2 border-white dark:border-zinc-900">
                                <h4 className="text-sm font-black w-6 h-6 flex items-center justify-center">2</h4>
                            </div>
                            <h4 className="mt-4 font-black text-sm text-zinc-800 dark:text-zinc-200 truncate" title={rankedPlayers[1].name}>{rankedPlayers[1].name}</h4>
                            <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded-md mt-1 inline-block">{rankedPlayers[1].position}</span>
                            <div className="mt-3 text-lg font-black text-slate-600 dark:text-slate-400">{rankedPlayers[1].metricValue}</div>
                        </div>
                    </div>

                    {/* Peringkat 1 - Emas */}
                    <div className="flex flex-col items-center justify-end z-10">
                        <div className="relative bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/20 dark:to-zinc-900 border-2 border-amber-400 w-full rounded-2xl p-5 text-center shadow-xl shadow-amber-200/50 dark:shadow-none transform -translate-y-4">
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 p-2 rounded-full border-4 border-white dark:border-zinc-900 shadow-md">
                                <Crown size={20} strokeWidth={3} />
                            </div>
                            <h4 className="mt-4 font-black text-base text-zinc-900 dark:text-zinc-100 truncate" title={rankedPlayers[0].name}>{rankedPlayers[0].name}</h4>
                            <span className="text-[10px] font-bold text-amber-700 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 rounded-md mt-1 inline-block">{rankedPlayers[0].position}</span>
                            <div className="mt-3 text-2xl font-black text-amber-600 dark:text-amber-500">{rankedPlayers[0].metricValue}</div>
                        </div>
                    </div>

                    {/* Peringkat 3 - Perunggu */}
                    <div className="flex flex-col items-center justify-end mt-12">
                        <div className="relative bg-white dark:bg-zinc-900 border-2 border-orange-300 dark:border-orange-800 w-full rounded-2xl p-4 text-center shadow-lg shadow-orange-100/50 dark:shadow-none">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-orange-200 text-orange-800 p-2 rounded-full border-2 border-white dark:border-zinc-900">
                                <h4 className="text-sm font-black w-6 h-6 flex items-center justify-center">3</h4>
                            </div>
                            <h4 className="mt-4 font-black text-sm text-zinc-800 dark:text-zinc-200 truncate" title={rankedPlayers[2].name}>{rankedPlayers[2].name}</h4>
                            <span className="text-[10px] font-bold text-orange-600 px-2 py-0.5 bg-orange-50 dark:bg-orange-900/30 rounded-md mt-1 inline-block">{rankedPlayers[2].position}</span>
                            <div className="mt-3 text-lg font-black text-orange-600 dark:text-orange-500">{rankedPlayers[2].metricValue}</div>
                        </div>
                    </div>

                </div>
            )}

            {/* Tabel Peringkat Lengkap */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-zinc-100 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-widest">
                            <th className="px-5 py-3 font-bold w-16 text-center">Rank</th>
                            <th className="px-5 py-3 font-bold">Pemain</th>
                            <th className="px-5 py-3 font-bold text-center">Posisi</th>
                            <th className="px-5 py-3 font-bold text-right flex items-center justify-end gap-1">
                                {selectedMetricLabel} <ArrowUpDown size={12} />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-sm">
                        {rankedPlayers.map((player, index) => {
                            const rank = index + 1;
                            // Warna khusus untuk badge top 3 di dalam list
                            let rankBadge = "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400";
                            if (rank === 1) rankBadge = "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400";
                            if (rank === 2) rankBadge = "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300";
                            if (rank === 3) rankBadge = "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";

                            return (
                                <tr key={player.player_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                                    <td className="px-5 py-3 text-center">
                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-black text-xs ${rankBadge}`}>
                                            {rank}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 font-bold text-zinc-800 dark:text-zinc-200">
                                        {player.name}
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <span className="text-[10px] font-bold text-zinc-500 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded">
                                            {player.position}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right font-black text-zinc-900 dark:text-zinc-100">
                                        {player.metricValue > 0 ? player.metricValue : '-'}
                                    </td>
                                </tr>
                            );
                        })}
                        
                        {rankedPlayers.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-5 py-10 text-center text-zinc-500 text-sm font-semibold">
                                    Belum ada data metrik yang diinput untuk sesi ini.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}