// resources/js/Pages/PerformanceLogs/Show.jsx

import React, { useMemo } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, Loader2, Download, FileSpreadsheet } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';
import ConfigurationHeader from './Partials/ConfigurationHeader';
import MetricsTable from './Partials/MetricsTable';
import SessionAnalysis from './Partials/SessionAnalysis'; // <--- IMPORT KOMPONEN BARU

const POSITION_ORDER = { 'CB': 1, 'FB': 2, 'MF': 3, 'WF': 4, 'FW': 5 };

export default function PerformanceLogShow({ auth, log, club, players, existing_metrics, benchmarks }) {
    
    // 1. Pengurutan dan Mapping Data Pemain
    const sortedPlayersData = useMemo(() => {
        let mappedData = players.map(player => {
            const existing = existing_metrics[player.id];
            let metricsData = {};
            FIXED_EXCEL_COLUMNS.forEach(col => { metricsData[col.id] = existing?.metrics?.[col.id] || ''; });
            return {
                player_id: player.id,
                position_number: player.position_number,
                name: player.name,
                position: player.position,
                historical_highest: player.highest_metrics || {}, 
                metrics: metricsData,
                sort_order: existing?.sort_order ?? null,
                selected: true
            };
        });

        mappedData.sort((a, b) => {
            if (a.sort_order !== null && b.sort_order !== null) return a.sort_order - b.sort_order;
            const posA = POSITION_ORDER[a.position?.toUpperCase()] || 99;
            const posB = POSITION_ORDER[b.position?.toUpperCase()] || 99;
            if (posA !== posB) return posA - posB;
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
            if (targetHighest === 0) {
                 if (position && activeBenchmark?.metrics?.[colId]?.[position]) {
                     targetHighest = activeBenchmark.metrics[colId][position];
                 } else if (activeBenchmark?.metrics?.[colId]) {
                     if (typeof activeBenchmark.metrics[colId] === 'number') {
                         targetHighest = activeBenchmark.metrics[colId];
                     } else {
                         const vals = Object.values(activeBenchmark.metrics[colId]);
                         targetHighest = vals.reduce((a,b)=>a+b,0) / vals.length || 100;
                     }
                 } else { targetHighest = 100; }
            }
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
                 targetValue = vals.reduce((a,b)=>a+b,0) / vals.length || 100;
             }
        }
        return ((numValue / targetValue) * 100).toFixed(1);
    };

    const getAutoCalculatedValue = (player, colId) => {
        const metrics = player.metrics;
        if (colId === 'hir_19_8_kmh') {
            const hir18 = parseFloat(metrics['hir_18_kmh']) || 0;
            const hsr21 = parseFloat(metrics['hsr_21_kmh']) || 0;
            return (hir18 + hsr21).toFixed(1);
        } 
        if (colId === 'total_18kmh') {
            const sprint = parseFloat(metrics['sprint_distance']) || 0;
            const hir19 = parseFloat(getAutoCalculatedValue(player, 'hir_19_8_kmh')) || 0;
            return (sprint + hir19).toFixed(1);
        }
        if (colId === 'highest_velocity') {
            const currentMax = parseFloat(metrics['max_velocity']) || 0;
            const historicalMax = parseFloat(player.historical_highest?.['highest_velocity']) || parseFloat(player.historical_highest?.['max_velocity']) || 0;
            return Math.max(currentMax, historicalMax).toFixed(2);
        }
        return metrics[colId];
    };

    const getColumnAverage = (colId) => {
        // Kecualikan Total Duration sesuai permintaan
        if (colId === 'total_duration') return '-';
    
        // Filter hanya pemain yang dicentang
        const selectedPlayers = data.players_data.filter(p => p.selected);
        
        // Jika tidak ada yang dipilih, jangan tampilkan angka
        if (selectedPlayers.length === 0) return '-';
    
        let sum = 0, count = 0;
        selectedPlayers.forEach(p => {
            const val = parseFloat(getAutoCalculatedValue(p, colId));
            if (!isNaN(val) && val !== '') { 
                sum += val; 
                count++; 
            }
        });
        return count > 0 ? (sum / count).toFixed(1) : 0;
    };

    // 4. Handlers Input
    const handlePaste = (e, rowIndex, colId) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text');
        if (!pasteData) return;
        
        // Pisahkan baris (enter) dan kolom (tab) bawaan Excel
        const rows = pasteData.split(/\r?\n/).map(r => r.split('\t'));
        let newData = [...data.players_data];
        
        // Cari index kolom tempat user klik paste (Biasanya di Total Duration)
        const startColIdx = FIXED_EXCEL_COLUMNS.findIndex(c => c.id === colId);
        
        rows.forEach((row, i) => {
            if (row.length === 1 && row[0] === '') return; // Skip baris kosong
            const targetRowIdx = rowIndex + i;
            
            if (newData[targetRowIdx]) {
                // ==========================================================
                // SMART FILTER: Buang semua cell yang mengandung tanda '%'
                // ==========================================================
                const cleanedRow = row.filter(val => !val.includes('%'));

                cleanedRow.forEach((val, j) => {
                    const targetColIdx = startColIdx + j;
                    
                    if (targetColIdx >= 0 && targetColIdx < FIXED_EXCEL_COLUMNS.length) {
                        const targetColId = FIXED_EXCEL_COLUMNS[targetColIdx].id;
                        
                        // JANGAN masukkan data ke kolom yang menggunakan rumus / terkunci
                        const isAutoCalculated = ['hir_19_8_kmh', 'total_18kmh', 'highest_velocity'].includes(targetColId);
                        
                        if (!isAutoCalculated) {
                            // Ganti koma Excel jadi titik (format angka standar) lalu bersihkan spasi
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
        
        // KUNCI PERBAIKAN: Deep clone baris dan object metrics saat diketik
        newData[rowIndex] = {
            ...newData[rowIndex],
            metrics: {
                ...newData[rowIndex].metrics,
                [colId]: value
            }
        };
        
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

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle="Update Data GPS"
            headerDescription="Edit metrik dan simpan perubahan untuk memperbarui rekor pemain."
        >
            <Head title={`GPS Log - ${log.date}`} />

            <div className="w-full pb-12 space-y-4 relative">
                
                {/* Tombol Kembali */}
                <Link href={route('performance-logs.index')} className="inline-flex items-center gap-2 text-[11px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-2 tracking-wide">
                    <ArrowLeft size={14} strokeWidth={2.5}/> Kembali ke Timeline
                </Link>

                <form onSubmit={submit} className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col overflow-hidden">
                    
                    {/* Header Konfigurasi (Partial) */}
                    <ConfigurationHeader 
                        data={data} 
                        setData={setData} 
                        benchmarks={benchmarks} 
                        errors={errors} 
                    />

                    {/* Tabel Metrik Data (Partial) */}
                    <div className="border-b border-zinc-200 dark:border-zinc-800">
                        <MetricsTable 
                            data={data}
                            setData={setData}
                            getAutoCalculatedValue={getAutoCalculatedValue}
                            calculatePercentage={calculatePercentage}
                            getColumnAverage={getColumnAverage}
                            handlePaste={handlePaste}
                            handleChange={handleChange}
                        />
                    </div>

                    {/* ========================================================= */}
                    {/* (BARU) DASHBOARD ANALISIS MUNCUL DI SINI SECARA REAL-TIME */}
                    {/* ========================================================= */}

                    {/* FOOTER ACTION BAR */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/30 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                        
                        {/* Tombol Export (Backend Generated) */}
                        <div className="flex w-full sm:w-auto gap-3">
                            <a 
                                href={route('performance-logs.export.pdf', log.id)} 
                                target="_blank"
                                className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors bg-white dark:bg-[#09090b] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
                            >
                                <Download size={14} strokeWidth={2.5} /> Unduh PDF
                            </a>
                            <a 
                                href={route('performance-logs.export.excel', log.id)} 
                                className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors bg-white dark:bg-[#09090b] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
                            >
                                <FileSpreadsheet size={14} strokeWidth={2.5} /> Unduh Excel
                            </a>
                        </div>

                        <div className="flex w-full sm:w-auto items-center gap-4">
                            {processing && <span className="text-[10px] font-bold text-zinc-500 animate-pulse uppercase tracking-widest">Menyimpan...</span>}
                            <button 
                                onClick={submit}
                                disabled={processing}
                                className={`w-full sm:w-auto px-8 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm
                                    ${processing ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed border border-zinc-200 dark:border-zinc-800' : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200'}
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