// resources/js/Pages/PerformanceLogs/Partials/Chart/ChartControls.jsx

import React, { useState, useRef, useEffect } from 'react';
import { BarChart2, LineChart as LineChartIcon, Trash2, ChevronDown, Check, ArrowDown01, ArrowUp10, RefreshCw, ZoomIn, ZoomOut, AlertCircle, Edit3 } from 'lucide-react';

export default function ChartControls({ 
    groupedOptions, selectedParams, setSelectedParams, paramColors, setParamColors, 
    COLOR_PALETTE, chartType, setChartType, sortBy, setSortBy, sortOrder, setSortOrder, 
    isZoomed, setIsZoomed, customTitle, setCustomTitle, onRemove 
}) {
    const dropdownRef = useRef(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [warningMsg, setWarningMsg] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const showWarning = (msg) => {
        setWarningMsg(msg);
        setTimeout(() => setWarningMsg(''), 3500);
    };

    const getParamLabel = (id) => {
        for (const cat of Object.values(groupedOptions)) {
            const found = cat.find(m => m.id === id);
            if (found) return found.label;
        }
        return id;
    };

    const handleToggleParam = (metricId) => {
        if (selectedParams.includes(metricId)) {
            setSelectedParams(prev => prev.filter(m => m !== metricId));
        } else {
            if (selectedParams.length < 3) {
                const newParams = [...selectedParams, metricId];
                setSelectedParams(newParams);
                if (!paramColors[metricId]) {
                    const used = Object.values(paramColors);
                    const available = COLOR_PALETTE.find(c => !used.includes(c)) || COLOR_PALETTE[newParams.length];
                    setParamColors(prev => ({ ...prev, [metricId]: available }));
                }
            } else {
                showWarning("Maksimal hanya bisa memilih 3 parameter sekaligus.");
            }
        }
    };

    const defaultTitle = selectedParams.length > 0 
        ? selectedParams.map(id => getParamLabel(id)).join(' vs ')
        : 'Grafik Analisis Pemain';
    const displayTitle = customTitle || defaultTitle;

    return (
        <>
            {warningMsg && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
                    <AlertCircle size={16} strokeWidth={3} />
                    <span className="text-xs font-bold tracking-wide">{warningMsg}</span>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 gap-4">
                <div className="flex items-center gap-2 flex-1">
                    <BarChart2 className="text-amber-500 shrink-0" size={18} />
                    {isEditingTitle ? (
                        <input 
                            type="text" 
                            value={customTitle} 
                            onChange={e => setCustomTitle(e.target.value)} 
                            onBlur={() => setIsEditingTitle(false)}
                            onKeyDown={e => e.key === 'Enter' && setIsEditingTitle(false)}
                            placeholder={defaultTitle}
                            autoFocus
                            className="text-sm font-black text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 w-full max-w-md outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    ) : (
                        <h3 className="text-sm font-black text-zinc-800 dark:text-zinc-100 truncate cursor-pointer hover:text-amber-600 transition-colors flex items-center gap-2 group" onClick={() => setIsEditingTitle(true)}>
                            {displayTitle} <Edit3 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                    )}
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setIsZoomed(!isZoomed)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${isZoomed ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                        {isZoomed ? <ZoomOut size={14} /> : <ZoomIn size={14} />} 
                        {isZoomed ? 'Zoom Out (Fit Layar)' : 'Zoom In (Scrollable)'}
                    </button>
                    <button onClick={onRemove} title="Hapus Chart" className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-lg"><Trash2 size={16} /></button>
                </div>
            </div>

            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-4 items-end bg-white dark:bg-zinc-950">
                <div className="relative" ref={dropdownRef}>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Parameter (Max 3)</label>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 w-64 text-sm font-bold text-zinc-900 dark:text-zinc-100 shadow-sm outline-none">
                        <span>{selectedParams.length} Parameter Dipilih</span>
                        <ChevronDown size={14} className="text-zinc-500" />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-[340px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl z-50 flex flex-col">
                            <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 px-4 py-2 border-b border-zinc-200 dark:border-zinc-700 rounded-t-xl">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Kategori Metrik</span>
                                <button onClick={() => setSelectedParams([])} className="text-[10px] font-black text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 px-2 py-1 rounded transition-colors">CLEAR ALL</button>
                            </div>
                            <div className="max-h-80 overflow-y-auto custom-scrollbar pb-2">
                                {Object.entries(groupedOptions).map(([category, items]) => (
                                    <div key={category} className="mb-2">
                                        <div className="bg-zinc-50 dark:bg-zinc-950/50 px-4 py-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest sticky top-0 z-10 backdrop-blur-sm">
                                            {category}
                                        </div>
                                        {items.map(metric => {
                                            const isSelected = selectedParams.includes(metric.id);
                                            const indentClass = !metric.isRaw ? "pl-8" : "pl-4";
                                            // Style untuk teks di-dropdown (tanpa isPerc)
                                            const textStyle = metric.isAvg ? "text-amber-600 dark:text-amber-500 italic" : "text-zinc-700 dark:text-zinc-200 font-bold";
                                            
                                            return (
                                                <div key={metric.id} onClick={() => handleToggleParam(metric.id)} className={`flex items-center justify-between py-2 pr-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${indentClass}`}>
                                                    <span className={`text-[11px] ${textStyle}`}>{metric.label}</span>
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${isSelected ? 'bg-amber-500 border-amber-500' : 'border-zinc-300 dark:border-zinc-600'}`}>
                                                        {isSelected && <Check size={12} className="text-white" />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {selectedParams.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selectedParams.map(paramId => (
                            <div key={paramId} className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-1.5 px-3 shadow-sm">
                                <input type="color" value={paramColors[paramId]} onChange={e => setParamColors(prev => ({...prev, [paramId]: e.target.value}))} className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0" />
                                <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[120px]">{getParamLabel(paramId)}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2 ml-auto">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Urutan Dalam Posisi</label>
                        <div className="flex shadow-sm">
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-l-lg py-2 h-9 text-xs font-bold px-3 text-zinc-900 dark:text-zinc-100 outline-none max-w-[180px] truncate">
                                <option value="position">Sesuai Posisi</option>
                                <option value="name">Nama Pemain</option>
                                {selectedParams.map(param => (
                                    <option key={param} value={param}>{getParamLabel(param)}</option>
                                ))}
                            </select>
                            <button onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')} className="bg-zinc-100 dark:bg-zinc-800 border-y border-r border-zinc-300 dark:border-zinc-700 rounded-r-lg px-3 h-9 text-zinc-600 dark:text-zinc-400 hover:text-amber-600 transition-colors flex items-center justify-center">
                                {sortOrder === 'desc' ? <ArrowDown01 size={16} /> : <ArrowUp10 size={16} />}
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 ml-2">
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Visualisasi</label>
                        </div>
                        <div className="flex border border-zinc-300 dark:border-zinc-700 rounded-lg h-9 overflow-hidden shadow-sm">
                            <button type="button" onClick={() => setChartType('bar')} className={`px-3 flex justify-center items-center transition-colors ${chartType === 'bar' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500'}`}><BarChart2 size={16} /></button>
                            <button type="button" onClick={() => setChartType('line')} className={`px-3 flex justify-center items-center transition-colors border-l border-zinc-300 dark:border-zinc-700 ${chartType === 'line' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500'}`}><LineChartIcon size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}