// resources/js/Pages/PerformanceLogs/Partials/MetricsTable.jsx

import React, { useRef } from 'react';
import { GripVertical, Lock, CheckSquare, Square, Eraser } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';

const STICKY_COLS = {
    c1: { left: 0, width: 40, minWidth: 40, maxWidth: 40, boxSizing: 'border-box' },
    c2: { left: 40, width: 30, minWidth: 30, maxWidth: 30, boxSizing: 'border-box' },
    c3: { left: 70, width: 40, minWidth: 40, maxWidth: 40, boxSizing: 'border-box' },
    c4: { left: 110, width: 50, minWidth: 50, maxWidth: 50, boxSizing: 'border-box' },
    c5: { left: 160, width: 40, minWidth: 40, maxWidth: 40, boxSizing: 'border-box' },
    c6: { left: 200, width: 180, minWidth: 180, maxWidth: 180, boxSizing: 'border-box' },
    superHeader: { left: 0 },
    footerSpan: { left: 0 }
};

export default function MetricsTable({ data, setData, getAutoCalculatedValue, calculatePercentage, getColumnAverage, handlePaste, handleChange }) {
    
    const dragItem = useRef();
    const dragOverItem = useRef();

    const handleDragStart = (e, position) => { dragItem.current = position; };
    const handleDragEnter = (e, position) => { dragOverItem.current = position; };
    
    const handleDragEnd = () => {
        if (dragItem.current !== undefined && dragOverItem.current !== undefined) {
            const copyListItems = [...data.players_data];
            const dragItemContent = copyListItems[dragItem.current];
            copyListItems.splice(dragItem.current, 1);
            copyListItems.splice(dragOverItem.current, 0, dragItemContent);
            dragItem.current = undefined;
            dragOverItem.current = undefined;
            setData('players_data', copyListItems);
        }
    };

    const toggleSelectAll = (type = 'selected') => {
        const allSelected = data.players_data.every(p => p[type]);
        const newData = data.players_data.map(p => {
            p[type] = !allSelected;
            p.metrics[type] = !allSelected;
            return p;
        });
        setData('players_data', newData);
    };

    const togglePlayerSelection = (index, type = 'selected') => {
        const newData = [...data.players_data];
        newData[index][type] = !newData[index][type];
        newData[index].metrics[type] = newData[index][type];
        setData('players_data', newData);
    };

    const clearColumn = (colId, colName) => {
        if (!confirm(`Yakin ingin mengosongkan seluruh data pada kolom "${colName}"?`)) return;
        const newData = data.players_data.map(p => {
            const newMetrics = { ...p.metrics };
            newMetrics[colId] = '';
            return { ...p, metrics: newMetrics };
        });
        setData('players_data', newData);
    };

    const clearRow = (rowIndex, playerName) => {
        if (!confirm(`Yakin ingin mengosongkan data metrik milik "${playerName}"?`)) return;
        const newData = [...data.players_data];
        const newMetrics = { ...newData[rowIndex].metrics };
        FIXED_EXCEL_COLUMNS.forEach(col => {
            if (!['total_18kmh', 'highest_velocity'].includes(col.id)) newMetrics[col.id] = '';
        });
        newData[rowIndex].metrics = newMetrics;
        setData('players_data', newData);
    };

    const checkIsDistanceGroup = (colId) => { return ['hir_18_24_kmh', 'sprint_distance', 'total_18kmh'].includes(colId); };

    return (
        <div className="w-full space-y-3 mb-4">
            
            {/* Header Informasi Tabel */}
            <div className="flex items-center gap-2 px-1">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Data Metrik Pemain</h3>
                <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-[10px] font-bold text-zinc-500">
                    {data.players_data.length} Pemain
                </span>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
                <div className="overflow-x-auto relative [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-zinc-50 dark:[&::-webkit-scrollbar-track]:bg-zinc-950 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full pb-1">
                    
                    <table className="w-max min-w-full text-left whitespace-nowrap text-[10px] border-collapse tabular-nums">
                        
                        <thead className="bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm">
                            <tr>
                                <th colSpan="6" style={STICKY_COLS.superHeader} className="p-2 border-b border-zinc-200 dark:border-zinc-800 sticky z-40 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding"></th>
                                <th colSpan="5" className="p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"></th>
                                <th colSpan="6" className="p-2 border-b-2 border-zinc-400 dark:border-zinc-600 text-center font-black tracking-[0.2em] uppercase text-zinc-800 dark:text-zinc-200 bg-zinc-100/80 dark:bg-zinc-800/50">
                                    Distance (m)
                                </th>
                                <th colSpan="11" className="p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"></th>
                            </tr>
                            
                            <tr className="border-b-2 border-zinc-200 dark:border-zinc-800">
                                <th style={STICKY_COLS.c1} className="p-2 sticky z-30 bg-zinc-50 dark:bg-zinc-950 text-center bg-clip-padding" title="Pilih semua Tim Inti">
                                    <button type="button" onClick={() => toggleSelectAll('selected')} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors outline-none">
                                        {data.players_data.every(p => p.selected) ? <CheckSquare size={14} strokeWidth={2.5} /> : <Square size={14} strokeWidth={2.5} />}
                                    </button>
                                </th>
                                <th style={STICKY_COLS.c2} className="p-2 sticky z-30 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding"></th> 
                                <th style={STICKY_COLS.c3} className="p-2 font-black text-zinc-500 uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding">NO</th>
                                <th style={STICKY_COLS.c4} className="p-2 font-black text-zinc-500 uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding">POS</th>
                                <th style={STICKY_COLS.c5} className="p-2 font-black text-zinc-500 uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding">NP</th>
                                <th style={STICKY_COLS.c6} className="p-2 font-black text-zinc-500 uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-zinc-950 shadow-[4px_0_12px_rgba(0,0,0,0.03)] dark:shadow-[4px_0_12px_rgba(0,0,0,0.3)] bg-clip-padding">
                                    NAMA PEMAIN
                                </th>
                                
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
                                                        <button type="button" onClick={() => toggleSelectAll(isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl')} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors shrink-0" title={`Pilih semua untuk perhitungan Average ${col.label}`}>
                                                            {data.players_data.every(p => p[isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl']) ? <CheckSquare size={12} strokeWidth={2.5}/> : <Square size={12} strokeWidth={2.5}/>}
                                                        </button>
                                                    )}
                                                    
                                                    <span className="truncate">{col.label}</span>
                                                    
                                                    {!isAuto && (
                                                        <button type="button" onClick={() => clearColumn(col.id, col.label)} className="text-zinc-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover/header:opacity-100" title={`Kosongkan kolom ${col.label}`}>
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
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-zinc-950">
                            {data.players_data.map((player, rowIndex) => {
                                const rowStyle = "bg-white dark:bg-zinc-950 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900 transition-colors duration-200";
                                
                                return (
                                    <tr key={player.player_id} draggable onDragStart={(e) => handleDragStart(e, rowIndex)} onDragEnter={(e) => handleDragEnter(e, rowIndex)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} className="group">
                                        <td style={STICKY_COLS.c1} className={`p-2 sticky z-20 text-center bg-clip-padding ${rowStyle}`}>
                                            <button type="button" onClick={() => togglePlayerSelection(rowIndex, 'selected')} className={`${player.selected ? 'text-zinc-900 dark:text-white' : 'text-zinc-300 dark:text-zinc-700'} hover:scale-110 transition-transform outline-none`}>
                                                {player.selected ? <CheckSquare size={14} strokeWidth={2.5} /> : <Square size={14} strokeWidth={2.5} />}
                                            </button>
                                        </td>
                                        <td style={STICKY_COLS.c2} className={`p-1 sticky z-20 cursor-grab active:cursor-grabbing bg-clip-padding ${rowStyle}`}>
                                            <GripVertical size={14} className="text-zinc-200 dark:text-zinc-800 mx-auto group-hover:text-zinc-400 dark:group-hover:text-zinc-600 transition-colors" />
                                        </td>
                                        <td style={STICKY_COLS.c3} className={`p-2 font-bold text-zinc-400 dark:text-zinc-600 sticky z-20 bg-clip-padding ${rowStyle}`}>{rowIndex + 1}</td>
                                        <td style={STICKY_COLS.c4} className={`p-2 sticky z-20 bg-clip-padding ${rowStyle}`}>
                                            <span className="px-1.5 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-[9px] font-black tracking-wider text-zinc-600 dark:text-zinc-400 bg-zinc-100/50 dark:bg-zinc-900">{player.position}</span>
                                        </td>
                                        <td style={STICKY_COLS.c5} className={`p-2 font-mono font-bold text-[11px] text-zinc-500 sticky z-20 bg-clip-padding ${rowStyle}`}>{String(player.position_number).padStart(2, '0')}</td>
                                        
                                        <td style={STICKY_COLS.c6} className={`p-2 font-bold text-zinc-900 dark:text-zinc-100 sticky z-20 shadow-[4px_0_12px_rgba(0,0,0,0.03)] dark:shadow-[4px_0_12px_rgba(0,0,0,0.3)] bg-clip-padding ${rowStyle}`}>
                                            <div style={{ width: '164px' }} className="flex items-center justify-between gap-2 group/name overflow-hidden">
                                                <span className="truncate flex-1" title={player.name}>{player.name}</span>
                                                <button type="button" onClick={() => clearRow(rowIndex, player.name)} className="text-zinc-300 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover/name:opacity-100" title={`Kosongkan data ${player.name}`}>
                                                    <Eraser size={12} strokeWidth={2.5}/>
                                                </button>
                                            </div>
                                        </td>

                                        {FIXED_EXCEL_COLUMNS.map(col => {
                                            const rawValue = getAutoCalculatedValue(player, col.id);
                                            const percent = calculatePercentage(col.id, rawValue, player.position, player.historical_highest);
                                            const isAuto = ['total_18kmh', 'highest_velocity'].includes(col.id);
                                            const isDist = checkIsDistanceGroup(col.id);
                                            const isNewRecord = col.id === 'highest_velocity' && parseFloat(rawValue) > (parseFloat(player.historical_highest?.highest_velocity) || 0);

                                            const isHR4 = col.id === 'hr_band_4_dist';
                                            const isHR5 = col.id === 'hr_band_5_dist';
                                            const isPL = col.id === 'player_load';

                                            let cellBgClass = isDist ? (isAuto ? 'bg-zinc-100/40 dark:bg-zinc-900/30' : 'bg-zinc-50/50 dark:bg-zinc-900/10 group-hover:bg-zinc-100/60 dark:group-hover:bg-zinc-900/40') : (isAuto ? 'bg-zinc-50/50 dark:bg-zinc-900/20' : '');

                                            return (
                                                <React.Fragment key={col.id}>
                                                    <td className={`p-1.5 border-l border-zinc-100 dark:border-zinc-800/50 relative transition-colors ${cellBgClass}`}>
                                                        <div className="flex items-center justify-center gap-1 w-full">
                                                            {(isHR4 || isHR5 || isPL) && (
                                                                <button type="button" onClick={() => togglePlayerSelection(rowIndex, isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl')} className={`${player[isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl'] ? 'text-zinc-900 dark:text-zinc-300' : 'text-zinc-200 dark:text-zinc-800 hover:text-zinc-400'} outline-none shrink-0 transition-colors`}>
                                                                    {player[isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl'] ? <CheckSquare size={12} strokeWidth={2.5}/> : <Square size={12} strokeWidth={2.5}/>}
                                                                </button>
                                                            )}
                                                            
                                                            <input 
                                                                type="text" value={rawValue}
                                                                onChange={e => handleChange(rowIndex, col.id, e.target.value)}
                                                                onPaste={e => handlePaste(e, rowIndex, col.id)}
                                                                readOnly={isAuto}
                                                                placeholder="-"
                                                                className={`w-full bg-transparent border-none rounded text-[11px] py-1 px-1.5 text-center font-bold tabular-nums transition-all outline-none 
                                                                    ${isAuto ? 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed' : 'text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-950 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:shadow-sm'}
                                                                `} 
                                                            />
                                                        </div>
                                                        {isNewRecord && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-zinc-900 dark:bg-zinc-100 rounded-full animate-pulse shadow-sm"></div>}
                                                    </td>
                                                    
                                                    {col.hasPercent && (
                                                        <td className={`p-2 border-l border-zinc-100 dark:border-zinc-800/50 ${isDist ? 'bg-zinc-50/80 dark:bg-zinc-900/20' : 'bg-transparent group-hover:bg-zinc-50/30 dark:group-hover:bg-zinc-900/10'}`}>
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
                                    </tr>
                                );
                            })}
                        </tbody>

                        <tfoot className="bg-zinc-50 dark:bg-zinc-900/80 border-t-2 border-zinc-200 dark:border-zinc-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                            <tr>
                                <td colSpan="5" style={STICKY_COLS.footerSpan} className="p-2 sticky z-20 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding"></td>
                                <td style={STICKY_COLS.c6} className="p-3 font-black text-[10px] uppercase tracking-widest text-zinc-900 dark:text-zinc-100 text-right pr-4 sticky z-20 bg-zinc-50 dark:bg-zinc-950 shadow-[4px_0_12px_rgba(0,0,0,0.03)] dark:shadow-[4px_0_12px_rgba(0,0,0,0.3)] bg-clip-padding">
                                    Average
                                </td>
                                {FIXED_EXCEL_COLUMNS.map(col => {
                                    const avgValue = getColumnAverage(col.id);
                                    const hasValue = avgValue !== '-' && avgValue !== null;
                                    
                                    let avgPercent = 0;
                                    if (hasValue && col.hasPercent) {
                                        const distanceGroup = ['total_distance', 'dist_per_min', 'hir_18_24_kmh', 'sprint_distance', 'total_18kmh'];
                                        const hr4Group = ['hr_band_4_dist', 'hr_band_4_dur'];
                                        const hr5Group = ['hr_band_5_dist', 'hr_band_5_dur'];
                                        const plGroup = ['player_load'];

                                        let targetPlayers = data.players_data;
                                        if (distanceGroup.includes(col.id)) targetPlayers = data.players_data.filter(p => p.selected);
                                        else if (hr4Group.includes(col.id)) targetPlayers = data.players_data.filter(p => p.selected_hr4);
                                        else if (hr5Group.includes(col.id)) targetPlayers = data.players_data.filter(p => p.selected_hr5);
                                        else if (plGroup.includes(col.id)) targetPlayers = data.players_data.filter(p => p.selected_pl);

                                        let sumPct = 0; let countPct = 0;
                                        targetPlayers.forEach(p => {
                                            const rawVal = getAutoCalculatedValue(p, col.id);
                                            if (rawVal !== '' && !isNaN(parseFloat(rawVal))) {
                                                const pct = parseFloat(calculatePercentage(col.id, rawVal, p.position, p.historical_highest));
                                                if (!isNaN(pct)) { sumPct += pct; countPct++; }
                                            }
                                        });
                                        avgPercent = countPct > 0 ? (sumPct / countPct).toFixed(1) : 0;
                                    }

                                    const isDist = checkIsDistanceGroup(col.id);

                                    return (
                                        <React.Fragment key={col.id}>
                                            <td className={`p-2 font-black text-center text-zinc-900 dark:text-zinc-100 border-l border-zinc-200 dark:border-zinc-800 text-[11px] tabular-nums ${isDist ? 'bg-zinc-100/50 dark:bg-zinc-800/30' : ''}`}>
                                                {avgValue}
                                            </td>
                                            {col.hasPercent && (
                                                <td className={`p-2 border-l border-zinc-200/50 dark:border-zinc-800/50 ${isDist ? 'bg-zinc-100/80 dark:bg-zinc-800/40' : ''}`}>
                                                    {hasValue && (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <span className="text-[10px] font-black text-zinc-900 dark:text-zinc-100 w-8 text-right tabular-nums">{avgPercent}%</span>
                                                            <div className={`w-12 h-1.5 rounded-full overflow-hidden ${isDist ? 'bg-zinc-300 dark:bg-zinc-700' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                                                                <div className={`h-full transition-all duration-500 rounded-full ${isDist ? 'bg-zinc-700 dark:bg-zinc-300' : 'bg-zinc-900 dark:bg-zinc-100'}`} style={{ width: `${Math.min(avgPercent, 100)}%` }}></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}