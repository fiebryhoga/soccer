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

            {/* Dihapus max-w-4xl mx-auto agar Fluid Full-Width */}
            <div className="w-full space-y-6 pb-12">
                
                <Link 
                    href={route('players.benchmarks.index')} 
                    className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                    <ArrowLeft size={14} strokeWidth={2.5} /> Kembali ke Daftar
                </Link>

                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm transition-all">
                    
                    {/* Header Form */}
                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-50/50 dark:bg-[#09090b]/50">
                        <div>
                            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                                <Target className="text-zinc-500 dark:text-zinc-400" size={20} strokeWidth={2.5} /> 
                                Personal Target
                            </h3>
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                                Sesuaikan batas maksimal kemampuan fisik personal pemain.
                            </p>
                        </div>
                        <button 
                            type="button" 
                            onClick={loadFromHighest}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95"
                        >
                            <Zap size={14} strokeWidth={2} /> Tarik dari Highest Record
                        </button>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={submit} className="p-6">
                        {/* Grid disesuaikan menjadi 4 kolom di layar besar (xl) agar tidak terlalu lebar/kosong */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {metricColumns.map(col => (
                                <div key={col.id} className="space-y-2.5">
                                    <label className="flex items-center justify-between text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                                        <span className="truncate pr-2">{col.label}</span>
                                        {/* Label Max dengan gaya badge monochrome */}
                                        <span className="shrink-0 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded-md lowercase font-bold text-[9px] shadow-sm">
                                            Max: {player.highest_metrics?.[col.id] || '-'}
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            step="any"
                                            value={data.benchmark_metrics[col.id] || ''}
                                            onChange={e => setData('benchmark_metrics', { ...data.benchmark_metrics, [col.id]: e.target.value })}
                                            className="w-full bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-bold focus:ring-zinc-900 focus:border-zinc-900 dark:focus:ring-zinc-100 dark:focus:border-zinc-100 text-zinc-900 dark:text-zinc-100 transition-all shadow-sm py-2.5 px-3 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                                            placeholder="0.0"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer Action */}
                        <div className="flex justify-end pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                            <button 
                                disabled={processing}
                                className="flex items-center gap-2 px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-all disabled:opacity-50 active:scale-[0.98] shadow-md"
                            >
                                {processing ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} strokeWidth={2.5} />}
                                Simpan Benchmark
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}