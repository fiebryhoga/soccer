// resources/js/Pages/PerformanceLogs/Show.jsx

import React, { useMemo, useState } from 'react';
import { Head, useForm, Link, router} from '@inertiajs/react';
import { ArrowLeft, Save, Loader2, Download, FileSpreadsheet, Trash2, Target, Edit3, BarChart2 } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import { FIXED_EXCEL_COLUMNS, MATCH_EXCEL_COLUMNS } from '@/Constants/metrics';
import { FIXED_EXCEL_COLUMNS, MATCH_EXCEL_COLUMNS, AVAILABLE_METRICS } from '@/Constants/metrics2';
import ConfigurationHeader from './Partials/ConfigurationHeader';
import TrainingMetricsTable from './Partials/TrainingMetricsTable';
import MatchMetricsTable from './Partials/MatchMetricsTable';
import PlayerTrainingMetricsTable from './Partials/PlayerTrainingMetricsTable'; 
import PlayerMatchMetricsTable from './Partials/PlayerMatchMetricsTable';
import SessionAnalysisTab from './Partials/SessionAnalysisTab'; // Import Tab Baru

export default function PerformanceLogShow({ auth, log, club, players, existing_metrics, team_benchmarks = [], player_benchmarks = [] }) {
    
    // STATE UNTUK TAB NAVIGASI
    const [activeTab, setActiveTab] = useState('input'); // 'input' atau 'analytics'

    const activeColumns = log.type === 'match' ? MATCH_EXCEL_COLUMNS : FIXED_EXCEL_COLUMNS;
    
    // 1. Persiapan Data Pemain
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
                
                selected: existing?.metrics?.selected ?? true,
                selected_hr4: existing?.metrics?.selected_hr4 ?? true,
                selected_hr5: existing?.metrics?.selected_hr5 ?? true,
                selected_pl: existing?.metrics?.selected_pl ?? true,
            };
        });

        mappedData.sort((a, b) => {
            if (a.sort_order !== null && b.sort_order !== null) return a.sort_order - b.sort_order;
            const posOrder = { 'GK': 1, 'CB': 2, 'FB': 3, 'MF': 4, 'WF': 5, 'FW': 6, 'ST': 7 };
            const posA = posOrder[a.position?.toUpperCase()] || 99;
            const posB = posOrder[b.position?.toUpperCase()] || 99;
            if (posA !== posB) return posA - posB;
            return a.name.localeCompare(b.name);
        });

        return mappedData;
    }, [players, existing_metrics, activeColumns]);

    // 2. Inisialisasi Form State
    const { data, setData, post, processing, errors } = useForm({
        title: log.title || '',
        benchmark_id: log.benchmark_id || '',
        player_benchmark_id: log.player_benchmark_id || '', 
        players_data: sortedPlayersData
    });

    // 3. Logika Kalkulasi Angka
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

    // 4. Transformasi Data Form menjadi Format Analitik (Agar bisa langsung dianalisis tanpa perlu reload/simpan)
    // 4. Transformasi Data Form menjadi Format Analitik (Sinkron 100% dengan Tabel)
    const prepareSessionDataForAnalysis = () => {
        const activePlayers = data.players_data.filter(p => p.is_playing !== false);
        
        let teamAvg = {
            total_distance: 0, sprint_distance: 0, max_velocity: 0, player_load: 0
        };

        const playerMetricsForAnalytics = activePlayers.map(p => {
            let finalMetrics = { ...p.metrics };
            
            // Auto-calculate variabel
            finalMetrics['total_18kmh'] = getAutoCalculatedValue(p, 'total_18kmh');
            finalMetrics['highest_velocity'] = getAutoCalculatedValue(p, 'highest_velocity');

            // Parse Historical Highest dengan aman
            let histHighest = {};
            try { 
                histHighest = typeof p.historical_highest === 'string' 
                    ? JSON.parse(p.historical_highest) 
                    : (p.historical_highest || {}); 
            } catch(e) {}

            // =========================================================
            // PERBAIKAN: HITUNG PERSENTASE IDENTIK DENGAN TABEL UI
            // =========================================================
            activeColumns.filter(col => col.hasPercent).forEach(col => {
                const colId = col.id;
                let rawVal = finalMetrics[colId];
                let pctValue = 0;
                
                // Jika pakai Player Benchmark, hitung khusus player. Jika tidak, pakai Team.
                if (data.player_benchmark_id) {
                    pctValue = calculatePlayerPercentage(colId, rawVal, p.position, histHighest, p.player_id);
                } else if (data.benchmark_id) {
                    pctValue = calculateTeamPercentage(colId, rawVal, p.position, histHighest);
                }

                // Injeksi nilai persentase yang sudah matang ke dalam format _percent
                finalMetrics[`${colId}_percent`] = parseFloat(pctValue) || 0;
            });

            // Akumulasi rata-rata tim
            teamAvg.total_distance += parseFloat(finalMetrics.total_distance) || 0;
            teamAvg.sprint_distance += parseFloat(finalMetrics.sprint_distance) || 0;
            teamAvg.max_velocity = Math.max(teamAvg.max_velocity, parseFloat(finalMetrics.max_velocity) || 0); 
            teamAvg.player_load += parseFloat(finalMetrics.player_load) || 0;

            return {
                player: {
                    id: p.player_id,
                    name: p.name,
                    position: p.position,
                    position_number: p.position_number,
                    highest_metrics: histHighest 
                },
                metrics: finalMetrics, 
                
                // Parsing aman dengan parseFloat agar dist_per_min (desimal) tidak gagal
                total_duration: finalMetrics.total_duration || finalMetrics.duration,
                total_distance: parseFloat(finalMetrics.total_distance) || 0,
                dist_per_min: parseFloat(finalMetrics.dist_per_min) || 0,
                sprint_distance: parseFloat(finalMetrics.sprint_distance) || 0,
                hir_18_24_kmh: parseFloat(finalMetrics.hir_18_24_kmh) || 0,
                max_velocity: parseFloat(finalMetrics.max_velocity) || 0,
                accels: parseFloat(finalMetrics.accels) || 0,
                decels: parseFloat(finalMetrics.decels) || 0,
                player_load: parseFloat(finalMetrics.player_load) || 0,
            };
        });

        const count = activePlayers.length || 1;
        teamAvg.total_distance = Math.round(teamAvg.total_distance / count);
        teamAvg.sprint_distance = Math.round(teamAvg.sprint_distance / count);
        teamAvg.player_load = Number((teamAvg.player_load / count).toFixed(1));
        teamAvg.max_velocity = Number(teamAvg.max_velocity.toFixed(2));

        return {
            id: log.id,
            title: data.title || log.title,
            date: log.date,
            tag: log.tag,
            type: log.type,
            teamAverages: teamAvg,
            playerMetrics: playerMetricsForAnalytics
        };
    };

    // 5. Handlers Input
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
        newData[rowIndex] = {
            ...newData[rowIndex],
            metrics: {
                ...newData[rowIndex].metrics,
                [colId]: value
            }
        };
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

    // 6. Submit Form
    const submit = (e) => {
        e.preventDefault();
        
        const activePlayersOnly = data.players_data.filter(p => p.is_playing !== false);

        if(!data.player_benchmark_id) {
            alert("Harap pilih Player Benchmark (Acuan Target Personal) terlebih dahulu!");
            return;
        }

        const finalizedData = activePlayersOnly.map((player, index) => {
            const finalMetrics = { ...player.metrics };
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
        }, {
            preserveScroll: true,
            onSuccess: () => {
                console.log("Sinkronisasi Berhasil");
            }
        });
    };

    const formattedDate = new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const displayTitle = log.title || `Session ${log.id}`;

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle={`${displayTitle}`}
            headerDescription={`${formattedDate} • Edit metrik atau analisis performa.`}
        >
            <Head title={`${displayTitle} - ${formattedDate}`} />

            <div className="w-full pb-12 space-y-4 relative">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                    <Link href={route('performance-logs.index')} className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors tracking-wide group">
                        <ArrowLeft size={14} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" /> 
                        Kembali ke Timeline
                    </Link>

                    {/* TAB NAVIGASI */}
                    <div className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg flex items-center shadow-sm w-full sm:w-auto">
                        <button 
                            type="button"
                            onClick={() => setActiveTab('input')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'input' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                        >
                            <Edit3 size={14} strokeWidth={2.5} /> Data Entry
                        </button>
                        <button 
                            type="button"
                            onClick={() => setActiveTab('analytics')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'analytics' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                        >
                            <BarChart2 size={14} strokeWidth={2.5} /> Session Analytics
                        </button>
                    </div>
                </div>

                {/* FORM UTAMA */}
                <form onSubmit={submit} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col overflow-hidden transition-colors">
                    
                    {/* TAB KONTEN 1: DATA ENTRY (Input seperti biasa) */}
                    <div className={activeTab === 'input' ? 'block' : 'hidden'}>
                        {/* Header Konfigurasi */}
                        <ConfigurationHeader 
                            data={data} 
                            setData={setData} 
                            benchmarks={team_benchmarks} 
                            errors={errors} 
                        />

                        {/* SELECTOR PLAYER BENCHMARK */}
                        <div className="bg-amber-50/50 dark:bg-amber-900/10 px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                    <Target size={18} /> Acuan Target Personal
                                </h3>
                                <p className="text-[11px] font-semibold text-amber-600/70 mt-0.5">Wajib dipilih agar sistem dapat mengalkulasi persentase pencapaian individu.</p>
                            </div>
                            <div className="w-full sm:w-1/3">
                                <select 
                                    required
                                    value={data.player_benchmark_id}
                                    onChange={e => setData('player_benchmark_id', e.target.value)}
                                    className="w-full bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-700/50 rounded-lg text-sm font-bold px-4 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500 outline-none shadow-sm cursor-pointer"
                                >
                                    <option value="" disabled>-- Wajib Pilih Target Individu --</option>
                                    {player_benchmarks?.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                                {errors.player_benchmark_id && <span className="text-red-500 text-xs mt-1">{errors.player_benchmark_id}</span>}
                            </div>
                        </div>

                        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950 p-4 pb-0">
                            {log.type === 'match' ? (
                                <>
                                    <MatchMetricsTable 
                                        data={data} setData={setData} getAutoCalculatedValue={getAutoCalculatedValue} calculatePercentage={calculateTeamPercentage} handleChange={handleChange}
                                    />
                                    {data.player_benchmark_id ? (
                                        <PlayerMatchMetricsTable 
                                            data={data} setData={setData} getAutoCalculatedValue={getAutoCalculatedValue} calculatePercentage={calculatePlayerPercentage} handleChange={handleChange}
                                        />
                                    ) : (
                                        <div className="my-10 p-8 border-2 border-dashed border-amber-200 dark:border-amber-900/50 rounded-xl text-center bg-amber-50/30 dark:bg-amber-900/5">
                                            <Target size={32} className="mx-auto text-amber-400/50 mb-3" />
                                            <h4 className="text-sm font-bold text-amber-600 dark:text-amber-500">Tabel Kalkulasi Individu Disembunyikan</h4>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <TrainingMetricsTable 
                                        data={data} setData={setData} getAutoCalculatedValue={getAutoCalculatedValue} calculatePercentage={calculateTeamPercentage} handleChange={handleChange}
                                    />
                                    {data.player_benchmark_id ? (
                                        <PlayerTrainingMetricsTable 
                                            data={data} setData={setData} getAutoCalculatedValue={getAutoCalculatedValue} calculatePercentage={calculatePlayerPercentage} handleChange={handleChange}
                                        />
                                    ) : (
                                        <div className="my-10 p-8 border-2 border-dashed border-amber-200 dark:border-amber-900/50 rounded-xl text-center bg-amber-50/30 dark:bg-amber-900/5">
                                            <Target size={32} className="mx-auto text-amber-400/50 mb-3" />
                                            <h4 className="text-sm font-bold text-amber-600 dark:text-amber-500">Tabel Kalkulasi Individu Disembunyikan</h4>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* TAB KONTEN 2: SESSION ANALYTICS */}
                    {activeTab === 'analytics' && (
                        <div className="p-4 md:p-6 bg-zinc-50/30 dark:bg-zinc-950">
                            {/* Memanggil Tab Analysis. Datanya di-generate LANGSUNG dari apa yang sedang diinput user, jadi real-time walau belum disave! */}
                            <SessionAnalysisTab sessionData={prepareSessionDataForAnalysis()} />
                        </div>
                    )}

                    {/* FOOTER ACTION BAR (Hanya tampil di mode Input) */}
                    <div className={`p-4 bg-zinc-50/80 dark:bg-zinc-900/50 backdrop-blur-sm flex flex-col md:flex-row justify-between items-center gap-4 border-t border-zinc-200 dark:border-zinc-800 ${activeTab === 'analytics' ? 'hidden' : 'flex'}`}>
                        
                        <div className="flex w-full md:w-auto gap-3">
                            <a href={route('performance-logs.export.pdf', log.id)} target="_blank" className="flex-1 md:flex-none px-5 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-sm"><Download size={14} strokeWidth={2.5} /> Unduh PDF</a>
                            <a href={route('performance-logs.export.excel', log.id)} className="flex-1 md:flex-none px-5 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-sm"><FileSpreadsheet size={14} strokeWidth={2.5} /> Unduh Excel</a>
                        </div>

                        <div className="flex w-full md:w-auto items-center gap-3">
                            {processing && <span className="text-[10px] font-black text-zinc-500 animate-pulse uppercase tracking-widest hidden md:inline-block mr-2">Menyimpan...</span>}
                            
                            <button type="button" onClick={clearAll} className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all text-slate-600 dark:text-slate-400 bg-slate-50 border border-slate-200 dark:border-slate-500/20 shadow-sm">
                                <Trash2 size={16} strokeWidth={2.5} /> <span className="hidden sm:inline">Kosongkan</span>
                            </button>

                            <button onClick={submit} disabled={processing} className={`w-full sm:w-auto px-8 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${processing ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-transparent' : 'bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200'}`}>
                                {processing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} strokeWidth={2.5} />}
                                Simpan Data
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}