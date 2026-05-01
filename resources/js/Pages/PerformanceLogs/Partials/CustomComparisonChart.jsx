// resources/js/Pages/PerformanceLogs/Partials/CustomComparisonChart.jsx

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BarChart2, LineChart as LineChartIcon, Trash2, ChevronDown, Check, ArrowDown01, ArrowUp10, RefreshCw, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';
import { FIXED_EXCEL_COLUMNS, MATCH_EXCEL_COLUMNS } from '@/Constants/metrics';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, LabelList } from 'recharts';

// --- PALET WARNA OTOMATIS ---
const COLOR_PALETTE = ['#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#f43f5e'];

export default function CustomComparisonChart({ id, log, playersData, onRemove }) {
    const isMatch = log.type === 'match';
    const dropdownRef = useRef(null);
    
    // --- 1. STATES ---
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedParams, setSelectedParams] = useState([]); // Max 3 param
    const [paramColors, setParamColors] = useState({}); 
    
    const [chartType, setChartType] = useState('bar');
    const [sortBy, setSortBy] = useState('position'); 
    const [sortOrder, setSortOrder] = useState('desc'); // desc atau asc
    const [isZoomed, setIsZoomed] = useState(true); // true = scrollable, false = fit screen
    
    const [warningMsg, setWarningMsg] = useState(''); // State untuk custom notifikasi (pengganti alert)

    // --- 2. GENERATE METRICS OPTIONS (+ AVG POSISI) ---
    const metricsOptions = useMemo(() => {
        const columns = isMatch ? MATCH_EXCEL_COLUMNS : FIXED_EXCEL_COLUMNS;
        const baseCols = columns.filter(col => !['selected', 'selected_hr4', 'selected_hr5', 'selected_pl', 'sort_order'].includes(col.id));
        
        const enhancedCols = [];
        baseCols.forEach(col => {
            enhancedCols.push(col); // Masukkan metrik asli
            // Masukkan versi "Avg Posisi" dari metrik tersebut
            enhancedCols.push({
                id: `avg_pos_${col.id}`,
                header: `Avg Pos: ${col.header || col.label || col.id}`,
                isAvg: true,
                baseId: col.id
            });
        });
        
        return enhancedCols;
    }, [isMatch]);

    // Handle klik di luar dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Helper pemicu peringatan
    const showWarning = (msg) => {
        setWarningMsg(msg);
        setTimeout(() => setWarningMsg(''), 3500); // Hilang dalam 3.5 detik
    };

    // --- 3. LOGIKA CHECKBOX PARAMETER ---
    const handleToggleParam = (metricId) => {
        if (selectedParams.includes(metricId)) {
            setSelectedParams(prev => prev.filter(m => m !== metricId));
        } else {
            if (selectedParams.length < 3) {
                const newParams = [...selectedParams, metricId];
                setSelectedParams(newParams);
                if (!paramColors[metricId]) {
                    // Assign warna otomatis berdasarkan sisa palet yang ada
                    const usedColors = Object.values(paramColors);
                    const availableColor = COLOR_PALETTE.find(c => !usedColors.includes(c)) || COLOR_PALETTE[newParams.length];
                    setParamColors(prev => ({ ...prev, [metricId]: availableColor }));
                }
            } else {
                showWarning("Maksimal hanya bisa memilih 3 parameter sekaligus.");
            }
        }
    };

    const clearAllParams = () => {
        setSelectedParams([]);
    };

    const handleColorChange = (metricId, newColor) => {
        setParamColors(prev => ({ ...prev, [metricId]: newColor }));
    };

    // --- 4. DATA PARSER ---
    const formatName = (fullName) => {
        const parts = fullName.trim().split(' ');
        if (parts.length === 1) return parts[0];
        return `${parts[0].charAt(0)}. ${parts[parts.length - 1]}`;
    };

    const parseNumericValue = (val) => {
        if (val === null || val === undefined || val === '') return 0;
        if (typeof val === 'number') return val;
        
        let strVal = val.toString().trim();
        // Bersihkan simbol % agar bisa dibaca sebagai angka
        strVal = strVal.replace('%', ''); 

        if (strVal.includes(':')) {
            const parts = strVal.split(':').map(Number);
            if (parts.length === 2) return (parts[0] * 60) + (parts[1] || 0); 
            if (parts.length === 3) return (parts[0] * 3600) + (parts[1] * 60) + (parts[2] || 0); 
        }
        return parseFloat(strVal.replace(',', '.')) || 0;
    };

    // --- 5. DATA PREPARATION (Hitung Avg + Grouping & Gap) ---
    const { chartData, positionDividers } = useMemo(() => {
        const activePlayersRaw = playersData.filter(p => p.is_playing !== false);

        // Langkah A: Hitung Rata-Rata Posisi untuk setiap metrik dasar
        const posStats = {};
        activePlayersRaw.forEach(p => {
            if (!posStats[p.position]) posStats[p.position] = {};
            metricsOptions.filter(m => !m.isAvg).forEach(m => {
                if (!posStats[p.position][m.id]) posStats[p.position][m.id] = { sum: 0, count: 0 };
                const val = parseNumericValue(p.metrics?.[m.id]);
                if (val > 0) { // Hanya hitung jika nilainya valid > 0
                    posStats[p.position][m.id].sum += val;
                    posStats[p.position][m.id].count += 1;
                }
            });
        });

        // Simpan nilai akhir rata-rata posisinya
        const posAverages = {};
        Object.keys(posStats).forEach(pos => {
            posAverages[pos] = {};
            metricsOptions.filter(m => !m.isAvg).forEach(m => {
                const count = posStats[pos][m.id].count;
                posAverages[pos][m.id] = count > 0 ? (posStats[pos][m.id].sum / count) : 0;
            });
        });

        // Langkah B: Bentuk Objek Pemain
        let activePlayers = activePlayersRaw.map(p => {
            const dataObj = {
                id: p.player_id,
                originalName: p.name,
                formattedName: formatName(p.name),
                position: p.position,
            };
            
            selectedParams.forEach(paramId => {
                // Jika parameter yang dipilih adalah "Avg Posisi"
                if (paramId.startsWith('avg_pos_')) {
                    const baseId = paramId.replace('avg_pos_', '');
                    const avgVal = posAverages[p.position]?.[baseId] || 0;
                    
                    dataObj[paramId] = parseFloat(avgVal.toFixed(2));
                    // Jika data aslinya ada %, tampilkan juga % di tooltip
                    const hasPercent = p.metrics?.[baseId]?.toString().includes('%');
                    dataObj[`raw_${paramId}`] = `${avgVal.toFixed(1)}${hasPercent ? '%' : ''}`; 
                } 
                // Jika parameter biasa
                else {
                    const rawVal = p.metrics?.[paramId] || '';
                    dataObj[paramId] = parseNumericValue(rawVal);
                    dataObj[`raw_${paramId}`] = rawVal;
                }
            });
            return dataObj;
        });

        // Langkah C: SORTING LOGIC YANG DIKUNCI OLEH POSISI
        activePlayers.sort((a, b) => {
            // 1. Posisinya WAJIB terkelompok (Hirarki Mutlak)
            const posOrder = { 'GK': 1, 'CB': 2, 'FB': 3, 'MF': 4, 'WF': 5, 'FW': 6 };
            const posDiff = (posOrder[a.position] || 99) - (posOrder[b.position] || 99);
            if (posDiff !== 0) return posDiff; // Jangan dibalik oleh sortOrder, GK selalu di kiri
            
            // 2. Jika posisinya sama, barulah di-sorting sesuai keinginan User (Asc/Desc)
            let diff = 0;
            if (sortBy === 'name' || sortBy === 'position') { // Default position di dalam grup urut nama
                diff = a.originalName.localeCompare(b.originalName);
            } 
            else if (sortBy === 'value' && selectedParams[0]) {
                const m1 = selectedParams[0];
                diff = (a[m1] || 0) - (b[m1] || 0);
            }

            return sortOrder === 'desc' ? -diff : diff;
        });

        // Langkah D: Suntikkan GAP untuk UI Reference Line
        const cData = [];
        const dividers = [];
        let currentPos = null;
        let gapIndex = 0;

        activePlayers.forEach((player) => {
            if (currentPos !== null && player.position !== currentPos) {
                const gapId = `gap_${gapIndex++}`;
                cData.push({ formattedName: gapId, isGap: true });
                dividers.push({ xLabel: gapId, label: player.position });
            } else if (currentPos === null) {
                const gapId = `gap_start`;
                cData.push({ formattedName: gapId, isGap: true });
                dividers.push({ xLabel: gapId, label: player.position });
            }
            cData.push(player);
            currentPos = player.position;
        });

        return { chartData: cData, positionDividers: dividers };
    }, [playersData, selectedParams, sortBy, sortOrder]);

    const chartTitle = selectedParams.length > 0 
        ? selectedParams.map(id => metricsOptions.find(m => m.id === id)?.header || id).join(' vs ')
        : 'Grafik Analisis Pemain';

    // --- RENDERERS RECHARTS ---
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length && !label.startsWith('gap_')) {
            return (
                <div className="bg-zinc-950/90 backdrop-blur-sm border border-zinc-700/50 p-4 rounded-xl shadow-xl text-white text-xs z-50">
                    <p className="font-bold mb-3 text-zinc-300 border-b border-zinc-800 pb-2 flex items-center gap-2">
                        {label} <span className="px-1.5 py-0.5 bg-zinc-800 rounded text-[9px]">{payload[0]?.payload?.position}</span>
                    </p>
                    <div className="flex flex-col gap-2">
                        {payload.map((entry, index) => {
                            const rawKey = `raw_${entry.dataKey}`;
                            const displayValue = entry.payload[rawKey] || entry.value || '0'; 
                            return (
                                <div key={index} className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: entry.color }}></div>
                                        <span className="font-medium text-zinc-400">{entry.name}:</span>
                                    </div>
                                    <span className="font-black text-sm">{displayValue}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderTopLabel = ({ x, y, width, value, color }) => {
        if (!value || value === '0') return null;
        return (
            <text x={x + width / 2} y={y - 8} fill={color} fontSize={10} fontWeight="900" textAnchor="start" transform={`rotate(-90, ${x + width / 2}, ${y - 8})`}>
                {value}
            </text>
        );
    };

    const minChartWidth = chartData.length * 60; // 60px jarak aman per titik/bar

    return (
        <div className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-visible flex flex-col mb-6">
            
            {/* --- CUSTOM WARNING MODAL/TOAST --- */}
            {warningMsg && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
                    <AlertCircle size={16} strokeWidth={3} />
                    <span className="text-xs font-bold tracking-wide">{warningMsg}</span>
                </div>
            )}

            {/* --- TOOLBAR HEADER --- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 gap-4">
                <h3 className="text-sm font-black text-zinc-800 dark:text-zinc-100 flex items-center gap-2 truncate pr-4">
                    <BarChart2 className="text-amber-500 shrink-0" size={18} /> {chartTitle}
                </h3>
                
                {/* Aksi Header */}
                <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setIsZoomed(!isZoomed)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${isZoomed ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                        {isZoomed ? <ZoomOut size={14} /> : <ZoomIn size={14} />} 
                        {isZoomed ? 'Mode Lebar (Scroll)' : 'Paskan Layar'}
                    </button>
                    <button onClick={onRemove} title="Hapus Chart" className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-lg">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* --- FILTER & CONTROLS --- */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-4 items-end bg-white dark:bg-zinc-950">
                
                {/* 1. CUSTOM CHECKBOX DROPDOWN (MAX 3) */}
                <div className="relative" ref={dropdownRef}>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Parameter Grafik (Max 3)</label>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 w-64 text-sm font-bold text-zinc-900 dark:text-zinc-100 shadow-sm outline-none">
                        <span>{selectedParams.length} Parameter Dipilih</span>
                        <ChevronDown size={14} className="text-zinc-500" />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-[300px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 px-4 py-2 border-b border-zinc-200 dark:border-zinc-700">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Daftar Metrik</span>
                                <button onClick={clearAllParams} className="text-[10px] font-black text-red-500 hover:text-red-600 uppercase tracking-wider bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">Clear All</button>
                            </div>
                            <div className="max-h-72 overflow-y-auto p-2 custom-scrollbar">
                                {metricsOptions.map(metric => {
                                    const isSelected = selectedParams.includes(metric.id);
                                    return (
                                        <div key={metric.id} onClick={() => handleToggleParam(metric.id)} className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors mb-1 ${isSelected ? 'bg-amber-50 dark:bg-amber-900/10' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
                                            <span className={`text-xs font-semibold ${isSelected ? 'text-amber-700 dark:text-amber-400' : 'text-zinc-700 dark:text-zinc-300'} ${metric.isAvg ? 'italic' : ''}`}>
                                                {metric.header || metric.label}
                                            </span>
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ml-2 ${isSelected ? 'bg-amber-500 border-amber-500' : 'border-zinc-400 dark:border-zinc-600 bg-transparent'}`}>
                                                {isSelected && <Check size={12} className="text-white" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- CHIP WARNA CUSTOM --- */}
                {selectedParams.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selectedParams.map(paramId => {
                            const paramLabel = metricsOptions.find(m => m.id === paramId)?.header || paramId;
                            return (
                                <div key={paramId} className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-1.5 px-3">
                                    <input type="color" value={paramColors[paramId]} onChange={e => handleColorChange(paramId, e.target.value)} className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0" />
                                    <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[120px]">{paramLabel}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 2. SORTING & DIRECTION */}
                <div className="flex items-center gap-2 ml-auto">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Urutan Dalam Posisi</label>
                        <div className="flex shadow-sm">
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-l-lg py-2 h-9 text-xs font-bold px-3 text-zinc-900 dark:text-zinc-100 outline-none">
                                <option value="name">Nama Pemain</option>
                                <option value="value">Nilai Parameter ke-1</option>
                            </select>
                            <button onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')} className="bg-zinc-100 dark:bg-zinc-800 border-y border-r border-zinc-300 dark:border-zinc-700 rounded-r-lg px-3 h-9 text-zinc-600 dark:text-zinc-400 hover:text-amber-600 transition-colors flex items-center justify-center" title="Ascending / Descending">
                                {sortOrder === 'desc' ? <ArrowDown01 size={16} /> : <ArrowUp10 size={16} />}
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 ml-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Visualisasi</label>
                        <div className="flex border border-zinc-300 dark:border-zinc-700 rounded-lg h-9 overflow-hidden shadow-sm">
                            <button type="button" onClick={() => setChartType('bar')} className={`px-4 flex justify-center items-center transition-colors ${chartType === 'bar' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500'}`}><BarChart2 size={16} /></button>
                            <button type="button" onClick={() => setChartType('line')} className={`px-4 flex justify-center items-center transition-colors border-l border-zinc-300 dark:border-zinc-700 ${chartType === 'line' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500'}`}><LineChartIcon size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- KANVAS GRAFIK --- */}
            {selectedParams.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center text-center p-10 bg-zinc-50/50 dark:bg-zinc-900/10">
                    <div>
                        <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-4 border border-zinc-200 dark:border-zinc-800"><BarChart2 className="text-zinc-400" size={32} /></div>
                        <h4 className="text-zinc-800 dark:text-zinc-200 font-bold text-sm">Grafik Belum Terbentuk</h4>
                        <p className="text-xs text-zinc-500 mt-1 max-w-xs">Silakan pilih minimal 1 parameter (Maks. 3) di menu dropdown atas untuk mulai menampilkan perbandingan data.</p>
                    </div>
                </div>
            ) : (
                // Fitur Zoom In/Out direpresentasikan dengan width 100% vs width minimum scrollable
                <div className="w-full overflow-x-auto custom-scrollbar pb-4 pt-10">
                    <div style={{ minWidth: isZoomed ? `${Math.max(800, minChartWidth)}px` : '100%', height: '500px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" opacity={0.2} vertical={false} />
                                
                                <XAxis 
                                    dataKey="formattedName" 
                                    interval={0} 
                                    height={60}
                                    tick={(props) => {
                                        const { x, y, payload } = props;
                                        if (payload.value && payload.value.toString().startsWith('gap_')) return null;
                                        return (
                                            <text x={x} y={y + 10} textAnchor="end" fill="#71717a" fontSize={11} fontStyle="italic" fontWeight="bold" transform={`rotate(-45, ${x}, ${y})`}>
                                                {payload.value}
                                            </text>
                                        );
                                    }}
                                />
                                
                                {/* Mapping YAxis: Maksimal 3 parameter */}
                                {selectedParams.map((metric, index) => {
                                    // Param 1 di Kiri, Param 2 di Kanan.
                                    // Param ke-3 kita render grafiknya, tapi kita Sembunyikan Sumbu/Axis-nya agar UI tidak berantakan.
                                    const orientation = index === 1 ? 'right' : 'left';
                                    const isAxisHidden = index > 1; 

                                    return (
                                        <YAxis 
                                            key={`axis-${metric}`}
                                            yAxisId={metric} 
                                            orientation={orientation} 
                                            hide={isAxisHidden}
                                            tick={{ fontSize: 11, fill: paramColors[metric], fontWeight: 'bold' }} 
                                            axisLine={{ stroke: paramColors[metric] }} 
                                        />
                                    );
                                })}

                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255, 0.05)' }} />
                                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', top: -30 }} />

                                {/* Referensi Garis Posisi */}
                                {positionDividers.map((divider, index) => (
                                    <ReferenceLine 
                                        key={`ref-${index}`} 
                                        yAxisId={selectedParams[0]} // tempel ke axis pertama
                                        x={divider.xLabel} 
                                        stroke="#71717a" 
                                        strokeDasharray="5 5" 
                                        label={{ position: 'top', value: divider.label, fill: '#52525b', fontSize: 14, fontWeight: '900', offset: 30 }} 
                                    />
                                ))}

                                {/* RENDER DATA MAKSIMAL 3 VAR */}
                                {selectedParams.map((metric) => {
                                    const color = paramColors[metric];
                                    const optionObj = metricsOptions.find(m => m.id === metric);
                                    const labelName = optionObj?.header || metric;
                                    
                                    // Jika metrik adalah Avg Posisi, selalu gunakan format Line dengan dash agar berbeda secara visual
                                    if (optionObj?.isAvg) {
                                        return (
                                            <Line key={metric} yAxisId={metric} type="step" dataKey={metric} name={labelName} stroke={color} strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={{ r: 6 }}>
                                                <LabelList dataKey={`raw_${metric}`} content={(props) => renderTopLabel({ ...props, color })} />
                                            </Line>
                                        );
                                    }

                                    if (chartType === 'bar') {
                                        return (
                                            <Bar key={metric} yAxisId={metric} dataKey={metric} name={labelName} fill={color} radius={[0, 0, 0, 0]} maxBarSize={40}>
                                                <LabelList dataKey={`raw_${metric}`} content={(props) => renderTopLabel({ ...props, color })} />
                                            </Bar>
                                        );
                                    } else {
                                        return (
                                            <Line key={metric} yAxisId={metric} type="monotone" dataKey={metric} name={labelName} stroke={color} strokeWidth={3} dot={{ r: 4 }}>
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
    );
}