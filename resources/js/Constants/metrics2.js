// resources/js/Constants/metrics.js

export const FIXED_EXCEL_COLUMNS = [
    { id: 'total_duration', label: 'Total Duration', hasPercent: false },
    { id: 'total_distance', label: 'Total Distance', hasPercent: true },
    { id: 'dist_per_min', label: 'Distance/min', hasPercent: true },
    { id: 'hir_18_24_kmh', label: 'HIR 18-24.51', hasPercent: true },
    { id: 'sprint_distance', label: 'SPRINT 24.52~', hasPercent: true },
    { id: 'total_18kmh', label: 'Total 18kmh+', hasPercent: true },
    { id: 'accels', label: 'Accels >3', hasPercent: false },
    { id: 'decels', label: 'Decels >3', hasPercent: false },
    { id: 'hr_band_4_dist', label: 'HR Band 4 Dist', hasPercent: false },
    { id: 'hr_band_4_dur', label: 'HR Band 4 Dur', hasPercent: false },
    { id: 'hr_band_5_dist', label: 'HR Band 5 Dist', hasPercent: false },
    { id: 'hr_band_5_dur', label: 'HR Band 5 Dur', hasPercent: false },
    { id: 'max_velocity', label: 'Max Velocity', hasPercent: true },
    { id: 'highest_velocity', label: 'Highest Session', hasPercent: false }, 
    { id: 'player_load', label: 'Total Player Load', hasPercent: true },
];

export const BENCHMARK_COLUMNS = [
    { id: 'total_distance', label: 'DISTANCE' },
    { id: 'dist_per_min', label: 'DIST/MIN' },
    { id: 'hir_18_24_kmh', label: 'HIR' },
    { id: 'sprint_distance', label: 'SPRINT' }, 
    { id: 'total_18kmh', label: 'TOTAL' },      
    { id: 'accels', label: 'ACC' },
    { id: 'decels', label: 'DCC' },
    { id: 'hr_band_4_dist', label: 'DIST HR 4' },
    { id: 'hr_band_4_dur', label: 'HR BAND 4' },
    { id: 'hr_band_5_dist', label: 'DIST HR 5' },
    { id: 'hr_band_5_dur', label: 'HR BAND 5' },
    { id: 'player_load', label: 'PL' }
];

export const POSITIONS = ['GK', 'CB', 'FB', 'MF', 'WF', 'FW', 'ST'];

export const MATCH_EXCEL_COLUMNS = [
    { id: 'duration_1st', label: '1 ST', hasPercent: false },
    { id: 'duration_2nd', label: '2 ND', hasPercent: false },
    { id: 'total_distance', label: 'Total Distance (m)', hasPercent: true, pctLabel: '% Total Distance Of-MD' },
    { id: 'dist_per_min', label: 'Distance/min', hasPercent: true, pctLabel: '% Distance/min Of-MD' },
    { id: 'distance_1st', label: 'Distance 1 ST', hasPercent: false },
    { id: 'distance_2nd', label: 'Distance 2 ND', hasPercent: false },
    { id: 'hir_18_24_kmh', label: 'HIR 18-24.51 Km/h', hasPercent: true, pctLabel: '%HIR 18-24.51 Km/h' },
    { id: 'sprint_distance', label: 'SPRINT 24.52 km/h~', hasPercent: true, pctLabel: '% SPRINT 24.52 km/h~' },
    { id: 'total_18kmh', label: 'Total 18 Km/h~', hasPercent: true, pctLabel: '% Total 18 Km/h~' },
    { id: 'accels', label: 'Accels >3m/s/s', hasPercent: false },
    { id: 'decels', label: 'Decels >3m/s/s', hasPercent: false },
    { id: 'hr_band_4_dist', label: 'HR Band 4 Dist', hasPercent: false },
    { id: 'hr_band_4_dur', label: 'HR Band 4 Dur', hasPercent: false },
    { id: 'hr_band_5_dist', label: 'HR Band 5 Dist', hasPercent: false },
    { id: 'hr_band_5_dur', label: 'HR Band 5 Dur', hasPercent: false },
    { id: 'max_velocity', label: 'Max Velocity', hasPercent: true, pctLabel: '% Max Velocity' },
    { id: 'highest_velocity', label: 'Highest Vel', hasPercent: false },
    { id: 'player_load', label: 'Player Load', hasPercent: true, pctLabel: '% Player Load' }
];

export const checkIsDistanceGroup = (colId) => ['hir_18_24_kmh', 'sprint_distance', 'total_18kmh'].includes(colId);

// GABUNGKAN PERSENTASE MATCH DAN TRAINING UNTUK DROPDOWN GRAFIK
const combinedPercents = [...FIXED_EXCEL_COLUMNS, ...MATCH_EXCEL_COLUMNS].filter(c => c.hasPercent).reduce((acc, curr) => {
    if (!acc.find(item => item.id === curr.id)) acc.push(curr);
    return acc;
}, []);

export const METRIC_GROUPS = [
    {
        label: "Time, Volume & Distance",
        metrics: [
            { id: 'total_duration', label: 'Total Duration', type: 'duration' },
            { id: 'total_distance', label: 'Total Distance (m)', type: 'number' },
            { id: 'dist_per_min', label: 'Distance/min', type: 'decimal' },
        ]
    },
    {
        label: "Intensity & Speed",
        metrics: [
            { id: 'hir_18_24_kmh', label: 'HIR 18-24.51 (m)', type: 'number' },
            { id: 'sprint_distance', label: 'SPRINT 24.52~ (m)', type: 'number' },
            { id: 'total_18kmh', label: 'Total 18km/h+ (m)', type: 'number' },
            { id: 'max_velocity', label: 'Max Velocity (km/h)', type: 'decimal' },
            { id: 'highest_velocity', label: 'Highest Vel Session', type: 'decimal' },
        ]
    },
    {
        label: "Efforts & Load",
        metrics: [
            { id: 'accels', label: 'Accelerations >3', type: 'number' },
            { id: 'decels', label: 'Decelerations >3', type: 'number' },
            { id: 'player_load', label: 'Total Player Load', type: 'decimal' },
        ]
    },
    {
        label: "Heart Rate (HR)",
        metrics: [
            { id: 'hr_band_4_dist', label: 'HR Band 4 Dist (m)', type: 'number' },
            { id: 'hr_band_4_dur', label: 'HR Band 4 Duration', type: 'duration' },
            { id: 'hr_band_5_dist', label: 'HR Band 5 Dist (m)', type: 'number' },
            { id: 'hr_band_5_dur', label: 'HR Band 5 Duration', type: 'duration' },
        ]
    },
    {
        label: "Percentage vs Target (%)",
        metrics: combinedPercents.map(c => ({
            id: `${c.id}_percent`,
            label: c.pctLabel || `% ${c.label}`,
            type: 'decimal'
        }))
    }
];

export const AVAILABLE_METRICS = METRIC_GROUPS.flatMap(g => g.metrics);
export const DEFAULT_COLORS = ['#00a8a8', '#f59e0b', '#ef4444', '#8b5cf6', '#2a4365', '#10b981'];

export const parseTimeToMinutes = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val; 
    if (typeof val === 'string') {
        if (val.includes(':')) {
            const parts = val.split(':').map(Number);
            if (parts.length === 3) return (parts[0] * 60) + parts[1] + (parts[2] / 60); 
            if (parts.length === 2) return parts[0] + (parts[1] / 60); 
        }
        return parseFloat(val) || 0; 
    }
    return 0;
};

export const formatMetricValue = (val, type) => {
    if (val === 0 || val === undefined || isNaN(val)) return '0';
    if (type === 'duration') {
        const hrs = Math.floor(val / 60);
        const mins = Math.floor(val % 60);
        const secs = Math.floor((val * 60) % 60);
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    if (type === 'decimal') return Number(val).toFixed(2);
    return Math.round(val).toString(); 
};

export const calculateYAxisDomain = (dataMax) => {
    if (!dataMax || dataMax === 0) return 10;
    const target = dataMax * 1.45; 
    if (target > 1000) return Math.ceil(target / 500) * 500; 
    if (target > 100) return Math.ceil(target / 50) * 50;    
    if (target > 10) return Math.ceil(target / 5) * 5;       
    return Math.ceil(target);
};