// resources/js/Constants/metrics.js

export const FIXED_EXCEL_COLUMNS = [
    { id: 'total_duration', label: 'Total Duration', hasPercent: false },
    { id: 'total_distance', label: 'Total Distance', hasPercent: true },
    { id: 'dist_per_min', label: 'Distance/min', hasPercent: true },
    { id: 'hir_18_24_kmh', label: 'HIR 18-24.51', hasPercent: true },
    { id: 'sprint_distance', label: 'SPRINT 24.52~', hasPercent: true },
    { id: 'total_18kmh', label: 'Total 18kmh+', hasPercent: true }, // Auto calculated
    { id: 'accels', label: 'Accels >3', hasPercent: false },
    { id: 'decels', label: 'Decels >3', hasPercent: false },
    { id: 'hr_band_4_dist', label: 'HR Band 4 Dist', hasPercent: false },
    { id: 'hr_band_4_dur', label: 'HR Band 4 Dur', hasPercent: false },
    { id: 'hr_band_5_dist', label: 'HR Band 5 Dist', hasPercent: false },
    { id: 'hr_band_5_dur', label: 'HR Band 5 Dur', hasPercent: false },
    { id: 'max_velocity', label: 'Max Velocity', hasPercent: true },
    { id: 'highest_velocity', label: 'Highest Session', hasPercent: false }, // Auto calculated
    { id: 'player_load', label: 'Total Player Load', hasPercent: true },
];

export const BENCHMARK_COLUMNS = [
    { id: 'total_distance', label: 'DISTANCE' },
    { id: 'dist_per_min', label: 'DIST/MIN' },
    { id: 'hir_18_24_kmh', label: 'HIR' },
    { id: 'sprint_distance', label: 'SPRINT' }, // <-- Menggantikan HSR
    { id: 'total_18kmh', label: 'TOTAL' },      // <-- Menggantikan SPRINT
    { id: 'accels', label: 'ACC' },
    { id: 'decels', label: 'DCC' },
    { id: 'hr_band_4_dist', label: 'DIST HR 4' },
    { id: 'hr_band_4_dur', label: 'HR BAND 4' },
    { id: 'hr_band_5_dist', label: 'DIST HR 5' },
    { id: 'hr_band_5_dur', label: 'HR BAND 5' },
    { id: 'player_load', label: 'PL' }
];

export const POSITIONS = ['CB', 'FB', 'MF', 'WF', 'FW'];

// Tambahkan di paling bawah resources/js/Constants/metrics.js

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

// Helper warna tabel
export const checkIsDistanceGroup = (colId) => ['hir_18_24_kmh', 'sprint_distance', 'total_18kmh'].includes(colId);