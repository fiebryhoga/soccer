// resources/js/Pages/PerformanceLogs/Partials/MatchAverageRow.jsx

import React from 'react';
import { MATCH_EXCEL_COLUMNS, checkIsDistanceGroup } from '@/Constants/metrics';

// Daftar kolom yang HANYA dibagi 10 saat menghitung Team Average
const DIVIDE_BY_10_COLS = [
    'total_distance', 'dist_per_min', 'distance_1st', 'distance_2nd',
    'hir_18_24_kmh', 'sprint_distance', 'total_18kmh', 'player_load'
];

// FUNGSI PINTAR: Filter pemain berdasarkan Centang (Checkbox) masing-masing kategori
const getTargetPlayers = (players, colId) => {
    const hr4Group = ['hr_band_4_dist', 'hr_band_4_dur']; 
    const hr5Group = ['hr_band_5_dist', 'hr_band_5_dur']; 
    const plGroup = ['player_load'];

    if (hr4Group.includes(colId)) return players.filter(p => p.selected_hr4 !== false);
    if (hr5Group.includes(colId)) return players.filter(p => p.selected_hr5 !== false);
    if (plGroup.includes(colId)) return players.filter(p => p.selected_pl !== false);
    
    // Default (Untuk Distance, Duration, Velocity, dll)
    return players.filter(p => p.selected !== false); 
};

const calculateLocalAverage = (playersGroup, colId, getAutoCalculatedValue, isTeamAverage) => {
    let sum = 0; let count = 0; let isTime = false;
    
    // 1. FILTER BERDASARKAN CHECKBOX TERLEBIH DAHULU
    const targetPlayers = getTargetPlayers(playersGroup, colId);

    targetPlayers.forEach(p => {
        const val = getAutoCalculatedValue(p, colId);
        if (val === '-' || val === '' || val == null) return;
        
        if (typeof val === 'string' && val.includes('.')) {
            const parts = val.split('.');
            if (parts.length === 3) {
                isTime = true;
                sum += parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
                count++; return;
            }
        }
        
        const num = parseFloat(val);
        if (!isNaN(num)) { sum += num; count++; }
    });

    if (count === 0 && sum === 0) return '-';

    // 2. PEMBAGIAN KHUSUS 10 UNTUK TEAM AVERAGE (Hanya jarak & beban)
    if (isTeamAverage && DIVIDE_BY_10_COLS.includes(colId)) {
        count = 10;
    } else if (count === 0) {
        return '-';
    }

    if (isTime) {
        const avgSeconds = Math.round(sum / count);
        const h = Math.floor(avgSeconds / 3600);
        const m = Math.floor((avgSeconds % 3600) / 60);
        const s = avgSeconds % 60;
        return `${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}.${String(s).padStart(2, '0')}`;
    }
    
    const avg = sum / count;
    return Number.isInteger(avg) ? avg.toString() : avg.toFixed(1);
};

export default function MatchAverageRow({ title, groupPlayers, isTeamAverage, actions }) {
    const bgClass = isTeamAverage ? 'bg-zinc-50 dark:bg-zinc-950 bg-clip-padding' : 'bg-orange-50/90 dark:bg-orange-950/90 bg-clip-padding';
    const borderClass = isTeamAverage ? 'border-zinc-200 dark:border-zinc-800' : 'border-orange-200/60 dark:border-orange-800/60';
    const textClass = isTeamAverage ? 'text-zinc-900 dark:text-zinc-100' : 'text-orange-700 dark:text-orange-400';
    
    return (
        <tr className={isTeamAverage ? '' : 'bg-orange-50/60 dark:bg-orange-900/20 border-y border-orange-200/60 dark:border-orange-800/60'}>
            <td colSpan="5" style={{ left: 0 }} className={`p-2 sticky z-20 ${bgClass}`}></td>
            <td style={{ left: '220px', width: '180px', minWidth: '180px' }} className={`p-2.5 font-black text-[10px] uppercase tracking-widest text-right pr-4 sticky z-20 shadow-[4px_0_12px_rgba(0,0,0,0.03)] border-r ${bgClass} ${textClass} ${borderClass}`}>
                {title}
            </td>
            {MATCH_EXCEL_COLUMNS.map(col => {
                // Kalkulasi Angka Mentah (Sudah otomatis membaca status Checkbox)
                const avgValue = calculateLocalAverage(groupPlayers, col.id, actions.getAutoCalculatedValue, isTeamAverage);
                const hasValue = avgValue !== '-';
                
                let avgPercent = 0;
                if (hasValue && col.hasPercent) {
                    
                    // Filter pemain berdasarkan Checkbox untuk Persentase (%)
                    const targetPlayers = getTargetPlayers(groupPlayers, col.id);

                    let sumPct = 0; let countPct = 0;
                    targetPlayers.forEach(p => {
                        const rawVal = actions.getAutoCalculatedValue(p, col.id);
                        if (rawVal !== '' && !isNaN(parseFloat(rawVal))) {
                            const pct = parseFloat(actions.calculatePercentage(col.id, rawVal, p.position, p.historical_highest));
                            if (!isNaN(pct)) { sumPct += pct; countPct++; }
                        }
                    });

                    // Pembagian Khusus 10 untuk Persentase (%) Team Average
                    if (isTeamAverage && DIVIDE_BY_10_COLS.includes(col.id)) {
                        countPct = 10;
                    }

                    avgPercent = countPct > 0 ? (sumPct / countPct).toFixed(1) : 0;
                }
                const isDist = checkIsDistanceGroup(col.id);

                return (
                    <React.Fragment key={`avg-${col.id}`}>
                        <td className={`p-2 font-bold text-center border-l text-[11px] tabular-nums ${isTeamAverage ? 'text-zinc-900 dark:text-zinc-100' : 'text-orange-900 dark:text-orange-300'} ${borderClass} ${isDist ? (isTeamAverage ? 'bg-zinc-100/50 dark:bg-zinc-800/30' : 'bg-orange-100/50 dark:bg-orange-900/40') : ''}`}>
                            {avgValue}
                        </td>
                        {col.hasPercent && (
                            <td className={`p-2 border-l ${borderClass} ${isDist ? (isTeamAverage ? 'bg-zinc-100/80 dark:bg-zinc-800/40' : 'bg-orange-100/80 dark:bg-orange-900/50') : ''}`}>
                                {hasValue && (
                                    <div className="flex items-center justify-end gap-2">
                                        <span className={`text-[10px] font-black w-8 text-right tabular-nums ${textClass}`}>{avgPercent}%</span>
                                        <div className={`w-12 h-1.5 rounded-full overflow-hidden ${isTeamAverage ? (isDist ? 'bg-zinc-300 dark:bg-zinc-700' : 'bg-zinc-200 dark:bg-zinc-800') : 'bg-orange-200 dark:bg-orange-900/80'}`}>
                                            <div className={`h-full transition-all duration-500 rounded-full ${isTeamAverage ? (isDist ? 'bg-zinc-700 dark:bg-zinc-300' : 'bg-zinc-900 dark:bg-zinc-100') : 'bg-orange-500 dark:bg-orange-400'}`} style={{ width: `${Math.min(avgPercent, 100)}%` }}></div>
                                        </div>
                                    </div>
                                )}
                            </td>
                        )}
                    </React.Fragment>
                );
            })}
        </tr>
    );
}