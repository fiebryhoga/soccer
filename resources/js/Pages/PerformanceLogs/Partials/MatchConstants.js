// resources/js/Pages/PerformanceLogs/Partials/MatchConstants.js

export const STICKY_COLS = {
    c1: { left: 0, width: 40, minWidth: 40, maxWidth: 40, boxSizing: 'border-box' },
    c2: { left: 40, width: 50, minWidth: 50, maxWidth: 50, boxSizing: 'border-box' },
    c3: { left: 90, width: 40, minWidth: 40, maxWidth: 40, boxSizing: 'border-box' },
    c4: { left: 130, width: 50, minWidth: 50, maxWidth: 50, boxSizing: 'border-box' },
    c5: { left: 180, width: 40, minWidth: 40, maxWidth: 40, boxSizing: 'border-box' },
    c6: { left: 220, width: 180, minWidth: 180, maxWidth: 180, boxSizing: 'border-box' },
    superHeader: { left: 0 },
    footerSpan: { left: 0 }
};

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