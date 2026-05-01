// resources/js/Pages/PerformanceLogs/Partials/MatchPlayerRow.jsx

import React from 'react';
import { GripVertical, CheckSquare, Square, Eraser, CheckCircle2, MinusCircle } from 'lucide-react';
import { MATCH_EXCEL_COLUMNS, checkIsDistanceGroup } from '@/Constants/metrics';

// ==========================================
// KOMPONEN BARIS TABEL UTAMA (DI-MEMOIZATION AGAR SANGAT RINGAN)
// ==========================================
const MatchPlayerRow = ({ player, visibleIdx, isBenched, actions }) => {
    // Styling row disesuaikan dengan Dark Mode & Premium Monochrome
    const rowStyle = `bg-white dark:bg-[#0a0a0a] transition-colors duration-200 ${
        isBenched 
        ? 'opacity-50 hover:opacity-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/40' 
        : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40'
    }`;

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
            <td style={{ left: '0px', width: '40px', minWidth: '40px' }} className={`p-1.5 font-bold text-[11px] text-zinc-400 dark:text-zinc-600 border-r border-zinc-100 dark:border-zinc-800/50 sticky z-20 bg-clip-padding text-center ${rowStyle}`}>
                {player.originalIndex + 1}
            </td>
            <td style={{ left: '40px', width: '50px', minWidth: '50px' }} className={`p-1 sticky z-20 border-r border-zinc-100 dark:border-zinc-800/50 bg-clip-padding ${rowStyle}`}>
                <div className="flex items-center justify-center gap-1.5 w-full">
                    <div className="cursor-grab hover:text-zinc-600 dark:hover:text-zinc-300">
                        <GripVertical size={14} className="text-zinc-300 dark:text-zinc-600" />
                    </div>
                    <button type="button" onClick={() => actions.togglePlayStatus(player.originalIndex)} className="outline-none hover:scale-110 transition-transform">
                        {isBenched ? <MinusCircle size={14} className="text-zinc-400 dark:text-zinc-600" /> : <CheckCircle2 size={14} className="text-zinc-700 dark:text-zinc-300" />}
                    </button>
                </div>
            </td>

            <td style={{ left: '90px', width: '40px', minWidth: '40px' }} className={`p-1.5 sticky z-20 text-center border-r border-zinc-100 dark:border-zinc-800/50 bg-clip-padding ${rowStyle}`}>
                <button type="button" onClick={() => actions.togglePlayerSelection(player.originalIndex, 'selected')} className={`${isSelected ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-300 dark:text-zinc-700'} outline-none transition-colors`}>
                    {isSelected ? <CheckSquare size={14} strokeWidth={2.5} /> : <Square size={14} strokeWidth={2.5} />}
                </button>
            </td>

            {/* {{ left: '90px', width: '40px', minWidth: '40px' }} */}
            
            <td style={{ left: '130px', width: '50px', minWidth: '50px' }} className={`p-1.5 sticky z-20 border-r border-zinc-100 dark:border-zinc-800/50 bg-clip-padding text-center ${rowStyle}`}>
                <span className={`px-1.5 py-0.5 rounded border text-[9px] font-black tracking-wider ${isBenched ? 'border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-900' : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 bg-zinc-100/50 dark:bg-zinc-800'}`}>
                    {player.position}
                </span>
            </td>
            <td style={{ left: '180px', width: '40px', minWidth: '40px' }} className={`p-1.5 font-mono font-bold text-[10px] text-zinc-500 border-r border-zinc-100 dark:border-zinc-800/50 sticky z-20 bg-clip-padding text-center ${rowStyle}`}>
                {String(player.position_number).padStart(2, '0')}
            </td>
            <td style={{ left: '220px', width: '180px', minWidth: '180px' }} className={`p-1.5 font-bold text-[11px] ${isBenched ? 'text-zinc-500 dark:text-zinc-600' : 'text-zinc-900 dark:text-zinc-100'} sticky z-20 shadow-[4px_0_12px_rgba(0,0,0,0.04)] bg-clip-padding border-r border-zinc-200 dark:border-zinc-800 ${rowStyle}`}>
                <div style={{ width: '164px' }} className="flex items-center justify-between gap-2 group/name overflow-hidden">
                    <span className="truncate flex-1" title={player.name}>{player.name}</span>
                    {!isBenched && (
                        <button type="button" onClick={() => actions.clearRow(player.originalIndex, player.name)} className="text-zinc-300 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-500 opacity-0 group-hover/name:opacity-100 transition-opacity">
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
                
                const isHR4 = col.id === 'hr_band_4_dist'; 
                const isHR5 = col.id === 'hr_band_5_dist'; 
                const isPL = col.id === 'player_load';
                
                let cellBgClass = isDist ? (isAuto ? 'bg-zinc-100/40 dark:bg-zinc-900/30' : 'bg-zinc-50/50 dark:bg-[#111113]') : (isAuto ? 'bg-zinc-50/50 dark:bg-[#111113]' : '');

                return (
                    <React.Fragment key={col.id}>
                        <td className={`p-1 border-l border-zinc-100 dark:border-zinc-800/60 relative transition-colors ${cellBgClass}`}>
                            <div className="flex items-center justify-center gap-1 w-full">
                            {(isHR4 || isHR5 || isPL) && (
                                <button type="button" onClick={() => actions.togglePlayerSelection(player.originalIndex, isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl')} className="outline-none shrink-0 text-zinc-300 dark:text-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-400">
                                    { (isHR4 ? isSelectedHR4 : isHR5 ? isSelectedHR5 : isSelectedPL) ? <CheckSquare size={12} strokeWidth={2.5}/> : <Square size={12} strokeWidth={2.5}/>}
                                </button>
                            )}
                                <input 
                                    type="text" value={rawValue} 
                                    onChange={e => actions.handleChange(player.originalIndex, col.id, e.target.value)} 
                                    onPaste={e => actions.handleLocalPaste(e, visibleIdx, col.id)} 
                                    readOnly={isAuto} placeholder="-" 
                                    className={`w-full bg-transparent border-none rounded text-[11px] py-1 px-1 text-center font-bold tabular-nums outline-none transition-colors
                                        ${isAuto ? 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed' : 'text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-500 dark:focus:ring-zinc-400'}
                                    `} 
                                />
                            </div>
                        </td>
                        {col.hasPercent && (
                            <td className={`p-1 border-l border-zinc-100 dark:border-zinc-800/60 ${isDist ? 'bg-zinc-50/80 dark:bg-zinc-900/20' : 'bg-transparent'}`}>
                                <div className="flex items-center justify-end gap-1.5 px-1">
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
        </tr>
    );
};

// Custom Comparison function untuk memastikan React.memo bekerja maksimal
const areEqual = (prevProps, nextProps) => {
    // Hanya render ulang jika data spesifik player ini berubah, atau status benched-nya berubah.
    // Mengabaikan 'actions' karena actions bersifat statis dari parent (agar tidak merusak memo)
    return prevProps.player === nextProps.player && 
           prevProps.isBenched === nextProps.isBenched &&
           prevProps.visibleIdx === nextProps.visibleIdx;
};

export default React.memo(MatchPlayerRow, areEqual);