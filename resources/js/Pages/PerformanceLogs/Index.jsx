// resources/js/Pages/PerformanceLogs/Index.jsx

import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { CalendarDays, Filter, Check, Edit2, Search, Calendar as CalendarIcon, Tag, ChevronDown, X } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TimelineCard from './Partials/TimelineCard';

export default function PerformanceLogIndex({ auth, calendar, season_start_date }) {
    
    const [isEditingDate, setIsEditingDate] = useState(!season_start_date);
    const [tempDate, setTempDate] = useState(season_start_date || '');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMonth, setFilterMonth] = useState('all');
    const [filterTag, setFilterTag] = useState('all');

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Ekstrak Tag Unik
    const availableTags = useMemo(() => {
        if (!calendar) return [];
        const tags = new Set();
        calendar.forEach(day => {
            if (day.tag) tags.add(day.tag);
        });
        return Array.from(tags).sort();
    }, [calendar]);

    // Ekstrak Bulan Unik
    const availableMonths = useMemo(() => {
        if (!calendar) return [];
        const months = new Set();
        calendar.forEach(day => {
            const dateObj = new Date(day.date);
            months.add(JSON.stringify({
                val: dateObj.getMonth() + 1,
                label: dateObj.toLocaleString('id-ID', { month: 'long', year: 'numeric' })
            }));
        });
        return Array.from(months).map(m => JSON.parse(m)).sort((a,b) => a.val - b.val);
    }, [calendar]);

    // Filter Kalender
    const filteredCalendar = useMemo(() => {
        if (!calendar) return [];
        return calendar.filter(day => {
            const query = searchQuery.toLowerCase();
            const matchesSearch = 
                (day.title?.toLowerCase().includes(query)) ||
                (formatDate(day.date).toLowerCase().includes(query)) ||
                (day.type?.toLowerCase().includes(query));

            let matchesMonth = true;
            if (filterMonth !== 'all') {
                const dayMonth = new Date(day.date).getMonth() + 1; 
                matchesMonth = dayMonth.toString() === filterMonth;
            }

            let matchesTag = true;
            if (filterTag !== 'all') {
                matchesTag = day.tag === filterTag;
            }

            return matchesSearch && matchesMonth && matchesTag;
        });
    }, [calendar, searchQuery, filterMonth, filterTag]);

    const saveStartDate = () => {
        if (!tempDate) return;
        router.post(route('performance-logs.updateStartDate'), { season_start_date: tempDate }, {
            preserveScroll: true,
            onSuccess: () => setIsEditingDate(false)
        });
    };

    const resetFilters = () => {
        setSearchQuery('');
        setFilterMonth('all');
        setFilterTag('all');
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle="Kalender Performa" 
            headerDescription="Kelola jadwal tim dan pantau log metrik fisik harian."
        >
            <Head title="Jadwal & Log Performa" />

            <div className="w-full pb-20 space-y-6">
                
                {/* TOOLBAR KONTROL MONOKROM */}
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-sm flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between z-20 relative">
                    
                    {/* Kiri: Pencarian & Filter Dropdown */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto flex-1">
                        
                        {/* Input Pencarian Nama/Title */}
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} strokeWidth={2.5} />
                            <input
                                type="text"
                                placeholder="Cari sesi atau tanggal..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 py-2.5 pl-9 pr-3 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 transition-all shadow-sm"
                            />
                        </div>

                        {/* Dropdown Custom Tag */}
                        <div className="relative w-full sm:w-40">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 z-10" size={14} strokeWidth={2.5} />
                            <select
                                value={filterTag}
                                onChange={(e) => setFilterTag(e.target.value)}
                                className="w-full appearance-none bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-zinc-900 dark:text-zinc-100 py-2.5 pl-9 pr-8 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 transition-all shadow-sm cursor-pointer"
                            >
                                <option value="all">Semua Tag</option>
                                {availableTags.map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} strokeWidth={2.5} />
                        </div>
                        
                        {/* Dropdown Custom Bulan */}
                        <div className="relative w-full sm:w-44">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 z-10" size={14} strokeWidth={2.5} />
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="w-full appearance-none bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-zinc-900 dark:text-zinc-100 py-2.5 pl-9 pr-8 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 transition-all shadow-sm cursor-pointer"
                            >
                                <option value="all">Semua Bulan</option>
                                {availableMonths.map(month => (
                                    <option key={month.val} value={month.val}>{month.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} strokeWidth={2.5} />
                        </div>

                        {/* Tombol Reset (Muncul jika ada filter aktif) */}
                        {(searchQuery || filterMonth !== 'all' || filterTag !== 'all') && (
                            <button 
                                onClick={resetFilters}
                                className="flex items-center justify-center p-2.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-transparent"
                                title="Reset Filter"
                            >
                                <X size={14} strokeWidth={2.5} />
                            </button>
                        )}
                    </div>

                    {/* Kanan: Pengaturan Start Date */}
                    <div className="flex items-center justify-between w-full xl:w-auto xl:pl-6 xl:border-l border-zinc-200 dark:border-zinc-800 pt-3 xl:pt-0 border-t xl:border-t-0 gap-4">
                        <div className="flex items-center gap-2">
                            <CalendarIcon size={14} className="text-zinc-400" strokeWidth={2.5}/>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Awal Musim</span>
                        </div>
                        
                        {isEditingDate ? (
                            <div className="flex items-center gap-2">
                                <input 
                                    type="date" 
                                    value={tempDate}
                                    onChange={(e) => setTempDate(e.target.value)}
                                    className="bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-mono font-bold rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 shadow-sm"
                                />
                                <button 
                                    onClick={saveStartDate} 
                                    className="flex items-center justify-center p-2.5 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity shadow-sm" 
                                    title="Simpan Tanggal"
                                >
                                    <Check size={14} strokeWidth={3} />
                                </button>
                                {season_start_date && (
                                    <button 
                                        onClick={() => {
                                            setIsEditingDate(false);
                                            setTempDate(season_start_date);
                                        }} 
                                        className="flex items-center justify-center p-2.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors" 
                                        title="Batal"
                                    >
                                        <X size={14} strokeWidth={2.5} />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                    {formatDate(season_start_date)}
                                </span>
                                <button 
                                    onClick={() => setIsEditingDate(true)}
                                    className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors border border-zinc-200 dark:border-zinc-800 shadow-sm"
                                    title="Ubah Tanggal Awal Musim"
                                >
                                    <Edit2 size={12} strokeWidth={2.5} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* TIMELINE LIST */}
                <div className="pt-2 z-10 relative">
                    {!season_start_date ? (
                        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-400 bg-zinc-50/50 dark:bg-zinc-950/50">
                            <div className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-4 shadow-sm">
                                <CalendarDays size={28} strokeWidth={2} className="text-zinc-400" />
                            </div>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">Timeline Belum Aktif</h3>
                            <p className="text-xs font-medium text-zinc-500 max-w-sm text-center">Tentukan tanggal "Awal Musim" di sebelah kanan atas untuk mulai menghasilkan jadwal secara otomatis.</p>
                        </div>
                    ) : filteredCalendar.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
                            <Search size={32} className="text-zinc-300 dark:text-zinc-700 mb-4" />
                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Sesi tidak ditemukan</h3>
                            <p className="text-xs text-zinc-500 mt-1">Coba sesuaikan kata kunci, tag, atau filter bulan Anda.</p>
                            <button 
                                onClick={resetFilters}
                                className="mt-5 px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
                            >
                                Hapus Semua Filter
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 md:space-y-5 pl-0 md:pl-2">
                            {filteredCalendar.map((day, index) => (
                                <TimelineCard 
                                    key={day.date} 
                                    day={day} 
                                    isLast={index === filteredCalendar.length - 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}