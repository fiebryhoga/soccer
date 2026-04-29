// resources/js/Pages/PerformanceLogs/Partials/PlayerMatchMetricsTable.jsx

import React, { useMemo } from 'react';
import { Target, Activity, Lock } from 'lucide-react';

// Susunan Kolom dan Nama Label persis sesuai instruksi Anda
const MATCH_EXCEL_COLUMNS = [
    { id: 'duration_1st', label: '1 ST', hasPercent: false },
    { id: 'duration_2nd', label: '2 ND', hasPercent: false },
    { id: 'total_distance', label: 'Total Distance (m)', hasPercent: true, pctLabel: '% Total Distance Of-MD' },
    { id: 'dist_per_min', label: 'Distance/min', hasPercent: true, pctLabel: '% Distance/min Of-MD' },
    { id: 'distance_1st', label: 'Distance 1 ST', hasPercent: false },
    { id: 'distance_2nd', label: 'Distance 2 ND', hasPercent: false },
    { id: 'hir_18_24_kmh', label: 'HIR 18-24.51 Km/h', hasPercent: true, pctLabel: '%HIR 18-24.51 Km/h' },
    { id: 'sprint_distance', label: 'SPRINT 24.52 km/h~', hasPercent: true, pctLabel: '% SPRINT 24.52 km/h~' },
    { id: 'total_18kmh', label: 'Total 18 Km/h~', hasPercent: true, pctLabel: '% Total 18 Km/h~' },
    { id: 'accels', label: 'Accels >3m/s/s', hasPercent: false },
    { id: 'decels', label: 'Decels >3m/s/s', hasPercent: false },
    { id: 'hr_band_4_dist', label: 'HR Band 4 Dist', hasPercent: false },
    { id: 'hr_band_4_dur', label: 'HR Band 4 Dur', hasPercent: false },
    { id: 'hr_band_5_dist', label: 'HR Band 5 Dist', hasPercent: false },
    { id: 'hr_band_5_dur', label: 'HR Band 5 Dur', hasPercent: false },
    { id: 'max_velocity', label: 'Max Velocity', hasPercent: true, pctLabel: '% Max Velocity' },
    { id: 'highest_velocity', label: 'Highest Vel', hasPercent: false },
    { id: 'player_load', label: 'Player Load', hasPercent: true, pctLabel: '% Player Load' }
];

const checkIsDistanceGroup = (colId) => ['hir_18_24_kmh', 'sprint_distance', 'total_18kmh'].includes(colId);

export default function PlayerMatchMetricsTable({ data, handleChange, getAutoCalculatedValue, calculatePercentage }) {
    
    // HANYA ambil pemain yang sedang main (mengikuti tabel utama Match)
    const playingPlayers = useMemo(() => {
        return data.players_data
            .map((p, i) => ({ ...p, originalIndex: i }))
            .filter(p => p.is_playing !== false); 
    }, [data.players_data]);

    // Helper untuk merender Header Cell agar kode rapi
    const HeaderCell = ({ label, pctLabel, isAuto = false, hasPercent = false, rowSpan = 1, isDist = false }) => {
        const bgClass = isDist ? 'bg-zinc-100/50 dark:bg-zinc-800/30' : 'bg-transparent';
        const textColor = isAuto ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-700 dark:text-zinc-300';
        return (
            <React.Fragment>
                <th rowSpan={rowSpan} className={`p-2.5 font-bold text-center border-l border-zinc-200 dark:border-zinc-800 min-w-[90px] align-middle ${bgClass} ${textColor}`}>
                    <div className="flex items-center justify-center gap-1.5 cursor-default">
                        {isAuto && <Lock size={10} strokeWidth={3} className="shrink-0" />}
                        <span className="truncate">{label}</span>
                    </div>
                </th>
                {hasPercent && (
                    <th rowSpan={rowSpan} className={`p-2.5 font-bold text-zinc-400 dark:text-zinc-500 min-w-[110px] border-l border-zinc-200/50 dark:border-zinc-800/50 text-right whitespace-nowrap align-middle ${isDist ? 'bg-zinc-100/80 dark:bg-zinc-800/40' : 'bg-zinc-50/50 dark:bg-zinc-900/20'}`}>
                        {pctLabel || `% ${label}`}
                    </th>
                )}
            </React.Fragment>
        );
    };

    return (
        <div className="w-full space-y-3 mb-10 mt-12">
            <div className="flex items-center gap-2 px-1 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 pt-8">
                <Target size={20} className="text-amber-500" />
                <div>
                    <h3 className="text-sm font-black text-amber-600 dark:text-amber-500 tracking-tight">Kalkulasi Individual (Player Target - Match)</h3>
                    <p className="text-[10px] font-bold text-zinc-500">
                        Tabel ini otomatis mensinkronkan data dengan tabel Match di atas dan menghitung persentase berdasarkan target masing-masing individu.
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-amber-200/50 dark:border-amber-900/30 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden ring-4 ring-amber-50 dark:ring-amber-900/10">
                <div className="overflow-x-auto relative [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-zinc-50 dark:[&::-webkit-scrollbar-track]:bg-zinc-950 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full pb-1">
                    <table className="w-max min-w-full text-left whitespace-nowrap text-[10px] border-collapse tabular-nums">
                        
                        {/* 1. HEADER MATCH KHUSUS INDIVIDU (Lebar dan posisi persis dengan Tabel Match Utama) */}
                        <thead className="bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm">
                            <tr>
                                <th colSpan="4" rowSpan="2" style={{ left: 0 }} className="p-2 border-b border-zinc-200 dark:border-zinc-800 sticky z-40 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding align-bottom border-r shadow-[4px_0_12px_rgba(0,0,0,0.03)]">
                                    <div className="flex font-black text-zinc-400 dark:text-zinc-600 mb-1 ml-1 text-[10px] tracking-widest uppercase">Pemain</div>
                                </th>
                                
                                <th colSpan="2" className="p-2 border-b border-r border-zinc-200 dark:border-zinc-800 text-center font-black tracking-[0.2em] uppercase text-zinc-800 dark:text-zinc-200 bg-zinc-100/80 dark:bg-zinc-800/50">Duration</th>
                                <HeaderCell label="Total Distance (m)" pctLabel="% Total Distance Of-MD" hasPercent={true} rowSpan={2} />
                                <HeaderCell label="Distance/min" pctLabel="% Distance/min Of-MD" hasPercent={true} rowSpan={2} />
                                <th colSpan="2" className="p-2 border-b border-l border-r border-zinc-200 dark:border-zinc-800 text-center font-black tracking-[0.2em] uppercase text-zinc-800 dark:text-zinc-200 bg-zinc-100/80 dark:bg-zinc-800/50">Distance (m)</th>
                                
                                <HeaderCell label="HIR 18-24.51 Km/h" pctLabel="%HIR 18-24.51 Km/h" hasPercent={true} rowSpan={2} isDist={true} />
                                <HeaderCell label="SPRINT 24.52 km/h~" pctLabel="% SPRINT 24.52 km/h~" hasPercent={true} rowSpan={2} isDist={true} />
                                <HeaderCell label="Total 18 Km/h~" pctLabel="% Total 18 Km/h~" isAuto={true} hasPercent={true} rowSpan={2} isDist={true} />
                                <HeaderCell label="Accels >3m/s/s" rowSpan={2} />
                                <HeaderCell label="Decels >3m/s/s" rowSpan={2} />
                                <HeaderCell label="HR Band 4 Dist" rowSpan={2} />
                                <HeaderCell label="HR Band 4 Dur" rowSpan={2} />
                                <HeaderCell label="HR Band 5 Dist" rowSpan={2} />
                                <HeaderCell label="HR Band 5 Dur" rowSpan={2} />
                                <HeaderCell label="Max Velocity" pctLabel="% Max Velocity" hasPercent={true} rowSpan={2} />
                                <HeaderCell label="Highest Vel" isAuto={true} rowSpan={2} />
                                <HeaderCell label="Player Load" pctLabel="% Player Load" hasPercent={true} rowSpan={2} />
                            </tr>
                            <tr className="border-b-2 border-zinc-200 dark:border-zinc-800">
                                <HeaderCell label="1 ST" />
                                <HeaderCell label="2 ND" />
                                <HeaderCell label="Distance 1 ST" isDist={true} />
                                <HeaderCell label="Distance 2 ND" isDist={true} />
                            </tr>
                            <tr className="border-b-2 border-zinc-200 dark:border-zinc-800">
                                <th style={{ left: '0px', width: '40px', minWidth: '40px' }} className="p-2 font-black text-zinc-500 uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding text-center">NO</th>
                                <th style={{ left: '40px', width: '50px', minWidth: '50px' }} className="p-2 font-black text-zinc-500 uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding text-center">POS</th>
                                <th style={{ left: '90px', width: '40px', minWidth: '40px' }} className="p-2 font-black text-zinc-500 uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding text-center">NP</th>
                                <th style={{ left: '130px', width: '180px', minWidth: '180px' }} className="p-2 font-black text-zinc-500 uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-zinc-950 shadow-[4px_0_12px_rgba(0,0,0,0.03)] bg-clip-padding border-r border-zinc-200 dark:border-zinc-800">NAMA PEMAIN</th>
                                <th colSpan="25" className="p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"></th>
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
                                        
                                        <td style={{ left: '0px', width: '40px', minWidth: '40px' }} className="p-2 font-bold text-zinc-400 dark:text-zinc-600 sticky z-20 bg-clip-padding text-center bg-white dark:bg-zinc-950 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/50">
                                            {player.originalIndex + 1}
                                        </td>
                                        <td style={{ left: '40px', width: '50px', minWidth: '50px' }} className="p-2 sticky z-20 bg-clip-padding text-center bg-white dark:bg-zinc-950 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/50">
                                            <span className="px-1.5 py-0.5 rounded-md border text-[9px] font-black tracking-wider border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 bg-zinc-100/50 dark:bg-zinc-900">{player.position}</span>
                                        </td>
                                        <td style={{ left: '90px', width: '40px', minWidth: '40px' }} className="p-2 font-mono font-bold text-[11px] text-zinc-500 sticky z-20 bg-clip-padding text-center bg-white dark:bg-zinc-950 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/50">
                                            {String(player.position_number).padStart(2, '0')}
                                        </td>
                                        <td style={{ left: '130px', width: '180px', minWidth: '180px' }} className="p-2 font-bold text-zinc-900 dark:text-zinc-100 sticky z-20 shadow-[4px_0_12px_rgba(0,0,0,0.03)] dark:shadow-[4px_0_12px_rgba(0,0,0,0.3)] bg-clip-padding border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/50">
                                            <div style={{ width: '164px' }} className="flex items-center justify-between gap-2 overflow-hidden">
                                                <span className="truncate flex-1" title={player.name}>{player.name}</span>
                                            </div>
                                        </td>
                                        
                                        {/* LOOP KOLOM DATA */}
                                        {MATCH_EXCEL_COLUMNS.map(col => {
                                            const rawValue = getAutoCalculatedValue(player, col.id);
                                            // Kunci Kalkulasi Spesifik Pemain
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