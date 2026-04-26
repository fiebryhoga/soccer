// resources/js/Pages/PerformanceLogs/Index.jsx

import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { CalendarDays, Filter, Check, Edit2, Search, Calendar as CalendarIcon } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TimelineCard from './Partials/TimelineCard';
import SelectDropdown from '@/Components/ui/SelectDropdown';

export default function PerformanceLogIndex({ auth, calendar, season_start_date }) {
    
    const [isEditingDate, setIsEditingDate] = useState(!season_start_date);
    const [tempDate, setTempDate] = useState(season_start_date || '');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMonth, setFilterMonth] = useState('all');

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Filter Kalender berdasarkan Pencarian, Tag, Bulan, dsb.
    const filteredCalendar = useMemo(() => {
        if (!calendar) return [];
        return calendar.filter(day => {
            const query = searchQuery.toLowerCase();
            const matchesSearch = 
                (day.title?.toLowerCase().includes(query)) ||
                (formatDate(day.date).toLowerCase().includes(query)) ||
                (day.type.toLowerCase().includes(query)) ||
                (day.tag?.toLowerCase().includes(query)); // Termasuk mencari berdasarkan tag (MD-1, dst)

            let matchesMonth = true;
            if (filterMonth !== 'all') {
                const dayMonth = new Date(day.date).getMonth() + 1; 
                matchesMonth = dayMonth.toString() === filterMonth;
            }
            return matchesSearch && matchesMonth;
        });
    }, [calendar, searchQuery, filterMonth]);

    // Format opsi bulan untuk SelectDropdown custom
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
        const opts = Array.from(months).map(m => JSON.parse(m)).sort((a,b) => a.val - b.val);
        
        return [
            { value: 'all', label: 'Semua Bulan' }, 
            ...opts.map(o => ({ value: o.val.toString(), label: o.label }))
        ];
    }, [calendar]);

    const saveStartDate = () => {
        if (!tempDate) return;
        router.post(route('performance-logs.updateStartDate'), { season_start_date: tempDate }, {
            preserveScroll: true,
            onSuccess: () => setIsEditingDate(false)
        });
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle="Kalender Performa" 
            headerDescription="Kelola jadwal tim dan pantau log metrik fisik harian."
        >
            <Head title="Jadwal & Log Performa" />

            <div className="w-full pb-20 space-y-6">
                
                {/* CONTROL TOOLBAR KECIL & RAPI */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between z-20 relative">
                    
                    {/* Kiri: Pencarian & Pilihan Bulan */}
                    <div className="flex w-full xl:w-auto flex-col sm:flex-row gap-3 flex-1">
                        
                        {/* Input Pencarian */}
                        <div className="relative flex-1 max-w-lg">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} strokeWidth={2.5} />
                            <input
                                type="text"
                                placeholder="Cari sesi, tanggal, atau tag (MD-1)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 py-2 pl-9 pr-3 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                            />
                        </div>
                        
                        {/* DROPDOWN CUSTOM UNTUK BULAN */}
                        <div className="w-full sm:w-56 relative z-30">
                            <SelectDropdown 
                                value={filterMonth} 
                                onChange={(e) => setFilterMonth(e.target.value)} 
                                options={availableMonths}
                                icon={Filter}
                            />
                        </div>

                    </div>

                    {/* Kanan: Pengaturan Tanggal Mulai */}
                    <div className="flex items-center justify-between w-full xl:w-auto pl-0 xl:pl-5 xl:border-l border-zinc-200 dark:border-zinc-800 gap-4">
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
                                    className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-mono font-bold rounded-lg py-1.5 px-3 outline-none"
                                />
                                <button onClick={saveStartDate} className="p-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md hover:opacity-80 transition-opacity" title="Simpan">
                                    <Check size={14} strokeWidth={3} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                    {formatDate(season_start_date)}
                                </span>
                                <button 
                                    onClick={() => setIsEditingDate(true)}
                                    className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors border border-zinc-200 dark:border-zinc-800"
                                    title="Ubah Tanggal"
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
                        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-400 bg-zinc-50/50 dark:bg-[#0a0a0a]">
                            <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-4 shadow-sm">
                                <CalendarDays size={28} strokeWidth={2} className="text-zinc-400" />
                            </div>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">Timeline Belum Aktif</h3>
                            <p className="text-xs font-medium text-zinc-500">Atur tanggal "Awal Musim" di toolbar atas untuk menghasilkan jadwal otomatis.</p>
                        </div>
                    ) : filteredCalendar.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
                            <Search size={32} className="text-zinc-300 dark:text-zinc-700 mb-4" />
                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Tidak ada sesi ditemukan</h3>
                            <p className="text-xs text-zinc-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter bulan Anda.</p>
                            <button 
                                onClick={() => {setSearchQuery(''); setFilterMonth('all');}}
                                className="mt-4 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                            >
                                Reset Filter
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