// resources/js/Pages/TeamAnalysis/Comparison.jsx

import React, { useState, useMemo, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react'; 
import { Search, X, Activity, GitCompare, CheckSquare, PlusCircle, LayoutGrid, Columns, Square, Bookmark, BarChart2 } from 'lucide-react'; 
import ComparisonSummaryCards from './Partials/ComparisonSummaryCards';

import CustomComparisonChart from './Partials/CustomComparisonChart';

export default function Comparison({ auth, comparisonData, allSessions, chartTemplates }) {
    const { url } = usePage(); 

    const getSessionsFromUrl = () => {
        const searchParams = new URLSearchParams(window.location.search);
        const ids = [];
        for (const [key, value] of searchParams.entries()) {
            if (key.startsWith('session_ids')) ids.push(Number(value));
        }
        return ids;
    };

    const [selectedSessions, setSelectedSessions] = useState(() => {
        const saved = localStorage.getItem('comparison_sessions');
        const fromUrl = getSessionsFromUrl();
        return fromUrl.length > 0 ? fromUrl : (saved ? JSON.parse(saved) : []);
    });

    const [gridLayout, setGridLayout] = useState(() => {
        const saved = localStorage.getItem('comparison_grid');
        return saved ? JSON.parse(saved) : 1;
    });

    const [charts, setCharts] = useState(() => {
        const saved = localStorage.getItem('comparison_charts');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => { localStorage.setItem('comparison_sessions', JSON.stringify(selectedSessions)); }, [selectedSessions]);
    useEffect(() => { localStorage.setItem('comparison_grid', JSON.stringify(gridLayout)); }, [gridLayout]);
    useEffect(() => { localStorage.setItem('comparison_charts', JSON.stringify(charts)); }, [charts]);

    useEffect(() => {
        const currentUrlIds = getSessionsFromUrl();
        if (selectedSessions.length >= 2 && currentUrlIds.length === 0 && !url.includes('session_ids')) {
            applyFilter(selectedSessions);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- MANAJEMEN GRAFIK KUSTOM ---
    const addChart = () => {
        const newChart = {
            id: Date.now().toString(),
            selectedParams: [],
            paramColors: {},
            chartType: 'bar',
            isZoomed: true
        };
        setCharts([...charts, newChart]);
    };

    const updateChart = (id, newConfig) => {
        setCharts(prev => prev.map(c => c.id === id ? { ...c, ...newConfig } : c));
    };

    const removeChart = (idToRemove) => {
        setCharts(prev => prev.filter(c => c.id !== idToRemove));
    };

    // --- MANAJEMEN TEMPLATE ---
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const addMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (addMenuRef.current && !addMenuRef.current.contains(e.target)) setIsAddMenuOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSaveTemplate = (config, templateName) => {
        router.post(route('chart-templates.store'), {
            name: templateName,
            config: {
                selectedParams: config.selectedParams,
                paramColors: config.paramColors,
                chartType: config.chartType,
                isZoomed: config.isZoomed
            }
        }, { preserveScroll: true });
    };

    const handleUpdateTemplate = (templateId, config, templateName) => {
        router.put(route('chart-templates.update', templateId), {
            name: templateName,
            config: {
                selectedParams: config.selectedParams,
                paramColors: config.paramColors,
                chartType: config.chartType,
                isZoomed: config.isZoomed
            }
        }, { preserveScroll: true });
    };

    const applyTemplate = (template) => {
        const newChart = {
            id: Date.now().toString(),
            templateId: template.id,
            templateName: template.name,
            ...template.config 
        };
        setCharts([...charts, newChart]);
    };

    const deleteTemplate = (id) => {
        if(confirm("Yakin ingin menghapus template ini dari database?")) {
            router.delete(route('chart-templates.destroy', id), { preserveScroll: true });
        }
    };

    // --- PENCARIAN & FILTER SESI ---
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
    const searchDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutsideSearch = (e) => {
            if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target)) setIsSearchDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutsideSearch);
        return () => document.removeEventListener("mousedown", handleClickOutsideSearch);
    }, []);

    const filteredSessions = useMemo(() => {
        if (!searchQuery.trim()) return allSessions.slice(0, 5); 
        const q = searchQuery.toLowerCase();
        return allSessions.filter(s => {
            const matchName = s.title?.toLowerCase().includes(q);
            const matchTag = s.tag?.toLowerCase().includes(q);
            const matchDate = s.date?.includes(q);
            const dateObj = new Date(s.date);
            const matchMonth = dateObj.toLocaleString('id-ID', { month: 'long' }).toLowerCase().includes(q);
            return matchName || matchTag || matchDate || matchMonth;
        }).slice(0, 100); 
    }, [searchQuery, allSessions]);

    const addAllFiltered = () => {
        const newIds = filteredSessions.map(s => s.id);
        setSelectedSessions(prev => [...new Set([...prev, ...newIds])]);
    };

    const addSession = (session) => {
        if (!selectedSessions.includes(session.id)) setSelectedSessions(prev => [...prev, session.id]);
    };

    const removeSession = (id) => {
        setSelectedSessions(prev => prev.filter(s => s !== id));
    };

    const applyFilter = (sessionsToApply = selectedSessions) => {
        if (sessionsToApply.length > 0) {
            router.get(route('analysis.comparison'), { session_ids: sessionsToApply }, { preserveState: true });
            setIsSearchDropdownOpen(false); 
        }
    };

    const clearFilter = () => {
        setSelectedSessions([]);
        setSearchQuery(''); 
        setCharts([]); 
        router.get(route('analysis.comparison'), {}, { preserveState: true });
    };

    const selectedSessionDetails = useMemo(() => {
        return selectedSessions.map(id => allSessions.find(s => s.id === id)).filter(Boolean);
    }, [selectedSessions, allSessions]);

    const gridClass = gridLayout === 1 ? 'grid-cols-1' : gridLayout === 2 ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            headerTitle="Comparison Analysis"
            headerDescription="Bandingkan metrik performa secara mendalam antar sesi latihan atau pertandingan."
        >
            <Head title="Metric Comparison" />

            <div className="max-w-[100rem] mx-auto pb-12 space-y-6">
                
                {/* --- KOTAK PENCARIAN --- */}
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-5 lg:p-6 relative transition-colors z-40">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Search size={16} className="text-zinc-400 dark:text-zinc-500" strokeWidth={2.5} /> Cari & Pilih Sesi
                    </h3>
                    
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                        <div className="relative w-full md:w-1/2" ref={searchDropdownRef}>
                            <div className="relative z-50">
                                <input 
                                    type="text" placeholder="Ketik tag (MD-1), lawan, bulan..."
                                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-sm font-bold rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none transition-all shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setIsSearchDropdownOpen(true); }}
                                    onFocus={() => setIsSearchDropdownOpen(true)}
                                />
                                <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" strokeWidth={2.5}/>
                            </div>

                            {isSearchDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-[100] max-h-64 overflow-y-auto animate-in fade-in zoom-in-95">
                                    {filteredSessions.length > 0 ? (
                                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                                            {searchQuery.trim() !== '' && (
                                                <button onClick={addAllFiltered} className="w-full text-left px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between group">
                                                    <div className="flex items-center gap-2">
                                                        <CheckSquare size={16} className="text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" strokeWidth={2.5} />
                                                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white">Pilih Semua Hasil ({filteredSessions.length})</span>
                                                    </div>
                                                </button>
                                            )}

                                            {filteredSessions.map(session => {
                                                const isSelected = selectedSessions.includes(session.id);
                                                return (
                                                    <button key={session.id} disabled={isSelected} onClick={() => addSession(session)} className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${isSelected ? 'opacity-50 cursor-not-allowed bg-zinc-50 dark:bg-zinc-800/30' : ''}`}>
                                                        <div>
                                                            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{session.title}</div>
                                                            <div className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">{session.date}</div>
                                                        </div>
                                                        {session.tag && <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 text-[9px] font-black tracking-widest uppercase rounded border border-zinc-200 dark:border-zinc-800">{session.tag}</span>}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">Sesi tidak ditemukan.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto relative z-30">
                            <button onClick={() => applyFilter()} disabled={selectedSessions.length < 2} className={`px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2 flex-1 md:flex-none justify-center focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 dark:focus:ring-offset-zinc-950 ${selectedSessions.length < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <GitCompare size={16} strokeWidth={2.5}/> Bandingkan
                            </button>
                            
                            {selectedSessions.length > 0 && (
                                <button onClick={clearFilter} className="px-4 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white border border-transparent rounded-xl transition-all flex items-center gap-1.5 shrink-0">
                                    <X size={16} strokeWidth={2.5} /> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {selectedSessionDetails.length > 0 && (
                        <div className="mt-5 pt-5 border-t border-zinc-200 dark:border-zinc-800 relative z-30">
                            <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3">Sesi Terpilih ({selectedSessions.length}):</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedSessionDetails.map(session => (
                                    <div key={session.id} className="flex items-center gap-2 pl-3 pr-1 py-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                        <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">{session.title}</span>
                                        {session.tag && <span className="text-[9px] font-black text-zinc-500 dark:text-zinc-400">| {session.tag}</span>}
                                        <button onClick={() => removeSession(session.id)} className="p-1 text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-500 hover:bg-white dark:hover:bg-zinc-800 transition-colors rounded">
                                            <X size={12} strokeWidth={3} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- AREA HASIL COMPARISON --- */}
                {comparisonData.length < 2 ? (
                    <div className="p-12 text-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
                        <Activity size={32} className="mx-auto text-zinc-300 dark:text-zinc-700 opacity-50 mb-3" />
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Belum Ada Data Perbandingan</h4>
                        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                            Gunakan kotak pencarian di atas dan pilih minimal <span className="font-bold text-zinc-900 dark:text-zinc-100">2 sesi</span> untuk mulai membandingkan metrik.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">

                        <ComparisonSummaryCards data={comparisonData} />
                        
                        
                        {/* --- HEADER DASHBOARD GRAFIK (Z-INDEX 50 AGAR DROPDOWN TIDAK TERTUTUP CHART BAWAH) --- */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-800 relative z-50">
                            <div>
                                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    <BarChart2 size={20} className="text-zinc-900 dark:text-white" /> Dashboard Komparasi
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Gunakan grid dan tambahkan grafik untuk analisis visual.</p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {/* Grid Controls */}
                                <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-inner">
                                    <button onClick={() => setGridLayout(1)} className={`p-1.5 rounded transition-all ${gridLayout === 1 ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}`} title="1 Kolom"><Square size={16} strokeWidth={3} /></button>
                                    <button onClick={() => setGridLayout(2)} className={`p-1.5 rounded transition-all ${gridLayout === 2 ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}`} title="2 Kolom"><Columns size={16} strokeWidth={3} /></button>
                                    <button onClick={() => setGridLayout(3)} className={`p-1.5 rounded transition-all ${gridLayout === 3 ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}`} title="3 Kolom"><LayoutGrid size={16} strokeWidth={3} /></button>
                                </div>

                                {/* Add Chart Dropdown Menu */}
                                <div className="relative" ref={addMenuRef}>
                                    <button 
                                        onClick={() => setIsAddMenuOpen(!isAddMenuOpen)} 
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-bold shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
                                    >
                                        <PlusCircle size={16} /> Tambah Grafik
                                    </button>

                                    {/* Z-INDEX 999 AGAR DROPDOWN MUNCUL DI ATAS SEMUA ELEMEN */}
                                    {isAddMenuOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl z-[999] overflow-hidden animate-in fade-in zoom-in-95">
                                            <div className="p-1.5">
                                                <button 
                                                    onClick={() => { addChart(); setIsAddMenuOpen(false); }} 
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                                >
                                                    <BarChart2 size={16} className="text-zinc-500 dark:text-zinc-400"/> Buat Kustom Baru
                                                </button>
                                            </div>

                                            {chartTemplates && chartTemplates.length > 0 && (
                                                <>
                                                    <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1"></div>
                                                    <div className="px-4 py-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest bg-zinc-50 dark:bg-zinc-900/50">
                                                        Dari Template Tersimpan
                                                    </div>
                                                    <div className="p-1.5 max-h-60 overflow-y-auto custom-scrollbar">
                                                        {chartTemplates.map(template => (
                                                            <div key={template.id} className="flex items-center justify-between group hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                                                <button 
                                                                    onClick={() => { applyTemplate(template); setIsAddMenuOpen(false); }} 
                                                                    className="flex-1 flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-zinc-900 dark:text-zinc-100 text-left"
                                                                >
                                                                    <Bookmark size={14} className="text-zinc-900 dark:text-white"/> 
                                                                    <span className="truncate">{template.name}</span>
                                                                </button>
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); deleteTemplate(template.id); }} 
                                                                    className="p-2 mr-1 text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-red-50 dark:hover:bg-red-900/20" 
                                                                    title="Hapus Template Permanen"
                                                                >
                                                                    <X size={14} strokeWidth={3}/>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* --- WRAPPER GRID CHARTS --- */}
                        {charts.length === 0 ? (
                            <div className="w-full py-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/20 relative z-10">
                                <LayoutGrid size={32} className="text-zinc-400 dark:text-zinc-600 opacity-50" />
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Belum ada grafik yang ditampilkan.</p>
                                <button onClick={() => setIsAddMenuOpen(true)} type="button" className="text-sm font-bold text-zinc-900 dark:text-zinc-100 underline decoration-zinc-300 dark:decoration-zinc-700 hover:decoration-zinc-900 dark:hover:decoration-zinc-300 underline-offset-4">
                                    Tambah Grafik Sekarang
                                </button>
                            </div>
                        ) : (
                            <div className={`grid gap-6 items-start ${gridClass} relative z-10`}>
                                {charts.map(chartConfig => (
                                    <CustomComparisonChart 
                                        key={chartConfig.id} 
                                        config={chartConfig} 
                                        data={comparisonData} 
                                        onUpdate={(newConfig) => updateChart(chartConfig.id, newConfig)}
                                        onSaveTemplate={(name) => handleSaveTemplate(chartConfig, name)}
                                        onUpdateTemplate={(id, name) => handleUpdateTemplate(id, chartConfig, name)}
                                        onRemove={() => removeChart(chartConfig.id)} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
            </div>
        </AuthenticatedLayout>
    );
}