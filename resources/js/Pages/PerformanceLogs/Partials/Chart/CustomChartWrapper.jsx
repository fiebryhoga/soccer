// resources/js/Pages/PerformanceLogs/Partials/Chart/CustomChartWrapper.jsx

import React, { useState, useMemo, useEffect } from 'react';
import ChartControls from './ChartControls';
import ChartCanvas from './ChartCanvas';
import { FIXED_EXCEL_COLUMNS, MATCH_EXCEL_COLUMNS } from '@/Constants/metrics';

const COLOR_PALETTE = ['#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#f43f5e'];

const getMetricCategory = (colId) => {
    if (colId.includes('velocity') || colId.includes('speed') || colId.includes('sprint')) return 'Kecepatan & Sprint';
    if (colId.includes('distance') || colId.includes('hir') || colId.includes('hml')) return 'Jarak & Intensitas';
    if (colId.includes('hr') || colId.includes('heart_rate')) return 'Heart Rate (HR)';
    if (colId.includes('accel') || colId.includes('decel')) return 'Akselerasi & Deselerasi';
    if (colId.includes('ima') || colId.includes('load')) return 'Beban & IMA';
    return 'Lainnya';
};

export default function CustomChartWrapper({ chartConfig, log, playersData, onUpdate, onRemove, calculateTeamPercentage }) {
    const isMatch = log.type === 'match';
    
    const [selectedParams, setSelectedParams] = useState(chartConfig.selectedParams || []); 
    const [paramColors, setParamColors] = useState(chartConfig.paramColors || {}); 
    const [chartType, setChartType] = useState(chartConfig.chartType || 'bar');
    const [sortBy, setSortBy] = useState(chartConfig.sortBy || 'position'); 
    const [sortOrder, setSortOrder] = useState(chartConfig.sortOrder || 'desc'); 
    const [isZoomed, setIsZoomed] = useState(chartConfig.isZoomed ?? true); 
    const [customTitle, setCustomTitle] = useState(chartConfig.customTitle || '');

    useEffect(() => {
        onUpdate({ selectedParams, paramColors, chartType, sortBy, sortOrder, isZoomed, customTitle });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedParams, paramColors, chartType, sortBy, sortOrder, isZoomed, customTitle]);
    
    const groupedOptions = useMemo(() => {
        const columns = isMatch ? MATCH_EXCEL_COLUMNS : FIXED_EXCEL_COLUMNS;
        const baseCols = columns.filter(col => !['selected', 'selected_hr4', 'selected_hr5', 'selected_pl', 'sort_order'].includes(col.id));
        
        const groups = {};
        baseCols.forEach(col => {
            const cat = getMetricCategory(col.id);
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push({ id: col.id, label: col.header || col.id, isRaw: true });
            groups[cat].push({ id: `avg_pos_${col.id}`, label: `Avg Pos: ${col.header}`, isAvg: true, baseId: col.id });
        });
        return groups;
    }, [isMatch]);

    const { chartData, positionDividers } = useMemo(() => {
        const activePlayersRaw = playersData.filter(p => p.is_playing !== false);
        const posStats = {};
        
        activePlayersRaw.forEach(p => {
            if (!posStats[p.position]) posStats[p.position] = {};
            Object.values(groupedOptions).flat().filter(m => m.isRaw).forEach(m => {
                if (!posStats[p.position][m.id]) posStats[p.position][m.id] = { sum: 0, count: 0 };
                let valStr = p.metrics?.[m.id]?.toString().replace('%', '') || '0';
                const val = parseFloat(valStr.replace(',', '.')) || 0;
                if (val > 0) {
                    posStats[p.position][m.id].sum += val;
                    posStats[p.position][m.id].count += 1;
                }
            });
        });

        let activePlayers = activePlayersRaw.map(p => {
            const dataObj = { id: p.player_id, originalName: p.name, position: p.position };
            const parts = p.name.trim().split(' ');
            dataObj.formattedName = parts.length === 1 ? parts[0] : `${parts[0].charAt(0)}. ${parts[parts.length - 1]}`;
            
            selectedParams.forEach(paramId => {
                if (paramId.startsWith('avg_pos_')) {
                    const baseId = paramId.replace('avg_pos_', '');
                    const count = posStats[p.position]?.[baseId]?.count || 0;
                    const avgVal = count > 0 ? (posStats[p.position][baseId].sum / count) : 0;
                    dataObj[paramId] = parseFloat(avgVal.toFixed(2));
                    dataObj[`raw_${paramId}`] = avgVal.toFixed(1); 
                } else {
                    let rawVal = (p.metrics?.[paramId] || '').toString();
                    dataObj[`raw_${paramId}`] = rawVal;
                    if (rawVal.includes(':')) {
                        const parts = rawVal.split(':').map(Number);
                        dataObj[paramId] = parts.length === 2 ? (parts[0]*60)+(parts[1]||0) : (parts[0]*3600)+(parts[1]*60)+(parts[2]||0);
                    } else {
                        dataObj[paramId] = parseFloat(rawVal.replace('%', '').replace(',', '.')) || 0;
                    }
                }
            });
            return dataObj;
        });

        activePlayers.sort((a, b) => {
            const posOrder = { 'GK': 1, 'CB': 2, 'FB': 3, 'MF': 4, 'WF': 5, 'FW': 6 };
            const posDiff = (posOrder[a.position] || 99) - (posOrder[b.position] || 99);
            if (posDiff !== 0) return posDiff; 

            let diff = 0;
            if (sortBy === 'name' || sortBy === 'position') diff = a.originalName.localeCompare(b.originalName);
            else diff = (a[sortBy] || 0) - (b[sortBy] || 0);
            return sortOrder === 'desc' ? -diff : diff;
        });

        const cData = [];
        const dividers = [];
        let currentPos = null;
        let gapIndex = 0;
        const posRanges = {};

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
            if (!posRanges[player.position]) posRanges[player.position] = { start: cData.length, end: cData.length };
            posRanges[player.position].end = cData.length;
            cData.push(player);
            currentPos = player.position;
        });

        cData.forEach((item, idx) => {
            if (item.isGap) return;
            const mid = Math.floor((posRanges[item.position].start + posRanges[item.position].end) / 2);
            selectedParams.forEach(param => {
                if (param.startsWith('avg_pos_') && idx !== mid) item[`hide_label_${param}`] = true;
            });
        });

        return { chartData: cData, positionDividers: dividers };
    }, [playersData, selectedParams, sortBy, sortOrder, groupedOptions]);

    return (
        <div className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-visible flex flex-col mb-8 transition-all hover:shadow-md">
            <ChartControls 
                groupedOptions={groupedOptions} selectedParams={selectedParams} setSelectedParams={setSelectedParams}
                paramColors={paramColors} setParamColors={setParamColors} COLOR_PALETTE={COLOR_PALETTE}
                chartType={chartType} setChartType={setChartType} sortBy={sortBy} setSortBy={setSortBy}
                sortOrder={sortOrder} setSortOrder={setSortOrder} isZoomed={isZoomed} setIsZoomed={setIsZoomed}
                customTitle={customTitle} setCustomTitle={setCustomTitle} onRemove={onRemove}
            />
            <ChartCanvas 
                chartData={chartData} positionDividers={positionDividers} selectedParams={selectedParams}
                paramColors={paramColors} groupedOptions={groupedOptions} chartType={chartType} isZoomed={isZoomed}
            />
        </div>
    );
}