// resources/js/Pages/PerformanceLogs/Show.jsx

import React, { useMemo, useState, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { ArrowLeft, Save, Loader2, Download, FileSpreadsheet, Trash2, Database, LineChart } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FIXED_EXCEL_COLUMNS, MATCH_EXCEL_COLUMNS } from '@/Constants/metrics';

import InputDataTab from './Partials/InputDataTab';
import AnalysisTab from './Partials/AnalysisTab';

export default function PerformanceLogShow({ auth, log, club, players, existing_metrics, team_benchmarks = [], player_benchmarks = [] }) {
    
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTab = localStorage.getItem(`performance_log_tab_${log.id}`);
            return savedTab ? savedTab : 'input';
        }
        return 'input';
    });

    useEffect(() => {
        localStorage.setItem(`performance_log_tab_${log.id}`, activeTab);
    }, [activeTab, log.id]);

    const activeColumns = log.type === 'match' ? MATCH_EXCEL_COLUMNS : FIXED_EXCEL_COLUMNS;
    
    const sortedPlayersData = useMemo(() => {
        let mappedData = players.map(player => {
            const existing = existing_metrics[player.id];
            let metricsData = {};
            
            activeColumns.forEach(col => { metricsData[col.id] = existing?.metrics?.[col.id] || ''; });
            
            metricsData['selected'] = existing?.metrics?.selected ?? true;
            metricsData['selected_hr4'] = existing?.metrics?.selected_hr4 ?? true;
            metricsData['selected_hr5'] = existing?.metrics?.selected_hr5 ?? true;
            metricsData['selected_pl'] = existing?.metrics?.selected_pl ?? true;

            return {
                player_id: player.id,
                position_number: player.position_number,
                name: player.name,
                position: player.position,
                historical_highest: player.highest_metrics || {}, 
                metrics: metricsData,
                sort_order: existing?.sort_order ?? null,
                is_playing: existing ? true : false,
            };
        });

        mappedData.sort((a, b) => {
            if (a.sort_order !== null && b.sort_order !== null) return a.sort_order - b.sort_order;
            const posOrder = { 'CB': 1, 'FB': 2, 'MF': 3, 'WF': 4, 'FW': 5 };
            if (posOrder[a.position] !== posOrder[b.position]) return posOrder[a.position] - posOrder[b.position];
            return a.name.localeCompare(b.name);
        });

        return mappedData;
    }, [players, existing_metrics, activeColumns]);

    const { data, setData, post, processing, errors } = useForm({
        title: log.title || '',
        benchmark_id: log.benchmark_id || '',
        player_benchmark_id: log.player_benchmark_id || '',
        players_data: sortedPlayersData,
        custom_charts: log.custom_charts || [],
    });

    const calculateTeamPercentage = (colId, rawValue, position = null, playerHighest = null) => {
        if (!rawValue || isNaN(rawValue) || rawValue === '') return 0;
        const numValue = parseFloat(rawValue);

        if (colId === 'max_velocity' || colId === 'highest_velocity') {
            let targetHighest = parseFloat(playerHighest?.highest_velocity) || parseFloat(playerHighest?.max_velocity) || 0;
            if (targetHighest === 0) targetHighest = 100;
            return ((numValue / targetHighest) * 100).toFixed(1);
        }
        
        let targetValue = 100;
        const activeTeamBenchmark = team_benchmarks.find(b => b.id === parseInt(data.benchmark_id));
        
        if (activeTeamBenchmark?.metrics?.[colId]) {
             if (position && activeTeamBenchmark.metrics[colId][position]) {
                 targetValue = activeTeamBenchmark.metrics[colId][position]; 
             } else if (typeof activeTeamBenchmark.metrics[colId] === 'number' || typeof activeTeamBenchmark.metrics[colId] === 'string') {
                 targetValue = parseFloat(activeTeamBenchmark.metrics[colId]); 
             } else if (!position) {
                 const vals = Object.values(activeTeamBenchmark.metrics[colId]);
                 targetValue = vals.reduce((a,b)=>parseFloat(a)+parseFloat(b),0) / vals.length || 100;
             }
        }
        return ((numValue / Math.max(targetValue, 0.01)) * 100).toFixed(1);
    };

    const calculatePlayerPercentage = (colId, rawValue, position, historicalHighest, playerId) => {
        if (!rawValue || rawValue === '-' || isNaN(rawValue)) return 0;
        const numValue = parseFloat(rawValue);
    
        if (colId === 'max_velocity' || colId === 'highest_velocity') {
            let maxTarget = parseFloat(historicalHighest?.highest_velocity) || parseFloat(historicalHighest?.max_velocity) || 0;
            return ((numValue / Math.max(maxTarget || 100, 0.01)) * 100).toFixed(1);
        }
    
        let targetValue = 100;
        const activePlayerBenchmark = player_benchmarks.find(b => b.id === parseInt(data.player_benchmark_id));

        if (activePlayerBenchmark?.metrics?.[playerId]?.[colId]) {
            targetValue = parseFloat(activePlayerBenchmark.metrics[playerId][colId]);
        } else {
            return 0; 
        }
        return ((numValue / Math.max(targetValue, 0.01)) * 100).toFixed(1);
    };

    const getAutoCalculatedValue = (player, colId) => {
        if (colId === 'total_18kmh') {
            const hir = parseFloat(player.metrics?.hir_18_24_kmh) || 0;
            const sprint = parseFloat(player.metrics?.sprint_distance) || 0;
            const total = hir + sprint;
            if (total === 0) return '-';
            return Number.isInteger(total) ? total.toString() : total.toFixed(1);
        }
        if (colId === 'highest_velocity') {
            const currentMax = parseFloat(player.metrics?.max_velocity) || 0;
            const historicalMax = parseFloat(player.historical_highest?.highest_velocity) || parseFloat(player.historical_highest?.max_velocity) || 0;
            const max = Math.max(currentMax, historicalMax);
            return max > 0 ? max.toFixed(2) : '-';
        }
        return player.metrics?.[colId] ?? '';
    };

    const handleCheckboxChange = (rowIndex, field, value) => {
        let newData = [...data.players_data];
        newData[rowIndex] = {
            ...newData[rowIndex],
            [field]: value, // Update di root untuk merespon UI
            metrics: {
                ...newData[rowIndex].metrics,
                [field]: value // Masukkan ke metrics agar tersimpan ke DB
            }
        };
        setData('players_data', newData);
    };

    const handlePaste = (e, rowIndex, colId) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text');
        if (!pasteData) return;
        
        const rows = pasteData.split(/\r?\n/).map(r => r.split('\t'));
        let newData = [...data.players_data];
        const startColIdx = FIXED_EXCEL_COLUMNS.findIndex(c => c.id === colId);
        
        rows.forEach((row, i) => {
            if (row.length === 1 && row[0] === '') return;
            const targetRowIdx = rowIndex + i;
            
            if (newData[targetRowIdx]) {
                const cleanedRow = row.filter(val => !val.includes('%'));
                cleanedRow.forEach((val, j) => {
                    const targetColIdx = startColIdx + j;
                    if (targetColIdx >= 0 && targetColIdx < FIXED_EXCEL_COLUMNS.length) {
                        const targetColId = FIXED_EXCEL_COLUMNS[targetColIdx].id;
                        const isAutoCalculated = ['hir_19_8_kmh', 'total_18kmh', 'highest_velocity'].includes(targetColId);
                        if (!isAutoCalculated) {
                            newData[targetRowIdx].metrics[targetColId] = val.replace(',', '.').trim();
                        }
                    }
                });
            }
        });
        setData('players_data', newData);
    };

    const handleChange = (rowIndex, colId, value) => {
        if (['hir_19_8_kmh', 'total_18kmh', 'highest_velocity'].includes(colId)) return;
        let newData = [...data.players_data];
        newData[rowIndex] = { ...newData[rowIndex], metrics: { ...newData[rowIndex].metrics, [colId]: value } };
        setData('players_data', newData);
    };

    const clearAll = () => {
        if (!confirm('Yakin ingin mengosongkan SELURUH data metrik di tabel ini?')) return;
        const newData = data.players_data.map(p => {
            const newMetrics = { ...p.metrics };
            activeColumns.forEach(col => {
                if (!['total_18kmh', 'highest_velocity'].includes(col.id)) newMetrics[col.id] = '';
            });
            return { ...p, metrics: newMetrics };
        });
        setData('players_data', newData);
    };

    const submit = (e) => {
        e.preventDefault();
        const activePlayersOnly = data.players_data.filter(p => p.is_playing !== false);

        if(!data.player_benchmark_id) {
            alert("Harap pilih Player Benchmark (Acuan Target Personal) terlebih dahulu!");
            return;
        }

        const finalizedData = activePlayersOnly.map((player, index) => {
            const finalMetrics = { ...player.metrics };
            
            // --- PERBAIKAN: PAKSA CHECKBOX MASUK KE PAYLOAD JSON ---
            finalMetrics['selected'] = player.selected ?? player.metrics?.selected ?? true;
            finalMetrics['selected_hr4'] = player.selected_hr4 ?? player.metrics?.selected_hr4 ?? true;
            finalMetrics['selected_hr5'] = player.selected_hr5 ?? player.metrics?.selected_hr5 ?? true;
            finalMetrics['selected_pl'] = player.selected_pl ?? player.metrics?.selected_pl ?? true;

            // --- ---
            finalMetrics['total_18kmh'] = getAutoCalculatedValue(player, 'total_18kmh');
            finalMetrics['highest_velocity'] = getAutoCalculatedValue(player, 'highest_velocity');
            
            return { 
                player_id: player.player_id, 
                metrics: finalMetrics, 
                sort_order: index 
            };
        });

        router.post(route('performance-logs.metrics.updateBulk', log.id), {
            title: data.title,
            benchmark_id: data.benchmark_id,
            player_benchmark_id: data.player_benchmark_id,
            players_data: finalizedData,
            custom_charts: data.custom_charts, 
        }, { preserveScroll: true });
    };

    const formattedDate = new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const displayTitle = log.title || `Session ${log.id}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`${displayTitle} - ${formattedDate}`} />

            <div className="w-full pb-12 space-y-6 relative">
                
                {/* --- HEADER NAV & TABS --- */}
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                    {activeTab === 'input' ? (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                            <Link href={route('performance-logs.index')} className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 tracking-wide group">
                                <ArrowLeft size={14} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" /> 
                                Kembali ke Timeline
                            </Link>
                            <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                                Update {displayTitle}
                            </h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                {formattedDate} — Edit metrik, sesuaikan acuan benchmark, dan pantau rekor pemain.
                            </p>
                        </div>
                    ) : (
                        <div>
                            <Link href={route('performance-logs.index')} className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors tracking-wide group">
                                <ArrowLeft size={14} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" /> 
                                Kembali
                            </Link>
                        </div>
                    )}

                    {/* Tab Segmented Control */}
                    <div className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900/50 p-1 w-full xl:w-auto border border-zinc-200 dark:border-zinc-800">
                        <button
                            onClick={() => setActiveTab('input')}
                            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-medium transition-all flex-1 xl:flex-none gap-2
                            ${activeTab === 'input' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'}`}
                        >
                            <Database size={16} /> Data Metrik
                        </button>
                        <button
                            onClick={() => setActiveTab('analysis')}
                            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-medium transition-all flex-1 xl:flex-none gap-2
                            ${activeTab === 'analysis' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'}`}
                        >
                            <LineChart size={16} /> Analisis Tim
                        </button>
                    </div>
                </div>

                {/* --- KONTEN TAB --- */}
                {activeTab === 'input' && (
                    <form onSubmit={submit} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="min-h-[400px]">
                            <InputDataTab 
                                log={log} data={data} setData={setData} errors={errors}
                                team_benchmarks={team_benchmarks} player_benchmarks={player_benchmarks}
                                getAutoCalculatedValue={getAutoCalculatedValue}
                                calculateTeamPercentage={calculateTeamPercentage} calculatePlayerPercentage={calculatePlayerPercentage}
                                handleChange={handleChange}
                            />
                        </div>

                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-zinc-200 dark:border-zinc-800">
                            <div className="flex w-full md:w-auto gap-3">
                                <a href={route('performance-logs.export.pdf', log.id)} target="_blank" className="flex-1 md:flex-none px-5 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                    <Download size={14} strokeWidth={2.5} /> PDF
                                </a>
                                <a href={route('performance-logs.export.excel', log.id)} className="flex-1 md:flex-none px-5 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                    <FileSpreadsheet size={14} strokeWidth={2.5} /> Excel
                                </a>
                            </div>

                            <div className="flex w-full md:w-auto items-center gap-3">
                                {processing && <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 animate-pulse uppercase tracking-widest hidden md:inline-block mr-2">Menyimpan...</span>}
                                <button type="button" onClick={clearAll} className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900 shadow-sm">
                                    <Trash2 size={16} strokeWidth={2.5} />
                                    <span className="hidden sm:inline">Kosongkan</span>
                                </button>
                                <button type="submit" disabled={processing} className="w-full sm:w-auto px-8 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50">
                                    {processing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} strokeWidth={2.5} />}
                                    Simpan Data
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {activeTab === 'analysis' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
                        <AnalysisTab log={log} data={data} setData={setData} calculateTeamPercentage={calculateTeamPercentage} calculatePlayerPercentage={calculatePlayerPercentage} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}