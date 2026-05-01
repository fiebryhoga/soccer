import React, { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Search, X, Activity, GitCompare, CheckSquare, SearchX, LineChart, Plus } from 'lucide-react';

// Import Partials untuk Comparison (Multi-Session)
import BasicComparisonChart from './Partials/BasicComparisonChart';
import IntensityComparisonChart from './Partials/IntensityComparisonChart';
import MovementComparisonChart from './Partials/MovementComparisonChart';
import HeartRateComparisonChart from './Partials/HeartRateComparisonChart';
import VelocityComparisonChart from './Partials/VelocityComparisonChart';
import PlayerLoadComparisonChart from './Partials/PlayerLoadComparisonChart';
import SpeedZoneChart from './Partials/SpeedZoneChart';
import VolumeIntensityMatrix from './Partials/VolumeIntensityMatrix';

// Import Partials untuk Analysis (Single-Session)
import SessionSummary from './Partials/SessionSummary';
import PlayerMetricsTable from './Partials/PlayerMetricsTable';
import CustomSessionChart from './Partials/CustomSessionChart';

export default function Comparison({ auth, comparisonData, allSessions, isSingleSession, sessionData }) {
    
    const { url } = usePage(); 

    const getSessionsFromUrl = () => {
        const searchParams = new URLSearchParams(window.location.search);
        const ids = [];
        for (const [key, value] of searchParams.entries()) {
            if (key.startsWith('session_ids')) {
                ids.push(Number(value));
            }
        }
        return ids;
    };

    const [selectedSessions, setSelectedSessions] = useState(getSessionsFromUrl());
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // State untuk menampung Diagram Custom
    const [customCharts, setCustomCharts] = useState([]);

    useEffect(() => {
        const currentIds = getSessionsFromUrl();
        if (JSON.stringify(currentIds) !== JSON.stringify(selectedSessions)) {
            setSelectedSessions(currentIds);
        }
    }, [url]);

    const filteredSessions = useMemo(() => {
        if (!searchQuery.trim()) return allSessions.slice(0, 5); 
        const q = searchQuery.toLowerCase();
        return allSessions.filter(s => {
            const matchName = s.title?.toLowerCase().includes(q);
            const matchTag = s.tag?.toLowerCase().includes(q);
            const matchDate = s.date?.includes(q);
            const dateObj = new Date(s.date);
            const monthName = dateObj.toLocaleString('id-ID', { month: 'long' }).toLowerCase();
            return matchName || matchTag || matchDate || monthName.includes(q);
        }).slice(0, 100); 
    }, [searchQuery, allSessions]);

    const addAllFiltered = () => {
        const newIds = filteredSessions.map(s => s.id);
        setSelectedSessions(prev => [...new Set([...prev, ...newIds])]);
    };

    const addSession = (session) => {
        if (!selectedSessions.includes(session.id)) setSelectedSessions(prev => [...prev, session.id]);
    };

    const removeSession = (id) => setSelectedSessions(prev => prev.filter(s => s !== id));

    const applyFilter = () => {
        if (selectedSessions.length > 0) {
            router.get(route('analysis.comparison'), { session_ids: selectedSessions }, { preserveState: true });
            setIsDropdownOpen(false); 
        }
    };

    const clearFilter = () => {
        setSelectedSessions([]);
        setSearchQuery(''); 
        setCustomCharts([]); // Bersihkan diagram custom saat reset
        router.get(route('analysis.comparison'), {}, { preserveState: true });
    };

    const selectedSessionDetails = useMemo(() => {
        return selectedSessions.map(id => allSessions.find(s => s.id === id)).filter(Boolean);
    }, [selectedSessions, allSessions]);

    // Fungsi untuk menambah diagram custom baru
    const addNewChart = () => {
        setCustomCharts([...customCharts, { id: Date.now() }]);
    };

    const removeChart = (idToRemove) => {
        setCustomCharts(customCharts.filter(c => c.id !== idToRemove));
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle={isSingleSession ? "Session Analysis" : "Comparison Analysis"}
            headerDescription={isSingleSession ? "Analisis detail metrik tim dan pemain untuk satu sesi terpilih." : "Bandingkan metrik performa secara mendalam antar sesi."}
        >
            <Head title={isSingleSession ? "Session Analysis" : "Metric Comparison"} />

            <div className="max-w-[100rem] mx-auto pb-12 space-y-6">
                
                {/* 1. FILTER BAR (Tetap sama) */}
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-5 lg:p-6 relative transition-colors">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Search size={16} className="text-zinc-400" strokeWidth={2.5} /> 
                        Cari & Pilih Sesi Latihan
                    </h3>
                    
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                        <div className="relative w-full md:w-1/2">
                            <div className="relative z-50">
                                <input 
                                    type="text"
                                    placeholder="Ketik tag (MD-1), lawan (Dewa), bulan..."
                                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 text-sm font-bold rounded-lg px-4 py-3 text-zinc-900 dark:text-zinc-100 outline-none shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setIsDropdownOpen(true); }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                />
                                <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" strokeWidth={2.5}/>
                            </div>

                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50 max-h-64 overflow-y-auto">
                                    {filteredSessions.length > 0 ? (
                                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                                            {searchQuery.trim() !== '' && (
                                                <button onClick={addAllFiltered} className="w-full text-left px-4 py-2.5 bg-zinc-100/80 dark:bg-zinc-900 hover:bg-zinc-200 transition-colors flex items-center gap-2 group">
                                                    <CheckSquare size={16} className="text-zinc-600" strokeWidth={2.5} />
                                                    <span className="text-xs font-bold text-zinc-700">Pilih Semua Hasil Filter ({filteredSessions.length})</span>
                                                </button>
                                            )}
                                            {filteredSessions.map(session => (
                                                <button 
                                                    key={session.id}
                                                    disabled={selectedSessions.includes(session.id)}
                                                    onClick={() => addSession(session)}
                                                    className={`w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 ${selectedSessions.includes(session.id) ? 'opacity-50 cursor-not-allowed bg-zinc-50' : ''}`}
                                                >
                                                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{session.title}</div>
                                                    <div className="text-[10px] font-semibold text-zinc-500 mt-0.5">{session.date}</div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-xs font-semibold text-zinc-500">Sesi tidak ditemukan.</div>
                                    )}
                                </div>
                            )}
                            {isDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>}
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto relative z-30">
                            <button 
                                onClick={applyFilter} 
                                disabled={selectedSessions.length === 0}
                                className={`px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-lg flex items-center gap-2 ${selectedSessions.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {selectedSessions.length === 1 ? <LineChart size={16} strokeWidth={2.5}/> : <GitCompare size={16} strokeWidth={2.5}/>}
                                {selectedSessions.length === 1 ? 'Analisis Sesi' : 'Bandingkan Sesi'}
                            </button>
                            {selectedSessions.length > 0 && (
                                <button onClick={clearFilter} className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5"><X size={16} strokeWidth={2.5} /> Clear</button>
                            )}
                        </div>
                    </div>

                    {selectedSessionDetails.length > 0 && (
                        <div className="mt-5 pt-5 border-t border-zinc-200 dark:border-zinc-800 relative z-30 flex flex-wrap gap-2">
                            {selectedSessionDetails.map(session => (
                                <div key={session.id} className="flex items-center gap-2 pl-3 pr-1 py-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800">
                                    <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">{session.title}</span>
                                    <button onClick={() => removeSession(session.id)} className="p-1 text-zinc-400 hover:text-red-500 rounded"><X size={12} strokeWidth={3} /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. AREA KONTEN */}
                {selectedSessions.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
                        <SearchX size={32} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Pilih Agenda/Sesi Terlebih Dahulu</h4>
                    </div>
                ) : isSingleSession && sessionData ? (
                    
                    // ==========================================
                    // MODE: SINGLE SESSION (ANALYSIS)
                    // ==========================================
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Memanggil Partials yang sudah dipisah */}
                        <SessionSummary sessionData={sessionData} />
                        
                        {/* Tombol Add Custom Chart */}
                        <div className="mt-10 flex justify-between items-end border-b border-zinc-200 dark:border-zinc-800 pb-3">
                            <div>
                                <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                                    <Activity size={20} className="text-blue-500"/> Custom Analytics
                                </h3>
                                <p className="text-xs text-zinc-500 mt-1">Buat grafik kustom untuk melihat korelasi antar variabel pemain.</p>
                            </div>
                            <button 
                                onClick={addNewChart}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-md"
                            >
                                <Plus size={16} strokeWidth={2.5}/> Add Diagram
                            </button>
                        </div>

                        {/* Merender Array Custom Charts */}
                        {customCharts.length === 0 && (
                            <div className="mt-6 p-8 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                                <p className="text-sm font-semibold text-zinc-400">Klik "Add Diagram" untuk membuat grafik khusus.</p>
                            </div>
                        )}
                        {customCharts.map(chart => (
                            <CustomSessionChart 
                                key={chart.id} 
                                sessionData={sessionData} 
                                onRemove={() => removeChart(chart.id)} 
                            />
                        ))}

                        <PlayerMetricsTable playerMetrics={sessionData.playerMetrics} />
                    </div>

                ) : (
                    // ==========================================
                    // MODE: MULTI-SESSION (COMPARISON)
                    // ==========================================
                    <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <VolumeIntensityMatrix data={comparisonData} />
                        <BasicComparisonChart data={comparisonData} />
                        <IntensityComparisonChart data={comparisonData} />
                        <SpeedZoneChart data={comparisonData} />
                        <MovementComparisonChart data={comparisonData} />
                        <HeartRateComparisonChart data={comparisonData} />
                        <VelocityComparisonChart data={comparisonData} />
                        <PlayerLoadComparisonChart data={comparisonData} />
                    </div>
                )}
                
            </div>
        </AuthenticatedLayout>
    );
}