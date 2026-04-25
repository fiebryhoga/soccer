// resources/js/Pages/PerformanceLogs/Partials/ConfigurationHeader.jsx

import React, { useMemo } from 'react';
import { AlertCircle, Info, AlignLeft, Target } from 'lucide-react';
import SelectDropdown from '@/Components/ui/SelectDropdown'; // Menggunakan custom dropdown kita

export default function ConfigurationHeader({ data, setData, benchmarks, errors }) {
    
    // Format opsi benchmark untuk SelectDropdown
    const benchmarkOptions = useMemo(() => {
        const opts = benchmarks?.map(bm => ({ value: bm.id.toString(), label: bm.name })) || [];
        return [{ value: '', label: 'Wajib Pilih Benchmark' }, ...opts];
    }, [benchmarks]);

    const hasBenchmarkError = errors?.benchmark_id || !data.benchmark_id;

    return (
        <div className="p-5 lg:p-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between transition-colors">
            
            <div className="flex w-full xl:w-2/3 flex-col sm:flex-row gap-5">
                {/* INPUT JUDUL SESI */}
                <div className="flex-1 space-y-2">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        <AlignLeft size={12} strokeWidth={2.5} /> Judul / Nama Sesi <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="text" 
                        value={data.title} 
                        onChange={e => setData('title', e.target.value)} 
                        className={`w-full bg-zinc-50/50 dark:bg-zinc-900/50 border rounded-lg text-sm font-semibold py-2.5 px-3.5 focus:outline-none focus:ring-1 transition-colors shadow-sm
                            ${errors?.title 
                                ? 'border-red-300 dark:border-red-900 text-red-900 dark:text-red-100 focus:ring-red-500 bg-red-50/50 dark:bg-red-900/10' 
                                : 'border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900 dark:focus:ring-zinc-100'}
                        `} 
                        placeholder="Contoh: Recovery Day, Internal Game..."
                        required 
                    />
                    {errors?.title && (
                        <div className="flex items-center gap-1.5 text-[10px] text-red-500 font-bold tracking-wide">
                            <AlertCircle size={12} strokeWidth={2.5} /> {errors.title}
                        </div>
                    )}
                </div>

                {/* SELECT BENCHMARK */}
                <div className="flex-1 space-y-2">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        <Target size={12} strokeWidth={2.5} /> Benchmark Acuan <span className="text-red-500">*</span>
                    </label>
                    
                    {/* Menggunakan Custom SelectDropdown */}
                    <SelectDropdown 
                        value={data.benchmark_id || ''} 
                        onChange={e => setData('benchmark_id', e.target.value)} 
                        options={benchmarkOptions}
                        className={`py-2.5 text-sm ${hasBenchmarkError ? 'border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 focus:ring-red-500 bg-red-50/50 dark:bg-red-900/10' : ''}`}
                    />
                    
                    {/* Pesan Error Benchmark */}
                    {hasBenchmarkError && (
                        <div className="flex items-center gap-1.5 text-[10px] text-red-500 font-bold tracking-wide animate-pulse">
                            <AlertCircle size={12} strokeWidth={2.5} /> 
                            {errors?.benchmark_id ? errors.benchmark_id : 'Pilih target acuan agar persentase Excel terhitung.'}
                        </div>
                    )}
                </div>
            </div>

            {/* INFO PANEL (Monochrome Premium Design) */}
            <div className="w-full xl:w-auto bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex items-start gap-3 shadow-sm">
                <div className="p-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-md text-zinc-600 dark:text-zinc-400 shrink-0">
                    <Info size={16} strokeWidth={2.5} />
                </div>
                <p className="text-[10px] md:text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed max-w-sm">
                    <span className="font-bold text-zinc-900 dark:text-zinc-200">Tips Navigasi:</span> Tahan & geser ikon titik enam di sisi kiri tabel untuk merombak urutan pemain. Rekor tertinggi ("Highest") akan otomatis diperbarui saat Anda menyimpan data.
                </p>
            </div>

        </div>
    );
}