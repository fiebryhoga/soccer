// resources/js/Pages/TeamAnalysis/Partials/CustomComparisonChart.jsx

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Settings2, BarChart2, LineChart as LineChartIcon, Trash2, ChevronDown, ChevronUp, Check, AlertCircle, ZoomIn, ZoomOut, RefreshCw, BookmarkPlus, X } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from 'recharts';

const COLOR_PALETTE = ['#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#f43f5e'];

const METRICS_LIST = [
    { id: 'total_distance', label: 'Total Distance' },
    { id: 'dist_per_min', label: 'Distance / Min' },
    { id: 'hir_18_24_kmh', label: 'HIR (18-24 km/h)' },
    { id: 'sprint_distance', label: 'Sprint (>24 km/h)' },
    { id: 'total_18kmh', label: 'Total >18 km/h' },
    { id: 'accels', label: 'Accels >3m/s' },
    { id: 'decels', label: 'Decels >3m/s' },
    { id: 'hr_band_4_dist', label: 'HR Band 4 Dist' },
    { id: 'hr_band_4_dur', label: 'HR Band 4 Dur', isDuration: true },
    { id: 'hr_band_5_dist', label: 'HR Band 5 Dist' },
    { id: 'hr_band_5_dur', label: 'HR Band 5 Dur', isDuration: true },
    { id: 'max_velocity', label: 'Max Velocity' },
    { id: 'player_load', label: 'Player Load' },
];

export default function CustomComparisonChart({ config, data, onUpdate, onSaveTemplate, onUpdateTemplate, onRemove }) {
    const dropdownRef = useRef(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [warningMsg, setWarningMsg] = useState('');
    
    // Fitur Accordion (Buka/Tutup Pengaturan)
    // Default tertutup jika sudah ada parameter, terbuka jika masih kosong
    const [isConfigOpen, setIsConfigOpen] = useState(config.selectedParams?.length === 0);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [templateNameInput, setTemplateNameInput] = useState('');

    const { 
        selectedParams = [], 
        paramColors = {}, 
        chartType = 'bar', 
        isZoomed = true,
        templateId = null,
        templateName = null
    } = config;

    const chartTitle = selectedParams.length > 0 
        ? selectedParams.map(id => METRICS_LIST.find(m => m.id === id)?.label || id).join(' vs ')
        : 'Pilih Metrik Perbandingan';

    // Handler klik di luar dropdown untuk menutupnya
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const showWarning = (msg) => {
        setWarningMsg(msg);
        setTimeout(() => setWarningMsg(''), 3500);
    };

    const handleToggleParam = (metricId) => {
        let newParams;
        let newColors = { ...paramColors };

        if (selectedParams.includes(metricId)) {
            newParams = selectedParams.filter(m => m !== metricId);
        } else {
            if (selectedParams.length < 3) {
                newParams = [...selectedParams, metricId];
                if (!newColors[metricId]) {
                    const usedColors = Object.values(newColors);
                    const availableColor = COLOR_PALETTE.find(c => !usedColors.includes(c)) || COLOR_PALETTE[newParams.length];
                    newColors[metricId] = availableColor;
                }
            } else {
                showWarning("Maksimal hanya bisa memilih 3 parameter.");
                return;
            }
        }
        onUpdate({ selectedParams: newParams, paramColors: newColors });
    };

    const handleColorChange = (metricId, newColor) => {
        onUpdate({ paramColors: { ...paramColors, [metricId]: newColor } });
    };

    const handleResetColors = () => {
        const defaultColors = {};
        selectedParams.forEach((paramId, index) => {
            defaultColors[paramId] = COLOR_PALETTE[index % COLOR_PALETTE.length];
        });
        onUpdate({ paramColors: defaultColors });
    };

    // --- LOGIKA MODAL TEMPLATE ---
    const openSaveModal = (e) => {
        e.stopPropagation(); // Mencegah header accordion tertrigger
        if (selectedParams.length === 0) {
            showWarning("Pilih minimal 1 parameter sebelum menyimpan template.");
            return;
        }
        setTemplateNameInput(templateName || chartTitle);
        setIsModalOpen(true);
    };

    const submitSaveNew = () => {
        if (!templateNameInput.trim()) return;
        onSaveTemplate(templateNameInput.trim());
        setIsModalOpen(false);
    };

    const submitUpdateOld = () => {
        if (!templateNameInput.trim() || !templateId) return;
        onUpdateTemplate(templateId, templateNameInput.trim());
        setIsModalOpen(false);
    };

    // --- PARSING DATA CHART ---
    const chartData = useMemo(() => {
        return data.map(session => {
            const dataPoint = { name: session.title || session.date, date: session.date };
            
            selectedParams.forEach(paramId => {
                const rawValue = session.averages[paramId];
                const isDuration = METRICS_LIST.find(m => m.id === paramId)?.isDuration;
                
                let numericValue = 0;
                if (isDuration && rawValue && typeof rawValue === 'string') {
                    const parts = rawValue.split('.').map(Number);
                    if (parts.length === 3) numericValue = (parts[0] * 3600) + (parts[1] * 60) + (parts[2] || 0);
                    else if (parts.length === 2) numericValue = (parts[0] * 60) + (parts[1] || 0);
                } else {
                    numericValue = parseFloat(rawValue) || 0;
                }

                dataPoint[paramId] = numericValue;
                dataPoint[`raw_${paramId}`] = rawValue || '0';
            });

            return dataPoint;
        });
    }, [data, selectedParams]);

    // KOMPONEN TOOLTIP CUSTOM SHADCN (DENGAN DARK MODE EXPLICIT)
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dateText = payload[0]?.payload?.date;
            return (
                <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xl z-[1000] min-w-[200px]">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">{label}</p>
                    {dateText && <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-2">{dateText}</p>}
                    
                    <div className="flex flex-col gap-2.5">
                        {payload.map((entry, index) => {
                            const rawKey = `raw_${entry.dataKey}`;
                            const displayValue = entry.payload[rawKey] || entry.value || '0'; 
                            
                            return (
                                <div key={index} className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: entry.color }}></div>
                                        <span className="font-medium text-zinc-600 dark:text-zinc-400">{entry.name}:</span>
                                    </div>
                                    <span className="font-black text-sm text-zinc-900 dark:text-white">{displayValue}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }
        return null;
    };

    // RENDER ANGKA VERTIKAL (Menghindari angka terpotong)
    const renderTopLabel = ({ x, y, width, value, color }) => {
        if (!value || value === '0') return null;
        const xPos = width ? x + width / 2 : x;
        return (
            <text 
                x={xPos} 
                y={y - 12} 
                fill={color} 
                fontSize={10} 
                fontWeight="900" 
                textAnchor="start" 
                transform={`rotate(-90, ${xPos}, ${y - 12})`}
            >
                {value}
            </text>
        );
    };

    const minChartWidth = chartData.length * 120;

    return (
        <div className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col mb-6 transition-all hover:shadow-md h-full">
            
            {/* --- MODAL SIMPAN TEMPLATE --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-zinc-900/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
                        <div className="flex justify-between items-center mb-5 border-b border-zinc-100 dark:border-zinc-800/60 pb-4">
                            <div>
                                <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">{templateId ? 'Perbarui Template' : 'Simpan Template'}</h4>
                                <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mt-1">Simpan pengaturan metrik dan warna ke dalam database.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-lg">
                                <X size={16} strokeWidth={3}/>
                            </button>
                        </div>
                        
                        <div className="mb-6">
                            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block mb-2">Nama Template</label>
                            <input
                                type="text"
                                value={templateNameInput}
                                onChange={e => setTemplateNameInput(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 outline-none transition-all shadow-sm"
                                placeholder="Misal: Jarak & Sprint..."
                                autoFocus
                            />
                        </div>
                        
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors border border-transparent">
                                Batal
                            </button>
                            {templateId ? (
                                <div className="flex gap-2">
                                    <button onClick={submitSaveNew} className="px-4 py-2.5 text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors shadow-sm">
                                        Simpan Baru
                                    </button>
                                    <button onClick={submitUpdateOld} className="px-4 py-2.5 text-xs font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg transition-colors shadow-sm">
                                        Perbarui Lama
                                    </button>
                                </div>
                            ) : (
                                <button onClick={submitSaveNew} className="px-6 py-2.5 text-xs font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg transition-colors shadow-sm">
                                    Simpan
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {warningMsg && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/95 dark:bg-red-500/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-2xl z-[100] flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
                    <AlertCircle size={16} strokeWidth={3} />
                    <span className="text-xs font-bold tracking-wide">{warningMsg}</span>
                </div>
            )}

            {/* --- 1. HEADER ACCORDION (BISA DI-KLIK BUKA TUTUP) --- */}
            <div 
                onClick={() => setIsConfigOpen(!isConfigOpen)}
                className="flex flex-wrap items-center justify-between px-5 py-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-t-2xl gap-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900/80 transition-colors select-none group"
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm shrink-0 text-amber-500">
                        <Settings2 size={16} /> 
                    </div>
                    <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-2">
                        {chartTitle} 
                    </h3>
                    <div className="text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors bg-white dark:bg-zinc-800 p-1 rounded-md border border-zinc-200 dark:border-zinc-700 shadow-sm">
                        {isConfigOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                </div>
                
                {/* Aksi Cepat: Stop propagasi klik agar accordion tidak toggle saat memencet tombol */}
                <div className="flex flex-wrap items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                    {selectedParams.length > 0 && (
                        <button onClick={openSaveModal} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 mr-2 border border-blue-200 dark:border-blue-800/50 shadow-sm" title="Simpan sebagai template">
                            <BookmarkPlus size={14} /> <span className="hidden sm:inline">{templateId ? 'Edit' : 'Simpan'}</span>
                        </button>
                    )}
                    <button onClick={() => onUpdate({ isZoomed: !isZoomed })} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border shadow-sm ${isZoomed ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent' : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
                        {isZoomed ? <ZoomOut size={14} /> : <ZoomIn size={14} />} 
                        <span className="hidden sm:inline">{isZoomed ? 'Fit Layar' : 'Zoom In'}</span>
                    </button>
                    <button onClick={onRemove} title="Hapus Chart" className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-900/50 transition-all rounded-lg">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* --- 2. PENGATURAN GRAFIK (COLLAPSIBLE / ACCORDION CONTENT) --- */}
            {/* Menggunakan z-50 pada wadah luar agar dropdown tidak tenggelam ke canvas */}
            <div className={`transition-all duration-300 ease-in-out border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 relative z-50 ${isConfigOpen ? 'block' : 'hidden'}`}>
                <div className="p-5 flex flex-wrap gap-4 items-end">
                    
                    {/* Dropdown Metric (Dengan z-[999] agar tidak ketimpa) */}
                    <div className="relative flex-1 min-w-[220px]" ref={dropdownRef}>
                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block mb-1.5">Parameter (Max 3)</label>
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center justify-between gap-2 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 w-full text-sm font-bold text-zinc-900 dark:text-zinc-100 shadow-sm outline-none focus:ring-2 focus:ring-zinc-500 transition-all">
                            <span className="truncate">{selectedParams.length === 0 ? 'Pilih Metrik...' : `${selectedParams.length} Metrik Dipilih`}</span>
                            <ChevronDown size={14} className={`text-zinc-400 dark:text-zinc-500 shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-full sm:w-[320px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl z-[999] overflow-hidden flex flex-col max-h-80 animate-in fade-in zoom-in-95">
                                <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
                                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Katalog Metrik</span>
                                    <button onClick={() => onUpdate({ selectedParams: [] })} className="text-[9px] font-black text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 uppercase tracking-wider bg-red-50 dark:bg-red-900/30 px-2.5 py-1.5 rounded transition-colors">CLEAR</button>
                                </div>
                                <div className="overflow-y-auto p-2 custom-scrollbar space-y-1">
                                    {METRICS_LIST.map(metric => {
                                        const isSelected = selectedParams.includes(metric.id);
                                        return (
                                            <div key={metric.id} onClick={() => handleToggleParam(metric.id)} className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}>
                                                <span className={`text-xs font-bold ${isSelected ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                                    {metric.label}
                                                </span>
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ml-2 ${isSelected ? 'bg-zinc-900 border-zinc-900 dark:bg-white dark:border-white' : 'border-zinc-300 dark:border-zinc-600 bg-transparent'}`}>
                                                    {isSelected && <Check size={10} className="text-white dark:text-zinc-900 stroke-[3]" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Color Swatches */}
                    {selectedParams.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            {selectedParams.map(paramId => {
                                const paramLabel = METRICS_LIST.find(m => m.id === paramId)?.label || paramId;
                                return (
                                    <div key={paramId} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 px-3 shadow-sm">
                                        <div className="relative w-5 h-5 rounded-full overflow-hidden border border-zinc-300 dark:border-zinc-700 shadow-inner shrink-0 focus-within:ring-2 focus-within:ring-zinc-400">
                                            <input type="color" value={paramColors[paramId]} onChange={e => handleColorChange(paramId, e.target.value)} className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer border-0 bg-transparent p-0 shrink-0" />
                                        </div>
                                        <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[80px] sm:max-w-[120px]">{paramLabel}</span>
                                    </div>
                                );
                            })}
                            <button onClick={handleResetColors} className="text-[10px] p-2 font-bold text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg border border-transparent transition-colors" title="Reset Warna">
                                <RefreshCw size={14} />
                            </button>
                        </div>
                    )}

                    {/* Chart Type Toggle */}
                    <div className="flex flex-col gap-1.5 ml-auto shrink-0">
                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Tipe Visual</label>
                        <div className="flex border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg shadow-inner">
                            <button type="button" onClick={() => onUpdate({ chartType: 'bar' })} className={`px-4 py-1.5 rounded-md flex justify-center items-center transition-colors ${chartType === 'bar' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}><BarChart2 size={14} /></button>
                            <button type="button" onClick={() => onUpdate({ chartType: 'line' })} className={`px-4 py-1.5 rounded-md flex justify-center items-center transition-colors ${chartType === 'line' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}><LineChartIcon size={14} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 3. CANVAS GRAFIK --- */}
            {/* z-10 memastikan layer canvas ada di bawah area config dropdown */}
            <div className="relative z-10 flex-1">
                {selectedParams.length === 0 ? (
                    <div className="h-[400px] flex items-center justify-center text-center p-10 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-b-2xl">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <BarChart2 className="text-zinc-400 dark:text-zinc-600 opacity-50" size={32} />
                            </div>
                            <h4 className="text-zinc-900 dark:text-white font-black text-sm">Grafik Belum Terbentuk</h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-[200px]">Buka pengaturan dan pilih parameter untuk memvisualisasikan data.</p>
                        </div>
                    </div>
                ) : (
                    <div className={`w-full ${isZoomed ? 'overflow-x-auto custom-scrollbar' : 'overflow-hidden'} pb-0 pt-16 px-2 md:px-0 rounded-b-xl`}>
                        <div style={{ minWidth: isZoomed ? `${Math.max(800, minChartWidth)}px` : '100%', height: '450px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800 opacity-70" vertical={false} />
                                    
                                    {/* Label X miring & italic */}
                                    <XAxis 
                                        dataKey="name" 
                                        interval={0} 
                                        height={20} 
                                        axisLine={false} 
                                        tickLine={false}
                                        tick={(props) => {
                                            const { x, y, payload } = props;
                                            return (
                                                <text 
                                                    x={x} 
                                                    y={y + 10} 
                                                    textAnchor="end" 
                                                    fill="currentColor" 
                                                    className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold italic" 
                                                    transform={`rotate(-45, ${x}, ${y + 10})`}
                                                >
                                                    {payload.value}
                                                </text>
                                            );
                                        }}
                                    />
                                    
                                    {selectedParams.map((metric, index) => {
                                        const orientation = index % 2 === 0 ? 'left' : 'right';
                                        return (
                                            <YAxis 
                                                key={`axis-${metric}`} 
                                                yAxisId={metric} 
                                                orientation={orientation} 
                                                hide={index > 1} 
                                                // Headroom 25% agar label angka di atas chart tidak terpotong
                                                domain={[0, dataMax => dataMax === 0 ? 100 : Math.ceil(dataMax * 1.25)]}
                                                tick={{ fontSize: 10, fill: paramColors[metric], fontWeight: 'bold' }} 
                                                axisLine={false} 
                                                tickLine={true} 
                                            />
                                        );
                                    })}

                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', className: 'text-zinc-400 dark:text-zinc-600 opacity-10' }} />
                                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', top: -30 }} iconType="circle"/>

                                    {selectedParams.map((metric) => {
                                        const color = paramColors[metric];
                                        const labelName = METRICS_LIST.find(m => m.id === metric)?.label || metric;

                                        if (chartType === 'bar') {
                                            return (
                                                <Bar key={metric} yAxisId={metric} dataKey={metric} name={labelName} fill={color} radius={[0, 0, 0, 0]} maxBarSize={32}>
                                                    <LabelList dataKey={`raw_${metric}`} content={(props) => renderTopLabel({ ...props, color })} />
                                                </Bar>
                                            );
                                        } else {
                                            return (
                                                <Line key={metric} yAxisId={metric} type="monotone" dataKey={metric} name={labelName} stroke={color} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, className: "fill-white dark:fill-zinc-950" }}>
                                                    <LabelList dataKey={`raw_${metric}`} content={(props) => renderTopLabel({ ...props, color })} />
                                                </Line>
                                            );
                                        }
                                    })}
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}