// resources/js/Pages/PerformanceLogs/Partials/TrainingMetricsTable.jsx

import React, { useMemo, useRef } from 'react';
import { GripVertical, Lock, CheckSquare, Square, Eraser, CheckCircle2, MinusCircle, Activity } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';

// ==============================================================================
// 1. CONFIGURATION & CONSTANTS
// ==============================================================================
const STICKY_COLS = {
    c1: { left: 0, width: 40, minWidth: 40, maxWidth: 40, boxSizing: 'border-box' },
    c2: { left: 40, width: 50, minWidth: 50, maxWidth: 50, boxSizing: 'border-box' },
    c3: { left: 90, width: 40, minWidth: 40, maxWidth: 40, boxSizing: 'border-box' },
    c4: { left: 130, width: 50, minWidth: 50, maxWidth: 50, boxSizing: 'border-box' },
    c5: { left: 180, width: 40, minWidth: 40, maxWidth: 40, boxSizing: 'border-box' },
    c6: { left: 220, width: 180, minWidth: 180, maxWidth: 180, boxSizing: 'border-box' },
    superHeader: { left: 0 },
    footerSpan: { left: 0 }
};

const checkIsDistanceGroup = (colId) => ['hir_18_24_kmh', 'sprint_distance', 'total_18kmh'].includes(colId);

// Helper Fungsi Kalkulasi Rata-rata Lokal
const calculateLocalAverage = (playersGroup, colId, getAutoCalculatedValue) => {
    let sum = 0; let count = 0; let isTime = false;
    playersGroup.forEach(p => {
        const val = getAutoCalculatedValue(p, colId);
        if (val === '-' || val === '' || val == null) return;
        
        if (typeof val === 'string' && val.includes('.')) {
            const parts = val.split('.');
            if (parts.length === 3) {
                isTime = true;
                sum += parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
                count++;
                return;
            }
        }
        const num = parseFloat(val);
        if (!isNaN(num)) { sum += num; count++; }
    });

    if (count === 0) return '-';
    if (isTime) {
        const avgSeconds = Math.round(sum / count);
        const h = Math.floor(avgSeconds / 3600);
        const m = Math.floor((avgSeconds % 3600) / 60);
        const s = avgSeconds % 60;
        return `${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}.${String(s).padStart(2, '0')}`;
    }
    const avg = sum / count;
    return Number.isInteger(avg) ? avg.toString() : avg.toFixed(1);
};


// ==============================================================================
// 2. MAIN COMPONENT (PARENT)
// ==============================================================================
export default function TrainingMetricsTable({ data, setData, getAutoCalculatedValue, calculatePercentage, handleChange }) {
    
    const dragItem = useRef();
    const dragOverItem = useRef();

    // -- STATE ACTIONS & LOGIC --
    const handleDragStart = (e, originalIndex) => { dragItem.current = originalIndex; };
    const handleDragEnter = (e, originalIndex) => { dragOverItem.current = originalIndex; };
    
    const handleDragEnd = () => {
        if (dragItem.current !== undefined && dragOverItem.current !== undefined && dragItem.current !== dragOverItem.current) {
            const dragIdx = dragItem.current;
            const overIdx = dragOverItem.current;
            
            const copyListItems = [...data.players_data];
            const draggedPlayer = copyListItems[dragIdx];
            const targetPlayer = copyListItems[overIdx];

            const dragPos = String(draggedPlayer.position || 'OTHER').trim().toUpperCase();
            const targetPos = String(targetPlayer.position || 'OTHER').trim().toUpperCase();
            const isDragPlaying = draggedPlayer.is_playing !== false; 
            const isTargetPlaying = targetPlayer.is_playing !== false;

            // VALIDASI: Hanya bisa geser jika Posisi Sama dan Status Main Sama
            if (dragPos === targetPos && isDragPlaying === isTargetPlaying) {
                copyListItems.splice(dragIdx, 1);
                copyListItems.splice(overIdx, 0, draggedPlayer);
                setData('players_data', copyListItems);
            } else {
                let statusMsg = isDragPlaying ? "Tim Utama" : "Bench";
                alert(`Gagal: Anda hanya bisa menggeser sesama posisi ${dragPos} di dalam status ${statusMsg}.`);
            }
        }
        dragItem.current = undefined;
        dragOverItem.current = undefined;
    };

    const togglePlayStatus = (originalIndex) => {
        const newData = [...data.players_data];
        newData[originalIndex].is_playing = newData[originalIndex].is_playing === false ? true : false;
        setData('players_data', newData);
    };

    const toggleSelectAll = (type = 'selected') => {
        const allSelected = data.players_data.every(p => p[type]);
        const newData = data.players_data.map(p => { p[type] = !allSelected; p.metrics[type] = !allSelected; return p; });
        setData('players_data', newData);
    };

    const togglePlayerSelection = (originalIndex, type = 'selected') => {
        const newData = [...data.players_data];
        newData[originalIndex][type] = !newData[originalIndex][type];
        newData[originalIndex].metrics[type] = newData[originalIndex][type];
        setData('players_data', newData);
    };

    const clearColumn = (colId, colName) => {
        if (!confirm(`Yakin ingin mengosongkan seluruh data pada kolom "${colName}"?`)) return;
        const newData = data.players_data.map(p => { const newMetrics = { ...p.metrics }; newMetrics[colId] = ''; return { ...p, metrics: newMetrics }; });
        setData('players_data', newData);
    };

    const clearRow = (originalIndex, playerName) => {
        if (!confirm(`Yakin mengosongkan data metrik "${playerName}"?`)) return;
        const newData = [...data.players_data];
        const newMetrics = { ...newData[originalIndex].metrics };
        FIXED_EXCEL_COLUMNS.forEach(col => { if (!['total_18kmh', 'highest_velocity'].includes(col.id)) newMetrics[col.id] = ''; });
        newData[originalIndex].metrics = newMetrics;
        setData('players_data', newData);
    };

    // Paste Cerdas: Mengisi Excel berdasarkan urutan Visual (termasuk yang digrup posisi)
    const handleLocalPaste = (e, visibleIndex, colId) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text');
        if (!pasteData) return;
        
        const rows = pasteData.split(/\r?\n/).map(r => r.split('\t'));
        let newData = [...data.players_data];
        const startColIdx = FIXED_EXCEL_COLUMNS.findIndex(c => c.id === colId);
        
        rows.forEach((row, i) => {
            if (row.length === 1 && row[0] === '') return;
            const targetVisiblePlayer = visiblePlayers[visibleIndex + i]; 
            if (targetVisiblePlayer) {
                const targetOriginalIdx = targetVisiblePlayer.originalIndex;
                const cleanedRow = row.filter(val => !val.includes('%'));
                cleanedRow.forEach((val, j) => {
                    const targetColIdx = startColIdx + j;
                    if (targetColIdx >= 0 && targetColIdx < FIXED_EXCEL_COLUMNS.length) {
                        const targetColId = FIXED_EXCEL_COLUMNS[targetColIdx].id;
                        if (!['total_18kmh', 'highest_velocity'].includes(targetColId)) {
                            newData[targetOriginalIdx].metrics[targetColId] = val.replace(',', '.').trim();
                        }
                    }
                });
            }
        });
        setData('players_data', newData);
    };

    // -- GROUPING LOGIC --
    const { groupedPlayers, visiblePlayers, benchedPlayers, playingPlayers } = useMemo(() => {
        const playersWithIndex = data.players_data.map((p, i) => ({ ...p, originalIndex: i, is_playing: p.is_playing !== false }));
        const playing = playersWithIndex.filter(p => p.is_playing);
        const benched = playersWithIndex.filter(p => !p.is_playing);

        const groups = { CB: [], FB: [], MF: [], WF: [], FW: [], OTHER: [] };
        playing.forEach(p => {
            const pos = p.position ? p.position.toUpperCase() : 'OTHER';
            if (groups[pos]) groups[pos].push(p); else groups['OTHER'].push(p);
        });

        const visible = [...groups.CB, ...groups.FB, ...groups.MF, ...groups.WF, ...groups.FW, ...groups.OTHER, ...benched];
        return { groupedPlayers: groups, visiblePlayers: visible, benchedPlayers: benched, playingPlayers: playing };
    }, [data.players_data]);

    // Bundle semua actions agar mudah dikirim ke Partial Components
    const actions = {
        handleDragStart, handleDragEnter, handleDragEnd, togglePlayerSelection, 
        togglePlayStatus, clearRow, clearColumn, toggleSelectAll, 
        getAutoCalculatedValue, calculatePercentage, handleChange, handleLocalPaste
    };

    return (
        <div className="w-full space-y-3 mb-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-500 tracking-tight">Data Metrik Latihan (Training)</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        {playingPlayers.length} Main | {benchedPlayers.length} Bench
                    </span>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
                <div className="overflow-x-auto relative [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-zinc-50 dark:[&::-webkit-scrollbar-track]:bg-zinc-950 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full pb-1">
                    <table className="w-max min-w-full text-left whitespace-nowrap text-[10px] border-collapse tabular-nums">
                        
                        <TrainingTableHeader data={data} actions={actions} />

                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                            {/* 1. RENDER PEMAIN INTI (BERDASARKAN POSISI) */}
                            {['CB', 'FB', 'MF', 'WF', 'FW', 'OTHER'].map(pos => {
                                const groupPlayers = groupedPlayers[pos];
                                if (!groupPlayers || groupPlayers.length === 0) return null;

                                return (
                                    <React.Fragment key={`group-${pos}`}>
                                        {groupPlayers.map(player => {
                                            const visibleIdx = visiblePlayers.findIndex(vp => vp.originalIndex === player.originalIndex);
                                            return <TrainingPlayerRow key={player.player_id} player={player} visibleIdx={visibleIdx} isBenched={false} actions={actions} />
                                        })}
                                        {/* Baris Rata-rata per Posisi */}
                                        <TrainingAverageRow title={`AVG ${pos}`} groupPlayers={groupPlayers} isTeamAverage={false} actions={actions} />
                                    </React.Fragment>
                                );
                            })}

                            {/* 2. RENDER PEMAIN TIDAK MAIN (BENCH) */}
                            {benchedPlayers.length > 0 && (
                                <>
                                    <tr>
                                        <td colSpan="6" style={STICKY_COLS.superHeader} className="p-3 sticky z-20 bg-zinc-100 dark:bg-zinc-900 bg-clip-padding border-y border-zinc-200 dark:border-zinc-800"></td>
                                        <td colSpan={FIXED_EXCEL_COLUMNS.length * 2} className="p-3 bg-zinc-100 dark:bg-zinc-900 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-y border-zinc-200 dark:border-zinc-800">
                                            Pemain Tidak Latihan / Absen
                                        </td>
                                    </tr>
                                    {benchedPlayers.map(player => {
                                        const visibleIdx = visiblePlayers.findIndex(vp => vp.originalIndex === player.originalIndex);
                                        return <TrainingPlayerRow key={player.player_id} player={player} visibleIdx={visibleIdx} isBenched={true} actions={actions} />
                                    })}
                                </>
                            )}
                        </tbody>

                        {/* 3. RATA-RATA KESELURUHAN TIM */}
                        <tfoot className="bg-zinc-50 dark:bg-zinc-900/80 border-t-2 border-zinc-200 dark:border-zinc-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                            <TrainingAverageRow title="Team Average" groupPlayers={playingPlayers} isTeamAverage={true} actions={actions} />
                        </tfoot>

                    </table>
                </div>
            </div>
        </div>
    );
}

// ==============================================================================
// 3. SUB-COMPONENTS (PARTIALS) - Dipecah agar kode rapi
// ==============================================================================

// --- PARTIAL: HEADER TABEL ---
const TrainingTableHeader = ({ data, actions }) => {
    return (
        <thead className="bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm">
            {/* Header Jarak Jauh (Visual Pembatas Distance) - Optional, sesuai desain lama */}
            <tr>
                <th colSpan="6" style={STICKY_COLS.superHeader} className="p-2 border-b border-zinc-200 dark:border-zinc-800 sticky z-40 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding align-bottom">
                    <div className="flex font-black text-zinc-400 dark:text-zinc-600 mb-1 ml-1 text-[10px] tracking-widest uppercase">Pemain</div>
                </th>
                <th colSpan="5" className="p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"></th>
                <th colSpan="6" className="p-2 border-b-2 border-zinc-400 dark:border-zinc-600 text-center font-black tracking-[0.2em] uppercase text-zinc-800 dark:text-zinc-200 bg-zinc-100/80 dark:bg-zinc-800/50">
                    Distance (m)
                </th>
                <th colSpan="11" className="p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"></th>
            </tr>
            
            <tr className="border-b-2 border-zinc-200 dark:border-zinc-800">
                <th style={STICKY_COLS.c1} className="p-2 sticky z-30 bg-zinc-50 dark:bg-zinc-950 text-center bg-clip-padding" title="Pilih semua">
                    <button type="button" onClick={() => actions.toggleSelectAll('selected')} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors outline-none">
                        {data.players_data.every(p => p.selected) ? <CheckSquare size={14} strokeWidth={2.5} /> : <Square size={14} strokeWidth={2.5} />}
                    </button>
                </th>
                <th style={STICKY_COLS.c2} className="p-2 sticky z-30 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding text-center" title="Geser & Status Main"><Activity size={14} className="text-zinc-400 mx-auto" /></th> 
                <th style={STICKY_COLS.c3} className="p-2 font-black text-zinc-500 uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding">NO</th>
                <th style={STICKY_COLS.c4} className="p-2 font-black text-zinc-500 uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding">POS</th>
                <th style={STICKY_COLS.c5} className="p-2 font-black text-zinc-500 uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-zinc-950 bg-clip-padding">NP</th>
                <th style={STICKY_COLS.c6} className="p-2 font-black text-zinc-500 uppercase tracking-wider sticky z-30 bg-zinc-50 dark:bg-zinc-950 shadow-[4px_0_12px_rgba(0,0,0,0.03)] bg-clip-padding border-r border-zinc-200 dark:border-zinc-800">NAMA PEMAIN</th>
                
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
                                        <button type="button" onClick={() => actions.toggleSelectAll(isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl')} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors shrink-0" title={`Pilih semua untuk perhitungan Average ${col.label}`}>
                                            {data.players_data.every(p => p[isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl']) ? <CheckSquare size={12} strokeWidth={2.5}/> : <Square size={12} strokeWidth={2.5}/>}
                                        </button>
                                    )}
                                    
                                    <span className="truncate">{col.label}</span>
                                    
                                    {!isAuto && (
                                        <button type="button" onClick={() => actions.clearColumn(col.id, col.label)} className="text-zinc-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover/header:opacity-100" title={`Kosongkan kolom ${col.label}`}>
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
    );
}

// --- PARTIAL: BARIS PEMAIN ---
const TrainingPlayerRow = ({ player, visibleIdx, isBenched, actions }) => {
    const rowStyle = `bg-white dark:bg-zinc-950 transition-colors duration-200 ${isBenched ? 'opacity-60 hover:opacity-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/60' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900 group-hover:bg-zinc-200 dark:group-hover:bg-black'}`;

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
                <button type="button" onClick={() => actions.togglePlayerSelection(player.originalIndex, 'selected')} className={`${player.selected ? 'text-zinc-900 dark:text-white' : 'text-zinc-300 dark:text-zinc-700'} hover:scale-110 transition-transform outline-none`}>
                    {player.selected ? <CheckSquare size={14} strokeWidth={2.5} /> : <Square size={14} strokeWidth={2.5} />}
                </button>
            </td>
            <td style={STICKY_COLS.c2} className={`p-1 sticky z-20 bg-clip-padding ${rowStyle}`}>
                <div className="flex items-center justify-center gap-1.5 w-full">
                    <div className="cursor-grab active:cursor-grabbing hover:text-zinc-600 transition-colors" title="Geser (Hanya Posisi Sama)">
                        <GripVertical size={14} className="text-zinc-300 dark:text-zinc-700" />
                    </div>
                    <button type="button" onClick={() => actions.togglePlayStatus(player.originalIndex)} className="outline-none hover:scale-110 transition-transform" title={isBenched ? "Set Latihan" : "Set Absen"}>
                        {isBenched ? <MinusCircle size={14} className="text-red-500" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
                    </button>
                </div>
            </td>
            <td style={STICKY_COLS.c3} className={`p-2 font-bold text-zinc-400 dark:text-zinc-600 sticky z-20 bg-clip-padding ${rowStyle}`}>{player.originalIndex + 1}</td>
            <td style={STICKY_COLS.c4} className={`p-2 sticky z-20 bg-clip-padding ${rowStyle}`}>
                <span className={`px-1.5 py-0.5 rounded-md border text-[9px] font-black tracking-wider ${isBenched ? 'border-zinc-200 text-zinc-400 bg-zinc-100' : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 bg-zinc-100/50 dark:bg-zinc-900'}`}>{player.position}</span>
            </td>
            <td style={STICKY_COLS.c5} className={`p-2 font-mono font-bold text-[11px] text-zinc-500 sticky z-20 bg-clip-padding ${rowStyle}`}>{String(player.position_number).padStart(2, '0')}</td>
            <td style={STICKY_COLS.c6} className={`p-2 font-bold ${isBenched ? 'text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'} sticky z-20 shadow-[4px_0_12px_rgba(0,0,0,0.03)] dark:shadow-[4px_0_12px_rgba(0,0,0,0.3)] bg-clip-padding ${rowStyle} border-r border-zinc-200 dark:border-zinc-800`}>
                <div style={{ width: '164px' }} className="flex items-center justify-between gap-2 group/name overflow-hidden">
                    <span className="truncate flex-1" title={player.name}>{player.name}</span>
                    {!isBenched && (
                        <button type="button" onClick={() => actions.clearRow(player.originalIndex, player.name)} className="text-zinc-300 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover/name:opacity-100">
                            <Eraser size={12} strokeWidth={2.5}/>
                        </button>
                    )}
                </div>
            </td>

            {FIXED_EXCEL_COLUMNS.map(col => {
                const rawValue = actions.getAutoCalculatedValue(player, col.id);
                const percent = actions.calculatePercentage(col.id, rawValue, player.position, player.historical_highest);
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
                                    <button type="button" onClick={() => actions.togglePlayerSelection(player.originalIndex, isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl')} className={`${player[isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl'] ? 'text-zinc-900 dark:text-zinc-300' : 'text-zinc-200 dark:text-zinc-800 hover:text-zinc-400'} outline-none shrink-0 transition-colors`}>
                                        {player[isHR4 ? 'selected_hr4' : isHR5 ? 'selected_hr5' : 'selected_pl'] ? <CheckSquare size={12} strokeWidth={2.5}/> : <Square size={12} strokeWidth={2.5}/>}
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
        </tr>
    );
}

// --- PARTIAL: BARIS AVERAGE (Rata-rata) ---
const TrainingAverageRow = ({ title, groupPlayers, isTeamAverage, actions }) => {
    const bgClass = isTeamAverage ? 'bg-zinc-50 dark:bg-zinc-950 bg-clip-padding' : 'bg-emerald-50/90 dark:bg-emerald-950/90 bg-clip-padding';
    const borderClass = isTeamAverage ? 'border-zinc-200 dark:border-zinc-800' : 'border-emerald-200/60 dark:border-emerald-800/60';
    const textClass = isTeamAverage ? 'text-zinc-900 dark:text-zinc-100' : 'text-emerald-700 dark:text-emerald-400';
    
    return (
        <tr className={isTeamAverage ? '' : 'bg-emerald-50/60 dark:bg-emerald-900/20 border-y border-emerald-200/60 dark:border-emerald-800/60'}>
            <td colSpan="5" style={STICKY_COLS.footerSpan} className={`p-2 sticky z-20 ${bgClass}`}></td>
            <td style={STICKY_COLS.c6} className={`p-2.5 font-black text-[10px] uppercase tracking-widest text-right pr-4 sticky z-20 shadow-[4px_0_12px_rgba(0,0,0,0.03)] border-r ${bgClass} ${textClass} ${borderClass}`}>
                {title}
            </td>
            {FIXED_EXCEL_COLUMNS.map(col => {
                const avgValue = calculateLocalAverage(groupPlayers, col.id, actions.getAutoCalculatedValue);
                const hasValue = avgValue !== '-';
                
                let avgPercent = 0;
                if (hasValue && col.hasPercent) {
                    const distanceGroup = ['total_distance', 'dist_per_min', 'hir_18_24_kmh', 'sprint_distance', 'total_18kmh'];
                    const hr4Group = ['hr_band_4_dist', 'hr_band_4_dur'];
                    const hr5Group = ['hr_band_5_dist', 'hr_band_5_dur'];
                    const plGroup = ['player_load'];

                    let targetPlayers = groupPlayers;
                    if (distanceGroup.includes(col.id)) targetPlayers = groupPlayers.filter(p => p.selected);
                    else if (hr4Group.includes(col.id)) targetPlayers = groupPlayers.filter(p => p.selected_hr4);
                    else if (hr5Group.includes(col.id)) targetPlayers = groupPlayers.filter(p => p.selected_hr5);
                    else if (plGroup.includes(col.id)) targetPlayers = groupPlayers.filter(p => p.selected_pl);

                    let sumPct = 0; let countPct = 0;
                    targetPlayers.forEach(p => {
                        const rawVal = actions.getAutoCalculatedValue(p, col.id);
                        if (rawVal !== '' && !isNaN(parseFloat(rawVal))) {
                            const pct = parseFloat(actions.calculatePercentage(col.id, rawVal, p.position, p.historical_highest));
                            if (!isNaN(pct)) { sumPct += pct; countPct++; }
                        }
                    });
                    avgPercent = countPct > 0 ? (sumPct / countPct).toFixed(1) : 0;
                }
                const isDist = checkIsDistanceGroup(col.id);

                const cellTextClass = isTeamAverage ? 'text-zinc-900 dark:text-zinc-100' : 'text-emerald-900 dark:text-emerald-300';
                const cellBorderClass = isTeamAverage ? 'border-zinc-200 dark:border-zinc-800' : 'border-emerald-200/50 dark:border-emerald-800/50';
                const cellBgClass = isDist ? (isTeamAverage ? 'bg-zinc-100/50 dark:bg-zinc-800/30' : 'bg-emerald-100/50 dark:bg-emerald-900/40') : '';

                return (
                    <React.Fragment key={`avg-${col.id}`}>
                        <td className={`p-2 font-bold text-center border-l text-[11px] tabular-nums ${cellTextClass} ${cellBorderClass} ${cellBgClass}`}>
                            {avgValue}
                        </td>
                        {col.hasPercent && (
                            <td className={`p-2 border-l ${cellBorderClass} ${isDist ? (isTeamAverage ? 'bg-zinc-100/80 dark:bg-zinc-800/40' : 'bg-emerald-100/80 dark:bg-emerald-900/50') : ''}`}>
                                {hasValue && (
                                    <div className="flex items-center justify-end gap-2">
                                        <span className={`text-[10px] font-black w-8 text-right tabular-nums ${cellTextClass}`}>{avgPercent}%</span>
                                        <div className={`w-12 h-1.5 rounded-full overflow-hidden ${isTeamAverage ? (isDist ? 'bg-zinc-300 dark:bg-zinc-700' : 'bg-zinc-200 dark:bg-zinc-800') : 'bg-emerald-200 dark:bg-emerald-900/80'}`}>
                                            <div className={`h-full transition-all duration-500 rounded-full ${isTeamAverage ? (isDist ? 'bg-zinc-700 dark:bg-zinc-300' : 'bg-zinc-900 dark:bg-zinc-100') : 'bg-emerald-500 dark:bg-emerald-400'}`} style={{ width: `${Math.min(avgPercent, 100)}%` }}></div>
                                        </div>
                                    </div>
                                )}
                            </td>
                        )}
                    </React.Fragment>
                );
            })}
        </tr>
    );
}