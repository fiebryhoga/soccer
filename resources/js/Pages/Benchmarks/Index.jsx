import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react'; // <-- Link DITAMBAHKAN DI SINI
import { Target, Plus, Trash2, Edit2 } from 'lucide-react';
import { MASTER_METRICS } from '@/Constants/metrics';

export default function Index({ auth, benchmarks }) {
    
    const deleteBenchmark = (id) => {
        if (confirm('Yakin ingin menghapus Benchmark ini?')) {
            router.delete(route('benchmarks.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} headerTitle="Master Benchmark" headerDescription="Buat target metrik fisik untuk berbagai jenis sesi latihan/pertandingan.">
            <Head title="Benchmarks" />

            <div className="max-w-6xl pb-12 space-y-6">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white dark:bg-[#0a0a0a] p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                    <div>
                        <h2 className="font-bold text-xl text-zinc-900 dark:text-zinc-100">Daftar Benchmark</h2>
                        <p className="text-sm text-zinc-500 mt-1">Target fisik per posisi untuk evaluasi performa.</p>
                    </div>
                    <Link 
                        href={route('benchmarks.create')} 
                        className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                    >
                        <Plus size={18} /> Buat Target Baru
                    </Link>
                </div>

                {/* Grid List Item */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {benchmarks.map(bm => (
                        <div key={bm.id} className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group">
                            
                            {/* Card Header (Icon & Actions) */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                                    <Target size={20} />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link href={route('benchmarks.edit', bm.id)} className="p-2 text-zinc-400 hover:text-blue-500 bg-zinc-50 dark:bg-zinc-900 rounded-lg transition-colors" title="Edit">
                                        <Edit2 size={14} />
                                    </Link>
                                    <button onClick={() => deleteBenchmark(bm.id)} className="p-2 text-zinc-400 hover:text-red-500 bg-zinc-50 dark:bg-zinc-900 rounded-lg transition-colors" title="Hapus">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Card Body */}
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-1">{bm.name}</h3>
                            <p className="text-xs text-zinc-500 mb-4">{Object.keys(bm.metrics).length} Variabel Metrik Aktif</p>
                            
                            {/* Tags Preview */}
                            <div className="flex flex-wrap gap-1.5">
                                {Object.keys(bm.metrics).slice(0, 4).map(key => (
                                    <span key={key} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-[9px] font-bold text-zinc-500 dark:text-zinc-400 rounded uppercase">
                                        {/* Menghapus kata '_distance' agar badge tidak terlalu panjang */}
                                        {key.replace('_distance', '')} 
                                    </span>
                                ))}
                                {Object.keys(bm.metrics).length > 4 && (
                                    <span className="text-[9px] text-zinc-400 font-bold px-1 py-0.5 flex items-center">
                                        +{Object.keys(bm.metrics).length - 4} More
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Jika Belum Ada Data */}
                    {benchmarks.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-400">
                            <Target size={48} className="mb-4 opacity-20" />
                            <p className="text-sm font-medium">Belum ada Benchmark yang dibuat.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}