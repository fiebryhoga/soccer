// resources/js/Pages/Benchmarks/Show.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit2, Target } from 'lucide-react';
import { BENCHMARK_COLUMNS, POSITIONS } from '@/Constants/metrics';

export default function Show({ auth, benchmark }) {
    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle="Detail Benchmark"
            headerDescription="Tinjau angka target performa fisik untuk masing-masing posisi pemain."
        >
            <Head title={benchmark.name} />

            <div className="max-w-[100rem] mx-auto pb-12 space-y-6">
                <div className="flex items-center justify-between">
                    <Link href={route('benchmarks.index')} className="inline-flex items-center gap-2 text-[11px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors uppercase tracking-widest">
                        <ArrowLeft size={14} strokeWidth={2.5}/> Kembali
                    </Link>
                    <Link href={route('benchmarks.edit', benchmark.id)} className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all uppercase tracking-widest">
                        <Edit2 size={14} strokeWidth={2.5} /> Edit Data
                    </Link>
                </div>

                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100">
                                <Target size={20} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{benchmark.name}</h2>
                        </div>
                    </div>

                    <div className="p-0 overflow-x-auto relative pb-2">
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
                                {POSITIONS.map(pos => (
                                    <tr key={pos} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                                        <td className="p-3 border-r border-zinc-200 dark:border-zinc-800 font-black text-center sticky left-0 z-10 bg-white dark:bg-[#09090b] group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/50 shadow-[inset_-1px_0_0_0_#e4e4e7] dark:shadow-[inset_-1px_0_0_0_#27272a]">
                                            {pos}
                                        </td>
                                        {BENCHMARK_COLUMNS.map(col => {
                                            const val = benchmark.metrics[col.id]?.[pos];
                                            return (
                                                <td key={col.id} className="p-2 border-r border-zinc-200 dark:border-zinc-800 text-center">
                                                    <span className={`inline-block w-full py-1.5 px-2 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-bold text-[11px] ${val ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-300 dark:text-zinc-700'}`}>
                                                        {val || '-'}
                                                    </span>
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