// resources/js/Pages/PerformanceLogs/Partials/MetricsTable.jsx

import React, { useRef } from 'react';
import { GripVertical, Lock } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';

export default function MetricsTable({ data, setData, getAutoCalculatedValue, calculatePercentage, getColumnAverage, handlePaste, handleChange }) {
    
    // Referensi untuk Drag & Drop
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

    return (
        <div className="overflow-x-auto relative [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-zinc-50 dark:[&::-webkit-scrollbar-track]:bg-[#09090b] [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full pb-2">
            <table className="w-full text-left whitespace-nowrap text-[10px] border-collapse">
                
                {/* HEADERS */}
                <thead className="bg-zinc-50 dark:bg-[#09090b]">
                    {/* Header Grup Atas */}
                    <tr>
                        <th colSpan="5" style={{ minWidth: '30px', left: 0 }} className="p-2 font-black tracking-widest uppercase border-b border-zinc-200 dark:border-zinc-800 text-center text-zinc-400 dark:text-zinc-600 sticky z-30 bg-zinc-50 dark:bg-[#09090b]">Identitas Pemain</th>
                        <th colSpan="1" className="p-2 border-b border-l border-zinc-200 dark:border-zinc-800 dark:border-l-zinc-800/50 text-center font-black tracking-widest uppercase text-zinc-400 dark:text-zinc-600">Durasi</th>
                        <th colSpan="2" className="p-2 border-b border-l border-zinc-200 dark:border-zinc-800 dark:border-l-zinc-800/50 text-center font-black tracking-widest uppercase text-zinc-400 dark:text-zinc-600">Jarak Total</th>
                        <th colSpan="2" className="p-2 border-b border-l border-zinc-200 dark:border-zinc-800 dark:border-l-zinc-800/50 text-center font-black tracking-widest uppercase text-zinc-400 dark:text-zinc-600">Jarak/Mnt</th>
                        <th colSpan="10" className="p-2 border-b border-l border-zinc-200 dark:border-zinc-800 dark:border-l-zinc-800/50 text-center font-black tracking-widest uppercase text-zinc-900 dark:text-zinc-100 bg-zinc-100/50 dark:bg-zinc-900/50">Detail Jarak (m)</th>
                        <th colSpan="12" className="p-2 border-b border-l border-zinc-200 dark:border-zinc-800 dark:border-l-zinc-800/50 text-center font-black tracking-widest uppercase text-zinc-400 dark:text-zinc-600">Metrik Lainnya</th>
                    </tr>
                    {/* Header Kolom Spesifik */}
                    <tr className="border-b-2 border-zinc-200 dark:border-zinc-800">
                        <th style={{ left: 0, minWidth: '24px' }} className="p-2 sticky z-30 bg-zinc-50 dark:bg-[#09090b]"></th> 
                        <th style={{ left: '24px', minWidth: '30px' }} className="p-2 font-bold text-zinc-500 uppercase sticky z-30 bg-zinc-50 dark:bg-[#09090b]">NO</th>
                        <th style={{ left: '54px', minWidth: '40px' }} className="p-2 font-bold text-zinc-500 uppercase sticky z-30 bg-zinc-50 dark:bg-[#09090b]">POS</th>
                        <th style={{ left: '94px', minWidth: '40px' }} className="p-2 font-bold text-zinc-500 uppercase sticky z-30 bg-zinc-50 dark:bg-[#09090b]">NP</th>
                        {/* Batas Sticky Kanan diberi shadow halus inset */}
                        <th style={{ left: '134px', minWidth: '150px' }} className="p-2 font-bold text-zinc-500 uppercase sticky z-30 bg-zinc-50 dark:bg-[#09090b] shadow-[inset_-1px_0_0_0_#e4e4e7] dark:shadow-[inset_-1px_0_0_0_#27272a]">NAMA PEMAIN</th>
                        
                        {FIXED_EXCEL_COLUMNS.map(col => {
                            const isAuto = ['hir_19_8_kmh', 'total_18kmh', 'highest_velocity'].includes(col.id);
                            return (
                                <React.Fragment key={col.id}>
                                    <th className={`p-2.5 font-bold text-center border-l border-zinc-200/50 dark:border-zinc-800/50 min-w-[85px] ${isAuto ? 'text-zinc-400 dark:text-zinc-600 flex items-center justify-center gap-1' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                        {isAuto && <Lock size={10} />} {col.label}
                                    </th>
                                    {col.hasPercent && (
                                        <th className="p-2.5 font-bold text-zinc-400 dark:text-zinc-500 min-w-[110px] bg-zinc-50/50 dark:bg-zinc-900/20 border-l border-zinc-200/50 dark:border-zinc-800/50 text-right">
                                            % MD
                                        </th>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tr>
                </thead>

                {/* BODY TABEL DENGAN DRAG & DROP */}
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-[#09090b]">
                    {data.players_data.map((player, rowIndex) => {
                        // Hilangkan warna mencolok, gunakan hover abu-abu elegan
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
                                {/* KOLOM KIRI (STICKY) */}
                                <td style={{ left: 0 }} className={`p-1 sticky z-10 cursor-grab active:cursor-grabbing ${rowStyle}`}>
                                    <GripVertical size={14} className="text-zinc-300 dark:text-zinc-700 mx-auto group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors" />
                                </td>
                                <td style={{ left: '24px' }} className={`p-2 font-semibold text-zinc-400 dark:text-zinc-600 sticky z-10 ${rowStyle}`}>{rowIndex + 1}</td>
                                <td style={{ left: '54px' }} className={`p-2 sticky z-10 ${rowStyle}`}>
                                    <span className="px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-[9px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100/50 dark:bg-zinc-800/50">
                                        {player.position}
                                    </span>
                                </td>
                                <td style={{ left: '94px' }} className={`p-2 font-mono text-[11px] text-zinc-500 sticky z-10 ${rowStyle}`}>{String(player.position_number).padStart(2, '0')}</td>
                                <td style={{ left: '134px' }} className={`p-2 font-bold text-zinc-900 dark:text-zinc-100 truncate sticky z-10 shadow-[inset_-1px_0_0_0_#e4e4e7] dark:shadow-[inset_-1px_0_0_0_#27272a] ${rowStyle}`}>
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
                                            <td className={`p-1.5 border-l border-zinc-100 dark:border-zinc-800/50 relative ${isAuto ? 'bg-zinc-50/50 dark:bg-zinc-900/20' : ''}`}>
                                                <input 
                                                    type="text" value={rawValue}
                                                    onChange={e => handleChange(rowIndex, col.id, e.target.value)}
                                                    onPaste={e => handlePaste(e, rowIndex, col.id)}
                                                    readOnly={isAuto}
                                                    placeholder="-"
                                                    className={`w-full bg-transparent border border-transparent rounded-md text-[11px] py-1 px-1.5 text-center font-semibold transition-all outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700
                                                        ${isAuto ? 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed' : 'text-zinc-900 dark:text-zinc-100 hover:border-zinc-200 dark:hover:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100'}
                                                    `} 
                                                />
                                                {/* Indikator Rekor Baru */}
                                                {isNewRecord && (
                                                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-zinc-900 dark:bg-zinc-100 rounded-full animate-pulse" title="New Record!"></div>
                                                )}
                                            </td>
                                            {col.hasPercent && (
                                                <td className="p-2 border-l border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-900/10">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 w-7 text-right">{percent}%</span>
                                                        <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-500 ease-out" 
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
                <tfoot className="bg-zinc-50 dark:bg-[#09090b] border-t border-zinc-200 dark:border-zinc-800 shadow-[0_-1px_2px_rgba(0,0,0,0.02)]">
                    <tr>
                        <td colSpan="4" style={{ left: 0 }} className="p-2 sticky z-20 bg-zinc-50 dark:bg-[#09090b]"></td>
                        <td style={{ left: '134px' }} className="p-3 font-black text-[10px] uppercase tracking-widest text-zinc-900 dark:text-zinc-100 text-right pr-4 sticky z-20 bg-zinc-50 dark:bg-[#09090b] shadow-[inset_-1px_0_0_0_#e4e4e7] dark:shadow-[inset_-1px_0_0_0_#27272a]">Rata-Rata Tim</td>
                        {FIXED_EXCEL_COLUMNS.map(col => {
                            const avgValue = getColumnAverage(col.id);
                            const avgPercent = calculatePercentage(col.id, avgValue, null); 
                            const visualBarWidthAvg = Math.min(avgPercent, 100);

                            return (
                                <React.Fragment key={col.id}>
                                    <td className="p-2 font-black text-center text-zinc-900 dark:text-zinc-100 border-l border-zinc-200/50 dark:border-zinc-800/50 text-[11px]">{avgValue}</td>
                                    {col.hasPercent && (
                                        <td className="p-2 border-l border-zinc-200/50 dark:border-zinc-800/50">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-[9px] font-black text-zinc-900 dark:text-zinc-100 w-7 text-right">{avgPercent}%</span>
                                                <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-500 ease-out" style={{ width: `${visualBarWidthAvg}%` }}></div>
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