// resources/js/Pages/PerformanceLogs/Partials/Chart/ChartCanvas.jsx

import React from 'react';
import { BarChart2 } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, LabelList } from 'recharts';

export default function ChartCanvas({ chartData, positionDividers, selectedParams, paramColors, groupedOptions, chartType, isZoomed }) {

    if (selectedParams.length === 0) {
        return (
            <div className="h-[400px] flex items-center justify-center text-center p-10 bg-zinc-50/50 dark:bg-zinc-900/10">
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <BarChart2 className="text-zinc-400 dark:text-zinc-600 opacity-50" size={40} />
                    </div>
                    <h4 className="text-zinc-900 dark:text-zinc-100 font-black text-lg">Area Canvas Kosong</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm mx-auto leading-relaxed">
                        Pilih hingga 3 metrik melalui menu dropdown di atas untuk merender visualisasi komparasi pemain secara real-time.
                    </p>
                </div>
            </div>
        );
    }

    const minChartWidth = chartData.length * 60; 

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length && typeof label === 'string' && !label.startsWith('gap_')) {
            return (
                <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg shadow-2xl text-zinc-900 dark:text-zinc-100 text-xs z-50 min-w-[200px]">
                    <p className="font-bold mb-3 text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2 flex items-center justify-between gap-4">
                        {label} 
                        <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md text-[10px] uppercase tracking-widest">{payload[0]?.payload?.position}</span>
                    </p>
                    <div className="flex flex-col gap-2.5">
                        {payload.map((entry, index) => {
                            const rawKey = `raw_${entry.dataKey}`;
                            const displayValue = entry.payload[rawKey] || entry.value || '0'; 
                            const isAvg = entry.dataKey.startsWith('avg_pos_');
                            
                            return (
                                <div key={index} className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-sm shadow-sm" style={{ backgroundColor: entry.color }}></div>
                                        <span className={`font-medium ${isAvg ? 'text-zinc-500 dark:text-zinc-400 italic' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                            {entry.name}:
                                        </span>
                                    </div>
                                    <span className={`text-sm ${isAvg ? 'font-bold text-zinc-500 dark:text-zinc-400' : 'font-black text-zinc-900 dark:text-white'}`}>
                                        {displayValue}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderTopLabel = (props, color, dataKey) => {
        const { x, y, width, value, payload } = props;
        if (!value || value === '0') return null;
        const dataItem = payload?.payload || payload || props;
        if (dataItem && dataItem[`hide_label_${dataKey}`]) return null;

        const xPos = width ? x + width / 2 : x;
        return (
            <text x={xPos} y={y - 12} fill={color} fontSize={10} fontWeight="900" textAnchor="start" transform={`rotate(-90, ${xPos}, ${y - 12})`}>
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

    const avgParams = selectedParams.filter(m => m.startsWith('avg_pos_'));
    const rawParams = selectedParams.filter(m => !m.startsWith('avg_pos_'));

    return (
        <div className={`w-full ${isZoomed ? 'overflow-x-auto custom-scrollbar' : 'overflow-hidden'} pb-6 pt-10 px-4`}>
            <div style={{ minWidth: isZoomed ? `${Math.max(800, minChartWidth)}px` : '100%', height: '450px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 60, right: 10, left: -20, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" opacity={0.7} vertical={false} />
                        
                        <XAxis 
                            dataKey="formattedName" interval={0} height={60} axisLine={false} tickLine={false}
                            tick={(props) => {
                                const { x, y, payload } = props;
                                if (payload.value && payload.value.toString().startsWith('gap_')) return null;
                                return <text x={x} y={y + 16} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400 text-[10px] font-bold" transform={`rotate(-45, ${x}, ${y + 5})`}>{payload.value}</text>;
                            }}
                        />
                        
                        {selectedParams.map((metric, index) => {
                            const orientation = index % 2 === 0 ? 'left' : 'right';
                            return (
                                <YAxis 
                                    key={`axis-${metric}`} yAxisId={metric} orientation={orientation} hide={index > 1}
                                    tick={{ fontSize: 10, fill: paramColors[metric], fontWeight: 'bold' }} 
                                    axisLine={false} tickLine={false}
                                />
                            );
                        })}

                        {/* Custom Tooltip Cursor Color handling dark mode via fill */}
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#71717a', opacity: 0.1 }} />
                        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', top: -30 }} iconType="circle" />

                        {positionDividers.map((divider, index) => (
                            <ReferenceLine 
                                key={`ref-${index}`} yAxisId={selectedParams[0]} x={divider.xLabel} 
                                className="stroke-zinc-300 dark:stroke-zinc-700" strokeDasharray="4 4" 
                                label={{ position: 'top', value: divider.label, className: 'fill-zinc-800 dark:fill-zinc-200 text-sm font-black', offset: 25 }} 
                            />
                        ))}

                        {avgParams.map((metric) => (
                            <Area 
                                key={metric} yAxisId={metric} type="step" dataKey={metric} name={getParamLabel(metric)} 
                                fill={paramColors[metric]} fillOpacity={0.15} stroke="none" activeDot={false}
                            />
                        ))}

                        {rawParams.map((metric) => {
                            if (chartType === 'bar') {
                                return (
                                    <Bar key={metric} yAxisId={metric} dataKey={metric} name={getParamLabel(metric)} fill={paramColors[metric]} radius={[6, 6, 0, 0]} maxBarSize={45}>
                                        <LabelList dataKey={`raw_${metric}`} content={(props) => renderTopLabel(props, paramColors[metric], metric)} />
                                    </Bar>
                                );
                            } else {
                                return (
                                    <Line key={metric} yAxisId={metric} type="monotone" dataKey={metric} name={getParamLabel(metric)} stroke={paramColors[metric]} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, className: "fill-white dark:fill-zinc-950" }} activeDot={{ r: 6 }}>
                                        <LabelList dataKey={`raw_${metric}`} content={(props) => renderTopLabel(props, paramColors[metric], metric)} />
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