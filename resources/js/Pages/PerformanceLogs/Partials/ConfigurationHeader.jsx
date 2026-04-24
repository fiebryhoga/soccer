import React from 'react';
import { Zap, AlertCircle } from 'lucide-react';

export default function ConfigurationHeader({ data, setData, benchmarks, errors }) {
    return (
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#121212] flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex w-full lg:w-2/3 gap-4">
                {/* INPUT JUDUL SESI */}
                <div className="flex-1">
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                        Judul / Nama Sesi <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="text" 
                        value={data.title} 
                        onChange={e => setData('title', e.target.value)} 
                        className={`w-full bg-white dark:bg-zinc-900 border text-zinc-900 dark:text-zinc-100 rounded-lg text-[11px] py-1.5 px-3 focus:ring-1 outline-none transition-colors
                            ${errors?.title ? 'border-red-500 focus:ring-red-500' : 'border-zinc-300 dark:border-zinc-700 focus:ring-zinc-400'}
                        `} 
                        placeholder="Masukkan judul sesi..."
                        required 
                    />
                    {errors?.title && (
                        <div className="flex items-center gap-1 mt-1 text-[9px] text-red-500 font-medium">
                            <AlertCircle size={10} /> {errors.title}
                        </div>
                    )}
                </div>

                {/* SELECT BENCHMARK */}
                <div className="flex-1">
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                        Benchmark Acuan <span className="text-red-500">*</span>
                    </label>
                    <select 
                        value={data.benchmark_id || ''} // Pastikan string kosong jika null agar placeholder muncul
                        onChange={e => setData('benchmark_id', e.target.value)} 
                        className={`w-full bg-white dark:bg-zinc-900 border text-zinc-900 dark:text-zinc-100 rounded-lg text-[11px] py-1.5 px-3 focus:ring-1 outline-none transition-colors cursor-pointer
                            ${errors?.benchmark_id || !data.benchmark_id ? 'border-red-500 focus:ring-red-500 bg-red-50/30 dark:bg-red-900/10' : 'border-zinc-300 dark:border-zinc-700 focus:ring-zinc-400'}
                        `} 
                        required
                    >
                        <option value="" disabled>-- Wajib Pilih Benchmark --</option>
                        {benchmarks?.map(bm => (
                            <option key={bm.id} value={bm.id}>{bm.name}</option>
                        ))}
                    </select>
                    
                    {/* Pesan Error: Jika dari backend gagal, ATAU jika user belum memilih sama sekali secara visual */}
                    {(errors?.benchmark_id || !data.benchmark_id) && (
                        <div className="flex items-center gap-1 mt-1 text-[9px] text-red-500 font-medium animate-pulse">
                            <AlertCircle size={10} /> 
                            {errors?.benchmark_id ? errors.benchmark_id : 'Benchmark wajib dipilih sebelum menyimpan data!'}
                        </div>
                    )}
                </div>
            </div>

            {/* INFO PANEL */}
            <div className="w-full lg:w-auto bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-2.5 rounded-lg flex items-center gap-2">
                <Zap size={14} className="text-amber-500 shrink-0" />
                <p className="text-[9px] text-amber-700 dark:text-amber-400 font-medium">
                    Tahan & geser ikon titik enam pada baris tabel untuk merombak urutan pemain.<br/>
                    Rekor "Highest" akan terupdate otomatis jika pecah rekor.
                </p>
            </div>
        </div>
    );
}