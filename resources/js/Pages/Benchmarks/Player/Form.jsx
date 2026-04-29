// resources/js/Pages/Benchmarks/Player/Form.jsx

import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft, Zap, Eraser, Loader2 } from 'lucide-react';

// Kolom Benchmark Custom sesuai permintaan spesifik Anda
const BENCHMARK_COLUMNS = [
    { id: 'total_distance', label: 'DISTANCE' },
    { id: 'dist_per_min', label: 'DIST/MIN' },
    { id: 'hir_18_24_kmh', label: 'HIR' },
    { id: 'sprint_distance', label: 'SPRINT' },
    { id: 'total_18kmh', label: 'TOTAL' },
    { id: 'accels', label: 'ACC' },
    { id: 'decels', label: 'DCC' },
    { id: 'hr_band_4_dist', label: 'DIST HR 4' },
    { id: 'hr_band_4_dur', label: 'HR BAND 4' }, // Ini Durasi
    { id: 'hr_band_5_dist', label: 'DIST HR 5' },
    { id: 'hr_band_5_dur', label: 'HR BAND 5' }, // Ini Durasi
    { id: 'player_load', label: 'PL' }
];

export default function Form({ auth, benchmark, players }) {
    const isEdit = !!benchmark;
    
    // Inisialisasi metrics: Jika edit, muat data lama. Jika baru, siapkan objek per Player ID
    const initialMetrics = {};
    if (isEdit && benchmark.metrics) {
        Object.assign(initialMetrics, benchmark.metrics);
    } else {
        players.forEach(p => { initialMetrics[p.id] = {}; });
    }

    const { data, setData, post, put, processing, errors } = useForm({
        name: benchmark?.name || '',
        metrics: initialMetrics,
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('players.benchmarks.update', benchmark.id));
        } else {
            post(route('players.benchmarks.store'));
        }
    };

    const handleMetricChange = (playerId, colId, value) => {
        setData('metrics', {
            ...data.metrics,
            [playerId]: {
                ...(data.metrics[playerId] || {}),
                [colId]: value
            }
        });
    };

    // ==========================================
    // FUNGSI SAKTI 1: SMART PASTE (DARI EXCEL)
    // ==========================================
    const handleLocalPaste = (e, startRowIdx, startColId) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text');
        if (!pasteData) return;
        
        // Pisahkan data per baris (enter) dan per kolom (tab)
        const rows = pasteData.split(/\r?\n/).map(r => r.split('\t'));
        let newMetrics = { ...data.metrics };
        const startColIdx = BENCHMARK_COLUMNS.findIndex(c => c.id === startColId);
        
        rows.forEach((row, i) => {
            if (row.length === 1 && row[0] === '') return; // Lewati baris kosong
            
            const targetPlayer = players[startRowIdx + i]; // Cari pemain di baris tujuan
            if (targetPlayer) {
                if (!newMetrics[targetPlayer.id]) newMetrics[targetPlayer.id] = {};
                
                const cleanedRow = row.filter(val => !val.includes('%')); // Abaikan jika ada %
                cleanedRow.forEach((val, j) => {
                    const targetColIdx = startColIdx + j;
                    if (targetColIdx >= 0 && targetColIdx < BENCHMARK_COLUMNS.length) {
                        const targetColId = BENCHMARK_COLUMNS[targetColIdx].id;
                        // Ubah koma jadi titik agar terbaca desimal
                        newMetrics[targetPlayer.id][targetColId] = val.replace(',', '.').trim();
                    }
                });
            }
        });
        setData('metrics', newMetrics);
    };

    // ==========================================
    // FUNGSI SAKTI 2: TARIK DARI HIGHEST
    // ==========================================
    const loadAllFromHighest = () => {
        if (!confirm("Tarik SEMUA data dari Highest Record masing-masing pemain? Angka yang Anda ketik sebelumnya akan tertimpa.")) return;
        
        const newMetrics = { ...data.metrics };
        players.forEach(p => {
            const highest = typeof p.highest_metrics === 'string' ? JSON.parse(p.highest_metrics) : (p.highest_metrics || {});
            if (!newMetrics[p.id]) newMetrics[p.id] = {};
            
            BENCHMARK_COLUMNS.forEach(col => {
                // Jika rekor highest-nya ada, salin ke input
                if (highest[col.id] !== undefined && highest[col.id] !== null) {
                    newMetrics[p.id][col.id] = highest[col.id]; 
                }
            });
        });
        
        setData('metrics', newMetrics);
    };

    const clearAll = () => {
        if (!confirm("Kosongkan semua isian target pemain di tabel ini?")) return;
        const newMetrics = {};
        players.forEach(p => { newMetrics[p.id] = {}; });
        setData('metrics', newMetrics);
    };

    return (
        <AuthenticatedLayout user={auth.user} headerTitle={isEdit ? `Edit: ${benchmark.name}` : "Buat Player Benchmark"}>
            <Head title="Player Benchmark Form" />

            <div className="max-w-[100rem] mx-auto space-y-6">
                <Link href={route('players.benchmarks.index')} className="text-xs font-bold text-zinc-500 flex items-center gap-2 hover:text-zinc-900 dark:hover:text-zinc-100 w-max">
                    <ArrowLeft size={14} /> Kembali ke Daftar
                </Link>

                <form onSubmit={submit} className="space-y-6">
                    
                    {/* Header Kontrol */}
                    <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="w-full md:w-1/3">
                            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Nama Benchmark (Misal: Target MD-1)</label>
                            <input 
                                type="text" required
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold px-4 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Contoh: Target Fisik MD-1"
                            />
                            {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name}</span>}
                        </div>

                        <div className="flex items-center gap-3">
                            <button type="button" onClick={clearAll} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-600 hover:text-red-600 dark:text-zinc-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-2">
                                <Eraser size={14} /> Kosongkan Form
                            </button>
                            <button type="button" onClick={loadAllFromHighest} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2">
                                <Zap size={14} fill="currentColor" /> Set Semua dari Highest
                            </button>
                            <button disabled={processing} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2">
                                {processing ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan Benchmark
                            </button>
                        </div>
                    </div>

                    {/* Tabel Input Matriks */}
                    <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto relative [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-zinc-50 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 pb-2">
                            <table className="w-max min-w-full text-left whitespace-nowrap text-[10px] border-collapse tabular-nums">
                                <thead className="bg-zinc-50 dark:bg-zinc-900">
                                    <tr>
                                        <th className="p-3 border-b border-zinc-200 dark:border-zinc-800 font-black text-zinc-500 sticky left-0 z-20 bg-zinc-50 dark:bg-zinc-900 shadow-[4px_0_12px_rgba(0,0,0,0.03)] uppercase tracking-widest w-48">NAMA PEMAIN</th>
                                        <th className="p-3 border-b border-zinc-200 dark:border-zinc-800 font-black text-zinc-500 text-center uppercase tracking-widest">POS</th>
                                        {BENCHMARK_COLUMNS.map(col => (
                                            <th key={col.id} className="p-3 border-b border-zinc-200 dark:border-zinc-800 font-black text-zinc-500 text-center uppercase tracking-widest min-w-[70px]">
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                                    {/* Gunakan index (idx) pada loop map agar handleLocalPaste tahu kita nge-paste di baris ke-berapa */}
                                    {players.map((player, idx) => {
                                        const highest = typeof player.highest_metrics === 'string' ? JSON.parse(player.highest_metrics) : (player.highest_metrics || {});
                                        return (
                                            <tr key={player.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                                                <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100 sticky left-0 z-10 bg-white dark:bg-zinc-950 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/50 shadow-[4px_0_12px_rgba(0,0,0,0.03)] truncate w-48">
                                                    {player.name}
                                                </td>
                                                <td className="p-3 font-bold text-zinc-500 text-center">{player.position}</td>
                                                {BENCHMARK_COLUMNS.map(col => {
                                                    const isDur = col.id.includes('_dur');
                                                    return (
                                                        <td key={col.id} className="p-1.5 border-l border-zinc-100 dark:border-zinc-800/60">
                                                            <div className="flex flex-col items-center gap-0.5">
                                                                <input 
                                                                    type={isDur ? "text" : "number"} step={isDur ? undefined : "any"}
                                                                    value={data.metrics[player.id]?.[col.id] || ''}
                                                                    onChange={e => handleMetricChange(player.id, col.id, e.target.value)}
                                                                    onPaste={e => handleLocalPaste(e, idx, col.id)} // <- BARIS INI YANG DITAMBAHKAN
                                                                    className={`text-center text-[11px] font-bold py-1 px-1.5 border border-zinc-200 dark:border-zinc-700 bg-transparent rounded focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 outline-none transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700 ${isDur ? 'w-20' : 'w-16'}`}
                                                                    placeholder={isDur ? "00.00.00" : "-"}
                                                                />
                                                                <span className="text-[9px] font-bold text-amber-500/80 tracking-tight" title="Highest Record Pemain">
                                                                    Highest: {highest[col.id] || '-'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}