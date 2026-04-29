// resources/js/Pages/PerformanceLogs/Partials/TrainingMetricsTable.jsx

import React, { useMemo, useRef, useState } from 'react';
import { Activity, Users, Plus } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';

// Import Partials
import TrainingTableHeader from './TrainingTableHeader';
import TrainingPlayerRow from './TrainingPlayerRow';
import TrainingAverageRow from './TrainingAverageRow';

export default function TrainingMetricsTable({ data, setData, getAutoCalculatedValue, calculatePercentage, handleChange }) {
    
    const dragItem = useRef();
    const dragOverItem = useRef();

    // -- SMART BENCH LOGIC --
    const [benchState, setBenchState] = useState(() => {
        return data.players_data.map(p => {
            if (!p.metrics) return false;
            const hasData = Object.keys(p.metrics).some(key => 
                !['selected', 'selected_hr4', 'selected_hr5', 'selected_pl'].includes(key) && 
                p.metrics[key] !== '' && p.metrics[key] !== null
            );
            return hasData;
        });
    });

    const activePlayersWithIndex = useMemo(() => {
        return data.players_data
            .map((p, i) => ({ ...p, originalIndex: i }))
            .filter((_, i) => benchState[i]);
    }, [data.players_data, benchState]);

    const benchedPlayersList = useMemo(() => {
        return data.players_data
            .map((p, i) => ({ ...p, originalIndex: i }))
            .filter((_, i) => !benchState[i]);
    }, [data.players_data, benchState]);

    const movePlayerToTable = (originalIndex) => {
        setBenchState(prev => {
            const newState = [...prev];
            newState[originalIndex] = true;
            return newState;
        });
        const newData = [...data.players_data];
        newData[originalIndex].is_playing = true;
        // Default checkboxes ke true
        if (newData[originalIndex].selected === undefined) {
            newData[originalIndex].selected = true;
            newData[originalIndex].selected_hr4 = true;
            newData[originalIndex].selected_hr5 = true;
            newData[originalIndex].selected_pl = true;
            if (newData[originalIndex].metrics) {
                newData[originalIndex].metrics.selected = true;
                newData[originalIndex].metrics.selected_hr4 = true;
                newData[originalIndex].metrics.selected_hr5 = true;
                newData[originalIndex].metrics.selected_pl = true;
            }
        }
        setData('players_data', newData);
    };

    const movePlayerToBench = (originalIndex, playerName) => {
        if (!confirm(`Kembalikan "${playerName}" ke bench? Data metriknya tidak akan dihitung di tabel.`)) return;
        setBenchState(prev => {
            const newState = [...prev];
            newState[originalIndex] = false;
            return newState;
        });
        
        const newData = [...data.players_data];
        newData[originalIndex].is_playing = false;
        setData('players_data', newData);
    };

    // -- STATE ACTIONS & LOGIC --
    const handleDragStart = (e, originalIndex) => { dragItem.current = originalIndex; };
    const handleDragEnter = (e, originalIndex) => { dragOverItem.current = originalIndex; };
    
    const handleDragEnd = () => {
        if (dragItem.current !== undefined && dragOverItem.current !== undefined && dragItem.current !== dragOverItem.current) {
            const dragIdx = dragItem.current;
            const overIdx = dragOverItem.current;
            
            const copyListItems = [...data.players_data];
            const copyBenchState = [...benchState];

            const draggedPlayer = copyListItems[dragIdx];
            const targetPlayer = copyListItems[overIdx];
            const draggedBenchState = copyBenchState[dragIdx];

            const dragPos = String(draggedPlayer.position || 'OTHER').trim().toUpperCase();
            const targetPos = String(targetPlayer.position || 'OTHER').trim().toUpperCase();
            const isDragPlaying = draggedPlayer.is_playing !== false; 
            const isTargetPlaying = targetPlayer.is_playing !== false;

            if (dragPos === targetPos && isDragPlaying === isTargetPlaying) {
                copyListItems.splice(dragIdx, 1);
                copyListItems.splice(overIdx, 0, draggedPlayer);
                
                copyBenchState.splice(dragIdx, 1);
                copyBenchState.splice(overIdx, 0, draggedBenchState);

                setData('players_data', copyListItems);
                setBenchState(copyBenchState);
            } else {
                let statusMsg = isDragPlaying ? "Tim Utama" : "Cadangan";
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
        const allSelected = activePlayersWithIndex.every(p => p[type] !== false);
        const newData = [...data.players_data];
        activePlayersWithIndex.forEach(p => {
            newData[p.originalIndex][type] = !allSelected; 
            if (newData[p.originalIndex].metrics) {
                newData[p.originalIndex].metrics[type] = !allSelected; 
            }
        });
        setData('players_data', newData);
    };

    const togglePlayerSelection = (originalIndex, type = 'selected') => {
        const newData = [...data.players_data];
        const currentVal = newData[originalIndex][type] !== false; // if undefined consider true
        newData[originalIndex][type] = !currentVal;
        if (newData[originalIndex].metrics) {
            newData[originalIndex].metrics[type] = !currentVal;
        }
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

    // -- GROUPING LOGIC (HANYA UNTUK ACTIVE PLAYERS) --
    const { groupedPlayers, visiblePlayers, absentPlayers, playingPlayers } = useMemo(() => {
        const playing = activePlayersWithIndex.filter(p => p.is_playing !== false);
        const absent = activePlayersWithIndex.filter(p => p.is_playing === false);

        const groups = { CB: [], FB: [], MF: [], WF: [], FW: [], OTHER: [] };
        playing.forEach(p => {
            const pos = p.position ? p.position.toUpperCase() : 'OTHER';
            if (groups[pos]) groups[pos].push(p); else groups['OTHER'].push(p);
        });

        const visible = [...groups.CB, ...groups.FB, ...groups.MF, ...groups.WF, ...groups.FW, ...groups.OTHER, ...absent];
        return { groupedPlayers: groups, visiblePlayers: visible, absentPlayers: absent, playingPlayers: playing };
    }, [activePlayersWithIndex]);

    const actions = {
        handleDragStart, handleDragEnter, handleDragEnd, togglePlayerSelection, 
        togglePlayStatus, clearRow, clearColumn, toggleSelectAll, 
        getAutoCalculatedValue, calculatePercentage, handleChange, handleLocalPaste, movePlayerToBench
    };

    return (
        <div className="w-full space-y-3 mb-6 mt-4">
            {/* AREA BENCH - Monochrome Premium */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                            <Users size={16} className="text-zinc-500 dark:text-zinc-400"/> Skuad Tersedia (Bench)
                        </h3>
                        <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">Klik pemain yang berpartisipasi dalam sesi ini untuk ditambahkan ke tabel matriks di bawah.</p>
                    </div>
                    <div className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 uppercase tracking-widest shadow-sm">
                        {benchedPlayersList.length} di Bench
                    </div>
                </div>

                {benchedPlayersList.length > 0 ? (
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
                        {benchedPlayersList.map(player => (
                            <button
                                key={player.player_id}
                                onClick={() => movePlayerToTable(player.originalIndex)}
                                type="button"
                                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-[11px] font-bold transition-all group shadow-sm"
                            >
                                <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">{player.position}</span>
                                <span className="text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                                    {player.name}
                                </span>
                                <Plus size={12} className="text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors ml-0.5" strokeWidth={3}/>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
                        Semua pemain skuad sudah dimasukkan ke tabel aktif.
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between px-1 mt-6 mb-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 tracking-tight uppercase">Data Metrik Latihan (Training)</h3>
                    <span className="px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-[9px] font-bold text-zinc-600 dark:text-zinc-400">
                        {playingPlayers.length} Latihan | {absentPlayers.length} Absen
                    </span>
                </div>
            </div>

            {/* TABEL METRIK */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
                <div className="overflow-x-auto relative [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-zinc-50 dark:[&::-webkit-scrollbar-track]:bg-[#111113] [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full pb-1">
                    <table className="w-max min-w-full text-left whitespace-nowrap text-[10px] border-collapse tabular-nums">
                        
                        <TrainingTableHeader data={{ players_data: activePlayersWithIndex }} actions={actions} />

                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-[#0a0a0a]">
                            {activePlayersWithIndex.length === 0 ? (
                                <tr>
                                    <td colSpan="100%" className="p-10 text-center bg-zinc-50 dark:bg-[#0a0a0a]">
                                        <Activity size={24} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
                                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Belum ada pemain di tabel</h4>
                                        <p className="text-[10px] font-semibold text-zinc-500 mt-1">Silakan pilih pemain dari Skuad Tersedia di atas.</p>
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {/* 1. PEMAIN INTI */}
                                    {['CB', 'FB', 'MF', 'WF', 'FW', 'OTHER'].map(pos => {
                                        const groupPlayers = groupedPlayers[pos];
                                        if (!groupPlayers || groupPlayers.length === 0) return null;

                                        return (
                                            <React.Fragment key={`group-${pos}`}>
                                                {groupPlayers.map(player => {
                                                    const visibleIdx = visiblePlayers.findIndex(vp => vp.originalIndex === player.originalIndex);
                                                    return <TrainingPlayerRow key={player.player_id} player={player} visibleIdx={visibleIdx} isAbsent={false} actions={actions} />
                                                })}
                                                <TrainingAverageRow title={`AVG ${pos}`} groupPlayers={groupPlayers} isTeamAverage={false} actions={actions} />
                                            </React.Fragment>
                                        );
                                    })}

                                    {/* 2. RATA-RATA TIM */}
                                    {playingPlayers.length > 0 && (
                                        <>
                                            <tr><td colSpan="100%" className="h-[2px] bg-zinc-200/60 dark:bg-zinc-800/60"></td></tr>
                                            <TrainingAverageRow title="Team Average" groupPlayers={playingPlayers} isTeamAverage={true} actions={actions} />
                                            <tr><td colSpan="100%" className="h-2 bg-zinc-50 dark:bg-[#0a0a0a] border-b border-zinc-200 dark:border-zinc-800 shadow-inner"></td></tr>
                                        </>
                                    )}

                                    {/* 3. PEMAIN ABSEN */}
                                    {absentPlayers.length > 0 && (
                                        <>
                                            <tr>
                                                <td colSpan="6" className="p-2 sticky z-20 left-0 bg-zinc-50 dark:bg-[#111113] bg-clip-padding border-y border-zinc-200 dark:border-zinc-800"></td>
                                                <td colSpan="100%" className="p-2 bg-zinc-50 dark:bg-[#111113] text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest border-y border-zinc-200 dark:border-zinc-800">
                                                    Pemain Absen / Tidak Latihan
                                                </td>
                                            </tr>
                                            {absentPlayers.map(player => {
                                                const visibleIdx = visiblePlayers.findIndex(vp => vp.originalIndex === player.originalIndex);
                                                return <TrainingPlayerRow key={player.player_id} player={player} visibleIdx={visibleIdx} isAbsent={true} actions={actions} />
                                            })}
                                        </>
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}