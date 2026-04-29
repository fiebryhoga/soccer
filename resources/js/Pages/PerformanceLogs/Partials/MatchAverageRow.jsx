// resources/js/Pages/PerformanceLogs/Partials/MatchAverageRow.jsx

import React, { useMemo } from 'react';
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

function MatchAverageRow({ title, groupPlayers, isTeamAverage, actions }) {
    const bgClass = isTeamAverage ? 'bg-zinc-50 dark:bg-[#111113] bg-clip-padding' : 'bg-zinc-100 dark:bg-zinc-900 bg-clip-padding';
    const borderClass = 'border-zinc-200 dark:border-zinc-800';
    const textClass = isTeamAverage ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-300';
    
    return (
        <tr className={isTeamAverage ? '' : 'bg-zinc-50/60 dark:bg-zinc-900/40 border-y border-zinc-200/60 dark:border-zinc-800/60'}>
            <td colSpan="5" style={{ left: 0 }} className={`p-1.5 sticky z-20 border-r ${borderClass} ${bgClass}`}></td>
            <td style={{ left: '220px', width: '180px', minWidth: '180px' }} className={`p-2 font-black text-[9px] uppercase tracking-widest text-right pr-4 sticky z-20 shadow-[4px_0_12px_rgba(0,0,0,0.04)] border-r ${bgClass} ${textClass} ${borderClass}`}>
                {title}
            </td>
            
            {MATCH_EXCEL_COLUMNS.map(col => {
                const avgValue = calculateLocalAverage(groupPlayers, col.id, actions.getAutoCalculatedValue, isTeamAverage);
                const hasValue = avgValue !== '-';
                
                let avgPercent = 0;
                if (hasValue && col.hasPercent) {
                    const targetPlayers = getTargetPlayers(groupPlayers, col.id);
                    let sumPct = 0; let countPct = 0;
                    targetPlayers.forEach(p => {
                        const rawVal = actions.getAutoCalculatedValue(p, col.id);
                        if (rawVal !== '' && !isNaN(parseFloat(rawVal))) {
                            const pct = parseFloat(actions.calculatePercentage(col.id, rawVal, p.position, p.historical_highest));
                            if (!isNaN(pct)) { sumPct += pct; countPct++; }
                        }
                    });

                    if (isTeamAverage && DIVIDE_BY_10_COLS.includes(col.id)) {
                        countPct = 10;
                    }
                    avgPercent = countPct > 0 ? (sumPct / countPct).toFixed(1) : 0;
                }
                const isDist = checkIsDistanceGroup(col.id);

                return (
                    <React.Fragment key={`avg-${col.id}`}>
                        <td className={`p-1.5 font-bold text-center border-l text-[11px] tabular-nums ${isTeamAverage ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-300'} ${borderClass} ${isDist ? (isTeamAverage ? 'bg-zinc-100/50 dark:bg-zinc-800/30' : 'bg-zinc-200/50 dark:bg-zinc-800/60') : ''}`}>
                            {avgValue}
                        </td>
                        {col.hasPercent && (
                            <td className={`p-1.5 border-l ${borderClass} ${isDist ? (isTeamAverage ? 'bg-zinc-100/80 dark:bg-zinc-800/40' : 'bg-zinc-200/80 dark:bg-zinc-800/70') : ''}`}>
                                {hasValue && (
                                    <div className="flex items-center justify-end gap-1.5 px-1">
                                        <span className={`text-[9px] font-black w-7 text-right tabular-nums ${textClass}`}>{avgPercent}%</span>
                                        <div className={`w-10 h-1 rounded-full overflow-hidden ${isTeamAverage ? (isDist ? 'bg-zinc-300 dark:bg-zinc-700' : 'bg-zinc-200 dark:bg-zinc-800') : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                                            <div className={`h-full transition-all duration-500 rounded-full ${isTeamAverage ? (isDist ? 'bg-zinc-700 dark:bg-zinc-300' : 'bg-zinc-900 dark:bg-zinc-100') : 'bg-zinc-600 dark:bg-zinc-400'}`} style={{ width: `${Math.min(avgPercent, 100)}%` }}></div>
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

// OPTIMASI LEVEL DEWA: Hanya jalankan kalkulasi panjang di atas JIKA metrics pemain bersangkutan memang berubah.
const areEqual = (prev, next) => {
    if (prev.title !== next.title) return false;
    if (prev.groupPlayers.length !== next.groupPlayers.length) return false;

    // Cek referensi objek metrics satu-satu (sangat cepat karena O(n))
    for (let i = 0; i < prev.groupPlayers.length; i++) {
        if (prev.groupPlayers[i].metrics !== next.groupPlayers[i].metrics) return false;
        
        // Cek juga centangnya
        if (prev.groupPlayers[i].selected !== next.groupPlayers[i].selected ||
            prev.groupPlayers[i].selected_hr4 !== next.groupPlayers[i].selected_hr4 ||
            prev.groupPlayers[i].selected_hr5 !== next.groupPlayers[i].selected_hr5 ||
            prev.groupPlayers[i].selected_pl !== next.groupPlayers[i].selected_pl) {
            return false;
        }
    }
    return true;
};

export default React.memo(MatchAverageRow, areEqual);