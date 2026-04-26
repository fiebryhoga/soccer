// resources/js/Pages/Benchmarks/Index.jsx

import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Target, Plus, Trash2, Edit2, Eye, Activity, Copy, MoreHorizontal } from 'lucide-react';
import ActionModal from './Partials/ActionModal';

export default function Index({ auth, benchmarks }) {
    const [modalState, setModalState] = useState({ isOpen: false, type: null, data: null });
    const [processing, setProcessing] = useState(false);

    const openModal = (type, benchmark) => setModalState({ isOpen: true, type, data: benchmark });
    const closeModal = () => {
        if (!processing) setModalState({ isOpen: false, type: null, data: null });
    };

    const confirmAction = (id) => {
        setProcessing(true);
        if (modalState.type === 'delete') {
            router.delete(route('benchmarks.destroy', id), {
                onFinish: () => { setProcessing(false); closeModal(); }
            });
        } else if (modalState.type === 'duplicate') {
            router.post(route('benchmarks.duplicate', id), {}, {
                onFinish: () => { setProcessing(false); closeModal(); }
            });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} headerTitle="Master Benchmark">
            <Head title="Benchmarks" />

            <div className="w-full pb-12 space-y-6">
                
                {/* Header Action - Monochrome Premium */}
                <div className="sticky top-0 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1rem] text-zinc-900 dark:text-zinc-100">
                            <Activity size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="font-extrabold text-xl text-zinc-900 dark:text-zinc-100 tracking-tight">Daftar Benchmark</h2>
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">Kelola target performa fisik untuk sesi latihan tim.</p>
                        </div>
                    </div>
                    <Link 
                        href={route('benchmarks.create')} 
                        className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={18} strokeWidth={2} /> Buat Target Baru
                    </Link>
                </div>

                {/* Grid List */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {benchmarks.map(bm => (
                        <div key={bm.id} className="group flex flex-col bg-white dark:bg-[#09090b] rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-300 shadow-sm hover:shadow-md">
                            
                            {/* Card Header & Floating Actions */}
                            <div className="flex justify-between items-start mb-5 relative min-h-[40px]">
                                <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-900 dark:text-zinc-100 transition-colors">
                                    <Target size={20} strokeWidth={2.5} />
                                </div>
                                
                                {/* Action Bar - Posisikan Absolute agar tidak tertimpa */}
                                <div className="absolute right-0 top-0 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-md p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                    <Link href={route('benchmarks.show', bm.id)} className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all" title="Lihat Mode Baca">
                                        <Eye size={14} strokeWidth={2}/>
                                    </Link>
                                    <button type="button" onClick={() => openModal('duplicate', bm)} className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all cursor-pointer" title="Duplikat Data">
                                        <Copy size={14} strokeWidth={2}/>
                                    </button>
                                    <Link href={route('benchmarks.edit', bm.id)} className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all" title="Edit">
                                        <Edit2 size={14} strokeWidth={2}/>
                                    </Link>
                                    <button type="button" onClick={() => openModal('delete', bm)} className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all cursor-pointer" title="Hapus">
                                        <Trash2 size={14} strokeWidth={2}/>
                                    </button>
                                </div>
                                
                                {/* Placeholder icon - WAJIB pointer-events-none agar tidak memblokir klik */}
                                <div className="absolute right-0 top-2.5 p-1 text-zinc-300 dark:text-zinc-700 group-hover:opacity-0 transition-opacity pointer-events-none z-0">
                                    <MoreHorizontal size={20} strokeWidth={2} />
                                </div>
                            </div>
                            
                            {/* Card Body */}
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-1 leading-tight capitalize line-clamp-2">{bm.name}</h3>
                                <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mb-5 tracking-wide">
                                    {Object.keys(bm.metrics).length} VARIABEL AKTIF
                                </p>
                                
                                {/* Shadcn style badges - Monochrome */}
                                <div className="flex flex-wrap gap-2">
                                    {Object.keys(bm.metrics).slice(0, 4).map(key => (
                                        <span key={key} className="inline-flex items-center px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 transition-colors">
                                            {key.replace(/_distance|_dur/g, '').replace(/_/g, ' ').toUpperCase()} 
                                        </span>
                                    ))}
                                    {Object.keys(bm.metrics).length > 4 && (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-800 dark:text-zinc-200">
                                            +{Object.keys(bm.metrics).length - 4} Lainnya
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {benchmarks.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center p-16 bg-white dark:bg-[#09090b] border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
                            <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl mb-4 border border-zinc-200 dark:border-zinc-800">
                                <Target size={28} className="text-zinc-500 dark:text-zinc-400" />
                            </div>
                            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg mb-1">Belum ada target</h3>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 text-center max-w-sm">Buat benchmark pertama Anda untuk mulai mengatur standar evaluasi fisik tim.</p>
                        </div>
                    )}
                </div>
            </div>

            <ActionModal 
                isOpen={modalState.isOpen}
                type={modalState.type}
                benchmark={modalState.data}
                onClose={closeModal}
                onConfirm={confirmAction}
                processing={processing}
            />
        </AuthenticatedLayout>
    );
}