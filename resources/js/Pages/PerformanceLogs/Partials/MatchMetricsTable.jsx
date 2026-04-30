// resources/js/Pages/PerformanceLogs/Partials/MatchMetricsTable.jsx

import React, { useMemo, useRef } from 'react';
import { Users, Plus } from 'lucide-react';
import { MATCH_EXCEL_COLUMNS } from '@/Constants/metrics';
import MatchTableHeader from './MatchTableHeader';
import MatchPlayerRow from './MatchPlayerRow';
import MatchAverageRow from './MatchAverageRow';

export default function MatchMetricsTable({ data, setData, getAutoCalculatedValue, calculatePercentage, handleChange }) {
    
    const dragItem = useRef(); const dragOverItem = useRef();

    const handleDragStart = (e, originalIndex) => { dragItem.current = originalIndex; };
    const handleDragEnter = (e, originalIndex) => { dragOverItem.current = originalIndex; };
    const handleDragEnd = () => {
        if (dragItem.current !== undefined && dragOverItem.current !== undefined && dragItem.current !== dragOverItem.current) {
            const dragIdx = dragItem.current; const overIdx = dragOverItem.current;
            const copyListItems = [...data.players_data];
            const draggedPlayer = copyListItems[dragIdx]; const targetPlayer = copyListItems[overIdx];

            const dragPos = String(draggedPlayer.position || 'OTHER').trim().toUpperCase();
            const targetPos = String(targetPlayer.position || 'OTHER').trim().toUpperCase();
            const isDragPlaying = draggedPlayer.is_playing !== false; 
            const isTargetPlaying = targetPlayer.is_playing !== false;

            if (dragPos === targetPos && isDragPlaying === isTargetPlaying) {
                copyListItems.splice(dragIdx, 1); copyListItems.splice(overIdx, 0, draggedPlayer);
                setData('players_data', copyListItems);
            } else {
                alert(`Gagal: Hanya bisa menggeser sesama posisi ${dragPos}.`);
            }
        }
        dragItem.current = undefined; dragOverItem.current = undefined;
    };

    const togglePlayStatus = (originalIndex) => {
        const newData = [...data.players_data];
        const player = newData[originalIndex];
        
        const hasData = player.metrics && Object.keys(player.metrics).some(k => !['selected', 'selected_hr4', 'selected_hr5', 'selected_pl'].includes(k) && player.metrics[k] !== '');
        const isPlaying = player.is_playing !== undefined ? player.is_playing : hasData;

        if (isPlaying) {
            if (!confirm(`Kembalikan "${player.name}" ke Bench? Data tidak akan dihitung di tabel.`)) return;
            player.is_playing = false;
        } else {
            player.is_playing = true;
        }
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
        if (!confirm(`Kosongkan data kolom "${colName}"?`)) return;
        const newData = data.players_data.map(p => { const newMetrics = { ...p.metrics }; newMetrics[colId] = ''; return { ...p, metrics: newMetrics }; });
        setData('players_data', newData);
    };

    const clearRow = (originalIndex, playerName) => {
        if (!confirm(`Kosongkan data "${playerName}"?`)) return;
        const newData = [...data.players_data];
        const newMetrics = { ...newData[originalIndex].metrics };
        MATCH_EXCEL_COLUMNS.forEach(col => { if (!['total_18kmh', 'highest_velocity'].includes(col.id)) newMetrics[col.id] = ''; });
        newData[originalIndex].metrics = newMetrics;
        setData('players_data', newData);
    };

    const handleLocalPaste = (e, visibleIndex, colId) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text');
        if (!pasteData) return;
        
        const rows = pasteData.split(/\r?\n/).map(r => r.split('\t'));
        let newData = [...data.players_data];
        const startColIdx = MATCH_EXCEL_COLUMNS.findIndex(c => c.id === colId);
        
        rows.forEach((row, i) => {
            if (row.length === 1 && row[0] === '') return;
            const targetVisiblePlayer = visiblePlayers[visibleIndex + i]; 
            if (targetVisiblePlayer) {
                const targetOriginalIdx = targetVisiblePlayer.originalIndex;
                const cleanedRow = row.filter(val => !val.includes('%'));
                cleanedRow.forEach((val, j) => {
                    const targetColIdx = startColIdx + j;
                    if (targetColIdx >= 0 && targetColIdx < MATCH_EXCEL_COLUMNS.length) {
                        const targetColId = MATCH_EXCEL_COLUMNS[targetColIdx].id;
                        if (!['total_18kmh', 'highest_velocity'].includes(targetColId)) {
                            newData[targetOriginalIdx].metrics[targetColId] = val.replace(',', '.').trim();
                        }
                    }
                });
            }
        });
        setData('players_data', newData);
    };

    const { groupedPlayers, visiblePlayers, benchedPlayers, playingPlayers } = useMemo(() => {
        const playersWithIndex = data.players_data.map((p, i) => {
            const hasData = p.metrics && Object.keys(p.metrics).some(k => !['selected', 'selected_hr4', 'selected_hr5', 'selected_pl'].includes(k) && p.metrics[k] !== '');
            const isPlaying = p.is_playing !== undefined ? p.is_playing : hasData;
            return { ...p, originalIndex: i, is_playing: isPlaying };
        });

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

    const actions = {
        handleDragStart, handleDragEnter, handleDragEnd, togglePlayerSelection, 
        togglePlayStatus, clearRow, clearColumn, toggleSelectAll, 
        getAutoCalculatedValue, calculatePercentage, handleChange, handleLocalPaste
    };

    return (
        <div className="w-full space-y-3 mb-6 mt-4">
            
            {/* AREA SMART BENCH (Monochrome Premium) */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                        <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                            <Users size={16} className="text-zinc-500 dark:text-zinc-400"/> Skuad Pertandingan (Bench)
                        </h3>
                        <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">Pilih pemain yang tampil (Starter/Sub) untuk ditambahkan ke tabel matriks di bawah.</p>
                    </div>
                    
                    {/* BAGIAN KANAN: Tombol Masukkan Semua & Indikator Bench */}
                    <div className="flex items-center gap-2 shrink-0">
                        {benchedPlayers.length > 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    // Ubah data utama pemain sekaligus (is_playing dan status centang checkbox)
                                    const newData = data.players_data.map(p => {
                                        p.is_playing = true;
                                        p.selected = true;
                                        p.selected_hr4 = true;
                                        p.selected_hr5 = true;
                                        p.selected_pl = true;
                                        if(p.metrics) {
                                            p.metrics.selected = true;
                                            p.metrics.selected_hr4 = true;
                                            p.metrics.selected_hr5 = true;
                                            p.metrics.selected_pl = true;
                                        }
                                        return p;
                                    });
                                    setData('players_data', newData);
                                }}
                                className="px-2.5 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded border border-transparent text-[9px] font-black transition-all shadow-sm outline-none uppercase tracking-widest flex items-center gap-1.5"
                            >
                                <Plus size={12} strokeWidth={3} />
                                Masukkan Semua
                            </button>
                        )}
                        <div className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 uppercase tracking-widest shadow-sm">
                            {benchedPlayers.length} di Bench
                        </div>
                    </div>
                </div>

                {benchedPlayers.length > 0 ? (
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
                        {benchedPlayers.map(player => (
                            <button
                                key={player.player_id}
                                onClick={() => togglePlayStatus(player.originalIndex)}
                                type="button"
                                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-[11px] font-bold transition-all group shadow-sm"
                            >
                                <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">{player.position}</span>
                                <span className="text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">{player.name}</span>
                                <Plus size={12} className="text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors ml-0.5" strokeWidth={3}/>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
                        Semua pemain telah masuk skuad aktif.
                    </div>
                )}
            </div>

            {/* TABEL MATCH METRICS */}
            <div className="flex items-center justify-between px-1 mt-6 mb-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 tracking-tight uppercase">Metrik Pertandingan (Match)</h3>
                    <span className="px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-[9px] font-bold text-zinc-600 dark:text-zinc-400">
                        {playingPlayers.length} Main
                    </span>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
                <div className="overflow-x-auto relative [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-zinc-50 dark:[&::-webkit-scrollbar-track]:bg-[#111113] [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full pb-1">
                    <table className="w-max min-w-full text-left whitespace-nowrap text-[10px] border-collapse tabular-nums">
                        
                        <MatchTableHeader data={data} actions={actions} />

                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-[#0a0a0a]">
                            {['CB', 'FB', 'MF', 'WF', 'FW', 'OTHER'].map(pos => {
                                const groupPlayers = groupedPlayers[pos];
                                if (!groupPlayers || groupPlayers.length === 0) return null;
                                return (
                                    <React.Fragment key={`group-${pos}`}>
                                        {groupPlayers.map(player => {
                                            const visibleIdx = visiblePlayers.findIndex(vp => vp.originalIndex === player.originalIndex);
                                            return <MatchPlayerRow key={player.player_id} player={player} visibleIdx={visibleIdx} isBenched={false} actions={actions} />
                                        })}
                                        <MatchAverageRow title={`AVG ${pos}`} groupPlayers={groupPlayers} isTeamAverage={false} actions={actions} />
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                        
                        {/* FOOTER: Team Average */}
                        <tfoot className="bg-zinc-50 dark:bg-[#111113] border-t-2 border-zinc-200 dark:border-zinc-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                            <MatchAverageRow title="Team Average" groupPlayers={playingPlayers} isTeamAverage={true} actions={actions} />
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}