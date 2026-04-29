import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Target, Plus, Copy, Trash2, Edit3 } from 'lucide-react';

export default function Index({ auth, benchmarks }) {
    const handleDelete = (id, name) => {
        if (confirm(`Yakin ingin menghapus benchmark pemain "${name}"?`)) {
            router.delete(route('players.benchmarks.destroy', id));
        }
    };

    const handleDuplicate = (id) => {
        router.post(route('players.benchmarks.duplicate', id));
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle="Player Benchmarks"
            headerDescription="Kelola profil target metrik individu (Misal: Target Pemain MD-1, Target Match)."
        >
            <Head title="Player Benchmarks" />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex justify-between items-center bg-white dark:bg-[#0a0a0a] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-2">
                        <Target size={18} className="text-blue-500"/> Daftar Player Benchmark
                    </h2>
                    <Link href={route('players.benchmarks.create')} className="px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-lg shadow-sm hover:opacity-90 flex items-center gap-2 transition-all">
                        <Plus size={16} /> Buat Benchmark Pemain Baru
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {benchmarks.map((benchmark) => (
                        <div key={benchmark.id} className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl shadow-sm hover:border-blue-500 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-black text-lg text-zinc-900 dark:text-zinc-100">{benchmark.name}</h3>
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded uppercase tracking-widest">Player Target</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <Link href={route('players.benchmarks.edit', benchmark.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-xs font-bold transition-colors">
                                    <Edit3 size={14}/> Edit
                                </Link>
                                <button onClick={() => handleDuplicate(benchmark.id)} className="p-2 text-zinc-400 hover:text-blue-600 bg-zinc-50 dark:bg-zinc-900 rounded-lg transition-colors" title="Duplikasi">
                                    <Copy size={16}/>
                                </button>
                                <button onClick={() => handleDelete(benchmark.id, benchmark.name)} className="p-2 text-zinc-400 hover:text-red-600 bg-zinc-50 dark:bg-zinc-900 rounded-lg transition-colors" title="Hapus">
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>
                    ))}
                    {benchmarks.length === 0 && (
                        <div className="col-span-full p-8 text-center text-zinc-500 text-sm font-semibold border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                            Belum ada Benchmark Pemain yang dibuat.
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}