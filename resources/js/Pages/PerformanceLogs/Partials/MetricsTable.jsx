import React, { useRef } from 'react';
import { GripVertical } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';

// Palette warna posisi yang sangat soft dan elegan (Light & Dark)
const getPositionColor = (pos) => {
    switch (pos?.toUpperCase()) {
        case 'CB': return 'bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50';
        case 'FB': return 'bg-orange-50/70 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-950/50';
        case 'MF': return 'bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50';
        case 'WF': return 'bg-sky-50/70 dark:bg-sky-950/30 hover:bg-sky-100 dark:hover:bg-sky-950/50';
        case 'FW': return 'bg-indigo-50/70 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/50';
        default: return 'bg-white dark:bg-[#0a0a0a] hover:bg-zinc-50 dark:hover:bg-[#121212]';
    }
};

export default function MetricsTable({ data, setData, getAutoCalculatedValue, calculatePercentage, getColumnAverage, handlePaste, handleChange }) {
    
    // Referensi untuk Drag & Drop
    const dragItem = useRef();
    const dragOverItem = useRef();

    const handleDragStart = (e, position) => {
        dragItem.current = position;
    };

    const handleDragEnter = (e, position) => {
        dragOverItem.current = position;
    };

    const handleDragEnd = () => {
        if (dragItem.current !== undefined && dragOverItem.current !== undefined) {
            const copyListItems = [...data.players_data];
            const dragItemContent = copyListItems[dragItem.current];
            copyListItems.splice(dragItem.current, 1);
            copyListItems.splice(dragOverItem.current, 0, dragItemContent);
            dragItem.current = undefined;
            dragOverItem.current = undefined;
            
            // Simpan urutan baru ke dalam State form
            setData('players_data', copyListItems);
        }
    };

    return (
        <div className="overflow-x-auto relative [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
            <table className="w-full text-left whitespace-nowrap text-[9px] border-collapse">
                
                {/* HEADERS */}
                <thead className="bg-zinc-100 dark:bg-[#1a1a1a]">
                    <tr>
                        <th colSpan="5" style={{ minWidth: '30px', left: 0 }} className="p-1 font-bold border border-zinc-300 dark:border-zinc-700 text-center text-zinc-500 sticky z-30 bg-zinc-100 dark:bg-[#1a1a1a]">Player Identity</th>
                        <th colSpan="1" className="p-1 border border-zinc-300 dark:border-zinc-700 text-center font-bold text-zinc-500">Duration</th>
                        <th colSpan="2" className="p-1 border border-zinc-300 dark:border-zinc-700 text-center font-bold text-zinc-500">Total Dist</th>
                        <th colSpan="2" className="p-1 border border-zinc-300 dark:border-zinc-700 text-center font-bold text-zinc-500">Dist/min</th>
                        <th colSpan="10" className="p-1 border border-zinc-300 dark:border-zinc-700 text-center font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 uppercase">Distance (m)</th>
                        <th colSpan="12" className="p-1 border border-zinc-300 dark:border-zinc-700 text-center font-bold text-zinc-500">Other Metrics</th>
                    </tr>
                    <tr className="border-b-2 border-zinc-300 dark:border-zinc-700">
                        <th style={{ left: 0, minWidth: '20px' }} className="p-2 sticky z-30 bg-zinc-100 dark:bg-[#1a1a1a]"></th> {/* Kolom Handle Drag */}
                        <th style={{ left: '20px', minWidth: '30px' }} className="p-2 font-bold text-zinc-600 dark:text-zinc-400 sticky z-30 bg-zinc-100 dark:bg-[#1a1a1a]">NO</th>
                        <th style={{ left: '50px', minWidth: '40px' }} className="p-2 font-bold text-zinc-600 dark:text-zinc-400 sticky z-30 bg-zinc-100 dark:bg-[#1a1a1a]">POS</th>
                        <th style={{ left: '90px', minWidth: '40px' }} className="p-2 font-bold text-zinc-600 dark:text-zinc-400 sticky z-30 bg-zinc-100 dark:bg-[#1a1a1a]">NP</th>
                        <th style={{ left: '130px', minWidth: '130px' }} className="p-2 font-bold text-zinc-600 dark:text-zinc-400 border-r border-zinc-300 dark:border-zinc-700 sticky z-30 bg-zinc-100 dark:bg-[#1a1a1a] shadow-[1px_0_0_0_#d4d4d8] dark:shadow-[1px_0_0_0_#3f3f46]">NAMA PEMAIN</th>
                        
                        {FIXED_EXCEL_COLUMNS.map(col => (
                            <React.Fragment key={col.id}>
                                <th className={`p-2 font-bold text-center border-r border-zinc-200 dark:border-zinc-800 ${['hir_19_8_kmh', 'total_18kmh', 'highest_velocity'].includes(col.id) ? 'text-amber-600 dark:text-amber-500 bg-amber-50/50 dark:bg-amber-900/10' : 'text-zinc-700 dark:text-zinc-300'} min-w-[75px]`}>
                                    {col.label}
                                </th>
                                {col.hasPercent && (
                                    <th className="p-2 font-bold text-blue-600 dark:text-blue-400 min-w-[100px] bg-blue-50/50 dark:bg-blue-900/10 border-r border-zinc-300 dark:border-zinc-700">
                                        % {col.label.split('(')[0].replace('Total', '').trim()} Of- MD
                                    </th>
                                )}
                            </React.Fragment>
                        ))}
                    </tr>
                </thead>

                {/* BODY TABEL DENGAN DRAG & DROP */}
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                    {data.players_data.map((player, rowIndex) => {
                        const rowColors = getPositionColor(player.position);
                        
                        return (
                            <tr 
                                key={player.player_id} 
                                draggable 
                                onDragStart={(e) => handleDragStart(e, rowIndex)}
                                onDragEnter={(e) => handleDragEnter(e, rowIndex)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => e.preventDefault()}
                                className={`group transition-colors ${rowColors}`}
                            >
                                {/* KOLOM KIRI (STICKY) */}
                                <td style={{ left: 0 }} className={`p-1 sticky z-10 cursor-grab active:cursor-grabbing ${rowColors}`}>
                                    <GripVertical size={14} className="text-zinc-400 mx-auto hover:text-zinc-600 dark:hover:text-zinc-300" />
                                </td>
                                <td style={{ left: '20px' }} className={`p-2 font-bold text-zinc-500 sticky z-10 ${rowColors}`}>{rowIndex + 1}</td>
                                <td style={{ left: '50px' }} className={`p-2 font-bold text-zinc-600 dark:text-zinc-300 sticky z-10 ${rowColors}`}>{player.position}</td>
                                <td style={{ left: '90px' }} className={`p-2 font-bold text-zinc-500 sticky z-10 ${rowColors}`}>{String(player.position_number).padStart(2, '0')}</td>
                                <td style={{ left: '130px' }} className={`p-2 font-bold text-zinc-900 dark:text-zinc-100 truncate border-r border-zinc-300 dark:border-zinc-700 sticky z-10 shadow-[1px_0_0_0_#d4d4d8] dark:shadow-[1px_0_0_0_#3f3f46] ${rowColors}`}>
                                    {player.name}
                                </td>

                                {/* KOLOM METRIK */}
                                {FIXED_EXCEL_COLUMNS.map(col => {
                                    const rawValue = getAutoCalculatedValue(player, col.id);
                                    const percent = calculatePercentage(col.id, rawValue, player.position, player.historical_highest);
                                    const isAuto = ['hir_19_8_kmh', 'total_18kmh', 'highest_velocity'].includes(col.id);
                                    
                                    const historicalMax = parseFloat(player.historical_highest?.['highest_velocity']) || parseFloat(player.historical_highest?.['max_velocity']) || 0;
                                    const isNewRecord = col.id === 'highest_velocity' && parseFloat(rawValue) > historicalMax && historicalMax !== 0;

                                    const visualBarWidth = Math.min(percent, 100);

                                    return (
                                        <React.Fragment key={col.id}>
                                            <td className={`p-1 border-r border-zinc-200 dark:border-zinc-800 ${isAuto ? 'opacity-80 mix-blend-multiply dark:mix-blend-lighten' : ''}`}>
                                                <input 
                                                    type="text" value={rawValue}
                                                    onChange={e => handleChange(rowIndex, col.id, e.target.value)}
                                                    onPaste={e => handlePaste(e, rowIndex, col.id)}
                                                    readOnly={isAuto}
                                                    className={`w-full bg-transparent border-0 ring-1 focus:ring-2 rounded-[3px] text-[9px] py-1 px-1 text-center font-semibold transition-all outline-none 
                                                        ${isAuto ? 'ring-amber-200/50 dark:ring-amber-800/50 text-amber-700 dark:text-amber-500 cursor-not-allowed' : 'ring-zinc-200 dark:ring-zinc-700 focus:ring-zinc-900 dark:focus:ring-zinc-100 text-zinc-900 dark:text-zinc-100'}
                                                        ${isNewRecord ? 'text-emerald-600 dark:text-emerald-400 font-black scale-105' : ''}
                                                    `} 
                                                />
                                            </td>
                                            {col.hasPercent && (
                                                <td className="p-1.5 border-r border-zinc-300 dark:border-zinc-700/60 bg-white/30 dark:bg-black/10">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[8px] font-bold text-zinc-600 dark:text-zinc-400 w-8 text-right">{percent}%</span>
                                                        <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full transition-all duration-300 ease-out 
                                                                    ${percent >= 100 ? 'bg-indigo-500' : percent >= 90 ? 'bg-emerald-500' : percent >= 70 ? 'bg-blue-500' : 'bg-amber-500'}
                                                                `} 
                                                                style={{ width: `${visualBarWidth}%` }}
                                                            ></div>
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

                {/* TFOOTER (RATA-RATA TIM) */}
                <tfoot className="bg-zinc-100 dark:bg-[#1a1a1a] border-t-2 border-zinc-300">
                    <tr>
                        <td colSpan="4" style={{ left: 0 }} className="p-2 sticky z-20 bg-zinc-100 dark:bg-[#1a1a1a]"></td>
                        <td style={{ left: '130px' }} className="p-2 font-black text-zinc-900 dark:text-zinc-100 text-right pr-3 border-r border-zinc-300 sticky z-20 bg-zinc-100 dark:bg-[#1a1a1a] shadow-[1px_0_0_0_#d4d4d8] dark:shadow-[1px_0_0_0_#3f3f46]">RATA-RATA TIM</td>
                        {FIXED_EXCEL_COLUMNS.map(col => {
                            const avgValue = getColumnAverage(col.id);
                            const avgPercent = calculatePercentage(col.id, avgValue, null); 
                            const visualBarWidthAvg = Math.min(avgPercent, 100);

                            return (
                                <React.Fragment key={col.id}>
                                    <td className="p-2 font-black text-center text-zinc-900 dark:text-zinc-100 border-r border-zinc-300">{avgValue}</td>
                                    {col.hasPercent && (
                                        <td className="p-1.5 border-r border-zinc-300">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[8px] font-bold text-blue-600 dark:text-blue-400 w-8 text-right">{avgPercent}%</span>
                                                <div className="flex-1 h-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                                                    <div className={`h-full transition-all duration-300 ease-out ${avgPercent >= 100 ? 'bg-indigo-500' : 'bg-blue-500'}`} style={{ width: `${visualBarWidthAvg}%` }}></div>
                                                </div>
                                            </div>
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