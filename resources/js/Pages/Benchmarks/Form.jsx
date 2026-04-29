// resources/js/Pages/Benchmarks/Form.jsx

import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, Save, Loader2, Info } from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

// 1. IMPORT DARI METRICS.JS (JANGAN DITULIS MANUAL LAGI)
import { BENCHMARK_COLUMNS, POSITIONS } from '@/Constants/metrics';

export default function BenchmarkForm({ auth, benchmark }) {
    // Inisialisasi metrics default
    let defaultMetrics = {};
    BENCHMARK_COLUMNS.forEach(col => {
        defaultMetrics[col.id] = { CB: '', FB: '', MF: '', WF: '', FW: '' };
    });

    // Jika sedang edit, gabungkan dengan data yang ada
    if (benchmark?.metrics) {
        BENCHMARK_COLUMNS.forEach(col => {
            if (benchmark.metrics[col.id]) {
                POSITIONS.forEach(pos => {
                    defaultMetrics[col.id][pos] = benchmark.metrics[col.id][pos] ?? '';
                });
            }
        });
    }

    const { data, setData, post, patch, processing, errors } = useForm({
        name: benchmark?.name || '',
        metrics: defaultMetrics
    });

    const handleMetricChange = (colId, pos, value) => {
        setData('metrics', {
            ...data.metrics,
            [colId]: {
                ...data.metrics[colId],
                [pos]: value
            }
        });
    };

    // FUNGSI SMART PASTE EXCEL KHUSUS BENCHMARK
    const handlePaste = (e, startRowIdx, startColId) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text');
        if (!pasteData) return;

        const rows = pasteData.split(/\r?\n/).map(r => r.split('\t'));
        let newMetrics = JSON.parse(JSON.stringify(data.metrics));

        const startColIdx = BENCHMARK_COLUMNS.findIndex(c => c.id === startColId);
        
        rows.forEach((row, i) => {
            if (row.length === 1 && row[0] === '') return;
            
            const targetPosIdx = startRowIdx + i;
            if (targetPosIdx < POSITIONS.length) {
                const pos = POSITIONS[targetPosIdx];
                // Buang persentase jika tak sengaja ikut tercopy
                let valuesToPaste = row.filter(val => !val.includes('%'));
                
                // Jika user tak sengaja ikut meng-copy nama POSISI di kolom pertama, buang teks tersebut
                if (POSITIONS.includes(valuesToPaste[0]?.toUpperCase().trim())) {
                    valuesToPaste.shift();
                }

                valuesToPaste.forEach((val, j) => {
                    const targetColIdx = startColIdx + j;
                    if (targetColIdx >= 0 && targetColIdx < BENCHMARK_COLUMNS.length) {
                        const colId = BENCHMARK_COLUMNS[targetColIdx].id;
                        newMetrics[colId][pos] = val.replace(',', '.').trim();
                    }
                });
            }
        });

        setData('metrics', newMetrics);
    };

    const submit = (e) => {
        e.preventDefault();
        if (benchmark) {
            patch(route('benchmarks.update', benchmark.id));
        } else {
            post(route('benchmarks.store'));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} headerTitle={benchmark ? 'Edit Benchmark' : 'Buat Benchmark Baru'} headerDescription="Tetapkan standar performa tim secara mutlak.">
            <Head title={benchmark ? 'Edit Benchmark' : 'Buat Benchmark Baru'} />

            <div className="max-w-[100rem] mx-auto pb-12 space-y-6">
                <Link href={route('benchmarks.index')} className="inline-flex items-center gap-2 text-[11px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors uppercase tracking-widest">
                    <ArrowLeft size={14} strokeWidth={2.5}/> Kembali
                </Link>

                <form onSubmit={submit} className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                        <InputLabel value="Nama Benchmark (Contoh: Standar Liga 1 2026)" className="text-zinc-700 dark:text-zinc-300" />
                        <TextInput 
                            className="mt-1 w-full md:w-1/2 bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800" 
                            value={data.name} 
                            onChange={e => setData('name', e.target.value)} 
                            required 
                        />
                        <InputError message={errors.name} className="mt-1" />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                        <Info size={16} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                            <strong>Smart Paste:</strong> Anda bisa langsung memblok area tabel dari Excel (Mulai dari CB/7000 sampai pojok kanan bawah), lalu Paste (Ctrl+V) ke dalam kotak mana saja di bawah.
                        </span>
                    </div>

                    <div className="p-0 overflow-x-auto relative [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-zinc-50 dark:[&::-webkit-scrollbar-track]:bg-[#09090b] [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full pb-2">
                        <table className="w-full text-left whitespace-nowrap text-[11px] border-collapse">
                            <thead className="bg-zinc-50 dark:bg-[#09090b]">
                                <tr>
                                    <th className="p-3 border-b border-r border-zinc-200 dark:border-zinc-800 font-black text-center text-zinc-500 sticky left-0 z-20 bg-zinc-50 dark:bg-[#09090b] shadow-[inset_-1px_0_0_0_#e4e4e7] dark:shadow-[inset_-1px_0_0_0_#27272a]">POS</th>
                                    {BENCHMARK_COLUMNS.map(col => (
                                        <th key={col.id} className="p-3 border-b border-r border-zinc-200 dark:border-zinc-800 font-black tracking-wider text-center text-zinc-700 dark:text-zinc-300">
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-[#09090b]">
                                {POSITIONS.map((pos, idx) => (
                                    <tr key={pos} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                                        <td className="p-3 border-r border-zinc-200 dark:border-zinc-800 semibold text-black dark:text-white text-center sticky left-0 z-10 bg-white dark:bg-[#09090b] group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/50 shadow-[inset_-1px_0_0_0_#e4e4e7] dark:shadow-[inset_-1px_0_0_0_#27272a]">
                                            {pos}
                                        </td>
                                        {BENCHMARK_COLUMNS.map(col => (
                                            <td key={col.id} className="p-1.5 border-r border-zinc-200 dark:border-zinc-800">
                                                <input 
                                                    type="text"
                                                    className="w-full text-center text-[11px] font-bold py-1.5 px-1 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 rounded bg-transparent transition-all outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                                                    value={data.metrics[col.id]?.[pos] ?? ''}
                                                    onChange={e => handleMetricChange(col.id, pos, e.target.value)}
                                                    onPaste={e => handlePaste(e, idx, col.id)}
                                                    placeholder="-"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/30 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                        <button disabled={processing} className="px-8 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-colors shadow-sm">
                            {processing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} strokeWidth={2.5} />}
                            Simpan Benchmark
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}