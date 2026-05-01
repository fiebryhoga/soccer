// resources/js/Pages/PerformanceLogs/Partials/Leaderboard.jsx

import React, { useMemo, useState } from 'react';
import { Medal, Crown, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
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

    // Komponen Pembantu untuk menampilkan Diff (Selisih dari Rata-rata)
    const DiffIndicator = ({ val, avg }) => {
        if (!val || val === 0 || !avg || avg === 0) return null;
        const diff = (val - avg).toFixed(2);
        const isPositive = diff > 0;
        
        return (
            <div className={`flex items-center gap-1 text-[10px] font-bold ${isPositive ? 'text-primary' : 'text-muted-foreground'}`}>
                {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {isPositive ? '+' : ''}{diff}
            </div>
        );
    };

    return (
        <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm overflow-hidden transition-all">
            
            {/* --- HEADER & FILTER --- */}
            <div className="p-5 border-b border-border bg-muted/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-base font-black text-foreground flex items-center gap-2">
                        <Medal className="text-primary" size={20} /> 
                        Peringkat Skuad
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 font-semibold flex items-center gap-1.5">
                        Rata-rata Tim: <span className="bg-background border border-border px-2 py-0.5 rounded text-foreground font-black">{teamAverage}</span>
                    </p>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Filter Indikator</span>
                    <select 
                        value={sortMetric}
                        onChange={(e) => setSortMetric(e.target.value)}
                        className="w-full md:w-64 bg-background border border-border rounded-lg text-sm font-bold px-3 py-2.5 text-foreground focus:ring-2 focus:ring-ring outline-none cursor-pointer shadow-sm hover:bg-muted/50 transition-colors"
                    >
                        {rankableColumns.map(col => (
                            <option key={col.id} value={col.id}>
                                {col.header || col.label || col.id.replace(/_/g, ' ').toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* --- TOP 3 PODIUM --- */}
            {rankedPlayers.length >= 3 && (
                <div className="grid grid-cols-3 gap-3 md:gap-6 p-6 bg-gradient-to-b from-muted/10 to-transparent border-b border-border">
                    
                    {/* Rank 2 - Perak */}
                    <div className="flex flex-col items-center justify-end mt-8">
                        <div className="relative bg-background border border-border w-full rounded-xl p-4 text-center shadow-sm">
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-muted text-muted-foreground p-1.5 rounded-full border-4 border-background">
                                <span className="text-xs font-black w-5 h-5 flex items-center justify-center">2</span>
                            </div>
                            <h4 className="mt-3 font-black text-sm text-foreground truncate">{rankedPlayers[1].name}</h4>
                            <span className="text-[9px] font-bold text-muted-foreground px-2 py-0.5 bg-muted rounded mt-1 inline-block uppercase tracking-wider">{rankedPlayers[1].position}</span>
                            <div className="mt-3 flex flex-col items-center justify-center">
                                <span className="text-xl font-black text-foreground">{rankedPlayers[1].metricValue}</span>
                                <DiffIndicator val={rankedPlayers[1].metricValue} avg={teamAverage} />
                            </div>
                        </div>
                    </div>

                    {/* Rank 1 - Emas */}
                    <div className="flex flex-col items-center justify-end z-10">
                        <div className="relative bg-primary text-primary-foreground border border-border w-full rounded-xl p-5 text-center shadow-md transform -translate-y-4">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-background text-primary p-2 rounded-full border-4 border-primary shadow-sm">
                                <Crown size={16} strokeWidth={3} />
                            </div>
                            <h4 className="mt-3 font-black text-base truncate">{rankedPlayers[0].name}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-background/20 rounded mt-1 inline-block uppercase tracking-wider">{rankedPlayers[0].position}</span>
                            <div className="mt-3 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black">{rankedPlayers[0].metricValue}</span>
                                <div className="opacity-80">
                                   <DiffIndicator val={rankedPlayers[0].metricValue} avg={teamAverage} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rank 3 - Perunggu */}
                    <div className="flex flex-col items-center justify-end mt-12">
                        <div className="relative bg-background border border-border w-full rounded-xl p-4 text-center shadow-sm">
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-muted/50 text-muted-foreground p-1.5 rounded-full border-4 border-background">
                                <span className="text-xs font-black w-5 h-5 flex items-center justify-center">3</span>
                            </div>
                            <h4 className="mt-3 font-black text-sm text-foreground truncate">{rankedPlayers[2].name}</h4>
                            <span className="text-[9px] font-bold text-muted-foreground px-2 py-0.5 bg-muted rounded mt-1 inline-block uppercase tracking-wider">{rankedPlayers[2].position}</span>
                            <div className="mt-3 flex flex-col items-center justify-center">
                                <span className="text-lg font-black text-foreground">{rankedPlayers[2].metricValue}</span>
                                <DiffIndicator val={rankedPlayers[2].metricValue} avg={teamAverage} />
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* --- TABEL PERINGKAT LENGKAP --- */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/30 border-b border-border text-muted-foreground text-[10px] uppercase tracking-widest">
                            <th className="px-5 py-3.5 font-bold w-16 text-center">Rank</th>
                            <th className="px-5 py-3.5 font-bold">Informasi Pemain</th>
                            <th className="px-5 py-3.5 font-bold text-center">Posisi</th>
                            <th className="px-5 py-3.5 font-bold text-right flex items-center justify-end gap-1.5">
                                {selectedMetricLabel} <ArrowUpDown size={12} />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                        {rankedPlayers.map((player, index) => {
                            const rank = index + 1;
                            
                            // Visualisasi badge ranking untuk membedakan top 3 dan sisanya di dalam tabel
                            let rankBadge = "bg-muted text-muted-foreground";
                            if (rank === 1) rankBadge = "bg-primary text-primary-foreground";
                            if (rank === 2) rankBadge = "bg-foreground text-background";
                            if (rank === 3) rankBadge = "bg-border text-foreground";

                            return (
                                <tr key={player.player_id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-5 py-3.5 text-center">
                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-black text-[10px] ${rankBadge}`}>
                                            {rank}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 font-bold text-foreground group-hover:text-primary transition-colors">
                                        {player.name}
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <span className="text-[9px] font-bold text-muted-foreground px-2 py-1 bg-muted rounded uppercase tracking-wider">
                                            {player.position}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex flex-col items-end justify-center">
                                            <span className="font-black text-foreground">
                                                {player.metricValue > 0 ? player.metricValue : '-'}
                                            </span>
                                            <DiffIndicator val={player.metricValue} avg={teamAverage} />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        
                        {rankedPlayers.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-5 py-12 text-center text-muted-foreground text-sm font-semibold">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Medal size={32} className="opacity-20" />
                                        Belum ada data metrik yang diinput untuk filter ini.
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}