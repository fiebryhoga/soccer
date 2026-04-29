import React from 'react';
import { GripVertical, CheckSquare, Square, Eraser, CheckCircle2, MinusCircle } from 'lucide-react';
import { MATCH_EXCEL_COLUMNS, checkIsDistanceGroup } from '@/Constants/metrics';

export default function MatchPlayerRow({ player, visibleIdx, isBenched, actions }) {
    const rowStyle = `bg-white dark:bg-zinc-950 transition-colors duration-200 ${isBenched ? 'opacity-60 hover:opacity-100 hover:bg-zinc-50' : 'hover:bg-red-50 group-hover:bg-zinc-200'}`;

    return (
        <tr draggable={true} onDragStart={(e) => actions.handleDragStart(e, player.originalIndex)} onDragEnter={(e) => actions.handleDragEnter(e, player.originalIndex)} onDragEnd={actions.handleDragEnd} onDragOver={(e) => e.preventDefault()} className="group">
            <td style={{ left: '0px', width: '40px', minWidth: '40px' }} className={`p-2 sticky z-20 text-center bg-clip-padding ${rowStyle}`}>
                <button type="button" onClick={() => actions.togglePlayerSelection(player.originalIndex, 'selected')} className={`${player.selected ? 'text-zinc-900' : 'text-zinc-300'} outline-none`}>
                    {player.selected ? <CheckSquare size={14} strokeWidth={2.5} /> : <Square size={14} strokeWidth={2.5} />}
                </button>
            </td>
            <td style={{ left: '40px', width: '50px', minWidth: '50px' }} className={`p-1 sticky z-20 bg-clip-padding ${rowStyle}`}>
                <div className="flex items-center justify-center gap-1.5 w-full">
                    <div className="cursor-grab hover:text-zinc-600"><GripVertical size={14} className="text-zinc-300" /></div>
                    <button type="button" onClick={() => actions.togglePlayStatus(player.originalIndex)} className="outline-none hover:scale-110">
                        {isBenched ? <MinusCircle size={14} className="text-red-500" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
                    </button>
                </div>
            </td>
            <td style={{ left: '90px', width: '40px', minWidth: '40px' }} className={`p-2 font-bold text-zinc-400 sticky z-20 bg-clip-padding text-center ${rowStyle}`}>{player.originalIndex + 1}</td>
            <td style={{ left: '130px', width: '50px', minWidth: '50px' }} className={`p-2 sticky z-20 bg-clip-padding text-center ${rowStyle}`}>
                <span className={`px-1.5 py-0.5 rounded-md border text-[9px] font-black tracking-wider ${isBenched ? 'border-zinc-200 text-zinc-400 bg-zinc-100' : 'border-zinc-200 text-zinc-600 bg-zinc-100/50'}`}>{player.position}</span>
            </td>
            <td style={{ left: '180px', width: '40px', minWidth: '40px' }} className={`p-2 font-mono font-bold text-[11px] text-zinc-500 sticky z-20 bg-clip-padding text-center ${rowStyle}`}>{String(player.position_number).padStart(2, '0')}</td>
            <td style={{ left: '220px', width: '180px', minWidth: '180px' }} className={`p-2 font-bold ${isBenched ? 'text-zinc-500' : 'text-zinc-900'} sticky z-20 shadow-[4px_0_12px_rgba(0,0,0,0.03)] bg-clip-padding border-r border-zinc-200 ${rowStyle}`}>
                <div style={{ width: '164px' }} className="flex items-center justify-between gap-2 group/name overflow-hidden">
                    <span className="truncate flex-1" title={player.name}>{player.name}</span>
                    {!isBenched && (
                        <button type="button" onClick={() => actions.clearRow(player.originalIndex, player.name)} className="text-zinc-300 hover:text-red-500 opacity-0 group-hover/name:opacity-100">
                            <Eraser size={12} strokeWidth={2.5}/>
                        </button>
                    )}
                </div>
            </td>

            {MATCH_EXCEL_COLUMNS.map(col => {
                const rawValue = actions.getAutoCalculatedValue(player, col.id);
                const percent = actions.calculatePercentage(col.id, rawValue, player.position, player.historical_highest);
                const isAuto = ['total_18kmh', 'highest_velocity'].includes(col.id);
                const isDist = checkIsDistanceGroup(col.id);
                const isHR4 = col.id === 'hr_band_4_dist'; const isHR5 = col.id === 'hr_band_5_dist'; const isPL = col.id === 'player_load';
                let cellBgClass = isDist ? (isAuto ? 'bg-zinc-100/40' : 'bg-zinc-50/50') : (isAuto ? 'bg-zinc-50/50' : '');

                return (
                    <React.Fragment key={col.id}>
                        <td className={`p-1.5 border-l border-zinc-100 relative transition-colors ${cellBgClass}`}>
                            <div className="flex items-center justify-center gap-1 w-full">
                                {(isHR4 || isHR5 || isPL) && (
                                    <button type="button" onClick={() => actions.togglePlayerSelection(player.originalIndex, isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl')} className="outline-none shrink-0 text-zinc-300 hover:text-zinc-500">
                                        {player[isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl'] ? <CheckSquare size={12} strokeWidth={2.5}/> : <Square size={12} strokeWidth={2.5}/>}
                                    </button>
                                )}
                                <input type="text" value={rawValue} onChange={e => actions.handleChange(player.originalIndex, col.id, e.target.value)} onPaste={e => actions.handleLocalPaste(e, visibleIdx, col.id)} readOnly={isAuto} placeholder="-" className={`w-full bg-transparent border-none rounded text-[11px] py-1 px-1.5 text-center font-bold tabular-nums outline-none ${isAuto ? 'text-zinc-400 cursor-not-allowed' : 'text-zinc-900 focus:ring-2 focus:ring-zinc-900'}`} />
                            </div>
                        </td>
                        {col.hasPercent && (
                            <td className={`p-2 border-l border-zinc-100 ${isDist ? 'bg-zinc-50/80' : 'bg-transparent'}`}>
                                <div className="flex items-center justify-end gap-2">
                                    <span className="text-[10px] font-bold text-zinc-500 w-8 text-right tabular-nums">{percent}%</span>
                                    <div className={`w-12 h-1.5 rounded-full overflow-hidden ${isDist ? 'bg-zinc-200' : 'bg-zinc-100'}`}>
                                        <div className={`h-full transition-all duration-500 rounded-full ${isDist ? 'bg-zinc-600' : 'bg-zinc-900'}`} style={{ width: `${Math.min(percent, 100)}%` }}></div>
                                    </div>
                                </div>
                            </td>
                        )}
                    </React.Fragment>
                );
            })}
        </tr>
    );
}