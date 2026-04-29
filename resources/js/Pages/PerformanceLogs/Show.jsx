// resources/js/Pages/PerformanceLogs/Show.jsx

import React, { useMemo } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, Loader2, Download, FileSpreadsheet, Trash2 } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';
import ConfigurationHeader from './Partials/ConfigurationHeader';
import TrainingMetricsTable from './Partials/TrainingMetricsTable';
import MatchMetricsTable from './Partials/MatchMetricsTable';
import MetricsTable from './Partials/MetricsTable';

const POSITION_ORDER = { 'CB': 1, 'FB': 2, 'MF': 3, 'WF': 4, 'FW': 5 };

export default function PerformanceLogShow({ auth, log, club, players, existing_metrics, benchmarks }) {
    
    const sortedPlayersData = useMemo(() => {
        let mappedData = players.map(player => {
            const existing = existing_metrics[player.id];
            let metricsData = {};
            FIXED_EXCEL_COLUMNS.forEach(col => { metricsData[col.id] = existing?.metrics?.[col.id] || ''; });
            
            // Simpan status centang ke dalam JSON
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
                
                // State UI
                selected: existing?.metrics?.selected ?? true,
                selected_hr4: existing?.metrics?.selected_hr4 ?? true,
                selected_hr5: existing?.metrics?.selected_hr5 ?? true,
                selected_pl: existing?.metrics?.selected_pl ?? true,
            };
        });

        mappedData.sort((a, b) => {
            if (a.sort_order !== null && b.sort_order !== null) return a.sort_order - b.sort_order;
            const posOrder = { 'CB': 1, 'FB': 2, 'MF': 3, 'WF': 4, 'FW': 5 };
            if (posOrder[a.position] !== posOrder[b.position]) return posOrder[a.position] - posOrder[b.position];
            return a.name.localeCompare(b.name);
        });

        return mappedData;
    }, [players, existing_metrics]);

    // 2. Inisialisasi Form State
    const { data, setData, post, processing, errors } = useForm({
        title: log.title || '',
        benchmark_id: log.benchmark_id || '',
        players_data: sortedPlayersData,
    });

    const activeBenchmark = useMemo(() => {
        if (!data.benchmark_id) return null;
        return benchmarks?.find(b => b.id == data.benchmark_id);
    }, [data.benchmark_id, benchmarks]);

    // 3. Logika Kalkulasi Angka
    const calculatePercentage = (colId, rawValue, position = null, playerHighest = null) => {
        if (!rawValue || isNaN(rawValue) || rawValue === '') return 0;
        const numValue = parseFloat(rawValue);

        if (colId === 'max_velocity') {
            let targetHighest = parseFloat(playerHighest?.['highest_velocity']) || parseFloat(playerHighest?.['max_velocity']) || 0;
            if (targetHighest === 0) targetHighest = 100;
            return ((numValue / targetHighest) * 100).toFixed(1);
        }
        
        let targetValue = 100;
        
        if (activeBenchmark?.metrics?.[colId]) {
             if (position && activeBenchmark.metrics[colId][position]) {
                 targetValue = activeBenchmark.metrics[colId][position]; 
             } else if (typeof activeBenchmark.metrics[colId] === 'number') {
                 targetValue = activeBenchmark.metrics[colId]; 
             } else if (!position) {
                 const vals = Object.values(activeBenchmark.metrics[colId]);
                 targetValue = vals.slateuce((a,b)=>a+b,0) / vals.length || 100;
             }
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
        
        // KALKULASI HIGHEST VELOCITY
        if (colId === 'highest_velocity') {
            const currentMax = parseFloat(player.metrics?.max_velocity) || 0;
            const historicalMax = parseFloat(player.historical_highest?.highest_velocity) || parseFloat(player.historical_highest?.max_velocity) || 0;
            
            const max = Math.max(currentMax, historicalMax);
            return max > 0 ? max.toFixed(2) : '-';
        }
        
        return player.metrics?.[colId] ?? '';
    };

    const timeToSeconds = (timeStr) => {
        if(!timeStr || typeof timeStr !== 'string' || !timeStr.includes('.')) return null;
        const parts = timeStr.split('.').map(Number);
        if(parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2];
        if(parts.length === 2) return parts[0]*60 + parts[1];
        return null;
    };

    const secondsToTime = (totalSeconds) => {
        if(totalSeconds === null || isNaN(totalSeconds)) return '-';
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = Math.round(totalSeconds % 60);
        return `${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}.${String(s).padStart(2, '0')}`;
    };

    const getColumnAverage = (colId) => {
        if (colId === 'total_duration') return '-';

        let targetPlayers = data.players_data;
        
        const distanceGroup = ['total_distance', 'dist_per_min', 'hir_18_24_kmh', 'sprint_distance', 'total_18kmh'];
        const hr4Group = ['hr_band_4_dist', 'hr_band_4_dur'];
        const hr5Group = ['hr_band_5_dist', 'hr_band_5_dur'];
        const plGroup = ['player_load'];

        if (distanceGroup.includes(colId)) targetPlayers = data.players_data.filter(p => p.selected);
        else if (hr4Group.includes(colId)) targetPlayers = data.players_data.filter(p => p.selected_hr4);
        else if (hr5Group.includes(colId)) targetPlayers = data.players_data.filter(p => p.selected_hr5);
        else if (plGroup.includes(colId)) targetPlayers = data.players_data.filter(p => p.selected_pl);

        if (targetPlayers.length === 0) return '-';

        if (colId === 'hr_band_4_dur' || colId === 'hr_band_5_dur') {
            let sumSec = 0; let count = 0;
            targetPlayers.forEach(p => {
                const val = getAutoCalculatedValue(p, colId);
                const sec = timeToSeconds(val);
                if (sec !== null) { sumSec += sec; count++; }
            });
            return count > 0 ? secondsToTime(sumSec / count) : '-';
        }

        let sum = 0, count = 0;
        targetPlayers.forEach(p => {
            const val = parseFloat(getAutoCalculatedValue(p, colId));
            if (!isNaN(val) && getAutoCalculatedValue(p, colId) !== '') { 
                sum += val; count++; 
            }
        });
        
        if (count === 0) return '-';
        const avg = sum / count;
        
        if (['max_velocity', 'highest_velocity'].includes(colId)) return avg.toFixed(2);
        return Number.isInteger(avg) ? avg.toString() : avg.toFixed(1);
    };

    // 4. Handlers Input
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

    // FUNGSI CLEAR ALL (Dipindahkan dari MetricsTable)
    const clearAll = () => {
        if (!confirm('Yakin ingin mengosongkan SELURUH data metrik di tabel ini?')) return;
        const newData = data.players_data.map(p => {
            const newMetrics = { ...p.metrics };
            FIXED_EXCEL_COLUMNS.forEach(col => {
                if (!['total_18kmh', 'highest_velocity'].includes(col.id)) newMetrics[col.id] = '';
            });
            return { ...p, metrics: newMetrics };
        });
        setData('players_data', newData);
    };

    // 5. Submit Form
    const submit = (e) => {
        e.preventDefault();
        const finalizedData = data.players_data.map((player, index) => {
            const finalMetrics = { ...player.metrics };
            finalMetrics['hir_19_8_kmh'] = getAutoCalculatedValue(player, 'hir_19_8_kmh');
            finalMetrics['total_18kmh'] = getAutoCalculatedValue(player, 'total_18kmh');
            finalMetrics['highest_velocity'] = getAutoCalculatedValue(player, 'highest_velocity');
            return { player_id: player.player_id, metrics: finalMetrics, sort_order: index };
        });

        post(route('performance-logs.metrics.updateBulk', log.id), {
            title: data.title,
            benchmark_id: data.benchmark_id,
            players_data: finalizedData,
            preserveScroll: true,
        });
    };

    const formattedDate = new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const displayTitle = log.title || `Session ${log.id}`;
    const pageHeaderTitle = `Update ${displayTitle} - ${formattedDate}`;

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle={pageHeaderTitle}
            headerDescription="Edit metrik, sesuaikan acuan benchmark, dan simpan perubahan untuk memperbarui rekor pemain secara real-time."
        >
            <Head title={`${displayTitle} - ${formattedDate}`} />

            <div className="w-full pb-12 space-y-4 relative">
                
                {/* Tombol Kembali */}
                <Link href={route('performance-logs.index')} className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-2 tracking-wide group">
                    <ArrowLeft size={14} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" /> 
                    Kembali ke Timeline
                </Link>

                <form onSubmit={submit} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col overflow-hidden transition-colors">
                    
                    {/* Header Konfigurasi */}
                    <ConfigurationHeader 
                        data={data} 
                        setData={setData} 
                        benchmarks={benchmarks} 
                        errors={errors} 
                    />

                    
                    <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950 p-4 pb-0">
                        {log.type === 'match' ? (
                            <MatchMetricsTable 
                                data={data}
                                setData={setData}
                                getAutoCalculatedValue={getAutoCalculatedValue}
                                calculatePercentage={calculatePercentage}
                                getColumnAverage={getColumnAverage}
                                handlePaste={handlePaste}
                                handleChange={handleChange}
                            />
                        ) : (
                            <TrainingMetricsTable 
                                data={data}
                                setData={setData}
                                getAutoCalculatedValue={getAutoCalculatedValue}
                                calculatePercentage={calculatePercentage}
                                getColumnAverage={getColumnAverage}
                                handlePaste={handlePaste}
                                handleChange={handleChange}
                            />
                        )}
                    </div>

                    {/* FOOTER ACTION BAR */}
                    <div className="p-4 bg-zinc-50/80 dark:bg-zinc-900/50 backdrop-blur-sm flex flex-col md:flex-row justify-between items-center gap-4 border-t border-zinc-200 dark:border-zinc-800">
                        
                        {/* Tombol Export */}
                        <div className="flex w-full md:w-auto gap-3">
                            <a 
                                href={route('performance-logs.export.pdf', log.id)} 
                                target="_blank"
                                className="flex-1 md:flex-none px-5 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm"
                            >
                                <Download size={14} strokeWidth={2.5} /> Unduh PDF
                            </a>
                            <a 
                                href={route('performance-logs.export.excel', log.id)} 
                                className="flex-1 md:flex-none px-5 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm"
                            >
                                <FileSpreadsheet size={14} strokeWidth={2.5} /> Unduh Excel
                            </a>
                        </div>

                        {/* Aksi Kanan: Kosongkan & Simpan */}
                        <div className="flex w-full md:w-auto items-center gap-3">
                            {processing && <span className="text-[10px] font-black text-zinc-500 animate-pulse uppercase tracking-widest hidden md:inline-block mr-2">Menyimpan...</span>}
                            
                            {/* Tombol Kosongkan Tabel dipindah kesini */}
                            <button 
                                type="button" 
                                onClick={clearAll} 
                                className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all text-slate-600 dark:text-slate-400 bg-slate-50 hover:bg-slate-100 dark:bg-slate-500/10 dark:hover:bg-slate-500/20 border border-slate-200 dark:border-slate-500/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/50"
                            >
                                <Trash2 size={16} strokeWidth={2.5} />
                                <span className="hidden sm:inline">Kosongkan</span>
                            </button>

                            <button 
                                onClick={submit}
                                disabled={processing}
                                className={`w-full sm:w-auto px-8 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-zinc-950
                                    ${processing 
                                        ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-transparent' 
                                        : 'bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:ring-zinc-900 dark:focus:ring-zinc-100'}
                                `}
                            >
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