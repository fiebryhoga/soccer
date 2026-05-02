import React from 'react';
import { Trash2, Edit, Calendar } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';

export default function CompositionHistory({ history, onEdit }) {
    // Mengecek apakah user yang login adalah admin
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.role === 'admin';

    if (!history || history.length === 0) {
        return (
            <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 text-center shadow-sm">
                <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">Belum ada riwayat tes untuk pemain ini.</p>
            </div>
        );
    }

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus data riwayat ini secara permanen?')) {
            router.delete(route('analysis.composition.destroy', id), {
                preserveScroll: true
            });
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden animate-in fade-in duration-500 mt-6 md:mt-8">
            <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#111113]">
                <h3 className="font-black text-sm text-zinc-900 dark:text-white uppercase tracking-widest">Riwayat Pengukuran</h3>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                            <th className="p-4 font-black">Tanggal</th>
                            <th className="p-4 font-black">Berat (Kg)</th>
                            <th className="p-4 font-black">Body Fat (%)</th>
                            <th className="p-4 font-black">Muscle (Kg)</th>
                            <th className="p-4 font-black">TBW (%)</th>
                            {/* Hanya render kolom aksi jika user adalah Admin */}
                            {isAdmin && <th className="p-4 font-black text-right">Aksi</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        {history.map((item) => (
                            <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors group">
                                <td className="p-4 flex items-center gap-2">
                                    <Calendar size={14} className="text-blue-500"/>
                                    {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </td>
                                <td className="p-4 tabular-nums">{item.weight}</td>
                                <td className="p-4 tabular-nums text-red-500 dark:text-red-400">{item.body_fat_percentage || '-'}</td>
                                <td className="p-4 tabular-nums text-emerald-600 dark:text-emerald-400">{item.muscle_mass || '-'}</td>
                                <td className="p-4 tabular-nums text-blue-600 dark:text-blue-400">{item.total_body_water || '-'}</td>
                                
                                {/* Tombol Aksi Admin */}
                                {isAdmin && (
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => onEdit(item)} className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors shadow-sm" title="Edit Data">
                                                <Edit size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors shadow-sm" title="Hapus Data">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}