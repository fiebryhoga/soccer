// resources/js/Pages/Benchmarks/Form.jsx

import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { ChevronLeft, Save, LayoutGrid, Target, Loader2, CheckSquare, Square } from 'lucide-react';
import { BENCHMARK_METRICS, POSITIONS } from '@/Constants/metrics';

export default function Form({ auth, benchmark = null }) {
    const isEditing = !!benchmark;

    const { data, setData, post, patch, processing } = useForm({
        name: benchmark?.name || '',
        metrics: benchmark?.metrics || {},
    });

    const [selectedIds, setSelectedIds] = useState(Object.keys(benchmark?.metrics || {}));

    const toggleVariable = (id) => {
        let newIds = [...selectedIds];
        let newMetrics = { ...data.metrics };

        if (newIds.includes(id)) {
            newIds = newIds.filter(i => i !== id);
            delete newMetrics[id];
        } else {
            newIds.push(id);
            newMetrics[id] = { CB: '', FB: '', MF: '', WF: '', FW: '' };
        }
        
        setSelectedIds(newIds);
        setData('metrics', newMetrics);
    };

    const handleSelectAll = () => {
        if (selectedIds.length === BENCHMARK_METRICS.length) {
            setSelectedIds([]);
            setData('metrics', {});
        } else {
            const allIds = BENCHMARK_METRICS.map(m => m.id);
            const newMetrics = {};
            allIds.forEach(id => {
                newMetrics[id] = data.metrics[id] || { CB: '', FB: '', MF: '', WF: '', FW: '' };
            });
            setSelectedIds(allIds);
            setData('metrics', newMetrics);
        }
    };

    const handleTargetChange = (metricId, pos, value) => {
        setData('metrics', {
            ...data.metrics,
            [metricId]: { ...data.metrics[metricId], [pos]: value }
        });
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) patch(route('benchmarks.update', benchmark.id));
        else post(route('benchmarks.store'));
    };

    const isAllSelected = selectedIds.length === BENCHMARK_METRICS.length && BENCHMARK_METRICS.length > 0;

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle={isEditing ? "Edit Benchmark" : "Benchmark Baru"}
            headerDescription={isEditing ? "Perbarui variabel dan target performa untuk benchmark ini." : "Tentukan variabel dan angka target untuk standar performa baru."}
        >
            <Head title="Configure Benchmark" />

            <form onSubmit={submit} className="w-full space-y-6 pb-20">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <Link href={route('benchmarks.index')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-sm font-medium">
                        <ChevronLeft size={18} /> Kembali
                    </Link>
                    <button disabled={processing} className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-70">
                        {processing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {isEditing ? "Simpan Perubahan" : "Simpan Benchmark"}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Panel Kiri: Info Dasar & Pemilihan Metrik */}
                    <div className="lg:col-span-4 space-y-5 sticky top-6">
                        <div className="bg-white dark:bg-[#09090b] p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Nama Benchmark</label>
                            <input 
                                type="text" 
                                value={data.name} 
                                onChange={e => setData('name', e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-zinc-900 dark:focus:ring-zinc-100 text-sm font-semibold text-zinc-900 dark:text-zinc-100 transition-colors"
                                placeholder="Contoh: Target Match Day"
                                required
                            />
                        </div>

                        <div className="bg-white dark:bg-[#09090b] p-0 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-[500px]">
                            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/30">
                                <div className="flex items-center gap-2">
                                    <LayoutGrid size={16} className="text-zinc-700 dark:text-zinc-300" />
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Variabel Metrik</h3>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={handleSelectAll}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                                >
                                    {isAllSelected ? <CheckSquare size={14}/> : <Square size={14}/>}
                                    {isAllSelected ? 'Hapus Semua' : 'Pilih Semua'}
                                </button>
                            </div>
                            
                            <div className="p-3 overflow-y-auto space-y-1 flex-1">
                                {BENCHMARK_METRICS.map(m => (
                                    <label key={m.id} className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${selectedIds.includes(m.id) ? 'bg-zinc-100 border-zinc-300 dark:bg-zinc-800/80 dark:border-zinc-700' : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/50'}`}>
                                        <span className={`text-xs font-semibold ${selectedIds.includes(m.id) ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                            {m.label}
                                        </span>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedIds.includes(m.id)}
                                            onChange={() => toggleVariable(m.id)}
                                            className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:checked:bg-zinc-100 dark:focus:ring-zinc-100 dark:checked:border-zinc-100 transition-all"
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Panel Kanan: Input Angka Target */}
                    <div className="lg:col-span-8">
                        {selectedIds.length === 0 ? (
                            <div className="h-[400px] flex flex-col items-center justify-center p-12 bg-white dark:bg-[#09090b] border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-400">
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-full mb-4 border border-zinc-100 dark:border-zinc-800">
                                    <Target size={32} className="text-zinc-400 dark:text-zinc-600" />
                                </div>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Pilih variabel di panel kiri untuk mengatur target.</p>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                                {/* Header Table Custom */}
                                <div className="grid grid-cols-7 gap-3 px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/50">
                                    <div className="col-span-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center">Nama Variabel</div>
                                    {POSITIONS.map(pos => (
                                        <div key={pos} className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-center">{pos}</div>
                                    ))}
                                </div>
                                
                                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                                    {BENCHMARK_METRICS.filter(m => selectedIds.includes(m.id)).map(m => (
                                        <div key={m.id} className="grid grid-cols-7 gap-3 px-5 py-3 items-center hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10 transition-colors">
                                            <div className="col-span-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                                {m.label}
                                            </div>
                                            {POSITIONS.map(pos => (
                                                <div key={pos}>
                                                    <input 
                                                        type="number" 
                                                        step="any"
                                                        value={data.metrics[m.id]?.[pos] || ''}
                                                        onChange={e => handleTargetChange(m.id, pos, e.target.value)}
                                                        className="w-full bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg text-center text-xs font-mono py-2 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 shadow-sm transition-colors"
                                                        placeholder="0"
                                                        required
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}