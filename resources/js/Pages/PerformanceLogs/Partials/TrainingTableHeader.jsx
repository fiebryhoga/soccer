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
    footerSpan: { left: 0 }
};

const checkIsDistanceGroup = (colId) => ['hir_18_24_kmh', 'sprint_distance', 'total_18kmh'].includes(colId);

export default function TrainingTableHeader({ data, actions }) {
    return (
        <thead className="bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm">
            <tr>
                <th colSpan="6" style={STICKY_COLS.superHeader} className="p-2 border-b border-zinc-200 dark:border-zinc-800 sticky z-40 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding align-bottom">
                    <div className="flex font-black text-zinc-400 dark:text-zinc-600 mb-1 ml-1 text-[10px] tracking-widest uppercase">Pemain</div>
                </th>
                <th colSpan="5" className="p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"></th>
                <th colSpan="6" className="p-2 border-b-2 border-zinc-400 dark:border-zinc-600 text-center font-black tracking-[0.2em] uppercase text-zinc-800 dark:text-zinc-200 bg-zinc-100/80 dark:bg-zinc-800/50">
                    Distance (m)
                </th>
                <th colSpan="11" className="p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"></th>
                
                {/* REVISI: Header Kolom Aksi sekarang diberi label "ACTION" agar tidak kosong */}
                <th className="p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"></th>
            </tr>
            
            <tr className="border-b-2 border-zinc-200 dark:border-zinc-800">
                <th style={STICKY_COLS.c1} className="p-2 sticky z-30 bg-zinc-50 dark:bg-zinc-950 text-center bg-clip-padding" title="Pilih semua">
                    <button type="button" onClick={() => actions.toggleSelectAll('selected')} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors outline-none">
                        {data.players_data.length > 0 && data.players_data.every(p => p.selected !== false) ? <CheckSquare size={14} strokeWidth={2.5} /> : <Square size={14} strokeWidth={2.5} />}
                    </button>
                </th>
                <th style={STICKY_COLS.c2} className="p-2 sticky z-30 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding text-center" title="Geser & Status Main"><Activity size={14} className="text-zinc-400 mx-auto" /></th> 
                <th style={STICKY_COLS.c3} className="p-2 font-black text-zinc-500 uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding">NO</th>
                <th style={STICKY_COLS.c4} className="p-2 font-black text-zinc-500 uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding">POS</th>
                <th style={STICKY_COLS.c5} className="p-2 font-black text-zinc-500 uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding">NP</th>
                <th style={STICKY_COLS.c6} className="p-2 font-black text-zinc-500 uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-zinc-950 shadow-[4px_0_12px_rgba(0,0,0,0.03)] bg-clip-padding border-r border-zinc-200 dark:border-zinc-800">NAMA PEMAIN</th>
                
                {FIXED_EXCEL_COLUMNS.map(col => {
                    const isAuto = ['total_18kmh', 'highest_velocity'].includes(col.id);
                    const isDist = checkIsDistanceGroup(col.id);
                    
                    let percentLabel = `% ${col.label}`;
                    if (col.id === 'total_distance') percentLabel = '% Total Distance';
                    if (col.id === 'dist_per_min') percentLabel = '% Dist/min';
                    if (col.id === 'hir_18_24_kmh') percentLabel = '% HIR 18-24.51';
                    if (col.id === 'sprint_distance') percentLabel = '% SPRINT 24.52~';
                    if (col.id === 'total_18kmh') percentLabel = '% Total 18~';
                    if (col.id === 'max_velocity') percentLabel = '% Max Velocity';
                    if (col.id === 'player_load') percentLabel = '% Total PL';

                    const headerBgClass = isDist ? 'bg-zinc-100/50 dark:bg-zinc-800/30' : 'bg-transparent';
                    const isHR4 = col.id === 'hr_band_4_dist';
                    const isHR5 = col.id === 'hr_band_5_dist';
                    const isPL = col.id === 'player_load';

                    return (
                        <React.Fragment key={col.id}>
                            <th className={`p-2.5 font-bold text-center border-l border-zinc-200 dark:border-zinc-800 min-w-[90px] ${headerBgClass} ${isAuto ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                <div className="flex items-center justify-center gap-1.5 group/header cursor-default">
                                    {isAuto && <Lock size={10} strokeWidth={3} className="shrink-0" />}
                                    
                                    {(isHR4 || isHR5 || isPL) && (
                                        <button type="button" onClick={() => actions.toggleSelectAll(isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl')} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors shrink-0" title={`Pilih semua untuk perhitungan Average ${col.label}`}>
                                            {data.players_data.length > 0 && data.players_data.every(p => p[isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl'] !== false) ? <CheckSquare size={12} strokeWidth={2.5}/> : <Square size={12} strokeWidth={2.5}/>}
                                        </button>
                                    )}
                                    
                                    <span className="truncate">{col.label}</span>
                                    
                                    {!isAuto && (
                                        <button type="button" onClick={() => actions.clearColumn(col.id, col.label)} className="text-zinc-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover/header:opacity-100" title={`Kosongkan kolom ${col.label}`}>
                                            <Eraser size={12} strokeWidth={2.5} />
                                        </button>
                                    )}
                                </div>
                            </th>
                            {col.hasPercent && (
                                <th className={`p-2.5 font-bold text-zinc-400 dark:text-zinc-500 min-w-[110px] border-l border-zinc-200/50 dark:border-zinc-800/50 text-right whitespace-nowrap ${isDist ? 'bg-zinc-100/80 dark:bg-zinc-800/40' : 'bg-zinc-50/50 dark:bg-zinc-900/20'}`}>
                                    {percentLabel}
                                </th>
                            )}
                        </React.Fragment>
                    );
                })}

                {/* REVISI: Mengganti ikon Minus dengan tulisan "AKSI" atau Ikon UserMinus yang lebih jelas maknanya */}
                <th className="p-2.5 font-bold text-zinc-400 dark:text-zinc-500 text-center border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 w-12" title="Keluarkan Pemain dari Tabel">
                    <UserMinus size={14} className="mx-auto" />
                </th>
            </tr>
        </thead>
    );
}