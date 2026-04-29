// resources/js/Pages/Benchmarks/Player/Form.jsx

import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft, Zap, Eraser, Loader2, Target, AlertTriangle } from 'lucide-react';
import Modal from '@/Components/Modal';

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
    
    // State untuk mengontrol Modal Konfirmasi
    const [confirmModal, setConfirmModal] = useState({ 
        isOpen: false, 
        type: null, 
        title: '', 
        message: '' 
    });
    
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
        
        const rows = pasteData.split(/\r?\n/).map(r => r.split('\t'));
        
        // [PERBAIKAN] Deep Clone agar mutasi state terbaca Inertia & tersimpan
        let newMetrics = JSON.parse(JSON.stringify(data.metrics));
        const startColIdx = BENCHMARK_COLUMNS.findIndex(c => c.id === startColId);
        
        rows.forEach((row, i) => {
            if (row.length === 1 && row[0] === '') return;
            
            const targetPlayer = players[startRowIdx + i];
            if (targetPlayer) {
                if (!newMetrics[targetPlayer.id]) newMetrics[targetPlayer.id] = {};
                
                const cleanedRow = row.filter(val => !val.includes('%'));
                cleanedRow.forEach((val, j) => {
                    const targetColIdx = startColIdx + j;
                    if (targetColIdx >= 0 && targetColIdx < BENCHMARK_COLUMNS.length) {
                        const targetColId = BENCHMARK_COLUMNS[targetColIdx].id;
                        newMetrics[targetPlayer.id][targetColId] = val.replace(',', '.').trim();
                    }
                });
            }
        });
        setData('metrics', newMetrics);
    };

    // ==========================================
    // MODAL CONTROL & EXECUTION
    // ==========================================
    const openConfirmModal = (type, title, message) => {
        setConfirmModal({ isOpen: true, type, title, message });
    };

    const closeConfirmModal = () => {
        setConfirmModal({ isOpen: false, type: null, title: '', message: '' });
    };

    const executeAction = () => {
        if (confirmModal.type === 'highest') {
            // [PERBAIKAN PENTING] Buat objek baru murni agar Inertia Form tau ada perubahan
            const newMetrics = {}; 
            
            players.forEach(p => {
                const highest = typeof p.highest_metrics === 'string' ? JSON.parse(p.highest_metrics) : (p.highest_metrics || {});
                
                // Copy data existing player (jika ada) ke objek referensi baru
                newMetrics[p.id] = { ...(data.metrics[p.id] || {}) };
                
                BENCHMARK_COLUMNS.forEach(col => {
                    if (highest[col.id] !== undefined && highest[col.id] !== null) {
                        // Pastikan di-cast ke string agar tersimpan konsisten seperti ketikan manual
                        newMetrics[p.id][col.id] = String(highest[col.id]).replace(',', '.').trim(); 
                    }
                });
            });
            setData('metrics', newMetrics);
            
        } else if (confirmModal.type === 'clear') {
            const newMetrics = {};
            players.forEach(p => { newMetrics[p.id] = {}; });
            setData('metrics', newMetrics);
        }
        closeConfirmModal();
    };

    return (
        <AuthenticatedLayout user={auth.user} headerTitle={isEdit ? `Edit: ${benchmark.name}` : "Buat Player Benchmark"}>
            <Head title="Player Benchmark Form" />

            <div className="w-full pb-12 space-y-4">
                <Link 
                    href={route('players.benchmarks.index')} 
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors w-max"
                >
                    <ArrowLeft size={14} strokeWidth={2.5} /> Kembali ke Daftar
                </Link>

                <form onSubmit={submit} className="space-y-4">
                    
                    {/* Header Kontrol */}
                    <div className="bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 transition-all">
                        <div className="w-full md:w-1/3 relative">
                            <label className="block text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <Target size={12} strokeWidth={3} />
                                Nama Benchmark Target
                            </label>
                            <input 
                                type="text" required
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all shadow-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                                placeholder="Contoh: Target Fisik MD-1"
                            />
                            {errors.name && <span className="absolute -bottom-4 left-0 text-red-500 text-[10px] font-bold">{errors.name}</span>}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button 
                                type="button" 
                                onClick={() => openConfirmModal('clear', 'Kosongkan Form?', 'Apakah Anda yakin ingin mengosongkan semua isian target pemain di tabel ini?')} 
                                className="px-3 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-500 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1.5 active:scale-95 shadow-sm"
                            >
                                <Eraser size={12} strokeWidth={2.5} /> Kosongkan
                            </button>
                            <button 
                                type="button" 
                                onClick={() => openConfirmModal('highest', 'Set Semua dari Highest?', 'Ambil data snapshot dari Highest Record saat ini? Angka ini akan disimpan permanen sebagai Benchmark Target.')} 
                                className="px-3 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1.5 active:scale-95 shadow-sm"
                            >
                                <Zap size={12} strokeWidth={2.5} /> Set dari Highest
                            </button>
                            <button 
                                disabled={processing} 
                                className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-[11px] font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 active:scale-[0.98]"
                            >
                                {processing ? <Loader2 size={12} strokeWidth={2.5} className="animate-spin" /> : <Save size={12} strokeWidth={2.5} />} 
                                Simpan Target
                            </button>
                        </div>
                    </div>

                    {/* Tabel Input Matriks */}
                    <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto relative [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-zinc-50 dark:[&::-webkit-scrollbar-track]:bg-zinc-900 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 pb-1">
                            <table className="w-max min-w-full text-left whitespace-nowrap text-[10px] border-collapse tabular-nums">
                                <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
                                    <tr>
                                        <th className="p-3 font-black text-zinc-500 dark:text-zinc-400 sticky left-0 z-20 bg-zinc-50 dark:bg-[#111113] shadow-[4px_0_12px_rgba(0,0,0,0.03)] uppercase tracking-widest w-48 border-r border-zinc-200 dark:border-zinc-800">
                                            NAMA PEMAIN
                                        </th>
                                        <th className="p-3 font-black text-zinc-500 dark:text-zinc-400 text-center uppercase tracking-widest border-r border-zinc-200 dark:border-zinc-800">
                                            POS
                                        </th>
                                        {BENCHMARK_COLUMNS.map(col => (
                                            <th key={col.id} className="p-2 font-black text-zinc-500 dark:text-zinc-400 text-center uppercase tracking-widest min-w-[64px]">
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-[#0a0a0a]">
                                    {players.map((player, idx) => {
                                        const highest = typeof player.highest_metrics === 'string' ? JSON.parse(player.highest_metrics) : (player.highest_metrics || {});
                                        return (
                                            <tr key={player.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors group">
                                                <td className="p-2.5 font-bold text-zinc-900 dark:text-zinc-100 sticky left-0 z-10 bg-white dark:bg-[#0a0a0a] group-hover:bg-zinc-50/50 dark:group-hover:bg-zinc-900/30 shadow-[4px_0_12px_rgba(0,0,0,0.03)] truncate w-48 border-r border-zinc-100 dark:border-zinc-800/60 text-[11px]">
                                                    {player.name}
                                                </td>
                                                <td className="p-2.5 font-bold text-zinc-500 dark:text-zinc-400 text-center border-r border-zinc-100 dark:border-zinc-800/60 text-[10px]">
                                                    {player.position}
                                                </td>
                                                {BENCHMARK_COLUMNS.map(col => {
                                                    const isDur = col.id.includes('_dur');
                                                    return (
                                                        <td key={col.id} className="p-1.5 border-l border-zinc-100/50 dark:border-zinc-800/30">
                                                            <div className="flex flex-col items-center gap-0.5">
                                                                <input 
                                                                    type={isDur ? "text" : "number"} step={isDur ? undefined : "any"}
                                                                    value={data.metrics[player.id]?.[col.id] || ''}
                                                                    onChange={e => handleMetricChange(player.id, col.id, e.target.value)}
                                                                    onPaste={e => handleLocalPaste(e, idx, col.id)} 
                                                                    className={`text-center text-[11px] font-bold py-1 px-1.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] rounded focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 text-zinc-900 dark:text-zinc-100 outline-none transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700 shadow-sm ${isDur ? 'w-20' : 'w-16'}`}
                                                                    placeholder={isDur ? "00.00.00" : "-"}
                                                                />
                                                                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 tracking-tight" title="Highest Record Pemain">
                                                                    Max: {highest[col.id] || '-'}
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

            {/* Custom Modal Konfirmasi */}
            <Modal show={confirmModal.isOpen} onClose={closeConfirmModal} maxWidth="sm">
                <div className="p-6 bg-white dark:bg-[#0a0a0a] rounded-xl relative overflow-hidden border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 shrink-0 rounded-full border shadow-sm flex items-center justify-center ${
                            confirmModal.type === 'clear' 
                                ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-500' 
                                : 'bg-zinc-100 text-zinc-900 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100'
                        }`}>
                            <AlertTriangle size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 mb-1 leading-tight">
                                {confirmModal.title}
                            </h2>
                            <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                                {confirmModal.message}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-2">
                        <button 
                            onClick={closeConfirmModal} 
                            className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs font-bold rounded-lg transition-colors active:scale-95 shadow-sm"
                        >
                            Batal
                        </button>
                        <button 
                            onClick={executeAction} 
                            className={`px-5 py-2 text-white text-xs font-bold rounded-lg transition-all active:scale-95 shadow-sm ${
                                confirmModal.type === 'clear' 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 dark:text-zinc-900'
                            }`}
                        >
                            Ya, Lanjutkan
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}