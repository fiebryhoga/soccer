// resources/js/Pages/Benchmarks/Show.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Edit2, Target } from 'lucide-react';
import { BENCHMARK_METRICS, POSITIONS } from '@/Constants/metrics';

export default function Show({ auth, benchmark }) {
    
    // Ambil metrik yang diatur pada benchmark ini saja
    const activeMetrics = BENCHMARK_METRICS.filter(m => Object.keys(benchmark.metrics).includes(m.id));

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle="Detail Benchmark"
            headerDescription="Tinjau angka target performa fisik untuk masing-masing posisi pemain."
        >
            <Head title={benchmark.name} />

            <div className="w-full pb-12 space-y-6">
                
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <Link href={route('benchmarks.index')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-sm font-medium">
                        <ChevronLeft size={18} /> Kembali
                    </Link>
                    <Link href={route('benchmarks.edit', benchmark.id)} className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all">
                        <Edit2 size={16} /> Edit Data
                    </Link>
                </div>

                <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100">
                                <Target size={20} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{benchmark.name}</h2>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 ml-12">Tabel distribusi target fisik per posisi.</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50/80 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4 font-semibold w-1/3 tracking-wider">Variabel Metrik</th>
                                    {POSITIONS.map(pos => (
                                        <th key={pos} className="px-4 py-4 font-medium text-center w-24 tracking-wider">{pos}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                                {activeMetrics.map(m => (
                                    <tr key={m.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-zinc-700 dark:text-zinc-300">
                                            {m.label}
                                        </td>
                                        {POSITIONS.map(pos => {
                                            const val = benchmark.metrics[m.id]?.[pos];
                                            return (
                                                <td key={pos} className="px-4 py-2 text-center">
                                                    <div className='w-full py-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900'>
                                                    <span className={`font-mono text-xs ${val ? 'text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-300 dark:text-zinc-700'}`}>
                                                        {val || '-'}
                                                    </span>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}