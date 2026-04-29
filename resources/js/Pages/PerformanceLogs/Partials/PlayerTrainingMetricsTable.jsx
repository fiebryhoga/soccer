// resources/js/Pages/PerformanceLogs/Partials/PlayerTrainingMetricsTable.jsx

import React, { useMemo } from 'react';
import { Target, Activity, Lock } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';

// Helper untuk mewarnai kolom kategori Distance
const checkIsDistanceGroup = (colId) => ['hir_18_24_kmh', 'sprint_distance', 'total_18kmh'].includes(colId);

export default function PlayerTrainingMetricsTable({ data, setData, getAutoCalculatedValue, calculatePercentage, handleChange }) {
    
    // HANYA ambil pemain yang sedang latihan (mengikuti tabel utama)
    const playingPlayers = useMemo(() => {
        return data.players_data
            .map((p, i) => ({ ...p, originalIndex: i }))
            .filter(p => p.is_playing !== false); // Abaikan yang di-bench
    }, [data.players_data]);

    return (
        <div className="w-full space-y-3 mb-10 mt-12">
            <div className="flex items-center gap-2 px-1 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 pt-8">
                <Target size={20} className="text-amber-500" />
                <div>
                    <h3 className="text-sm font-black text-amber-600 dark:text-amber-500 tracking-tight">Kalkulasi Individual (Player Target)</h3>
                    <p className="text-[10px] font-bold text-zinc-500">
                        Tabel ini otomatis mensinkronkan data dengan tabel di atas dan menghitung persentase berdasarkan target masing-masing individu.
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-amber-200/50 dark:border-amber-900/30 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden ring-4 ring-amber-50 dark:ring-amber-900/10">
                <div className="overflow-x-auto relative [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-zinc-50 dark:[&::-webkit-scrollbar-track]:bg-zinc-950 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full pb-1">
                    <table className="w-max min-w-full text-left whitespace-nowrap text-[10px] border-collapse tabular-nums">
                        
                        {/* HEADER SIMPEL TANPA CHECKBOX / TOOLS */}
                        <thead className="bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm">
                            <tr className="border-b-2 border-zinc-200 dark:border-zinc-800">
                                <th className="p-3 font-black text-zinc-500 uppercase tracking-wider sticky left-0 z-30 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding border-r border-zinc-200 dark:border-zinc-800 shadow-[4px_0_12px_rgba(0,0,0,0.03)] min-w-[200px] w-[200px]">NAMA PEMAIN</th>
                                <th className="p-3 font-black text-zinc-500 uppercase tracking-wider text-center min-w-[50px]">POS</th>
                                
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

                                    return (
                                        <React.Fragment key={`th-${col.id}`}>
                                            <th className={`p-2.5 font-bold text-center border-l border-zinc-200 dark:border-zinc-800 min-w-[90px] ${isDist ? 'bg-zinc-100/50 dark:bg-zinc-800/30' : 'bg-transparent'} ${isAuto ? 'text-zinc-400 dark:text-zinc-600' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                                <div className="flex items-center justify-center gap-1.5 cursor-default">
                                                    {isAuto && <Lock size={10} strokeWidth={3} />}
                                                    <span className="truncate">{col.label}</span>
                                                </div>
                                            </th>
                                            {col.hasPercent && (
                                                <th className={`p-2.5 font-bold text-zinc-400 dark:text-zinc-500 min-w-[110px] border-l border-zinc-200/50 dark:border-zinc-800/50 text-right ${isDist ? 'bg-zinc-100/80 dark:bg-zinc-800/40' : 'bg-zinc-50/50 dark:bg-zinc-900/20'}`}>
                                                    {percentLabel}
                                                </th>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                            {playingPlayers.length === 0 ? (
                                <tr>
                                    <td colSpan="100%" className="p-12 text-center bg-zinc-50 dark:bg-[#0a0a0a]">
                                        <Activity size={32} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Menunggu Data...</h4>
                                        <p className="text-xs font-semibold text-zinc-500 mt-1">Pilih dan masukkan pemain ke dalam tabel utama di atas.</p>
                                    </td>
                                </tr>
                            ) : (
                                playingPlayers.map((player) => (
                                    <tr key={player.player_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                                        <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100 sticky left-0 z-20 bg-white dark:bg-zinc-950 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/50 shadow-[4px_0_12px_rgba(0,0,0,0.03)] border-r border-zinc-200 dark:border-zinc-800 truncate min-w-[200px] w-[200px]">
                                            {player.name}
                                        </td>
                                        <td className="p-2 text-[10px] font-black text-center text-zinc-500">
                                            {player.position}
                                        </td>
                                        
                                        {FIXED_EXCEL_COLUMNS.map(col => {
                                            const rawValue = getAutoCalculatedValue(player, col.id);
                                            
                                            // KUNCI PERBAIKAN PERSENTASE: Mengirim parameter ke-5 (player.player_id)
                                            const percent = calculatePercentage(col.id, rawValue, player.position, player.historical_highest, player.player_id);
                                            
                                            const isAuto = ['total_18kmh', 'highest_velocity'].includes(col.id);
                                            const isDist = checkIsDistanceGroup(col.id);
                                            let cellBgClass = isDist ? (isAuto ? 'bg-zinc-100/40 dark:bg-zinc-900/30' : 'bg-zinc-50/50 dark:bg-zinc-900/10') : (isAuto ? 'bg-zinc-50/50 dark:bg-zinc-900/20' : '');

                                            return (
                                                <React.Fragment key={`td-${col.id}`}>
                                                    <td className={`p-1.5 border-l border-zinc-100 dark:border-zinc-800/50 relative ${cellBgClass}`}>
                                                        <input 
                                                            type="text" value={rawValue}
                                                            onChange={e => handleChange(player.originalIndex, col.id, e.target.value)}
                                                            readOnly={isAuto} placeholder="-"
                                                            className={`w-full bg-transparent border-none rounded text-[11px] py-1 px-1.5 text-center font-bold tabular-nums outline-none transition-all
                                                                ${isAuto ? 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed' : 'text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-950 focus:ring-2 focus:ring-zinc-900'}
                                                            `} 
                                                        />
                                                    </td>
                                                    
                                                    {col.hasPercent && (
                                                        <td className={`p-2 border-l border-zinc-100 dark:border-zinc-800/50 ${isDist ? 'bg-zinc-50/80 dark:bg-zinc-900/20' : 'bg-transparent'}`}>
                                                            <div className="flex items-center justify-end gap-2">
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}