import { computeRiskScore, severityFromScore, classifyRainfall } from './riskEngine';
export function simulateWeather(cell, timeOffsetMin) {
    const t = timeOffsetMin / 60;
    const coastFactor = cell.near_coast ? 1.3 : 1.0;
    const stormIntensity = Math.max(0, 1 - Math.abs(t - 1) * 0.6);
    const baseRain = cell.urban_density * 8 + stormIntensity * 25 * coastFactor;
    const noise = (Math.sin(timeOffsetMin * 0.13 + cell.center_lat * 100) + 1) / 2;
    return {
        rainfall_mm: Math.max(0, baseRain * (0.6 + noise * 0.8)),
        temperature_c: 28 - stormIntensity * 3 + noise * 2,
        humidity_pct: Math.min(98, 75 + stormIntensity * 20 + noise * 5),
        wind_speed_kmph: 10 + stormIntensity * 35 * coastFactor + noise * 10,
        pressure_hpa: 1010 - stormIntensity * 8,
    };
}
export function simulateRiskOverTime(cell, baseRisk, timeOffsetMin) {
    const w = simulateWeather(cell, timeOffsetMin);
    const floodProb = Math.min((w.rainfall_mm / 35) * (1 - cell.drainage_score) * (cell.historical_flood_flag ? 1.4 : 1), 0.95);
    const lightProb = Math.min((w.humidity_pct / 100) * (w.rainfall_mm / 25) * 0.5, 0.9);
    const windScore = Math.min(w.wind_speed_kmph / 60, 1);
    const rainScore = Math.min(w.rainfall_mm / 35, 1);
    const score = computeRiskScore({
        rainScore,
        floodScore: floodProb,
        lightningScore: lightProb,
        windScore,
        populationScore: baseRisk.population_score,
        vulnerabilityScore: baseRisk.vulnerability_score,
    });
    return {
        timeOffsetMin,
        rainfallClass: classifyRainfall(w.rainfall_mm),
        riskScore: score,
        severity: severityFromScore(score),
        floodProb,
        lightningProb: lightProb,
    };
}
export function simulateForecast(cell, basePredictions, extraRainPct = 0) {
    return basePredictions.map((p) => {
        const extra = 1 + extraRainPct / 100;
        const rainfall = p.rainfall_forecast_mm * extra;
        const floodProb = Math.min(p.flood_probability * extra * 1.15, 0.95);
        const lightProb = Math.min(p.lightning_probability * (1 + extraRainPct / 200), 0.9);
        return {
            ...p,
            rainfall_forecast_mm: rainfall,
            flood_probability: floodProb,
            lightning_probability: lightProb,
        };
    });
}
