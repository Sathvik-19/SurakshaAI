import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SEVERITY_COLORS } from '@/lib/riskEngine';
import { Hospital, School, Shield, Flame, Home, Construction, } from 'lucide-react';
// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
const infraIcons = {
    hospital: Hospital,
    school: School,
    police: Shield,
    fire_station: Flame,
    shelter: Home,
    bridge: Construction,
};
export function RiskMap({ cells, infrastructure, infraFilters, onZoneClick, selectedCellId, simulationStates, className, center = [12.97, 74.85], zoom = 12, routeOverlay, }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const layerRef = useRef(null);
    const infraLayerRef = useRef(null);
    const routeLayerRef = useRef(null);
    // Initialize map once
    useEffect(() => {
        if (!mapRef.current || mapInstance.current)
            return;
        const map = L.map(mapRef.current, { zoomControl: true, attributionControl: true }).setView(center, zoom);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 19,
        }).addTo(map);
        layerRef.current = L.layerGroup().addTo(map);
        infraLayerRef.current = L.layerGroup().addTo(map);
        routeLayerRef.current = L.layerGroup().addTo(map);
        mapInstance.current = map;
        return () => {
            map.remove();
            mapInstance.current = null;
        };
    }, []);
    // Update grid cells
    useEffect(() => {
        if (!layerRef.current || !mapInstance.current)
            return;
        layerRef.current.clearLayers();
        for (const { cell, risk } of cells) {
            const simState = simulationStates?.get(cell.id);
            const severity = simState?.severity ?? risk?.severity_level ?? 'SAFE';
            const score = simState?.riskScore ?? risk?.risk_score ?? 0;
            const color = SEVERITY_COLORS[severity];
            const isSelected = selectedCellId === cell.id;
            const bounds = [
                [cell.min_lat, cell.min_lng],
                [cell.max_lat, cell.max_lng],
            ];
            const rect = L.rectangle(bounds, {
                color: isSelected ? '#06b6d4' : color,
                weight: isSelected ? 3 : 1.5,
                fillColor: color,
                fillOpacity: isSelected ? 0.45 : 0.25,
                className: 'zone-rect transition-all duration-700',
            });
            rect.bindTooltip(`<div style="font-family:system-sans"><b>${cell.label}</b><br/>Risk: ${score}/100 (${severity})<br/>${cell.cell_code}</div>`, { sticky: true, className: 'suraksha-tooltip' });
            if (onZoneClick) {
                rect.on('click', () => onZoneClick(cell.id));
            }
            rect.addTo(layerRef.current);
        }
    }, [cells, selectedCellId, onZoneClick, simulationStates]);
    // Update infrastructure markers
    useEffect(() => {
        if (!infraLayerRef.current || !infrastructure)
            return;
        infraLayerRef.current.clearLayers();
        for (const inf of infrastructure) {
            if (infraFilters && !infraFilters.has(inf.type))
                continue;
            const Icon = infraIcons[inf.type] ?? School;
            const colorMap = {
                hospital: '#ef4444', school: '#f97316', police: '#3b82f6',
                fire_station: '#f59e0b', shelter: '#22c55e', bridge: '#a855f7',
            };
            const color = colorMap[inf.type] ?? '#94a3b8';
            const marker = L.circleMarker([inf.lat, inf.lng], {
                radius: 5,
                fillColor: color,
                color: '#fff',
                weight: 1,
                fillOpacity: 0.9,
            });
            marker.bindTooltip(`<b>${inf.name}</b><br/>${inf.type.replace('_', ' ')}`, {
                className: 'suraksha-tooltip',
            });
            marker.addTo(infraLayerRef.current);
        }
    }, [infrastructure, infraFilters]);
    // Update route overlay
    useEffect(() => {
        if (!routeLayerRef.current)
            return;
        routeLayerRef.current.clearLayers();
        if (!routeOverlay)
            return;
        if (routeOverlay.fastest.length > 1) {
            L.polyline(routeOverlay.fastest, {
                color: '#ef4444', weight: 4, opacity: 0.7, dashArray: '10,6',
            }).addTo(routeLayerRef.current);
        }
        if (routeOverlay.safest.length > 1) {
            L.polyline(routeOverlay.safest, {
                color: '#22c55e', weight: 5, opacity: 0.85,
            }).addTo(routeLayerRef.current);
        }
    }, [routeOverlay]);
    return _jsx("div", { ref: mapRef, className: className ?? 'h-full w-full' });
}
