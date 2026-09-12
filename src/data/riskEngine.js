export const DEFAULT_WEIGHTS = {
    rain: 0.25,
    flood: 0.30,
    lightning: 0.15,
    wind: 0.10,
    population: 0.10,
    vulnerability: 0.10,
};
export function computeRiskScore(input, weights = DEFAULT_WEIGHTS) {
    const score = (weights.rain * input.rainScore +
        weights.flood * input.floodScore +
        weights.lightning * input.lightningScore +
        weights.wind * input.windScore +
        weights.population * input.populationScore +
        weights.vulnerability * input.vulnerabilityScore) *
        100;
    return Math.min(Math.max(Math.round(score), 0), 100);
}
export function severityFromScore(score) {
    if (score >= 75)
        return 'CRITICAL';
    if (score >= 50)
        return 'HIGH';
    if (score >= 25)
        return 'MODERATE';
    return 'SAFE';
}
export function classifyRainfall(mm) {
    if (mm < 2.5)
        return 'Normal';
    if (mm < 7.5)
        return 'Light';
    if (mm < 35)
        return 'Moderate';
    if (mm < 65)
        return 'Heavy';
    return 'Extreme';
}
export const SEVERITY_COLORS = {
    SAFE: '#22c55e',
    MODERATE: '#eab308',
    HIGH: '#f97316',
    CRITICAL: '#ef4444',
};
export const SEVERITY_BG = {
    SAFE: 'bg-emerald-500',
    MODERATE: 'bg-yellow-500',
    HIGH: 'bg-orange-500',
    CRITICAL: 'bg-red-500',
};
export const SEVERITY_TEXT = {
    SAFE: 'text-emerald-400',
    MODERATE: 'text-yellow-400',
    HIGH: 'text-orange-400',
    CRITICAL: 'text-red-400',
};
export const SEVERITY_BORDER = {
    SAFE: 'border-emerald-500',
    MODERATE: 'border-yellow-500',
    HIGH: 'border-orange-500',
    CRITICAL: 'border-red-500',
};
export function severityGlow(severity) {
    switch (severity) {
        case 'CRITICAL':
            return 'shadow-[0_0_20px_rgba(239,68,68,0.5)]';
        case 'HIGH':
            return 'shadow-[0_0_20px_rgba(249,115,22,0.4)]';
        case 'MODERATE':
            return 'shadow-[0_0_15px_rgba(234,179,8,0.3)]';
        default:
            return '';
    }
}
