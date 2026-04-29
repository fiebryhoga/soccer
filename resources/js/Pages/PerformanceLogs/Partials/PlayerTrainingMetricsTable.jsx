// resources/js/Pages/PerformanceLogs/Partials/PlayerTrainingMetricsTable.jsx

import React, { useMemo } from 'react';
import { Target, Activity, Lock } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';

// Helper untuk mewarnai kolom kategori Distance
const checkIsDistanceGroup = (colId) => ['hir_18_24_kmh', 'sprint_distance', 'total_18kmh'].includes(colId);

// ==========================================
// KOMPONEN BARIS (DI-MEMOIZATION AGAR RINGAN)
// ==========================================
const PlayerTrainingRow = React.memo(({ player, handleChange, getAutoCalculatedValue, calculatePercentage }) => {
    return (
        <tr className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors group">
            <td className="p-2.5 font-bold text-[11px] text-zinc-900 dark:text-zinc-100 sticky left-0 z-20 bg-white dark:bg-[#0a0a0a] group-hover:bg-zinc-50/80 dark:group-hover:bg-zinc-900/40 shadow-[4px_0_12px_rgba(0,0,0,0.03)] border-r border-zinc-100 dark:border-zinc-800/60 truncate min-w-[180px] w-[180px]">
                {player.name}
            </td>
            <td className="p-2 text-[10px] font-black text-center text-zinc-500 dark:text-zinc-400 border-r border-zinc-100 dark:border-zinc-800/60">
                {player.position}
            </td>
            
            {FIXED_EXCEL_COLUMNS.map(col => {
                const rawValue = getAutoCalculatedValue(player, col.id);
                // KUNCI PERBAIKAN PERSENTASE: Mengirim parameter ke-5 (player.player_id)
                const percent = calculatePercentage(col.id, rawValue, player.position, player.historical_highest, player.player_id);
                
                const isAuto = ['total_18kmh', 'highest_velocity'].includes(col.id);
                const isDist = checkIsDistanceGroup(col.id);
                let cellBgClass = isDist ? (isAuto ? 'bg-zinc-100/40 dark:bg-zinc-900/30' : 'bg-zinc-50/50 dark:bg-[#111113]') : (isAuto ? 'bg-zinc-50/50 dark:bg-[#111113]' : '');

                return (
                    <React.Fragment key={`td-${col.id}`}>
                        <td className={`p-1 border-l border-zinc-100 dark:border-zinc-800/60 relative ${cellBgClass}`}>
                            <input 
                                type="text" value={rawValue}
                                onChange={e => handleChange(player.originalIndex, col.id, e.target.value)}
                                readOnly={isAuto} placeholder="-"
                                className={`w-full bg-transparent border-none rounded text-[11px] py-1 px-1 text-center font-bold tabular-nums outline-none transition-all
                                    ${isAuto ? 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed' : 'text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-500 dark:focus:ring-zinc-400'}
                                `} 
                            />
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
}, (prev, next) => prev.player === next.player); // Hanya render ulang jika objek player berubah


// ==========================================
// KOMPONEN UTAMA TABEL
// ==========================================
export default function PlayerTrainingMetricsTable({ data, setData, getAutoCalculatedValue, calculatePercentage, handleChange }) {
    
    const playingPlayers = useMemo(() => {
        return data.players_data
            .map((p, i) => ({ ...p, originalIndex: i }))
            .filter(p => p.is_playing !== false); 
    }, [data.players_data]);

    return (
        <div className="w-full space-y-3 mb-10 mt-12">
            {/* Tema Monochrome Zinc */}
            <div className="flex items-center gap-2 px-1 border-t border-dashed border-zinc-300 dark:border-zinc-700 pt-6">
                <Target size={18} strokeWidth={2.5} className="text-zinc-700 dark:text-zinc-300" />
                <div>
                    <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Kalkulasi Individual (Player Target)</h3>
                    <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                        Mensinkronkan data dengan tabel di atas dan menghitung persentase dari benchmark masing-masing individu.
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
                <div className="overflow-x-auto relative [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-zinc-50 dark:[&::-webkit-scrollbar-track]:bg-[#111113] [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full pb-1">
                    <table className="w-max min-w-full text-left whitespace-nowrap text-[10px] border-collapse tabular-nums">
                        
                        <thead className="bg-zinc-50/80 dark:bg-[#111113]/80 backdrop-blur-sm">
                            <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                <th className="p-2 font-black text-[9px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest sticky left-0 z-30 bg-zinc-50 dark:bg-[#111113] bg-clip-padding border-r border-zinc-200 dark:border-zinc-800 shadow-[4px_0_12px_rgba(0,0,0,0.03)] min-w-[180px] w-[180px]">NAMA PEMAIN</th>
                                <th className="p-2 font-black text-[9px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-center min-w-[50px] border-r border-zinc-200 dark:border-zinc-800">POS</th>
                                
                                {FIXED_EXCEL_COLUMNS.map(col => {
                                    const isAuto = ['total_18kmh', 'highest_velocity'].includes(col.id);
                                    const isDist = checkIsDistanceGroup(col.id);
                                    
                                    let percentLabel = `% ${col.label}`;
                                    if (col.id === 'total_distance') percentLabel = '% Total Dist';
                                    if (col.id === 'dist_per_min') percentLabel = '% Dist/min';
                                    if (col.id === 'hir_18_24_kmh') percentLabel = '% HIR';
                                    if (col.id === 'sprint_distance') percentLabel = '% SPRINT';
                                    if (col.id === 'total_18kmh') percentLabel = '% Total >18';
                                    if (col.id === 'max_velocity') percentLabel = '% Max Vel';
                                    if (col.id === 'player_load') percentLabel = '% PL';

                                    return (
                                        <React.Fragment key={`th-${col.id}`}>
                                            <th className={`p-2 font-bold text-[9px] text-center border-l border-zinc-200 dark:border-zinc-800 min-w-[70px] ${isDist ? 'bg-zinc-100/50 dark:bg-zinc-800/40' : 'bg-transparent'} ${isAuto ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                                <div className="flex items-center justify-center gap-1 cursor-default">
                                                    {isAuto && <Lock size={10} strokeWidth={3} />}
                                                    <span className="truncate">{col.label}</span>
                                                </div>
                                            </th>
                                            {col.hasPercent && (
                                                <th className={`p-2 font-bold text-[9px] text-zinc-400 dark:text-zinc-500 min-w-[90px] border-l border-zinc-200/50 dark:border-zinc-800/50 text-right ${isDist ? 'bg-zinc-100/80 dark:bg-zinc-800/60' : 'bg-zinc-50/50 dark:bg-[#111113]'}`}>
                                                    {percentLabel}
                                                </th>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-[#0a0a0a]">
                            {playingPlayers.length === 0 ? (
                                <tr>
                                    <td colSpan="100%" className="p-10 text-center bg-zinc-50 dark:bg-[#0a0a0a]">
                                        <Activity size={24} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
                                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Menunggu Data...</h4>
                                        <p className="text-[10px] font-semibold text-zinc-500 mt-1">Pilih dan masukkan pemain ke tabel utama.</p>
                                    </td>
                                </tr>
                            ) : (
                                playingPlayers.map(player => (
                                    <PlayerTrainingRow 
                                        key={player.player_id} 
                                        player={player} 
                                        handleChange={handleChange} 
                                        getAutoCalculatedValue={getAutoCalculatedValue} 
                                        calculatePercentage={calculatePercentage} 
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}