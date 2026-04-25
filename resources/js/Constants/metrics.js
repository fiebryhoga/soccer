// resources/js/Constants/metrics.js

export const FIXED_EXCEL_COLUMNS = [
    { id: 'total_duration', label: 'Total Duration' },
    { id: 'total_distance', label: 'Total Distance (m)', hasPercent: true },
    { id: 'dist_per_min', label: 'Distance/min', hasPercent: true },
    
    // Kelompok Distance (m) dengan Sub-subnya
    { id: 'hir_18_kmh', label: 'HIR 18 Km/h~', hasPercent: true },
    { id: 'hir_19_8_kmh', label: 'HIR >19.8 Km/h-', hasPercent: true },
    { id: 'hsr_21_kmh', label: 'HSR 21 km/h~', hasPercent: true },
    { id: 'sprint_distance', label: 'SPRINT 24.52 km/h~', hasPercent: true },
    { id: 'total_18kmh', label: 'Total 18Km/h+', hasPercent: true },

    // Kelompok Lainnya
    { id: 'accels', label: 'Accels >3m/s/s' },
    { id: 'decels', label: 'Decels >3m/s/s' },
    { id: 'hr_band_4_dist', label: 'Heart Rate Band 4 Total Distance (m)' },
    { id: 'hr_band_4_dur', label: 'Heart Rate Band 4 Total Duration' },
    { id: 'hr_band_5_dist', label: 'Heart Rate Band 5 Total Distance (m)' },
    { id: 'hr_band_5_dur', label: 'Heart Rate Band 5 Total Duration' },
    
    // Kelompok Velocity
    { id: 'max_velocity', label: 'Max Velocity (km/h)', hasPercent: true },
    { id: 'highest_velocity', label: 'Highest Of All Session (km/h)' },
    
    { id: 'player_load', label: 'Total Player Load' },
];

export const MASTER_METRICS = FIXED_EXCEL_COLUMNS;

// Filter metrics yang TIDAK dipakai di form Benchmark
export const BENCHMARK_METRICS = FIXED_EXCEL_COLUMNS.filter(m => 
    !['max_velocity', 'highest_velocity', 'total_duration'].includes(m.id)
);

export const POSITIONS = ['CB', 'FB', 'MF', 'WF', 'FW'];