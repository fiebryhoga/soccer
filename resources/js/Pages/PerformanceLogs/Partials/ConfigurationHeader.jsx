// resources/js/Pages/PerformanceLogs/Partials/ConfigurationHeader.jsx

import React from 'react';
import { AlertCircle, Info, AlignLeft, Target, ChevronDown } from 'lucide-react';

export default function ConfigurationHeader({ data, setData, benchmarks, errors }) {
    
    const hasBenchmarkError = errors?.benchmark_id || !data.benchmark_id;

    return (
        <div className="p-5 lg:p-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col xl:flex-row gap-6 lg:gap-8 items-start xl:items-center justify-between transition-colors">
            
            <div className="flex w-full xl:w-2/3 flex-col sm:flex-row gap-5 lg:gap-6">
                
                {/* INPUT JUDUL SESI */}
                <div className="flex-1 space-y-2 relative group">
                    <label className="flex items-center gap-1.5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        <AlignLeft size={12} strokeWidth={3} className="text-zinc-400" /> 
                        Judul / Nama Sesi 
                        <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="text" 
                        value={data.title} 
                        onChange={e => setData('title', e.target.value)} 
                        className={`w-full bg-transparent border rounded-lg text-sm font-bold py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-zinc-950 transition-all shadow-sm
                            ${errors?.title 
                                ? 'border-red-300 dark:border-red-500/50 text-red-900 dark:text-red-100 focus:ring-red-500/50 bg-red-50/30 dark:bg-red-500/5' 
                                : 'border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-600 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-zinc-900/20 dark:focus:ring-zinc-100/20'}
                        `} 
                        placeholder="Contoh: Recovery Day, Internal Game..."
                        required 
                    />
                    {errors?.title && (
                        <div className="flex items-center gap-1.5 text-[10px] text-red-500 dark:text-red-400 font-bold tracking-wide mt-1">
                            <AlertCircle size={12} strokeWidth={2.5} /> {errors.title}
                        </div>
                    )}
                </div>

                {/* SELECT BENCHMARK (NATIVE STYLED) */}
                <div className="flex-1 space-y-2 relative group">
                    <label className="flex items-center gap-1.5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        <Target size={12} strokeWidth={3} className="text-zinc-400" /> 
                        Benchmark Acuan 
                        <span className="text-red-500">*</span>
                    </label>
                    
                    <div className="relative">
                        <select
                            value={data.benchmark_id || ''}
                            onChange={e => setData('benchmark_id', e.target.value)}
                            className={`w-full appearance-none bg-transparent border rounded-lg text-sm font-bold py-2.5 pl-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-zinc-950 transition-all shadow-sm cursor-pointer
                                ${hasBenchmarkError 
                                    ? 'border-red-300 dark:border-red-500/50 text-red-600 dark:text-red-400 focus:ring-red-500/50 bg-red-50/30 dark:bg-red-500/5' 
                                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-600 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-zinc-900/20 dark:focus:ring-zinc-100/20'}
                            `}
                        >
                            <option value="" disabled className="text-zinc-500">Wajib Pilih Benchmark</option>
                            {benchmarks?.map(bm => (
                                <option key={bm.id} value={bm.id} className="text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900">
                                    {bm.name}
                                </option>
                            ))}
                        </select>
                        {/* Custom Arrow Icon untuk Select */}
                        <ChevronDown 
                            className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors
                                ${hasBenchmarkError ? 'text-red-400' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}
                            `} 
                            size={16} 
                            strokeWidth={2.5} 
                        />
                    </div>
                    
                    {hasBenchmarkError && (
                        <div className="flex items-center gap-1.5 text-[10px] text-red-500 dark:text-red-400 font-bold tracking-wide mt-1 animate-pulse">
                            <AlertCircle size={12} strokeWidth={2.5} /> 
                            {errors?.benchmark_id ? errors.benchmark_id : 'Pilih target acuan agar persentase Excel terhitung.'}
                        </div>
                    )}
                </div>
            </div>

            {/* CALLOUT / INFO PANEL */}
            <div className="w-full xl:w-[380px] bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/80 p-4 rounded-xl flex items-start gap-3.5 shadow-sm">
                <div className="p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 shrink-0 shadow-sm">
                    <Info size={16} strokeWidth={2.5} />
                </div>
                <div className="space-y-1 mt-0.5">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Tips Navigasi</h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                        Tahan & geser ikon <span className="font-bold text-zinc-700 dark:text-zinc-300">titik enam</span> di sisi kiri tabel untuk merombak urutan. Rekor tertinggi akan otomatis diperbarui saat Anda menyimpan data.
                    </p>
                </div>
            </div>

        </div>
    );
}