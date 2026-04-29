import React from 'react';
import { GripVertical, CheckSquare, Square, Eraser, CheckCircle2, MinusCircle, Minus } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';

const STICKY_COLS = {
    c1: { left: 0, width: 40, minWidth: 40, maxWidth: 40, boxSizing: 'border-box' },
    c2: { left: 40, width: 50, minWidth: 50, maxWidth: 50, boxSizing: 'border-box' },
    c3: { left: 90, width: 40, minWidth: 40, maxWidth: 40, boxSizing: 'border-box' },
    c4: { left: 130, width: 50, minWidth: 50, maxWidth: 50, boxSizing: 'border-box' },
    c5: { left: 180, width: 40, minWidth: 40, maxWidth: 40, boxSizing: 'border-box' },
    c6: { left: 220, width: 180, minWidth: 180, maxWidth: 180, boxSizing: 'border-box' },
};

const checkIsDistanceGroup = (colId) => ['hir_18_24_kmh', 'sprint_distance', 'total_18kmh'].includes(colId);

export default function TrainingPlayerRow({ player, visibleIdx, isAbsent, actions }) {
    const rowStyle = `bg-white dark:bg-zinc-950 transition-colors duration-200 ${isAbsent ? 'opacity-60 hover:opacity-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/60' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900 group-hover:bg-zinc-200 dark:group-hover:bg-black'}`;

    return (
        <tr 
            draggable={true} 
            onDragStart={(e) => actions.handleDragStart(e, player.originalIndex)} 
            onDragEnter={(e) => actions.handleDragEnter(e, player.originalIndex)} 
            onDragEnd={actions.handleDragEnd} 
            onDragOver={(e) => e.preventDefault()} 
            className="group"
        >
            <td style={STICKY_COLS.c1} className={`p-2 sticky z-20 text-center bg-clip-padding ${rowStyle}`}>
                <button type="button" onClick={() => actions.togglePlayerSelection(player.originalIndex, 'selected')} className={`${player.selected !== false ? 'text-zinc-900 dark:text-white' : 'text-zinc-300 dark:text-zinc-700'} hover:scale-110 transition-transform outline-none`}>
                    {player.selected !== false ? <CheckSquare size={14} strokeWidth={2.5} /> : <Square size={14} strokeWidth={2.5} />}
                </button>
            </td>
            <td style={STICKY_COLS.c2} className={`p-1 sticky z-20 bg-clip-padding ${rowStyle}`}>
                <div className="flex items-center justify-center gap-1.5 w-full">
                    <div className="cursor-grab active:cursor-grabbing hover:text-zinc-600 transition-colors" title="Geser (Hanya Posisi Sama)">
                        <GripVertical size={14} className="text-zinc-300 dark:text-zinc-700" />
                    </div>
                    <button type="button" onClick={() => actions.togglePlayStatus(player.originalIndex)} className="outline-none hover:scale-110 transition-transform" title={isAbsent ? "Set Latihan" : "Set Absen"}>
                        {isAbsent ? <MinusCircle size={14} className="text-red-500" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
                    </button>
                </div>
            </td>
            <td style={STICKY_COLS.c3} className={`p-2 font-bold text-zinc-400 dark:text-zinc-600 sticky z-20 bg-clip-padding ${rowStyle}`}>{player.originalIndex + 1}</td>
            <td style={STICKY_COLS.c4} className={`p-2 sticky z-20 bg-clip-padding ${rowStyle}`}>
                <span className={`px-1.5 py-0.5 rounded-md border text-[9px] font-black tracking-wider ${isAbsent ? 'border-zinc-200 text-zinc-400 bg-zinc-100' : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 bg-zinc-100/50 dark:bg-zinc-900'}`}>{player.position}</span>
            </td>
            <td style={STICKY_COLS.c5} className={`p-2 font-mono font-bold text-[11px] text-zinc-500 sticky z-20 bg-clip-padding ${rowStyle}`}>{String(player.position_number).padStart(2, '0')}</td>
            <td style={STICKY_COLS.c6} className={`p-2 font-bold ${isAbsent ? 'text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'} sticky z-20 shadow-[4px_0_12px_rgba(0,0,0,0.03)] dark:shadow-[4px_0_12px_rgba(0,0,0,0.3)] bg-clip-padding ${rowStyle} border-r border-zinc-200 dark:border-zinc-800`}>
                <div style={{ width: '164px' }} className="flex items-center justify-between gap-2 group/name overflow-hidden">
                    <span className="truncate flex-1" title={player.name}>{player.name}</span>
                    <button type="button" onClick={() => actions.clearRow(player.originalIndex, player.name)} className="text-zinc-300 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover/name:opacity-100" title="Kosongkan Baris">
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
                let cellBgClass = isDist ? (isAuto ? 'bg-zinc-100/40 dark:bg-zinc-900/30' : 'bg-zinc-50/50 dark:bg-zinc-900/10') : (isAuto ? 'bg-zinc-50/50 dark:bg-zinc-900/20' : '');

                return (
                    <React.Fragment key={col.id}>
                        <td className={`p-1.5 border-l border-zinc-100 dark:border-zinc-800/50 relative transition-colors ${cellBgClass}`}>
                            <div className="flex items-center justify-center gap-1 w-full">
                                {(isHR4 || isHR5 || isPL) && (
                                    <button type="button" onClick={() => actions.togglePlayerSelection(player.originalIndex, isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl')} className={`${player[isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl'] !== false ? 'text-zinc-900 dark:text-zinc-300' : 'text-zinc-200 dark:text-zinc-800 hover:text-zinc-400'} outline-none shrink-0 transition-colors`}>
                                        {player[isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl'] !== false ? <CheckSquare size={12} strokeWidth={2.5}/> : <Square size={12} strokeWidth={2.5}/>}
                                    </button>
                                )}
                                
                                <input 
                                    type="text" value={rawValue}
                                    onChange={e => actions.handleChange(player.originalIndex, col.id, e.target.value)}
                                    onPaste={e => actions.handleLocalPaste(e, visibleIdx, col.id)}
                                    readOnly={isAuto} placeholder="-"
                                    className={`w-full bg-transparent border-none rounded text-[11px] py-1 px-1.5 text-center font-bold tabular-nums transition-all outline-none 
                                        ${isAuto ? 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed' : 'text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-950 focus:ring-2 focus:ring-zinc-900'}
                                    `} 
                                />
                            </div>
                            {isNewRecord && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-zinc-900 dark:bg-zinc-100 rounded-full animate-pulse shadow-sm"></div>}
                        </td>
                        
                        {col.hasPercent && (
                            <td className={`p-2 border-l border-zinc-100 dark:border-zinc-800/50 ${isDist ? 'bg-zinc-50/80 dark:bg-zinc-900/20' : 'bg-transparent'}`}>
                                <div className={`flex items-center justify-end gap-2`}>
                                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 w-8 text-right tabular-nums">{percent}%</span>
                                    <div className={`w-12 h-1.5 rounded-full overflow-hidden ${isDist ? 'bg-zinc-200 dark:bg-zinc-800' : 'bg-zinc-100 dark:bg-zinc-900'}`}>
                                        <div className={`h-full transition-all duration-500 rounded-full ${isDist ? 'bg-zinc-600 dark:bg-zinc-400' : 'bg-zinc-900 dark:bg-zinc-100'}`} style={{ width: `${Math.min(percent, 100)}%` }}></div>
                                    </div>
                                </div>
                            </td>
                        )}
                    </React.Fragment>
                );
            })}
            <td className={`p-2 border-l border-zinc-200 dark:border-zinc-800 text-center ${rowStyle}`}>
                <button 
                    onClick={() => actions.movePlayerToBench(player.originalIndex, player.name)}
                    type="button"
                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                    title="Kembalikan ke Bench"
                >
                    <Minus size={14} strokeWidth={3}/>
                </button>
            </td>
        </tr>
    );
}