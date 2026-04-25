// resources/js/Pages/PerformanceLogs/Partials/TimelineCard.jsx

import React from 'react';
import { Link } from '@inertiajs/react';
import { Activity, Trophy, Coffee, ChevronRight, Edit2, Plus, LayoutList } from 'lucide-react';
import SelectDropdown from '@/Components/ui/SelectDropdown'; // Import Dropdown Custom

export default function TimelineCard({ day, updateAgenda, isLast }) {
    const isOff = day.type === 'off';
    const isTraining = day.type === 'training';
    const isMatch = day.type === 'match';

    const dateObj = new Date(day.date);
    const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'short' });
    const dayDate = dateObj.getDate();
    const monthName = dateObj.toLocaleDateString('id-ID', { month: 'short' });

    // Opsi untuk custom dropdown
    const typeOptions = [
        { value: 'off', label: 'Off (Libur)' },
        { value: 'training', label: 'Training' },
        { value: 'match', label: 'Match' }
    ];

    return (
        <div className="relative flex flex-col md:flex-row gap-3 md:gap-6 group">
            
            {/* Timeline Line */}
            {!isLast && (
                <div className="hidden md:block absolute left-[48px] top-4 bottom-[-24px] w-px bg-zinc-200 dark:bg-zinc-800 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700 transition-colors z-0" />
            )}

            {/* Bagian Kiri: Tanggal (Diperkecil sedikit) */}
            <div className="md:w-[20px] shrink-0 flex items-end gap-2 md:block md:text-right z-10">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{dayName}</span>
                <h3 className={`text-2xl font-black tracking-tighter leading-none my-0.5 ${isOff ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-900 dark:text-zinc-100'}`}>
                    {dayDate}
                </h3>
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{monthName}</span>
            </div>

            {/* Timeline Node Point */}
            <div className={`hidden md:flex relative z-10 mt-4 w-2.5 h-2.5 rounded-full border-[2px] transition-colors duration-300 shadow-sm
                ${isTraining ? 'bg-zinc-900 border-zinc-900 dark:bg-zinc-100 dark:border-zinc-100' : 
                  isMatch ? 'bg-white border-zinc-900 dark:bg-[#09090b] dark:border-zinc-100' : 
                  'bg-zinc-100 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800'}
            `} />

            {/* Bagian Kanan: Konten Card Horizontal (Padding diperkecil) */}
            <div className={`flex-1 flex flex-col lg:flex-row lg:items-center gap-4 p-3.5 lg:p-4 rounded-xl border transition-all duration-300 hover:shadow-sm z-10
                ${isOff ? 'bg-zinc-50/50 dark:bg-zinc-900/20 border-zinc-200/50 dark:border-zinc-800/50 opacity-90 hover:opacity-100' : 'bg-white dark:bg-[#09090b] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'}
            `}>
                
                {/* Info Utama (Ikon & Judul) */}
                <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-lg border transition-colors ${
                        isTraining ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 shadow-sm' :
                        isMatch ? 'bg-white text-zinc-900 border-zinc-200 dark:bg-[#09090b] dark:text-zinc-100 dark:border-zinc-700 shadow-sm' :
                        'bg-zinc-100/50 text-zinc-400 border-zinc-200 dark:bg-zinc-900/50 dark:text-zinc-600 dark:border-zinc-800'
                    }`}>
                        {isTraining ? <Activity size={16} strokeWidth={2.5} /> : isMatch ? <Trophy size={16} strokeWidth={2.5} /> : <Coffee size={16} strokeWidth={2} />}
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">
                            {isOff ? 'Istirahat' : isTraining ? 'Sesi Latihan' : 'Pertandingan'}
                        </p>
                        <h4 className={`text-sm font-bold leading-tight line-clamp-1 ${isOff ? 'text-zinc-400 dark:text-zinc-600 italic font-medium' : 'text-zinc-900 dark:text-zinc-100'}`}>
                            {day.title || (isOff ? 'Tidak ada agenda' : 'Judul belum diatur')}
                        </h4>
                    </div>
                </div>

                {/* Bagian Aksi */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 lg:w-[300px] shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-zinc-100 dark:border-zinc-800/80">
                    
                    {/* IMPLEMENTASI DROPDOWN CUSTOM DI SINI */}
                    <div className="w-full sm:w-1/2">
                        <SelectDropdown 
                            value={day.type || 'off'} 
                            onChange={(e) => updateAgenda(day.date, e.target.value)}
                            options={typeOptions}
                            icon={LayoutList} // Tambahan ikon kecil di dalam dropdown
                            className={isOff ? 'text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}
                        />
                    </div>

                    <Link 
                        href={!isOff && day.id ? route('performance-logs.show', day.id) : '#'} 
                        className={`w-full sm:w-1/2 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                            !isOff && day.id 
                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200' 
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-zinc-200 dark:border-zinc-800'
                        }`}
                        onClick={(e) => (isOff || !day.id) && e.preventDefault()}
                    >
                        <span className="flex items-center gap-1.5">
                            {day.id && !isOff ? <Edit2 size={14} strokeWidth={2.5}/> : <Plus size={14} strokeWidth={2.5}/>}
                            {day.id && !isOff ? 'Isi Metrik' : 'Isi Sesi'}
                        </span>
                        <ChevronRight size={14} className={day.id && !isOff ? 'opacity-100' : 'opacity-0'} strokeWidth={2.5} />
                    </Link>
                </div>

            </div>
        </div>
    );
}