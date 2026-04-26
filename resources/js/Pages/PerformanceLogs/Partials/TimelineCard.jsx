// resources/js/Pages/PerformanceLogs/Partials/TimelineCard.jsx

import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Activity, Trophy, Coffee, ChevronRight, Edit2, LayoutList, ChevronDown, Tag } from 'lucide-react';

const MD_TAGS = [
    'MD - 5', 'MD - 4', 'MD - 3', 'MD - 2', 'MD - 1', 
    'MD', 
    'MD + 1', 'MD + 2', 'MD + 3', 'MD + 4', 'MD + 5'
];

export default function TimelineCard({ day, isLast }) {
    // Pengamanan data fallback
    const safeDay = day || { type: 'off', tag: '', date: '', id: null, title: '' };
    
    // State
    const [selectedType, setSelectedType] = useState(safeDay.type || 'off');
    const [selectedTag, setSelectedTag] = useState(safeDay.tag || '');

    const isOff = selectedType === 'off';
    const isTraining = selectedType === 'training';
    const isMatch = selectedType === 'match';

    // Format Tanggal
    const dateObj = new Date(safeDay.date);
    const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'short' });
    const dayDate = dateObj.getDate();
    const monthName = dateObj.toLocaleDateString('id-ID', { month: 'short' });

    // Deteksi "Hari Ini"
    const today = new Date();
    const isToday = dateObj.toDateString() === today.toDateString();

    // Fungsi Submit ke Backend
    const submitChange = (newType, newTag) => {
        if (!safeDay.date) return;
        router.post(route('performance-logs.store'), {
            date: safeDay.date,
            type: newType,
            tag: newTag
        }, {
            preserveScroll: true,
            preserveState: true
        });
    };

    const handleTypeChange = (e) => {
        const type = e.target.value;
        setSelectedType(type);
        const newTag = type === 'off' ? '' : selectedTag;
        setSelectedTag(newTag);
        submitChange(type, newTag);
    };

    const handleTagChange = (e) => {
        const tag = e.target.value;
        setSelectedTag(tag);
        submitChange(selectedType, tag);
    };

    return (
        <div className="relative flex flex-col md:flex-row gap-3 md:gap-6 group z-10">
            
            {/* Timeline Line Vertikal */}
            {!isLast && (
                <div className="hidden md:block absolute left-[62px] top-4 bottom-[-24px] w-px bg-zinc-200 dark:bg-zinc-800 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700 transition-colors z-0" />
            )}

            {/* Bagian Kiri: Tanggal */}
            <div className="md:w-[34px] shrink-0 flex items-end gap-2 md:block md:text-right z-10 pt-1 relative">
                {/* Tanda Hari Ini Monokrom */}
                {isToday && (
                    <div className="absolute -top-3 md:-top-4 -left-2 md:-right-8 flex items-center gap-1.5 md:justify-end w-[100px]">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 dark:bg-zinc-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-900 dark:bg-zinc-100"></span>
                        </span>
                        <span className="text-[9px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest whitespace-nowrap">Hari Ini</span>
                    </div>
                )}
                
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none block">{dayName}</span>
                <h3 className={`text-2xl font-black tracking-tighter leading-none my-0.5 ${isOff ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-900 dark:text-zinc-100'}`}>
                    {dayDate}
                </h3>
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none block">{monthName}</span>
            </div>

            {/* Timeline Node Point (Titik Bulat) */}
            <div className={`hidden md:flex relative z-10 mt-3.5 w-2.5 h-2.5 rounded-full border-[2px] transition-colors duration-300 shadow-sm
                ${isToday ? 'border-zinc-900 bg-white dark:border-zinc-100 dark:bg-zinc-950' : 
                  isTraining ? 'bg-zinc-900 border-zinc-900 dark:bg-zinc-100 dark:border-zinc-100' : 
                  isMatch ? 'bg-white border-zinc-900 dark:bg-[#09090b] dark:border-zinc-100' : 
                  'bg-zinc-100 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800'}
            `} />

            {/* Card Container Utama */}
            <div className={`flex-1 flex flex-col lg:flex-row lg:items-center gap-4 p-3.5 lg:p-4 rounded-xl border transition-all duration-300 relative z-10
                ${isOff ? 'bg-zinc-50/50 dark:bg-zinc-900/20 border-zinc-200/50 dark:border-zinc-800/50 opacity-90' : 
                  isToday ? 'bg-zinc-50 dark:bg-zinc-900 border-zinc-400 dark:border-zinc-500 shadow-sm' :
                  'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm'}
            `}>
                
                {/* Info Utama (Ikon & Judul) */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg border transition-colors shrink-0 ${
                        isTraining ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 shadow-sm' :
                        isMatch ? 'bg-white text-zinc-900 border-zinc-200 dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-700 shadow-sm' :
                        'bg-zinc-100/50 text-zinc-400 border-zinc-200 dark:bg-zinc-900/50 dark:text-zinc-600 dark:border-zinc-800'
                    }`}>
                        {isTraining ? <Activity size={16} strokeWidth={2.5} /> : isMatch ? <Trophy size={16} strokeWidth={2.5} /> : <Coffee size={16} strokeWidth={2} />}
                    </div>
                    
                    <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                                {isOff ? 'Istirahat' : isTraining ? 'Sesi Latihan' : 'Pertandingan'}
                            </p>
                            {/* Tag Monokrom */}
                            {!isOff && selectedTag && (
                                <span className="px-1.5 py-px rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 text-[8px] font-black tracking-widest uppercase shadow-sm">
                                    {selectedTag}
                                </span>
                            )}
                        </div>
                        <h4 className={`text-sm font-bold leading-tight truncate ${isOff ? 'text-zinc-400 dark:text-zinc-600 italic font-medium' : 'text-zinc-900 dark:text-zinc-100'}`}>
                            {safeDay.title || (isOff ? 'Tidak ada agenda' : 'Judul belum diatur')}
                        </h4>
                    </div>
                </div>

                {/* Bagian Aksi Dropdown & Tombol */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 lg:w-auto shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-zinc-100 dark:border-zinc-800/80">
                    
                    <div className="flex w-full sm:w-auto gap-2.5 relative">
                        {/* 1. Select TIPE (Native dengan Custom Style) */}
                        <div className="relative w-1/2 sm:w-[130px]">
                            <LayoutList className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} />
                            <select
                                value={selectedType}
                                onChange={handleTypeChange}
                                className="w-full appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 py-2 pl-9 pr-8 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 transition-all shadow-sm cursor-pointer"
                            >
                                <option value="off">Off (Libur)</option>
                                <option value="training">Training</option>
                                <option value="match">Match</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} strokeWidth={2.5} />
                        </div>

                        {/* 2. Select TAG (Native dengan Custom Style) */}
                        {!isOff && (
                            <div className="relative w-1/2 sm:w-[120px]">
                                <Tag className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${selectedTag ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`} size={14} strokeWidth={2.5} />
                                <select
                                    value={selectedTag}
                                    onChange={handleTagChange}
                                    className="w-full appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 py-2 pl-9 pr-8 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 transition-all shadow-sm cursor-pointer"
                                >
                                    <option value="">Tag MD</option>
                                    {MD_TAGS.map(tag => (
                                        <option key={tag} value={tag}>{tag}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} strokeWidth={2.5} />
                            </div>
                        )}
                    </div>

                    {/* Tombol Aksi Kanan (Isi Metrik) */}
                    <Link 
                        href={!isOff && safeDay.id ? route('performance-logs.show', safeDay.id) : '#'} 
                        className={`w-full sm:w-[130px] flex items-center justify-between px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            !isOff && safeDay.id 
                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm hover:opacity-90' 
                            : 'bg-zinc-100 dark:bg-zinc-900/50 text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-zinc-200 dark:border-zinc-800/50'
                        }`}
                        onClick={(e) => (isOff || !safeDay.id) && e.preventDefault()}
                    >
                        <span className="flex items-center gap-1.5">
                            {safeDay.id && !isOff ? <Edit2 size={14} strokeWidth={2.5}/> : <Activity size={14} strokeWidth={2.5}/>}
                            {safeDay.id && !isOff ? 'Isi Metrik' : 'Siapkan'}
                        </span>
                        <ChevronRight size={14} className={safeDay.id && !isOff ? 'opacity-100' : 'opacity-0'} strokeWidth={2.5} />
                    </Link>
                </div>

            </div>
        </div>
    );
}