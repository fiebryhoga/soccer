import React from 'react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';

const STICKY_COLS = {
    c6: { left: 220, width: 180, minWidth: 180, maxWidth: 180, boxSizing: 'border-box' },
    footerSpan: { left: 0 }
};

const checkIsDistanceGroup = (colId) => ['hir_18_24_kmh', 'sprint_distance', 'total_18kmh'].includes(colId);

const calculateLocalAverage = (playersGroup, colId, getAutoCalculatedValue) => {
    let sum = 0; let count = 0; let isTime = false;
    playersGroup.forEach(p => {
        const val = getAutoCalculatedValue(p, colId);
        if (val === '-' || val === '' || val == null) return;
        
        if (typeof val === 'string' && val.includes('.')) {
            const parts = val.split('.');
            if (parts.length === 3) {
                isTime = true;
                sum += parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
                count++;
                return;
            }
        }
        const num = parseFloat(val);
        if (!isNaN(num)) { sum += num; count++; }
    });

    if (count === 0) return '-';
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

export default function TrainingAverageRow({ title, groupPlayers, isTeamAverage, actions }) {
    const bgClass = isTeamAverage ? 'bg-zinc-50 dark:bg-zinc-950 bg-clip-padding' : 'bg-emerald-50/90 dark:bg-emerald-950/90 bg-clip-padding';
    const borderClass = isTeamAverage ? 'border-zinc-200 dark:border-zinc-800' : 'border-emerald-200/60 dark:border-emerald-800/60';
    const textClass = isTeamAverage ? 'text-zinc-900 dark:text-zinc-100' : 'text-emerald-700 dark:text-emerald-400';
    
    return (
        <tr className={isTeamAverage ? '' : 'bg-emerald-50/60 dark:bg-emerald-900/20 border-y border-emerald-200/60 dark:border-emerald-800/60'}>
            <td colSpan="5" style={STICKY_COLS.footerSpan} className={`p-2 sticky z-20 ${bgClass}`}></td>
            <td style={STICKY_COLS.c6} className={`p-2.5 font-black text-[10px] uppercase tracking-widest text-right pr-4 sticky z-20 shadow-[4px_0_12px_rgba(0,0,0,0.03)] border-r ${bgClass} ${textClass} ${borderClass}`}>
                {title}
            </td>
            {FIXED_EXCEL_COLUMNS.map(col => {
                const distanceGroup = ['total_distance', 'dist_per_min', 'hir_18_24_kmh', 'sprint_distance', 'total_18kmh'];
                const hr4Group = ['hr_band_4_dist', 'hr_band_4_dur'];
                const hr5Group = ['hr_band_5_dist', 'hr_band_5_dur'];
                const plGroup = ['player_load'];

                let targetPlayers = groupPlayers;
                
                // REVISI LOGIKA: Filter Checkbox HANYA berlaku untuk Team Average
                if (isTeamAverage) {
                    if (distanceGroup.includes(col.id)) targetPlayers = groupPlayers.filter(p => p.selected !== false);
                    else if (hr4Group.includes(col.id)) targetPlayers = groupPlayers.filter(p => p.selected_hr4 !== false);
                    else if (hr5Group.includes(col.id)) targetPlayers = groupPlayers.filter(p => p.selected_hr5 !== false);
                    else if (plGroup.includes(col.id)) targetPlayers = groupPlayers.filter(p => p.selected_pl !== false);
                }

                const avgValue = calculateLocalAverage(targetPlayers, col.id, actions.getAutoCalculatedValue);
                const hasValue = avgValue !== '-';
                
                let avgPercent = 0;
                if (hasValue && col.hasPercent) {
                    let sumPct = 0; let countPct = 0;
                    targetPlayers.forEach(p => {
                        const rawVal = actions.getAutoCalculatedValue(p, col.id);
                        if (rawVal !== '' && !isNaN(parseFloat(rawVal))) {
                            const pct = parseFloat(actions.calculatePercentage(col.id, rawVal, p.position, p.historical_highest, p.id));
                            if (!isNaN(pct)) { sumPct += pct; countPct++; }
                        }
                    });
                    avgPercent = countPct > 0 ? (sumPct / countPct).toFixed(1) : 0;
                }
                
                const isDist = checkIsDistanceGroup(col.id);
                const cellTextClass = isTeamAverage ? 'text-zinc-900 dark:text-zinc-100' : 'text-emerald-900 dark:text-emerald-300';
                const cellBorderClass = isTeamAverage ? 'border-zinc-200 dark:border-zinc-800' : 'border-emerald-200/50 dark:border-emerald-800/50';
                const cellBgClass = isDist ? (isTeamAverage ? 'bg-zinc-100/50 dark:bg-zinc-800/30' : 'bg-emerald-100/50 dark:bg-emerald-900/40') : '';

                return (
                    <React.Fragment key={`avg-${col.id}`}>
                        <td className={`p-2 font-bold text-center border-l text-[11px] tabular-nums ${cellTextClass} ${cellBorderClass} ${cellBgClass}`}>
                            {avgValue}
                        </td>
                        {col.hasPercent && (
                            <td className={`p-2 border-l ${cellBorderClass} ${isDist ? (isTeamAverage ? 'bg-zinc-100/80 dark:bg-zinc-800/40' : 'bg-emerald-100/80 dark:bg-emerald-900/50') : ''}`}>
                                {hasValue && (
                                    <div className="flex items-center justify-end gap-2">
                                        <span className={`text-[10px] font-black w-8 text-right tabular-nums ${cellTextClass}`}>{avgPercent}%</span>
                                        <div className={`w-12 h-1.5 rounded-full overflow-hidden ${isTeamAverage ? (isDist ? 'bg-zinc-300 dark:bg-zinc-700' : 'bg-zinc-200 dark:bg-zinc-800') : 'bg-emerald-200 dark:bg-emerald-900/80'}`}>
                                            <div className={`h-full transition-all duration-500 rounded-full ${isTeamAverage ? (isDist ? 'bg-zinc-700 dark:bg-zinc-300' : 'bg-zinc-900 dark:bg-zinc-100') : 'bg-emerald-500 dark:bg-emerald-400'}`} style={{ width: `${Math.min(avgPercent, 100)}%` }}></div>
                                        </div>
                                    </div>
                                )}
                            </td>
                        )}
                    </React.Fragment>
                );
            })}
            <td className={`p-2 border-l ${borderClass} ${bgClass}`}></td>
        </tr>
    );
}