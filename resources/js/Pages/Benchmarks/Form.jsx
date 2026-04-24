import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { ChevronLeft, Save, CheckCircle2, LayoutGrid, Target, Loader2 } from 'lucide-react';
import { MASTER_METRICS, POSITIONS } from '@/Constants/metrics';

export default function Form({ auth, benchmark = null }) {
    const isEditing = !!benchmark;

    const { data, setData, post, patch, processing, errors } = useForm({
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

    return (
        <AuthenticatedLayout user={auth.user} headerTitle={isEditing ? "Edit Benchmark" : "Benchmark Baru"}>
            <Head title="Configure Benchmark" />

            <form onSubmit={submit} className="max-w-5xl space-y-6 pb-20">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <Link href={route('benchmarks.index')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-medium">
                        <ChevronLeft size={18} /> Kembali ke Daftar
                    </Link>
                    <button disabled={processing} className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-2 rounded-xl text-sm font-bold shadow-lg hover:scale-105 active:scale-95 transition-all">
                        {processing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {isEditing ? "Simpan Perubahan" : "Buat Benchmark"}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Panel Kiri: Info Dasar & Pemilihan Metrik */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Nama Benchmark</label>
                            <input 
                                type="text" 
                                value={data.name} 
                                onChange={e => setData('name', e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-zinc-500"
                                placeholder="Misal: Target Match Day"
                                required
                            />
                        </div>

                        <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <LayoutGrid size={16} className="text-blue-500" />
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Pilih Variabel</h3>
                            </div>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                {MASTER_METRICS.map(m => (
                                    <label key={m.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedIds.includes(m.id) ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800' : 'border-zinc-100 dark:border-zinc-900'}`}>
                                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{m.label}</span>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedIds.includes(m.id)}
                                            onChange={() => toggleVariable(m.id)}
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Panel Kanan: Input Angka Target */}
                    <div className="lg:col-span-2">
                        {selectedIds.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-400">
                                <Target size={48} className="mb-4 opacity-20" />
                                <p className="text-sm">Pilih variabel di sebelah kiri untuk mengatur target.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {selectedIds.map(id => (
                                    <div key={id} className="bg-white dark:bg-[#0a0a0a] p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
                                            <CheckCircle2 size={14} /> {MASTER_METRICS.find(m => m.id === id)?.label}
                                        </p>
                                        <div className="grid grid-cols-5 gap-3">
                                            {POSITIONS.map(pos => (
                                                <div key={pos}>
                                                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5 text-center">{pos}</label>
                                                    <input 
                                                        type="number" 
                                                        step="any"
                                                        value={data.metrics[id]?.[pos] || ''}
                                                        onChange={e => handleTargetChange(id, pos, e.target.value)}
                                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-lg text-center text-xs font-mono py-2"
                                                        placeholder="0"
                                                        required
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}