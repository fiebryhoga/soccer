import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, Zap, ArrowLeft, Target, RefreshCw } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS } from '@/Constants/metrics';

export default function Edit({ auth, player }) {
    const { data, setData, put, processing } = useForm({
        benchmark_metrics: player.benchmark_metrics || {}
    });

    const loadFromHighest = () => {
        if (!player.highest_metrics) return alert("Pemain belum memiliki rekor tertinggi.");
        if (confirm("Tarik data dari rekor tertinggi pemain?")) {
            setData('benchmark_metrics', { ...player.highest_metrics });
        }
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('players.benchmarks.update', player.id));
    };

    const metricColumns = FIXED_EXCEL_COLUMNS.filter(col => !col.id.includes('_dur') && !['selected', 'total_duration'].includes(col.id));

    return (
        <AuthenticatedLayout user={auth.user} headerTitle={`Benchmark: ${player.name}`}>
            <Head title={`Edit Benchmark ${player.name}`} />

            <div className="max-w-4xl mx-auto space-y-6">
                <Link href={route('players.benchmarks.index')} className="text-xs font-bold text-zinc-500 flex items-center gap-2 hover:text-zinc-900 dark:hover:text-zinc-100">
                    <ArrowLeft size={14} /> Kembali ke Daftar
                </Link>

                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                                <Target className="text-blue-500" size={20} /> Personal Target
                            </h3>
                            <p className="text-xs font-semibold text-zinc-500 mt-1">Sesuaikan batas maksimal kemampuan fisik personal pemain.</p>
                        </div>
                        <button 
                            type="button" onClick={loadFromHighest}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95"
                        >
                            <Zap size={14} /> Tarik dari Highest Record
                        </button>
                    </div>

                    <form onSubmit={submit} className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                            {metricColumns.map(col => (
                                <div key={col.id} className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex justify-between">
                                        {col.label}
                                        <span className="text-amber-500 lowercase font-bold">Max: {player.highest_metrics?.[col.id] || '-'}</span>
                                    </label>
                                    <input 
                                        type="number" step="any"
                                        value={data.benchmark_metrics[col.id] || ''}
                                        onChange={e => setData('benchmark_metrics', { ...data.benchmark_metrics, [col.id]: e.target.value })}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all"
                                        placeholder="0.0"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <button 
                                disabled={processing}
                                className="flex items-center gap-2 px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                {processing ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                                Simpan Benchmark
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}