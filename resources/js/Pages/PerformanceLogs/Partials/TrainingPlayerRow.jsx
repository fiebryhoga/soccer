// resources/js/Pages/PerformanceLogs/Partials/TrainingPlayerRow.jsx

import React from 'react';
import { GripVertical, CheckSquare, Square, Eraser, CheckCircle2, MinusCircle, Minus } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';

const STICKY_COLS = {
    c1: { left: 0, width: 40, minWidth: 40, maxWidth: 40, boxSizing: 'border-box' },   
    c2: { left: 40, width: 40, minWidth: 40, maxWidth: 40, boxSizing: 'border-box' },  
    c3: { left: 80, width: 50, minWidth: 50, maxWidth: 50, boxSizing: 'border-box' },  
    c4: { left: 130, width: 50, minWidth: 50, maxWidth: 50, boxSizing: 'border-box' }, 
    c5: { left: 180, width: 40, minWidth: 40, maxWidth: 40, boxSizing: 'border-box' }, 
    c6: { left: 220, width: 180, minWidth: 180, maxWidth: 180, boxSizing: 'border-box' }, 
};

const checkIsDistanceGroup = (colId) => ['hir_18_24_kmh', 'sprint_distance', 'total_18kmh'].includes(colId);

const TrainingPlayerRow = ({ player, visibleIdx, isAbsent, actions }) => {
    const rowStyle = `bg-white dark:bg-[#0a0a0a] transition-colors duration-200 ${
        isAbsent 
        ? 'opacity-50 hover:opacity-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/40' 
        : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40'
    }`;

    // --- KUNCI PERBAIKAN: BACA CHECKBOX DENGAN AMAN ---
    const isSelected = player.selected ?? player.metrics?.selected ?? true;
    const isSelectedHR4 = player.selected_hr4 ?? player.metrics?.selected_hr4 ?? true;
    const isSelectedHR5 = player.selected_hr5 ?? player.metrics?.selected_hr5 ?? true;
    const isSelectedPL = player.selected_pl ?? player.metrics?.selected_pl ?? true;

    return (
        <tr 
            draggable={true} 
            onDragStart={(e) => actions.handleDragStart(e, player.originalIndex)} 
            onDragEnter={(e) => actions.handleDragEnter(e, player.originalIndex)} 
            onDragEnd={actions.handleDragEnd} 
            onDragOver={(e) => e.preventDefault()} 
            className="group"
        >
            <td style={STICKY_COLS.c1} className={`p-1.5 font-bold text-[11px] text-zinc-400 dark:text-zinc-600 border-r border-zinc-100 dark:border-zinc-800/50 sticky z-20 bg-clip-padding text-center ${rowStyle}`}>
                {visibleIdx + 1}
            </td>
            
            <td style={STICKY_COLS.c2} className={`p-1 sticky z-20 border-r border-zinc-100 dark:border-zinc-800/50 bg-clip-padding ${rowStyle}`}>
                <div className="flex items-center justify-center gap-1.5 w-full">
                    <div className="cursor-grab active:cursor-grabbing hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors" title="Geser">
                        <GripVertical size={14} className="text-zinc-300 dark:text-zinc-600" />
                    </div>
                    <button type="button" onClick={() => actions.togglePlayStatus(player.originalIndex)} className="outline-none hover:scale-110 transition-transform" title={isAbsent ? "Set Latihan" : "Set Absen"}>
                        {isAbsent ? <MinusCircle size={14} className="text-zinc-400 dark:text-zinc-600" /> : <CheckCircle2 size={14} className="text-zinc-700 dark:text-zinc-300" />}
                    </button>
                </div>
            </td>

            {/* CHECKBOX UTAMA (DISTANCE) */}
            <td style={STICKY_COLS.c3} className={`p-1.5 sticky z-20 text-center border-r border-zinc-100 dark:border-zinc-800/50 bg-clip-padding ${rowStyle}`}>
                <button type="button" onClick={() => actions.togglePlayerSelection(player.originalIndex, 'selected')} className={`${isSelected ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-300 dark:text-zinc-700'} hover:scale-110 transition-transform outline-none`}>
                    {isSelected ? <CheckSquare size={14} strokeWidth={2.5} /> : <Square size={14} strokeWidth={2.5} />}
                </button>
            </td>
            
            <td style={STICKY_COLS.c4} className={`p-1.5 sticky z-20 border-r border-zinc-100 dark:border-zinc-800/50 bg-clip-padding text-center ${rowStyle}`}>
                <span className={`px-1.5 py-0.5 rounded border text-[9px] font-black tracking-wider ${isAbsent ? 'border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-900' : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 bg-zinc-100/50 dark:bg-zinc-800'}`}>
                    {player.position}
                </span>
            </td>
            
            <td style={STICKY_COLS.c5} className={`p-1.5 font-mono font-bold text-[10px] text-zinc-500 border-r border-zinc-100 dark:border-zinc-800/50 sticky z-20 bg-clip-padding text-center ${rowStyle}`}>
                {String(player.position_number).padStart(2, '0')}
            </td>
            
            <td style={STICKY_COLS.c6} className={`p-1.5 font-bold text-[11px] ${isAbsent ? 'text-zinc-500 dark:text-zinc-600' : 'text-zinc-900 dark:text-zinc-100'} sticky z-20 shadow-[4px_0_12px_rgba(0,0,0,0.04)] bg-clip-padding border-r border-zinc-200 dark:border-zinc-800 ${rowStyle}`}>
                <div style={{ width: '164px' }} className="flex items-center justify-between gap-2 group/name overflow-hidden">
                    <span className="truncate flex-1" title={player.name}>{player.name}</span>
                    <button type="button" onClick={() => actions.clearRow(player.originalIndex, player.name)} className="text-zinc-300 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-500 transition-colors shrink-0 opacity-0 group-hover/name:opacity-100" title="Kosongkan Baris">
                        <Eraser size={12} strokeWidth={2.5}/>
                    </button>
                </div>
            </td>

            {FIXED_EXCEL_COLUMNS.map(col => {
                const rawValue = actions.getAutoCalculatedValue(player, col.id);
                const percent = actions.calculatePercentage(col.id, rawValue, player.position, player.historical_highest, player.id);
                const isAuto = ['total_18kmh', 'highest_velocity'].includes(col.id);
                const isDist = checkIsDistanceGroup(col.id);
                const isNewRecord = col.id === 'highest_velocity' && parseFloat(rawValue) > (parseFloat(player.historical_highest?.highest_velocity) || 0);

                const isHR4 = col.id === 'hr_band_4_dist';
                const isHR5 = col.id === 'hr_band_5_dist';
                const isPL = col.id === 'player_load';
                let cellBgClass = isDist ? (isAuto ? 'bg-zinc-100/40 dark:bg-zinc-900/30' : 'bg-zinc-50/50 dark:bg-[#111113]') : (isAuto ? 'bg-zinc-50/50 dark:bg-[#111113]' : '');

                return (
                    <React.Fragment key={col.id}>
                        <td className={`p-1 border-l border-zinc-100 dark:border-zinc-800/60 relative transition-colors ${cellBgClass}`}>
                            <div className="flex items-center justify-center gap-1 w-full">
                                {/* CHECKBOX SPESIFIK */}
                                {(isHR4 || isHR5 || isPL) && (
                                    <button type="button" onClick={() => actions.togglePlayerSelection(player.originalIndex, isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl')} className={`${(isHR4 ? isSelectedHR4 : isHR5 ? isSelectedHR5 : isSelectedPL) ? 'text-zinc-900 dark:text-zinc-300' : 'text-zinc-300 dark:text-zinc-700 hover:text-zinc-500'} outline-none shrink-0 transition-colors`}>
                                        {(isHR4 ? isSelectedHR4 : isHR5 ? isSelectedHR5 : isSelectedPL) ? <CheckSquare size={12} strokeWidth={2.5}/> : <Square size={12} strokeWidth={2.5}/>}
                                    </button>
                                )}
                                
                                <input 
                                    type="text" value={rawValue}
                                    onChange={e => actions.handleChange(player.originalIndex, col.id, e.target.value)}
                                    onPaste={e => actions.handleLocalPaste(e, visibleIdx, col.id)}
                                    readOnly={isAuto} placeholder="-"
                                    className={`w-full bg-transparent border-none rounded text-[11px] py-1 px-1 text-center font-bold tabular-nums transition-all outline-none 
                                        ${isAuto ? 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed' : 'text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-500 dark:focus:ring-zinc-400'}
                                    `} 
                                />
                            </div>
                            {isNewRecord && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-zinc-900 dark:bg-zinc-100 rounded-full animate-pulse shadow-sm"></div>}
                        </td>
                        
                        {col.hasPercent && (
                            <td className={`p-1 border-l border-zinc-100 dark:border-zinc-800/60 ${isDist ? 'bg-zinc-50/80 dark:bg-zinc-900/20' : 'bg-transparent'}`}>
                                <div className={`flex items-center justify-end gap-1.5 px-1`}>
                                    <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 w-7 text-right tabular-nums">{percent}%</span>
                                    <div className={`w-10 h-1 rounded-full overflow-hidden ${isDist ? 'bg-zinc-200 dark:bg-zinc-800' : 'bg-zinc-100 dark:bg-zinc-900'}`}>
                                        <div className={`h-full transition-all duration-500 rounded-full ${isDist ? 'bg-zinc-500 dark:bg-zinc-400' : 'bg-zinc-800 dark:bg-zinc-200'}`} style={{ width: `${Math.min(percent, 100)}%` }}></div>
                                    </div>
                                </div>
                            </td>
                        )}
                    </React.Fragment>
                );
            })}
            <td className={`p-1.5 border-l border-zinc-200 dark:border-zinc-800 text-center ${rowStyle}`}>
                <button 
                    onClick={() => actions.movePlayerToBench(player.originalIndex, player.name)}
                    type="button"
                    className="p-1.5 text-zinc-400 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                    title="Kembalikan ke Bench"
                >
                    <Minus size={14} strokeWidth={3}/>
                </button>
            </td>
        </tr>
    );
};

const areEqual = (prevProps, nextProps) => {
    return prevProps.player === nextProps.player && 
           prevProps.isAbsent === nextProps.isAbsent &&
           prevProps.visibleIdx === nextProps.visibleIdx; 
};

export default React.memo(TrainingPlayerRow, areEqual);