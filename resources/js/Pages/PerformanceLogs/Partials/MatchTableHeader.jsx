// resources/js/Pages/PerformanceLogs/Partials/MatchTableHeader.jsx

import React from 'react';
import { Lock, CheckSquare, Square, Eraser, Activity } from 'lucide-react';
import { MATCH_EXCEL_COLUMNS } from '@/Constants/metrics';

function MatchTableHeader({ data, actions }) {
    const HeaderCell = ({ colId, label, pctLabel, isAuto = false, hasPercent = false, rowSpan = 1, isDist = false }) => {
        const isHR4 = colId === 'hr_band_4_dist'; const isHR5 = colId === 'hr_band_5_dist'; const isPL = colId === 'player_load';
        const bgClass = isDist ? 'bg-zinc-100/50 dark:bg-zinc-800/40' : 'bg-transparent';
        const textColor = isAuto ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-700 dark:text-zinc-300';

        return (
            <React.Fragment>
                <th rowSpan={rowSpan} className={`p-2 font-bold text-[9px] text-center border-l border-zinc-200 dark:border-zinc-800 min-w-[70px] align-middle ${bgClass} ${textColor}`}>
                    <div className="flex items-center justify-center gap-1 group/header cursor-default">
                        {isAuto && <Lock size={10} strokeWidth={3} className="shrink-0" />}
                        {(isHR4 || isHR5 || isPL) && (
                            <button type="button" onClick={() => actions.toggleSelectAll(isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl')} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shrink-0">
                                {data.players_data.every(p => p[isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl']) ? <CheckSquare size={12} strokeWidth={2.5}/> : <Square size={12} strokeWidth={2.5}/>}
                            </button>
                        )}
                        <span className="truncate">{label}</span>
                        {!isAuto && (
                            <button type="button" onClick={() => actions.clearColumn(colId, label)} className="text-zinc-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-500 transition-colors shrink-0 opacity-0 group-hover/header:opacity-100">
                                <Eraser size={12} strokeWidth={2.5} />
                            </button>
                        )}
                    </div>
                </th>
                {hasPercent && (
                    <th rowSpan={rowSpan} className={`p-2 font-bold text-[9px] text-zinc-400 dark:text-zinc-500 min-w-[90px] border-l border-zinc-200/50 dark:border-zinc-800/50 text-right whitespace-nowrap align-middle ${isDist ? 'bg-zinc-100/80 dark:bg-zinc-800/60' : 'bg-zinc-50/50 dark:bg-[#111113]'}`}>
                        {pctLabel || `% ${label}`}
                    </th>
                )}
            </React.Fragment>
        );
    };

    return (
        <thead className="bg-zinc-50/80 dark:bg-[#111113]/80 backdrop-blur-sm">
            <tr>
                <th colSpan="6" rowSpan="2" style={{ left: 0 }} className="p-2 border-b border-zinc-200 dark:border-zinc-800 sticky z-40 bg-zinc-50 dark:bg-[#111113] bg-clip-padding align-bottom shadow-[4px_0_12px_rgba(0,0,0,0.03)] border-r">
                    <div className="flex font-black text-zinc-400 dark:text-zinc-500 mb-1 ml-1 text-[9px] tracking-widest uppercase">Pemain</div>
                </th>
                <th colSpan="2" className="p-2 border-b border-r border-zinc-200 dark:border-zinc-800 text-center font-black text-[9px] tracking-[0.2em] uppercase text-zinc-800 dark:text-zinc-200 bg-zinc-100/80 dark:bg-zinc-800/50">Duration</th>
                <HeaderCell colId="total_distance" label="Total Distance" pctLabel="% Total Dist" hasPercent={true} rowSpan={2} />
                <HeaderCell colId="dist_per_min" label="Distance/min" pctLabel="% Dist/min" hasPercent={true} rowSpan={2} />
                <th colSpan="2" className="p-2 border-b border-l border-r border-zinc-200 dark:border-zinc-800 text-center font-black text-[9px] tracking-[0.2em] uppercase text-zinc-800 dark:text-zinc-200 bg-zinc-100/80 dark:bg-zinc-800/50">Distance (m)</th>
                <HeaderCell colId="hir_18_24_kmh" label="HIR 18-24.51" pctLabel="% HIR" hasPercent={true} rowSpan={2} isDist={true} />
                <HeaderCell colId="sprint_distance" label="SPRINT 24.52~" pctLabel="% SPRINT" hasPercent={true} rowSpan={2} isDist={true} />
                <HeaderCell colId="total_18kmh" label="Total 18 Km/h~" pctLabel="% Total >18" isAuto={true} hasPercent={true} rowSpan={2} isDist={true} />
                <HeaderCell colId="accels" label="Accels" rowSpan={2} />
                <HeaderCell colId="decels" label="Decels" rowSpan={2} />
                <HeaderCell colId="hr_band_4_dist" label="HR Band 4 Dist" rowSpan={2} />
                <HeaderCell colId="hr_band_4_dur" label="HR Band 4 Dur" rowSpan={2} />
                <HeaderCell colId="hr_band_5_dist" label="HR Band 5 Dist" rowSpan={2} />
                <HeaderCell colId="hr_band_5_dur" label="HR Band 5 Dur" rowSpan={2} />
                <HeaderCell colId="max_velocity" label="Max Vel" pctLabel="% Max Vel" hasPercent={true} rowSpan={2} />
                <HeaderCell colId="highest_velocity" label="Highest Vel" isAuto={true} rowSpan={2} />
                <HeaderCell colId="player_load" label="Player Load" pctLabel="% Player Load" hasPercent={true} rowSpan={2} />
            </tr>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <HeaderCell colId="duration_1st" label="1 ST" />
                <HeaderCell colId="duration_2nd" label="2 ND" />
                <HeaderCell colId="distance_1st" label="Distance 1 ST" isDist={true} />
                <HeaderCell colId="distance_2nd" label="Distance 2 ND" isDist={true} />
            </tr>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#111113]">
                <th style={{ left: '0px', width: '40px' }} className="p-2 font-black text-zinc-500 text-[9px] uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-[#111113] bg-clip-padding text-center border-r border-zinc-200 dark:border-zinc-800">NO</th>
                <th style={{ left: '40px', width: '50px' }} className="p-1.5 sticky z-30 bg-zinc-50 dark:bg-[#111113] bg-clip-padding text-center border-r border-zinc-200 dark:border-zinc-800">
                    <Activity size={14} className="text-zinc-400 dark:text-zinc-600 mx-auto" />
                </th> 
                <th style={{ left: '90px', width: '40px' }} className="p-1 sticky z-30 bg-zinc-50 dark:bg-[#111113] text-center bg-clip-padding border-r border-zinc-200 dark:border-zinc-800">
                    <button type="button" onClick={() => actions.toggleSelectAll('selected')} className="text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 outline-none">
                        {data.players_data.every(p => p.selected) ? <CheckSquare size={14} strokeWidth={2.5} /> : <Square size={14} strokeWidth={2.5} />}
                    </button>
                </th>
                <th style={{ left: '130px', width: '50px' }} className="p-2 font-black text-zinc-500 text-[9px] uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-[#111113] bg-clip-padding text-center border-r border-zinc-200 dark:border-zinc-800">POS</th>
                <th style={{ left: '180px', width: '40px' }} className="p-2 font-black text-zinc-500 text-[9px] uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-[#111113] bg-clip-padding text-center border-r border-zinc-200 dark:border-zinc-800">NP</th>
                <th style={{ left: '220px', width: '180px' }} className="p-2 font-black text-zinc-500 text-[9px] uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-[#111113] shadow-[4px_0_12px_rgba(0,0,0,0.03)] bg-clip-padding border-r border-zinc-200 dark:border-zinc-800">NAMA PEMAIN</th>
                <th colSpan="25" className="p-1"></th>
            </tr>
        </thead>
    );
}

const areEqual = (prev, next) => {
    if (prev.data.players_data.length !== next.data.players_data.length) return false;
    for (let i = 0; i < prev.data.players_data.length; i++) {
        const p1 = prev.data.players_data[i];
        const p2 = next.data.players_data[i];
        if (p1.selected !== p2.selected || p1.selected_hr4 !== p2.selected_hr4 || p1.selected_hr5 !== p2.selected_hr5 || p1.selected_pl !== p2.selected_pl) {
            return false;
        }
    }
    return true;
};

export default React.memo(MatchTableHeader, areEqual);