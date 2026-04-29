// resources/js/Pages/PerformanceLogs/Partials/TrainingTableHeader.jsx

import React from 'react';
import { Lock, CheckSquare, Square, Eraser, Activity, UserMinus } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';

const STICKY_COLS = {
    c1: { left: 0, width: 40, minWidth: 40, maxWidth: 40, boxSizing: 'border-box' },
    c2: { left: 40, width: 50, minWidth: 50, maxWidth: 50, boxSizing: 'border-box' },
    c3: { left: 90, width: 40, minWidth: 40, maxWidth: 40, boxSizing: 'border-box' },
    c4: { left: 130, width: 50, minWidth: 50, maxWidth: 50, boxSizing: 'border-box' },
    c5: { left: 180, width: 40, minWidth: 40, maxWidth: 40, boxSizing: 'border-box' },
    c6: { left: 220, width: 180, minWidth: 180, maxWidth: 180, boxSizing: 'border-box' },
    superHeader: { left: 0 },
};

const checkIsDistanceGroup = (colId) => ['hir_18_24_kmh', 'sprint_distance', 'total_18kmh'].includes(colId);

function TrainingTableHeader({ data, actions }) {
    return (
        <thead className="bg-zinc-50/80 dark:bg-[#111113]/80 backdrop-blur-sm">
            <tr>
                <th colSpan="6" style={STICKY_COLS.superHeader} className="p-2 border-b border-zinc-200 dark:border-zinc-800 sticky z-40 bg-zinc-50 dark:bg-[#111113] bg-clip-padding align-bottom border-r shadow-[4px_0_12px_rgba(0,0,0,0.03)]">
                    <div className="flex font-black text-zinc-400 dark:text-zinc-500 mb-1 ml-1 text-[9px] tracking-widest uppercase">Pemain</div>
                </th>
                <th colSpan="5" className="p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"></th>
                <th colSpan="6" className="p-2 border-b-2 border-zinc-300 dark:border-zinc-700 text-center font-black text-[9px] tracking-[0.2em] uppercase text-zinc-800 dark:text-zinc-200 bg-zinc-100/80 dark:bg-zinc-800/50">
                    Distance (m)
                </th>
                <th colSpan="11" className="p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"></th>
                <th className="p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"></th>
            </tr>
            
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#111113]">
                
                <th style={STICKY_COLS.c1} className="p-2 font-black text-zinc-500 text-[9px] uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-[#111113] bg-clip-padding text-center border-r border-zinc-200 dark:border-zinc-800">NO</th>
                
                <th style={STICKY_COLS.c2} className="p-1 sticky z-30 bg-zinc-50 dark:bg-[#111113] text-center bg-clip-padding border-r border-zinc-200 dark:border-zinc-800" title="Pilih semua">
                    <button type="button" onClick={() => actions.toggleSelectAll('selected')} className="text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors outline-none">
                        {data.players_data.length > 0 && data.players_data.every(p => p.selected !== false) ? <CheckSquare size={14} strokeWidth={2.5} /> : <Square size={14} strokeWidth={2.5} />}
                    </button>
                </th>

                <th style={STICKY_COLS.c3} className="p-1.5 sticky z-30 bg-zinc-50 dark:bg-[#111113] bg-clip-padding text-center border-r border-zinc-200 dark:border-zinc-800" title="Geser & Status Main">
                    <Activity size={14} className="text-zinc-400 dark:text-zinc-600 mx-auto" />
                </th> 

                <th style={STICKY_COLS.c4} className="p-2 font-black text-zinc-500 text-[9px] uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-[#111113] bg-clip-padding text-center border-r border-zinc-200 dark:border-zinc-800">POS</th>
                <th style={STICKY_COLS.c5} className="p-2 font-black text-zinc-500 text-[9px] uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-[#111113] bg-clip-padding text-center border-r border-zinc-200 dark:border-zinc-800">NP</th>
                <th style={STICKY_COLS.c6} className="p-2 font-black text-zinc-500 text-[9px] uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-[#111113] shadow-[4px_0_12px_rgba(0,0,0,0.03)] bg-clip-padding border-r border-zinc-200 dark:border-zinc-800">NAMA PEMAIN</th>
                
                {FIXED_EXCEL_COLUMNS.map(col => {
                    const isAuto = ['total_18kmh', 'highest_velocity'].includes(col.id);
                    const isDist = checkIsDistanceGroup(col.id);
                    
                    let percentLabel = `% ${col.label}`;
                    if (col.id === 'total_distance') percentLabel = '% Total Dist';
                    if (col.id === 'dist_per_min') percentLabel = '% Dist/min';
                    if (col.id === 'hir_18_24_kmh') percentLabel = '% HIR';
                    if (col.id === 'sprint_distance') percentLabel = '% SPRINT';
                    if (col.id === 'total_18kmh') percentLabel = '% Total >18';
                    if (col.id === 'max_velocity') percentLabel = '% Max Vel';
                    if (col.id === 'player_load') percentLabel = '% Total PL';

                    const headerBgClass = isDist ? 'bg-zinc-100/50 dark:bg-zinc-800/40' : 'bg-transparent';
                    const isHR4 = col.id === 'hr_band_4_dist';
                    const isHR5 = col.id === 'hr_band_5_dist';
                    const isPL = col.id === 'player_load';

                    return (
                        <React.Fragment key={col.id}>
                            <th className={`p-2 font-bold text-[9px] text-center border-l border-zinc-200 dark:border-zinc-800 min-w-[70px] align-middle ${headerBgClass} ${isAuto ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                <div className="flex items-center justify-center gap-1 group/header cursor-default">
                                    {isAuto && <Lock size={10} strokeWidth={3} className="shrink-0" />}
                                    
                                    {(isHR4 || isHR5 || isPL) && (
                                        <button type="button" onClick={() => actions.toggleSelectAll(isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl')} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shrink-0" title={`Pilih semua untuk perhitungan Average ${col.label}`}>
                                            {data.players_data.length > 0 && data.players_data.every(p => p[isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl'] !== false) ? <CheckSquare size={12} strokeWidth={2.5}/> : <Square size={12} strokeWidth={2.5}/>}
                                        </button>
                                    )}
                                    
                                    <span className="truncate">{col.label}</span>
                                    
                                    {!isAuto && (
                                        <button type="button" onClick={() => actions.clearColumn(col.id, col.label)} className="text-zinc-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-500 transition-colors shrink-0 opacity-0 group-hover/header:opacity-100" title={`Kosongkan kolom ${col.label}`}>
                                            <Eraser size={12} strokeWidth={2.5} />
                                        </button>
                                    )}
                                </div>
                            </th>
                            {col.hasPercent && (
                                <th className={`p-2 font-bold text-[9px] text-zinc-400 dark:text-zinc-500 min-w-[90px] border-l border-zinc-200/50 dark:border-zinc-800/50 text-right whitespace-nowrap align-middle ${isDist ? 'bg-zinc-100/80 dark:bg-zinc-800/60' : 'bg-zinc-50/50 dark:bg-[#111113]'}`}>
                                    {percentLabel}
                                </th>
                            )}
                        </React.Fragment>
                    );
                })}
                <th className="p-2 font-bold text-zinc-400 dark:text-zinc-600 text-center border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 w-10" title="Keluarkan Pemain dari Tabel">
                    <UserMinus size={14} className="mx-auto" />
                </th>
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

export default React.memo(TrainingTableHeader, areEqual);