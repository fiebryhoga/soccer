// resources/js/Pages/PerformanceLogs/Partials/Chart/ChartControls.jsx

import React, { useState, useRef, useEffect } from 'react';
import { BarChart2, LineChart as LineChartIcon, Trash2, ChevronDown, Check, ArrowDown01, ArrowUp10, ZoomIn, ZoomOut, AlertCircle, Edit3, Settings2 } from 'lucide-react';

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

    const defaultTitle = selectedParams.length > 0 ? selectedParams.map(id => getParamLabel(id)).join(' vs ') : 'Grafik Analisis Pemain';
    const displayTitle = customTitle || defaultTitle;

    return (
        <>
            {warningMsg && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
                    <AlertCircle size={16} strokeWidth={3} />
                    <span className="text-xs font-bold tracking-wide">{warningMsg}</span>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 rounded-t-lg gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <div className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-sm rounded-lg text-zinc-900 dark:text-zinc-100">
                        <BarChart2 size={16} />
                    </div>
                    {isEditingTitle ? (
                        <input 
                            type="text" value={customTitle} onChange={e => setCustomTitle(e.target.value)} 
                            onBlur={() => setIsEditingTitle(false)} onKeyDown={e => e.key === 'Enter' && setIsEditingTitle(false)}
                            placeholder={defaultTitle} autoFocus
                            className="text-sm font-black text-zinc-900 dark:text-white bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 w-full max-w-md outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white shadow-sm"
                        />
                    ) : (
                        <h3 className="text-sm font-black text-zinc-900 dark:text-white truncate cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors flex items-center gap-2 group" onClick={() => setIsEditingTitle(true)}>
                            {displayTitle} <Edit3 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 dark:text-zinc-500" />
                        </h3>
                    )}
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setIsZoomed(!isZoomed)} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border shadow-sm ${isZoomed ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent' : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
                        {isZoomed ? <ZoomOut size={14} /> : <ZoomIn size={14} />} {isZoomed ? 'Fit Layar' : 'Zoom In'}
                    </button>
                    <button onClick={onRemove} title="Hapus Chart" className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-900/50 transition-all rounded-lg"><Trash2 size={16} /></button>
                </div>
            </div>

            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col xl:flex-row gap-5 xl:items-end bg-white dark:bg-zinc-950">
                <div className="relative flex-1 max-w-xs" ref={dropdownRef}>
                    <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Settings2 size={12} /> Pilih Parameter (Max 3)</label>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center justify-between w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg px-4 py-2.5 text-sm font-bold text-zinc-900 dark:text-zinc-100 shadow-sm transition-all focus:ring-2 focus:ring-zinc-500">
                        <span>{selectedParams.length === 0 ? 'Pilih Metrik...' : `${selectedParams.length} Metrik Dipilih`}</span>
                        <ChevronDown size={14} className={`text-zinc-400 dark:text-zinc-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-full sm:w-[360px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
                            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-700">
                                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Katalog Metrik</span>
                                <button onClick={() => setSelectedParams([])} className="text-[10px] font-black text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 px-2 py-1 rounded transition-colors">RESET</button>
                            </div>
                            <div className="max-h-80 overflow-y-auto custom-scrollbar p-2 space-y-3">
                                {Object.entries(groupedOptions).map(([category, items]) => (
                                    <div key={category} className="space-y-1">
                                        <div className="px-2 py-1 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{category}</div>
                                        {items.map(metric => {
                                            const isSelected = selectedParams.includes(metric.id);
                                            return (
                                                <div key={metric.id} onClick={() => handleToggleParam(metric.id)} className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}>
                                                    <span className={`text-xs ${metric.isAvg ? 'italic font-medium' : 'font-bold'} ${isSelected ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>{metric.label}</span>
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-zinc-900 border-zinc-900 dark:bg-white dark:border-white' : 'border-zinc-300 dark:border-zinc-600 bg-transparent'}`}>
                                                        {isSelected && <Check size={10} className="text-white dark:text-zinc-900 stroke-[3]" />}
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

                <div className="flex-1 flex flex-wrap gap-2">
                    {selectedParams.map(paramId => (
                        <div key={paramId} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-1.5 px-3 shadow-sm group">
                            <div className="relative w-5 h-5 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-inner shrink-0 focus-within:ring-2 focus-within:ring-zinc-500">
                                <input type="color" value={paramColors[paramId]} onChange={e => setParamColors(prev => ({...prev, [paramId]: e.target.value}))} className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer border-0 bg-transparent p-0" />
                            </div>
                            <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[140px]">{getParamLabel(paramId)}</span>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-4 mt-2 xl:mt-0 xl:ml-auto">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Urutkan</label>
                        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg shadow-inner border border-zinc-200 dark:border-zinc-800">
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-transparent border-none text-xs font-bold px-3 py-1.5 text-zinc-900 dark:text-zinc-100 outline-none cursor-pointer">
                                <option value="position">Posisi Skuad</option>
                                <option value="name">Alfabet Nama</option>
                                {selectedParams.map(param => <option key={param} value={param}>{getParamLabel(param)}</option>)}
                            </select>
                            <button onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')} className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 shadow-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center justify-center">
                                {sortOrder === 'desc' ? <ArrowDown01 size={14} /> : <ArrowUp10 size={14} />}
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Gaya Visual</label>
                        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg shadow-inner border border-zinc-200 dark:border-zinc-800">
                            <button type="button" onClick={() => setChartType('bar')} className={`px-3 py-1.5 rounded-lg flex items-center justify-center transition-all ${chartType === 'bar' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}><BarChart2 size={16} /></button>
                            <button type="button" onClick={() => setChartType('line')} className={`px-3 py-1.5 rounded-lg flex items-center justify-center transition-all ${chartType === 'line' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}><LineChartIcon size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}