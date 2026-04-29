import React from 'react';
import { Lock, CheckSquare, Square, Eraser, Activity } from 'lucide-react';
import { MATCH_EXCEL_COLUMNS } from '@/Constants/metrics';

export default function MatchTableHeader({ data, actions }) {
    const HeaderCell = ({ colId, label, pctLabel, isAuto = false, hasPercent = false, rowSpan = 1, isDist = false }) => {
        const isHR4 = colId === 'hr_band_4_dist'; const isHR5 = colId === 'hr_band_5_dist'; const isPL = colId === 'player_load';
        const bgClass = isDist ? 'bg-zinc-100/50 dark:bg-zinc-800/30' : 'bg-transparent';
        const textColor = isAuto ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-700 dark:text-zinc-300';

        return (
            <React.Fragment>
                <th rowSpan={rowSpan} className={`p-2.5 font-bold text-center border-l border-zinc-200 dark:border-zinc-800 min-w-[90px] align-middle ${bgClass} ${textColor}`}>
                    <div className="flex items-center justify-center gap-1.5 group/header cursor-default">
                        {isAuto && <Lock size={10} strokeWidth={3} className="shrink-0" />}
                        {(isHR4 || isHR5 || isPL) && (
                            <button type="button" onClick={() => actions.toggleSelectAll(isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl')} className="text-zinc-400 hover:text-zinc-900 transition-colors shrink-0">
                                {data.players_data.every(p => p[isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl']) ? <CheckSquare size={12} strokeWidth={2.5}/> : <Square size={12} strokeWidth={2.5}/>}
                            </button>
                        )}
                        <span className="truncate">{label}</span>
                        {!isAuto && (
                            <button type="button" onClick={() => actions.clearColumn(colId, label)} className="text-zinc-300 hover:text-red-500 transition-colors shrink-0 opacity-0 group-hover/header:opacity-100">
                                <Eraser size={12} strokeWidth={2.5} />
                            </button>
                        )}
                    </div>
                </th>
                {hasPercent && (
                    <th rowSpan={rowSpan} className={`p-2.5 font-bold text-zinc-400 dark:text-zinc-500 min-w-[110px] border-l border-zinc-200/50 dark:border-zinc-800/50 text-right whitespace-nowrap align-middle ${isDist ? 'bg-zinc-100/80 dark:bg-zinc-800/40' : 'bg-zinc-50/50 dark:bg-zinc-900/20'}`}>
                        {pctLabel || `% ${label}`}
                    </th>
                )}
            </React.Fragment>
        );
    };

    return (
        <thead className="bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm">
            <tr>
                <th colSpan="6" rowSpan="2" style={{ left: 0 }} className="p-2 border-b border-zinc-200 dark:border-zinc-800 sticky z-40 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding align-bottom shadow-[4px_0_12px_rgba(0,0,0,0.03)] border-r">
                    <div className="flex font-black text-zinc-400 dark:text-zinc-600 mb-1 ml-1 text-[10px] tracking-widest uppercase">Pemain</div>
                </th>
                <th colSpan="2" className="p-2 border-b border-r border-zinc-200 dark:border-zinc-800 text-center font-black tracking-[0.2em] uppercase text-zinc-800 dark:text-zinc-200 bg-zinc-100/80 dark:bg-zinc-800/50">Duration</th>
                <HeaderCell colId="total_distance" label="Total Distance (m)" pctLabel="% Total Distance Of-MD" hasPercent={true} rowSpan={2} />
                <HeaderCell colId="dist_per_min" label="Distance/min" pctLabel="% Distance/min Of-MD" hasPercent={true} rowSpan={2} />
                <th colSpan="2" className="p-2 border-b border-l border-r border-zinc-200 dark:border-zinc-800 text-center font-black tracking-[0.2em] uppercase text-zinc-800 dark:text-zinc-200 bg-zinc-100/80 dark:bg-zinc-800/50">Distance (m)</th>
                <HeaderCell colId="hir_18_24_kmh" label="HIR 18-24.51 Km/h" pctLabel="%HIR 18-24.51 Km/h" hasPercent={true} rowSpan={2} isDist={true} />
                <HeaderCell colId="sprint_distance" label="SPRINT 24.52 km/h~" pctLabel="% SPRINT 24.52 km/h~" hasPercent={true} rowSpan={2} isDist={true} />
                <HeaderCell colId="total_18kmh" label="Total 18 Km/h~" pctLabel="% Total 18 Km/h~" isAuto={true} hasPercent={true} rowSpan={2} isDist={true} />
                <HeaderCell colId="accels" label="Accels >3m/s/s" rowSpan={2} />
                <HeaderCell colId="decels" label="Decels >3m/s/s" rowSpan={2} />
                <HeaderCell colId="hr_band_4_dist" label="HR Band 4 Dist" rowSpan={2} />
                <HeaderCell colId="hr_band_4_dur" label="HR Band 4 Dur" rowSpan={2} />
                <HeaderCell colId="hr_band_5_dist" label="HR Band 5 Dist" rowSpan={2} />
                <HeaderCell colId="hr_band_5_dur" label="HR Band 5 Dur" rowSpan={2} />
                <HeaderCell colId="max_velocity" label="Max Velocity" pctLabel="% Max Velocity" hasPercent={true} rowSpan={2} />
                <HeaderCell colId="highest_velocity" label="Highest Vel" isAuto={true} rowSpan={2} />
                <HeaderCell colId="player_load" label="Player Load" pctLabel="% Player Load" hasPercent={true} rowSpan={2} />
            </tr>
            <tr className="border-b-2 border-zinc-200 dark:border-zinc-800">
                <HeaderCell colId="duration_1st" label="1 ST" />
                <HeaderCell colId="duration_2nd" label="2 ND" />
                <HeaderCell colId="distance_1st" label="Distance 1 ST" isDist={true} />
                <HeaderCell colId="distance_2nd" label="Distance 2 ND" isDist={true} />
            </tr>
            <tr className="border-b-2 border-zinc-200 dark:border-zinc-800">
                <th style={{ left: '0px', width: '40px', minWidth: '40px' }} className="p-2 sticky z-30 bg-zinc-50 dark:bg-zinc-950 text-center bg-clip-padding"><button type="button" onClick={() => actions.toggleSelectAll('selected')} className="text-zinc-400 hover:text-zinc-900 outline-none">{data.players_data.every(p => p.selected) ? <CheckSquare size={14} strokeWidth={2.5} /> : <Square size={14} strokeWidth={2.5} />}</button></th>
                <th style={{ left: '40px', width: '50px', minWidth: '50px' }} className="p-2 sticky z-30 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding text-center"><Activity size={14} className="text-zinc-400 mx-auto" /></th> 
                <th style={{ left: '90px', width: '40px', minWidth: '40px' }} className="p-2 font-black text-zinc-500 uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding text-center">NO</th>
                <th style={{ left: '130px', width: '50px', minWidth: '50px' }} className="p-2 font-black text-zinc-500 uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding text-center">POS</th>
                <th style={{ left: '180px', width: '40px', minWidth: '40px' }} className="p-2 font-black text-zinc-500 uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding text-center">NP</th>
                <th style={{ left: '220px', width: '180px', minWidth: '180px' }} className="p-2 font-black text-zinc-500 uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-zinc-950 shadow-[4px_0_12px_rgba(0,0,0,0.03)] bg-clip-padding border-r border-zinc-200 dark:border-zinc-800">NAMA PEMAIN</th>
                <th colSpan="25" className="p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"></th>
            </tr>
        </thead>
    );
}