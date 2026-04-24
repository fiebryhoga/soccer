import React, { useMemo, useRef } from 'react'; // (BARU) Tambahkan useRef
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, Loader2, Download, FileSpreadsheet } from 'lucide-react'; // (BARU) Icon Tambahan
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';
import ConfigurationHeader from './Partials/ConfigurationHeader';
import MetricsTable from './Partials/MetricsTable';

// (BARU) Import Library Export
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';

const POSITION_ORDER = { 'CB': 1, 'FB': 2, 'MF': 3, 'WF': 4, 'FW': 5 };

// (BARU) Pastikan menerima props `club` dari controller
export default function PerformanceLogShow({ auth, log, club, players, existing_metrics, benchmarks }) {
    
    // (BARU) Referensi untuk Template Cetak
    const exportRef = useRef(null);

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
                sort_order: existing?.sort_order ?? null 
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

    const { data, setData, post, processing, errors } = useForm({
        title: log.title || '',
        benchmark_id: log.benchmark_id || '',
        players_data: sortedPlayersData,
    });

    const activeBenchmark = useMemo(() => {
        if (!data.benchmark_id) return null;
        return benchmarks?.find(b => b.id == data.benchmark_id);
    }, [data.benchmark_id, benchmarks]);

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
        let sum = 0, count = 0;
        data.players_data.forEach(p => {
            const val = parseFloat(getAutoCalculatedValue(p, colId));
            if (!isNaN(val) && val !== '') { sum += val; count++; }
        });
        return count > 0 ? (sum / count).toFixed(1) : 0;
    };

    // ==========================================
    // (BARU) FUNGSI EXPORT EXCEL & PDF
    // ==========================================
    const downloadExcel = () => {
        if (!data.benchmark_id) return alert("Pilih Benchmark terlebih dahulu agar angka persentase bisa dihitung di Excel!");
        
        const table = exportRef.current.querySelector('table');
        const wb = XLSX.utils.table_to_book(table, { sheet: "Daily Report" });
        XLSX.writeFile(wb, `${log.title || 'Training_Report'}_${log.date}.xlsx`);
    };

    const downloadPDF = () => {
        if (!data.benchmark_id) return alert("Pilih Benchmark terlebih dahulu sebelum mencetak PDF!");

        const element = exportRef.current;
        const opt = {
            margin:       [0.5, 0.3, 0.5, 0.3], // Top, Left, Bottom, Right
            filename:     `${log.title || 'Training_Report'}_${log.date}.pdf`,
            image:        { type: 'jpeg', quality: 1 },
            html2canvas:  { scale: 2, useCORS: true }, // useCORS penting agar logo klub bisa dirender
            jsPDF:        { unit: 'in', format: 'a3', orientation: 'landscape' } // Pakai kertas A3 Landscape agar kolom yang banyak tidak terpotong
        };
        html2pdf().set(opt).from(element).save();
    };

    // ... (Fungsi handlePaste, handleChange, submit tetap sama persis) ...
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
                row.forEach((val, j) => {
                    const targetColIdx = startColIdx + j;
                    if (targetColIdx >= 0 && targetColIdx < FIXED_EXCEL_COLUMNS.length) {
                        const targetColId = FIXED_EXCEL_COLUMNS[targetColIdx].id;
                        if (!['hir_19_8_kmh', 'total_18kmh', 'highest_velocity'].includes(targetColId)) {
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
        newData[rowIndex].metrics[colId] = value;
        setData('players_data', newData);
    };

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

            <div className="max-w-[100rem] mx-auto pb-12 space-y-4 relative">
                <Link href={route('performance-logs.index')} className="inline-flex items-center gap-2 text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-2">
                    <ArrowLeft size={14} /> Kembali ke Kalender
                </Link>

                <form onSubmit={submit} className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                    <ConfigurationHeader data={data} setData={setData} benchmarks={benchmarks} errors={errors} />

                    <MetricsTable 
                        data={data}
                        setData={setData}
                        getAutoCalculatedValue={getAutoCalculatedValue}
                        calculatePercentage={calculatePercentage}
                        getColumnAverage={getColumnAverage}
                        handlePaste={handlePaste}
                        handleChange={handleChange}
                    />

                    {/* (BARU) FOOTER DENGAN TOMBOL EXPORT */}
                    <div className="p-4 bg-zinc-50 dark:bg-[#0d0d0d] border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center gap-4">
                        <div className="flex gap-3">
                        <a 
                            href={route('performance-logs.export.pdf', log.id)} 
                            target="_blank"
                            className="px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/50"
                        >
                            <Download size={16} /> Unduh PDF
                        </a>
                        <a 
                            href={route('performance-logs.export.excel', log.id)} 
                            className="px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50"
                        >
                            <FileSpreadsheet size={16} /> Unduh Excel
                        </a>
                        </div>

                        <div className="flex items-center gap-4">
                            {processing && <span className="text-[10px] text-zinc-500 animate-pulse">Sedang memproses...</span>}
                            <button 
                                onClick={submit}
                                disabled={processing}
                                className={`px-10 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg
                                    ${processing ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:scale-[1.02] active:scale-95'}
                                `}
                            >
                                {processing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Simpan Data
                            </button>
                        </div>
                    </div>
                </form>

                {/* ========================================================= */}
                {/* (BARU) TEMPLATE CETAK TERSEMBUNYI (Meniru Catapult Report) */}
                {/* ========================================================= */}
                <div style={{ position: 'absolute', top: '-15000px', left: '-15000px' }}>
                    <div ref={exportRef} style={{ width: '400mm', padding: '15px', backgroundColor: '#ffffff', color: '#000000', fontFamily: 'Arial, sans-serif' }}>
                        
                        {/* KOP SURAT */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '3px solid #000', paddingBottom: '10px' }}>
                            <div style={{ width: '120px' }}>
                                {club?.logo_url && <img src={club.logo_url} alt="Club Logo" crossOrigin="anonymous" style={{ height: '80px', objectFit: 'contain' }} />}
                            </div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '900', textTransform: 'uppercase' }}>
                                    DAILY TRAINING REPORT
                                </h1>
                                <h2 style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: 'normal' }}>
                                    Session: <span style={{ fontWeight: 'bold' }}>{data.title || 'Untitled'}</span> | {club?.name || 'Club'}, {new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </h2>
                            </div>
                            <div style={{ width: '120px', textAlign: 'right' }}>
                                {/* Placeholder logo sistem pelatih */}
                                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-1px' }}>SYSTEM</h2>
                            </div>
                        </div>

                        {/* TABEL DATA PURE TEXT (GAK ADA WARNA / BORDER RIBET) */}
                        <table border="1" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '11px' }}>
                            <thead>
                                <tr>
                                    <th colSpan="4" style={{ padding: '6px', backgroundColor: '#f4f4f5' }}>PLAYER IDENTITY</th>
                                    <th colSpan="1" style={{ padding: '6px', backgroundColor: '#f4f4f5' }}>DURATION</th>
                                    <th colSpan="2" style={{ padding: '6px', backgroundColor: '#f4f4f5' }}>TOTAL DIST</th>
                                    <th colSpan="2" style={{ padding: '6px', backgroundColor: '#f4f4f5' }}>DIST/MIN</th>
                                    <th colSpan="10" style={{ padding: '6px', backgroundColor: '#f4f4f5' }}>DISTANCE (m)</th>
                                    <th colSpan="12" style={{ padding: '6px', backgroundColor: '#f4f4f5' }}>OTHER METRICS</th>
                                </tr>
                                <tr>
                                    <th style={{ padding: '6px', backgroundColor: '#f4f4f5' }}>NO</th>
                                    <th style={{ padding: '6px', backgroundColor: '#f4f4f5' }}>POS</th>
                                    <th style={{ padding: '6px', backgroundColor: '#f4f4f5' }}>NP</th>
                                    <th style={{ padding: '6px', backgroundColor: '#f4f4f5', textAlign: 'left' }}>NAME</th>
                                    {FIXED_EXCEL_COLUMNS.map(col => (
                                        <React.Fragment key={`exp-hdr-${col.id}`}>
                                            <th style={{ padding: '6px', backgroundColor: '#f4f4f5' }}>{col.label}</th>
                                            {col.hasPercent && (
                                                <th style={{ padding: '6px', backgroundColor: '#f4f4f5' }}>% {col.label.split('(')[0].replace('Total', '').trim()} MD</th>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.players_data.map((player, index) => (
                                    <tr key={`exp-row-${player.player_id}`}>
                                        <td style={{ padding: '4px' }}>{index + 1}</td>
                                        <td style={{ padding: '4px', fontWeight: 'bold' }}>{player.position}</td>
                                        <td style={{ padding: '4px' }}>{String(player.position_number).padStart(2, '0')}</td>
                                        <td style={{ padding: '4px', textAlign: 'left', fontWeight: 'bold' }}>{player.name}</td>
                                        {FIXED_EXCEL_COLUMNS.map(col => {
                                            const rawValue = getAutoCalculatedValue(player, col.id);
                                            const percent = calculatePercentage(col.id, rawValue, player.position, player.historical_highest);
                                            return (
                                                <React.Fragment key={`exp-cell-${col.id}`}>
                                                    <td style={{ padding: '4px' }}>{rawValue}</td>
                                                    {col.hasPercent && <td style={{ padding: '4px' }}>{percent}%</td>}
                                                </React.Fragment>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" style={{ border: 'none' }}></td>
                                    <td style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#f4f4f5' }}>TEAM AVERAGE</td>
                                    {FIXED_EXCEL_COLUMNS.map(col => {
                                        const avgValue = getColumnAverage(col.id);
                                        const avgPercent = calculatePercentage(col.id, avgValue, null);
                                        return (
                                            <React.Fragment key={`exp-avg-${col.id}`}>
                                                <td style={{ padding: '6px', fontWeight: 'bold', backgroundColor: '#f4f4f5' }}>{avgValue}</td>
                                                {col.hasPercent && <td style={{ padding: '6px', fontWeight: 'bold', backgroundColor: '#f4f4f5' }}>{avgPercent}%</td>}
                                            </React.Fragment>
                                        );
                                    })}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}