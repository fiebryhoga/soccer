import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LabelList, ReferenceLine, Rectangle } from 'recharts';
import { Settings2, Trash2, Plus, X, ArrowDownUp, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { METRIC_GROUPS, AVAILABLE_METRICS, DEFAULT_COLORS, parseTimeToMinutes, formatMetricValue, calculateYAxisDomain, POSITIONS } from '@/Constants/metrics';

// 1. Definisikan Urutan Posisi yang Paten
const getPosOrder = (pos) => {
    const idx = POSITIONS.indexOf(pos?.toUpperCase());
    return idx !== -1 ? idx : 99;
};

// 2. Buat Skema Rata-Rata Per Posisi (AVG POS)
const AVG_POS_METRICS = AVAILABLE_METRICS.map(m => ({
    id: `avg_pos_${m.id}`,
    label: `Avg Pos: ${m.label}`,
    type: m.type
}));

// 3. Gabungkan Semua Definisi Metrik
const ALL_METRICS_DEF = [...AVAILABLE_METRICS, ...AVG_POS_METRICS];

export default function CustomSessionChart({ sessionData, onRemove }) {
    // STATE GRAFIK
    const [selectedParams, setSelectedParams] = useState(['total_distance']);
    const [colors, setColors] = useState({ 'total_distance': DEFAULT_COLORS[0] });
    const [isEditing, setIsEditing] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false); 
    const [sortBy, setSortBy] = useState('position'); 
    const [sortOrder, setSortOrder] = useState('desc'); 

    const toggleSortOrder = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');

    // Pemendek Nama (Contoh: Dimas Fiebry -> D. Fiebry)
    const formatName = (fullName) => {
        if (!fullName) return 'Unknown';
        const parts = fullName.trim().split(' ');
        if (parts.length === 1) return parts[0];
        return `${parts[0].charAt(0).toUpperCase()}. ${parts[parts.length - 1]}`;
    };

    // ========================================================================
    // ENGINE UTAMA: MURNI MENGAMBIL DATA DARI SHOW.JSX TANPA MENGHITUNG ULANG
    // ========================================================================
    const chartData = useMemo(() => {
        if (!sessionData || !sessionData.playerMetrics) return [];

        // TAHAP 1: Ekstraksi Data Murni dari Object yang dikirim Show.jsx
        let parsedPlayers = sessionData.playerMetrics.map(pm => {
            let calc = {};
            
            // Loop seluruh variabel yang ada di master metrics.js
            AVAILABLE_METRICS.forEach(m => {
                const rawValue = pm.metrics[m.id]; // Ambil angkanya secara absolut

                if (m.id.includes('_percent')) {
                    // Pastikan persentase ditangkap sebagai float
                    calc[m.id] = parseFloat(rawValue) || 0;
                } else if (m.type === 'duration') {
                    // Durasi (00:32:00) harus di-parse jadi Menit agar BarChart bisa menggambar tinggi barnya
                    calc[m.id] = parseTimeToMinutes(rawValue);
                } else {
                    // Angka desimal dan number biasa
                    calc[m.id] = parseFloat(rawValue) || 0;
                }
            });

            return {
                name: formatName(pm.player?.name),
                fullName: pm.player?.name,
                position: pm.player?.position || 'Unk',
                _raw: calc // Simpan untuk sorting & kalkulasi rata-rata
            };
        });

        // TAHAP 2: Bikin Rata-Rata Per Posisi (AVG POS)
        let posStats = {};
        parsedPlayers.forEach(p => {
            if (!posStats[p.position]) posStats[p.position] = { count: 0, totals: {} };
            posStats[p.position].count++;
            Object.keys(p._raw).forEach(k => {
                posStats[p.position].totals[k] = (posStats[p.position].totals[k] || 0) + p._raw[k];
            });
        });

        let enrichedPlayers = parsedPlayers.map(p => {
            let avgs = {};
            Object.keys(p._raw).forEach(k => {
                avgs[`avg_pos_${k}`] = posStats[p.position].count > 0 ? posStats[p.position].totals[k] / posStats[p.position].count : 0;
            });
            
            let finalDataObj = { ...p._raw, ...avgs };
            
            // Siapkan struktur untuk Recharts
            let row = { name: p.name, fullName: p.fullName, position: p.position, _raw: finalDataObj };
            
            // Inject variabel yang dipilih user ke root object agar Recharts bisa membacanya
            selectedParams.forEach(param => { 
                row[param] = finalDataObj[param] || 0; 
            });
            
            return row;
        });

        // TAHAP 3: SORTING (Kunci: Wajib dikelompokkan berdasarkan POSISI terlebih dahulu)
        enrichedPlayers.sort((a, b) => {
            // Pengelompokan Primer: POSISI
            if (a.position !== b.position) return getPosOrder(a.position) - getPosOrder(b.position);

            // Pengelompokan Sekunder: Sorting Pilihan User
            let valA = sortBy === 'name' || sortBy === 'position' ? a.fullName.toLowerCase() : (a._raw[sortBy] || 0);
            let valB = sortBy === 'name' || sortBy === 'position' ? b.fullName.toLowerCase() : (b._raw[sortBy] || 0);

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        // TAHAP 4: INJEKSI GAP (Spasi Kosong Pembatas Posisi)
        let finalData = [];
        let currentPos = null;
        enrichedPlayers.forEach((d, idx) => {
            if (d.position !== currentPos) {
                currentPos = d.position;
                finalData.push({
                    name: `gap_${currentPos}_${idx}`, 
                    isSeparator: true,
                    positionLabel: currentPos
                });
            }
            finalData.push(d);
        });

        return finalData;
    }, [sessionData, selectedParams, sortBy, sortOrder]);


    // ========================================================================
    // INTERAKSI PENGGUNA
    // ========================================================================
    const handleAddParam = (e) => {
        const paramId = e.target.value;
        if (paramId && selectedParams.length < 2 && !selectedParams.includes(paramId)) {
            const newParams = [...selectedParams, paramId];
            setSelectedParams(newParams);

            // Pilihkan warna yang belum terpakai otomatis
            const usedColors = Object.values(colors);
            const availableColor = DEFAULT_COLORS.find(c => !usedColors.includes(c)) || DEFAULT_COLORS[newParams.length % DEFAULT_COLORS.length];
            setColors(prev => ({ ...prev, [paramId]: availableColor }));
        }
        e.target.value = ""; 
    };

    const handleRemoveParam = (paramId) => {
        setSelectedParams(selectedParams.filter(p => p !== paramId));
        if (sortBy === paramId) setSortBy('position'); 
    };

    const resetColors = () => {
        let newColors = {};
        selectedParams.forEach((param, idx) => { newColors[param] = DEFAULT_COLORS[idx % DEFAULT_COLORS.length]; });
        setColors(newColors);
    };


    // ========================================================================
    // KOMPONEN RENDER (UI)
    // ========================================================================
    
    // Tooltip Cantik saat Bar di-hover
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length && !payload[0].payload.isSeparator) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-4 rounded-xl shadow-xl z-50 min-w-[240px]">
                    <p className="font-black text-lg text-zinc-900 dark:text-white leading-none mb-1">{data.fullName}</p>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">{data.position}</p>
                    {payload.map((entry, index) => {
                        const metricDef = ALL_METRICS_DEF.find(m => m.id === entry.dataKey);
                        return (
                            <div key={index} className="flex items-center justify-between gap-6 mb-1.5 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }}></div>
                                    <span className="font-medium text-zinc-600 dark:text-zinc-400">{metricDef?.label || entry.name}</span>
                                </div>
                                <span className="font-black text-zinc-900 dark:text-white tabular-nums">
                                    {/* Kembalikan angka menit ke HH:MM:SS atau Desimal/Angka */}
                                    {formatMetricValue(entry.value, metricDef?.type)}
                                    {/* Jika ID mengandung percent, tambahkan simbol % di tooltip */}
                                    {metricDef?.id.includes('_percent') ? '%' : ''}
                                </span>
                            </div>
                        )
                    })}
                </div>
            );
        }
        return null;
    };

    // Garis Penyekat Posisi (Dashed Lines)
    const renderPositionSeparators = () => {
        return chartData.filter(d => d.isSeparator).map((d) => (
            <ReferenceLine 
                key={d.name} 
                x={d.name} 
                stroke="#a1a1aa" 
                strokeDasharray="5 5"
                strokeWidth={1.5}
                strokeOpacity={0.5}
                label={{ 
                    position: 'top', 
                    value: d.positionLabel, 
                    fill: '#71717a', 
                    fontSize: 16, 
                    fontWeight: 900, 
                    dy: -15, // Tarik label posisinya agak ke atas
                }} 
            />
        ));
    };

    const dynamicChartWidth = isZoomed ? Math.max(1000, chartData.length * 75) : '100%';

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm mt-6 overflow-hidden transition-all">
            
            {/* 1. HEADER (TOMBOL KONTROL) */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsEditing(!isEditing)} className={`p-2 rounded-lg transition-colors shadow-sm border ${isEditing ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-400' : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-900 dark:border-zinc-700'}`}>
                        <Settings2 size={16} />
                    </button>
                    <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                        {selectedParams.length > 0 ? selectedParams.map(id => ALL_METRICS_DEF.find(m => m.id === id)?.label).join(' & ') : 'New Custom Diagram'}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setIsZoomed(!isZoomed)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${isZoomed ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700'}`}>
                        {isZoomed ? <><ZoomOut size={14} /> Fit Screen</> : <><ZoomIn size={14} /> Scroll View</>}
                    </button>
                    <button type="button" onClick={onRemove} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* 2. CONFIG PANEL (PEMILIH VARIABEL BERSARANG) */}
            {isEditing && (
                <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        
                        <select onChange={handleAddParam} disabled={selectedParams.length >= 2} className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 text-sm font-bold rounded-lg px-3 py-2.5 text-zinc-800 dark:text-zinc-200 outline-none w-64 shadow-sm disabled:opacity-50">
                            <option value="">{selectedParams.length >= 2 ? "Max 2 Parameters" : "+ Select Variable..."}</option>
                            {METRIC_GROUPS.map((group, i) => (
                                <optgroup key={i} label={group.label}>
                                    {group.metrics.filter(m => !selectedParams.includes(m.id)).map(m => (
                                        <option key={m.id} value={m.id}>{m.label}</option>
                                    ))}
                                </optgroup>
                            ))}
                            <optgroup label="Averages per Position">
                                {AVG_POS_METRICS.filter(m => !selectedParams.includes(m.id)).map(m => (
                                    <option key={m.id} value={m.id}>{m.label}</option>
                                ))}
                            </optgroup>
                        </select>

                        {/* List Active Params & Edit Warna */}
                        {selectedParams.length > 0 && (
                            <div className="flex flex-wrap items-center gap-3 border-l-0 sm:border-l sm:border-zinc-200 dark:sm:border-zinc-700 pl-0 sm:pl-4">
                                {selectedParams.map(paramId => {
                                    const metricDef = ALL_METRICS_DEF.find(m => m.id === paramId);
                                    return (
                                        <div key={paramId} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg shadow-sm">
                                            <input type="color" value={colors[paramId] || '#000000'} onChange={(e) => setColors({ ...colors, [paramId]: e.target.value })} className="w-5 h-5 p-0 border-0 rounded cursor-pointer bg-transparent"/>
                                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{metricDef?.label}</span>
                                            <button type="button" onClick={() => handleRemoveParam(paramId)} className="ml-1 text-zinc-400 hover:text-red-500"><X size={14} strokeWidth={3}/></button>
                                        </div>
                                    )
                                })}
                                <button type="button" onClick={resetColors} className="text-[10px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 flex items-center gap-1 ml-2"><RotateCcw size={12} /> Reset Colors</button>
                            </div>
                        )}
                    </div>

                    {/* Fitur Sort */}
                    {selectedParams.length > 0 && (
                        <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                            <span className="text-xs font-bold text-zinc-500 ml-2">Sort by:</span>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-sm font-bold text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer border-none py-1">
                                <option value="position">Position Only</option>
                                <option value="name">Player Name</option>
                                {selectedParams.map(id => (
                                    <option key={id} value={id}>{ALL_METRICS_DEF.find(m => m.id === id)?.label}</option>
                                ))}
                            </select>
                            <button type="button" onClick={toggleSortOrder} className="p-1.5 bg-white border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 rounded shadow-sm hover:bg-zinc-100">
                                <ArrowDownUp size={14} className="text-zinc-600 dark:text-zinc-300"/>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* 3. AREA RENDER GRAFIK */}
            <div className="p-6 overflow-x-auto custom-scrollbar">
                {selectedParams.length === 0 ? (
                    <div className="h-64 flex flex-col justify-center items-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/10">
                        <Plus size={32} className="mb-3 opacity-50"/>
                        <p className="text-sm font-bold text-zinc-500">Diagram Kosong</p>
                    </div>
                ) : (
                    <div className="transition-all duration-300 ease-in-out" style={{ height: '600px', width: dynamicChartWidth, minWidth: '800px' }}>
                        {/* BOTTOM 140 memberikan jarak jauh antara legenda dan nama pemain */}
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 50, right: 10, left: 10, bottom: 140 }} barCategoryGap="15%" barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.2} />
                                
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={{ stroke: '#52525b', opacity: 0.3 }}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#3f3f46', fontWeight: 800 }} 
                                    angle={-45}         
                                    textAnchor="end"    
                                    dy={15}
                                    interval={0}
                                    tickFormatter={(val) => val.startsWith('gap_') ? '' : val} 
                                />
                                
                                <YAxis 
                                    yAxisId="left" 
                                    domain={[0, dataMax => calculateYAxisDomain(dataMax)]} 
                                    axisLine={false}
                                    tickLine={false}
                                    width={65} 
                                    tick={{ fontSize: 11, fill: '#71717a', fontWeight: 600 }} 
                                    tickFormatter={(val) => formatMetricValue(val, ALL_METRICS_DEF.find(m => m.id === selectedParams[0])?.type)}
                                />
                                
                                {selectedParams.length > 1 && (
                                    <YAxis 
                                        yAxisId="right" 
                                        orientation="right" 
                                        domain={[0, dataMax => calculateYAxisDomain(dataMax)]} 
                                        axisLine={false}
                                        tickLine={false}
                                        width={65}
                                        tick={{ fontSize: 11, fill: '#71717a', fontWeight: 600 }} 
                                        tickFormatter={(val) => formatMetricValue(val, ALL_METRICS_DEF.find(m => m.id === selectedParams[1])?.type)}
                                    />
                                )}
                                
                                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5', opacity: 0.1 }} />
                                
                                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '80px', fontSize: '13px', fontWeight: 700, color: '#52525b' }} />
                                
                                {/* Eksekusi Garis Pemisah */}
                                {renderPositionSeparators()}

                                {/* Gambar Bar untuk setiap variabel yang dipilih */}
                                {selectedParams.map((paramId, index) => {
                                    const yAxisId = index % 2 === 0 ? "left" : "right"; 
                                    const metricDef = ALL_METRICS_DEF.find(m => m.id === paramId);
                                    
                                    return (
                                        <Bar 
                                            key={paramId} 
                                            yAxisId={yAxisId} 
                                            dataKey={paramId} 
                                            name={metricDef?.label} 
                                            fill={colors[paramId]} 
                                            radius={[4, 4, 0, 0]} 
                                            activeBar={<Rectangle fillOpacity={0.8} stroke={colors[paramId]} strokeWidth={2} />}
                                        >
                                            <LabelList 
                                                dataKey={paramId} 
                                                position="top" 
                                                angle={-90} 
                                                offset={25} 
                                                formatter={(val) => val === 0 ? '' : `${formatMetricValue(val, metricDef?.type)}${metricDef?.id.includes('_percent') ? '%' : ''}`}
                                                style={{ fontSize: '11px', fill: '#18181b', fontWeight: 900 }} 
                                                className="dark:fill-zinc-300"
                                            />
                                        </Bar>
                                    );
                                })}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}