// resources/js/Pages/PerformanceLogs/Partials/Chart/ChartCanvas.jsx

import React from 'react';
import { BarChart2 } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, LabelList } from 'recharts';

export default function ChartCanvas({ chartData, positionDividers, selectedParams, paramColors, groupedOptions, chartType, isZoomed }) {

    if (selectedParams.length === 0) {
        return (
            <div className="h-[400px] flex items-center justify-center text-center p-10 bg-zinc-50/50 dark:bg-zinc-900/10">
                <div>
                    <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-4 border border-zinc-200 dark:border-zinc-800">
                        <BarChart2 className="text-zinc-400" size={32} />
                    </div>
                    <h4 className="text-zinc-800 dark:text-zinc-200 font-bold text-sm">Grafik Belum Terbentuk</h4>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                        Silakan pilih minimal 1 parameter (Maks. 3) di menu dropdown atas untuk mulai memvisualisasikan data.
                    </p>
                </div>
            </div>
        );
    }

    const minChartWidth = chartData.length * 60; 

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length && typeof label === 'string' && !label.startsWith('gap_')) {
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
                                <div key={index} className="flex items-center justify-between gap-6">
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

    // PERBAIKAN ERROR ADA DI SINI
    const renderTopLabel = (props, color, dataKey) => {
        const { x, y, width, value, payload } = props;
        if (!value || value === '0') return null;
        
        // Safe check: Recharts menyimpan data objek di tempat yang berbeda antara Bar dan Line
        const dataItem = payload?.payload || payload || props;

        // Logika untuk menyembunyikan label average kecuali di tengah
        if (dataItem && dataItem[`hide_label_${dataKey}`]) return null;

        // Kalau Line Chart, width-nya tidak ada, jadi xPos disesuaikan
        const xPos = width ? x + width / 2 : x;

        return (
            <text x={xPos} y={y - 8} fill={color} fontSize={10} fontWeight="900" textAnchor="start" transform={`rotate(-90, ${xPos}, ${y - 8})`}>
                {value}
            </text>
        );
    };

    const getParamLabel = (id) => {
        for (const cat of Object.values(groupedOptions)) {
            const found = cat.find(m => m.id === id);
            if (found) return found.label;
        }
        return id;
    };

    return (
        <div className={`w-full ${isZoomed ? 'overflow-x-auto custom-scrollbar' : 'overflow-hidden'} pb-4 pt-10`}>
            <div style={{ minWidth: isZoomed ? `${Math.max(800, minChartWidth)}px` : '100%', height: '500px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 80, right: 20, left: -20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" opacity={0.2} vertical={false} />
                        
                        <XAxis 
                            dataKey="formattedName" interval={0} height={60}
                            tick={(props) => {
                                const { x, y, payload } = props;
                                if (payload.value && payload.value.toString().startsWith('gap_')) return null;
                                return <text x={x} y={y + 10} textAnchor="end" fill="#71717a" fontSize={11} fontStyle="italic" fontWeight="bold" transform={`rotate(-45, ${x}, ${y})`}>{payload.value}</text>;
                            }}
                        />
                        
                        {selectedParams.map((metric, index) => {
                            const orientation = index % 2 === 0 ? 'left' : 'right';
                            const isAxisHidden = index > 1; 

                            return (
                                <YAxis 
                                    key={`axis-${metric}`} yAxisId={metric} orientation={orientation} hide={isAxisHidden}
                                    tick={{ fontSize: 11, fill: paramColors[metric], fontWeight: 'bold' }} 
                                    axisLine={{ stroke: paramColors[metric] }} 
                                />
                            );
                        })}

                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255, 0.05)' }} />
                        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', top: -30 }} />

                        {positionDividers.map((divider, index) => (
                            <ReferenceLine 
                                key={`ref-${index}`} yAxisId={selectedParams[0]} x={divider.xLabel} 
                                stroke="#71717a" strokeDasharray="4 4" 
                                label={{ position: 'top', value: divider.label, fill: '#52525b', fontSize: 14, fontWeight: '900', offset: 30 }} 
                            />
                        ))}

                        {selectedParams.map((metric) => {
                            const color = paramColors[metric];
                            const labelName = getParamLabel(metric);
                            const isAvgLine = metric.startsWith('avg_pos_');

                            if (isAvgLine) {
                                return (
                                    <Line key={metric} yAxisId={metric} type="step" dataKey={metric} name={labelName} stroke={color} strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={{ r: 6 }}>
                                        <LabelList dataKey={`raw_${metric}`} content={(props) => renderTopLabel(props, color, metric)} />
                                    </Line>
                                );
                            }

                            if (chartType === 'bar') {
                                return (
                                    <Bar key={metric} yAxisId={metric} dataKey={metric} name={labelName} fill={color} radius={[4, 4, 0, 0]} maxBarSize={40}>
                                        <LabelList dataKey={`raw_${metric}`} content={(props) => renderTopLabel(props, color, metric)} />
                                    </Bar>
                                );
                            } else {
                                return (
                                    <Line key={metric} yAxisId={metric} type="monotone" dataKey={metric} name={labelName} stroke={color} strokeWidth={3} dot={{ r: 4 }}>
                                        <LabelList dataKey={`raw_${metric}`} content={(props) => renderTopLabel(props, color, metric)} />
                                    </Line>
                                );
                            }
                        })}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}