export const FIXED_EXCEL_COLUMNS = [
    { id: 'total_duration', label: 'Total Duration' },
    { id: 'total_distance', label: 'Total Distance (m)', hasPercent: true },
    { id: 'dist_per_min', label: 'Distance/min', hasPercent: true },
    { id: 'accels', label: 'Accels >3m/s/s' },
    { id: 'decels', label: 'Decels >3m/s/s' },
    { id: 'hr_band_4_dist', label: 'HR Band 4 Distance (m)' },
    { id: 'hr_band_4_dur', label: 'HR Band 4 Duration' },
    { id: 'hr_band_5_dist', label: 'HR Band 5 Distance (m)' },
    { id: 'hr_band_5_dur', label: 'HR Band 5 Duration' },
    { id: 'max_velocity', label: 'Max Velocity (km/h)', hasPercent: true },
    { id: 'player_load', label: 'Total Player Load' },
    { id: 'hir_distance', label: 'HIR >19.8 Km/h', hasPercent: true },
    { id: 'sprint_distance', label: 'SPRINT 24.52 km/h~', hasPercent: true },
    { id: 'total_18kmh', label: 'Total 18Km/h+', hasPercent: true },
];

export const POSITIONS = ['CB', 'FB', 'MF', 'WF', 'FW'];