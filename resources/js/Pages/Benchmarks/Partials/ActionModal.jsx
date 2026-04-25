// resources/js/Pages/Benchmarks/Partials/ActionModal.jsx

import { useEffect, useState } from 'react';
import { AlertTriangle, Copy, X, Loader2 } from 'lucide-react';

export default function ActionModal({ isOpen, onClose, onConfirm, type, benchmark, processing }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShow(true);
            document.body.style.overflow = 'hidden';
        } else {
            setTimeout(() => setShow(false), 300);
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [isOpen]);

    if (!isOpen && !show) return null;

    const isDelete = type === 'delete';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop Blur Premium */}
            <div 
                className={`absolute inset-0 bg-white/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={!processing ? onClose : undefined}
            />

            {/* Modal Box - Monochrome */}
            <div 
                className={`relative w-full max-w-md bg-white dark:bg-[#09090b] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden transition-all duration-300 transform ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
            >
                <div className="p-6 sm:p-8">
                    {/* Header Icon & Close */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                            {isDelete ? <AlertTriangle size={24} strokeWidth={2.5} /> : <Copy size={24} strokeWidth={2.5} />}
                        </div>
                        <button onClick={onClose} disabled={processing} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50">
                            <X size={16} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">
                        {isDelete ? 'Hapus Benchmark?' : 'Duplikat Benchmark?'}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                        {isDelete 
                            ? <>Anda yakin ingin menghapus target <span className="font-bold text-zinc-900 dark:text-zinc-200">{benchmark?.name}</span>? Tindakan ini tidak dapat dibatalkan.</>
                            : <>Anda akan menduplikat <span className="font-bold text-zinc-900 dark:text-zinc-200">{benchmark?.name}</span>. Semua variabel dan angka target akan disalin secara otomatis.</>
                        }
                    </p>

                    {/* Actions - Strict Black/White styling */}
                    <div className="flex items-center gap-3 w-full">
                        <button 
                            onClick={onClose} 
                            disabled={processing}
                            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button 
                            onClick={() => onConfirm(benchmark?.id)} 
                            disabled={processing}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-70 shadow-sm"
                        >
                            {processing && <Loader2 size={16} className="animate-spin" />}
                            {!processing && (isDelete ? 'Ya, Hapus' : 'Ya, Lanjutkan')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}