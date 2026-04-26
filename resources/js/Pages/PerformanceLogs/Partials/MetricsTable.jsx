// resources/js/Pages/PerformanceLogs/Partials/MetricsTable.jsx

import React, { useRef } from 'react';
import { GripVertical, Lock, CheckSquare, Square } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';

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

    const toggleSelectAll = () => {
        const allSelected = data.players_data.every(p => p.selected);
        const newData = data.players_data.map(p => ({ ...p, selected: !allSelected }));
        setData('players_data', newData);
    };

    const togglePlayerSelection = (index) => {
        const newData = [...data.players_data];
        newData[index].selected = !newData[index].selected;
        setData('players_data', newData);
    };

    const isAllSelected = data.players_data.length > 0 && data.players_data.every(p => p.selected);

    // Cek apakah sebuah kolom masuk dalam grup Distance
    const checkIsDistanceGroup = (colId) => {
        return ['hir_18_kmh', 'hir_19_8_kmh', 'hsr_21_kmh', 'sprint_distance', 'total_18kmh'].includes(colId);
    };

    return (
        <div className="overflow-x-auto relative [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-zinc-50 dark:[&::-webkit-scrollbar-track]:bg-[#09090b] [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full pb-2">
            <table className="w-full text-left whitespace-nowrap text-[10px] border-collapse">
                
                <thead className="bg-zinc-50 dark:bg-[#09090b]">
                    <tr>
                        <th colSpan="6" style={{ left: 0 }} className="p-2 border-b border-zinc-200 dark:border-zinc-800 sticky z-30 bg-zinc-50 dark:bg-[#09090b]"></th>
                        
                        <th colSpan="5" className="p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b]"></th>
                        
                        <th colSpan="10" className="p-2 border-b-2 border-slate-500 text-center font-black tracking-widest uppercase text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30">
                            Distance (m)
                        </th>
                        
                        {/* 10 Kolom Kanan Metrik Lainnya */}
                        <th colSpan="10" className="p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b]"></th>
                    </tr>
                    
                    {/* BARIS 2: NAMA KOLOM */}
                    <tr className="border-b-2 border-zinc-200 dark:border-zinc-800">
                        <th style={{ left: 0, minWidth: '30px' }} className="p-2 sticky z-30 bg-zinc-50 dark:bg-[#09090b] text-center" title="Pilih semua untuk perhitungan Averange">
                            <button type="button" onClick={toggleSelectAll} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors outline-none">
                                {isAllSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                            </button>
                        </th>
                        <th style={{ left: '30px', minWidth: '24px' }} className="p-2 sticky z-30 bg-zinc-50 dark:bg-[#09090b]"></th> 
                        <th style={{ left: '54px', minWidth: '30px' }} className="p-2 font-bold text-zinc-500 uppercase sticky z-30 bg-zinc-50 dark:bg-[#09090b]">NO</th>
                        <th style={{ left: '84px', minWidth: '40px' }} className="p-2 font-bold text-zinc-500 uppercase sticky z-30 bg-zinc-50 dark:bg-[#09090b]">POS</th>
                        <th style={{ left: '124px', minWidth: '40px' }} className="p-2 font-bold text-zinc-500 uppercase sticky z-30 bg-zinc-50 dark:bg-[#09090b]">NP</th>
                        <th style={{ left: '164px', minWidth: '150px' }} className="p-2 font-bold text-zinc-500 uppercase sticky z-30 bg-zinc-50 dark:bg-[#09090b] shadow-[inset_-1px_0_0_0_#e4e4e7] dark:shadow-[inset_-1px_0_0_0_#27272a]">NAMA PEMAIN</th>
                        
                        {FIXED_EXCEL_COLUMNS.map(col => {
                            const isAuto = ['hir_19_8_kmh', 'total_18kmh', 'highest_velocity'].includes(col.id);
                            const isDist = checkIsDistanceGroup(col.id);
                            
                            let percentLabel = `% ${col.label}`;
                            if (col.id === 'total_distance') percentLabel = '% Total Distance Of-MD';
                            if (col.id === 'dist_per_min') percentLabel = '% Distance/min Of-MD';
                            if (col.id === 'max_velocity') percentLabel = '% Max Velocity Of Highest (km/h)';

                            // Warna Header bergantung dari apakah dia grup Distance atau bukan
                            const headerBgClass = isDist ? 'bg-slate-50/50 dark:bg-slate-900/20' : 'bg-zinc-50 dark:bg-[#09090b]';

                            return (
                                <React.Fragment key={col.id}>
                                    <th className={`p-2.5 font-bold text-center border-l border-zinc-200/50 dark:border-zinc-800/50 min-w-[85px] ${headerBgClass} ${isAuto ? 'text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-1' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                        {isAuto && <Lock size={10} />} {col.label}
                                    </th>
                                    {col.hasPercent && (
                                        <th className={`p-2.5 font-bold text-zinc-400 dark:text-zinc-500 min-w-[110px] border-l border-zinc-200/50 dark:border-zinc-800/50 text-right whitespace-nowrap ${isDist ? 'bg-slate-50/80 dark:bg-slate-900/30' : 'bg-zinc-50/50 dark:bg-zinc-900/20'}`}>
                                            {percentLabel}
                                        </th>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-[#09090b]">
                    {data.players_data.map((player, rowIndex) => {
                        const rowStyle = "bg-white dark:bg-[#09090b] group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/50 transition-colors";
                        
                        return (
                            <tr 
                                key={player.player_id} 
                                draggable 
                                onDragStart={(e) => handleDragStart(e, rowIndex)}
                                onDragEnter={(e) => handleDragEnter(e, rowIndex)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => e.preventDefault()}
                                className="group"
                            >
                                <td style={{ left: 0 }} className={`p-2 sticky z-10 text-center ${rowStyle}`} title="Sertakan dalam hitungan Averange">
                                    <button type="button" onClick={() => togglePlayerSelection(rowIndex)} className={`${player.selected ? 'text-zinc-900 dark:text-white' : 'text-zinc-300 dark:text-zinc-700'} hover:scale-110 transition-transform outline-none`}>
                                        {player.selected ? <CheckSquare size={14} /> : <Square size={14} />}
                                    </button>
                                </td>
                                <td style={{ left: '30px' }} className={`p-1 sticky z-10 cursor-grab active:cursor-grabbing ${rowStyle}`}>
                                    <GripVertical size={14} className="text-zinc-300 dark:text-zinc-700 mx-auto group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors" />
                                </td>
                                <td style={{ left: '54px' }} className={`p-2 font-semibold text-zinc-400 dark:text-zinc-600 sticky z-10 ${rowStyle}`}>{rowIndex + 1}</td>
                                <td style={{ left: '84px' }} className={`p-2 sticky z-10 ${rowStyle}`}>
                                    <span className="px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-[9px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100/50 dark:bg-zinc-800/50">
                                        {player.position}
                                    </span>
                                </td>
                                <td style={{ left: '124px' }} className={`p-2 font-mono text-[11px] text-zinc-500 sticky z-10 ${rowStyle}`}>{String(player.position_number).padStart(2, '0')}</td>
                                <td style={{ left: '164px' }} className={`p-2 font-bold text-zinc-900 dark:text-zinc-100 truncate sticky z-10 shadow-[inset_-1px_0_0_0_#e4e4e7] dark:shadow-[inset_-1px_0_0_0_#27272a] ${rowStyle}`}>
                                    {player.name}
                                </td>

                                {FIXED_EXCEL_COLUMNS.map(col => {
                                    const rawValue = getAutoCalculatedValue(player, col.id);
                                    const percent = calculatePercentage(col.id, rawValue, player.position, player.historical_highest);
                                    const isAuto = ['hir_19_8_kmh', 'total_18kmh', 'highest_velocity'].includes(col.id);
                                    const isDist = checkIsDistanceGroup(col.id);
                                    const isNewRecord = col.id === 'highest_velocity' && parseFloat(rawValue) > (parseFloat(player.historical_highest?.highest_velocity) || 0);

                                    // Pengaturan warna Cell berdasarkan Grup
                                    let cellBgClass = '';
                                    if (isDist) {
                                        cellBgClass = isAuto ? 'bg-slate-100/40 dark:bg-slate-900/30' : 'bg-slate-50/30 dark:bg-slate-900/10 group-hover:bg-slate-100/50 dark:group-hover:bg-slate-900/40';
                                    } else {
                                        cellBgClass = isAuto ? 'bg-zinc-50/50 dark:bg-zinc-900/20' : '';
                                    }

                                    return (
                                        <React.Fragment key={col.id}>
                                            <td className={`p-1.5 border-l border-zinc-100 dark:border-zinc-800/50 relative transition-colors ${cellBgClass}`}>
                                                <input 
                                                    type="text" value={rawValue}
                                                    onChange={e => handleChange(rowIndex, col.id, e.target.value)}
                                                    onPaste={e => handlePaste(e, rowIndex, col.id)}
                                                    readOnly={isAuto}
                                                    placeholder="-"
                                                    className={`w-full bg-transparent border border-transparent rounded-md text-[11px] py-1 px-1.5 text-center font-semibold transition-all outline-none 
                                                        ${isAuto ? 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed' : 'text-zinc-900 dark:text-zinc-100 hover:border-zinc-200 dark:hover:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100'}
                                                    `} 
                                                />
                                                {isNewRecord && (
                                                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-zinc-900 dark:bg-zinc-100 rounded-full animate-pulse"></div>
                                                )}
                                            </td>
                                            {col.hasPercent && (
                                                <td className={`p-2 border-l border-zinc-100 dark:border-zinc-800/50 ${isDist ? 'bg-slate-50/50 dark:bg-slate-900/20' : 'bg-zinc-50/30 dark:bg-zinc-900/10'}`}>
                                                    <div className={`flex items-center justify-end gap-2`}>
                                                        <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 w-7 text-right">{percent}%</span>
                                                        <div className={`w-12 h-1.5 rounded-full overflow-hidden ${isDist ? 'bg-slate-200 dark:bg-slate-800/50' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                                                            <div className={`h-full transition-all duration-500 ${isDist ? 'bg-slate-600 dark:bg-slate-400' : 'bg-zinc-900 dark:bg-zinc-100'}`} style={{ width: `${Math.min(percent, 100)}%` }}></div>
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

                <tfoot className="bg-zinc-50 dark:bg-[#09090b] border-t border-zinc-200 dark:border-zinc-800 shadow-[0_-1px_2px_rgba(0,0,0,0.02)]">
                    <tr>
                        <td colSpan="5" style={{ left: 0 }} className="p-2 sticky z-20 bg-zinc-50 dark:bg-[#09090b]"></td>
                        <td style={{ left: '164px' }} className="p-3 font-black text-[10px] uppercase tracking-widest text-zinc-900 dark:text-zinc-100 text-right pr-4 sticky z-20 bg-zinc-50 dark:bg-[#09090b] shadow-[inset_-1px_0_0_0_#e4e4e7] dark:shadow-[inset_-1px_0_0_0_#27272a]">Averange</td>
                        {FIXED_EXCEL_COLUMNS.map(col => {
                            const avgValue = getColumnAverage(col.id);
                            const hasValue = avgValue !== '-' && avgValue !== null;
                            
                            // ====================================================================
                            // LOGIKA BARU: AVERANGE DARI PERSENTASE (Bukan dari nilai mentah)
                            // ====================================================================
                            let avgPercent = 0;
                            if (hasValue && col.hasPercent) {
                                const selectedPlayers = data.players_data.filter(p => p.selected);
                                let sumPct = 0;
                                let countPct = 0;
                                
                                selectedPlayers.forEach(p => {
                                    const rawVal = getAutoCalculatedValue(p, col.id);
                                    // Pastikan pemain memiliki data sebelum dihitung persennya
                                    if (rawVal !== '' && !isNaN(parseFloat(rawVal))) {
                                        const pct = parseFloat(calculatePercentage(col.id, rawVal, p.position, p.historical_highest));
                                        if (!isNaN(pct)) {
                                            sumPct += pct;
                                            countPct++;
                                        }
                                    }
                                });
                                
                                // Rata-rata = Total Persen / Jumlah Pemain Terpilih
                                avgPercent = countPct > 0 ? (sumPct / countPct).toFixed(1) : 0;
                            }
                            // ====================================================================

                            const isDist = checkIsDistanceGroup(col.id);

                            return (
                                <React.Fragment key={col.id}>
                                    <td className={`p-2 font-black text-center text-zinc-900 dark:text-zinc-100 border-l border-zinc-200/50 dark:border-zinc-800/50 text-[11px] ${isDist ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                                        {avgValue}
                                    </td>
                                    {col.hasPercent && (
                                        <td className={`p-2 border-l border-zinc-200/50 dark:border-zinc-800/50 ${isDist ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
                                            {hasValue && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-[9px] font-black text-zinc-900 dark:text-zinc-100 w-7 text-right">{avgPercent}%</span>
                                                    <div className={`w-12 h-1.5 rounded-full overflow-hidden ${isDist ? 'bg-blue-200 dark:bg-blue-800/50' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                                                        <div className={`h-full transition-all duration-500 ${isDist ? 'bg-blue-600 dark:bg-blue-400' : 'bg-zinc-900 dark:bg-zinc-100'}`} style={{ width: `${Math.min(avgPercent, 100)}%` }}></div>
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
    );
}