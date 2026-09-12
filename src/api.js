const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

export const fetchGridCells = () => request('/grid-cells');
export const fetchRiskZones = async () => {
  const data = await request('/risk-zones');
  return data;
};
export const fetchInfrastructure = () => request('/infrastructure');
export const fetchAlerts = (role, lang) => request(`/alerts?role=${encodeURIComponent(role || 'ALL')}&lang=${encodeURIComponent(lang || 'en')}`);
export const fetchHistoricalEvents = () => request('/historical-events');
export const fetchModelResults = () => request('/model-results');
export const fetchZoneDetail = (cellId) => request(`/zones/${encodeURIComponent(cellId)}`);
export const fetchAllZonesWithRisk = async () => {
  const [cells, risks] = await Promise.all([fetchGridCells(), fetchRiskZones()]);
  const map = new Map(risks.map((r) => [r.grid_cell_id, r]));
  return cells.map((cell) => ({ cell, risk: map.get(cell.id) })).filter((z) => z.risk);
};
export const fetchPopulationByCell = (cellId) => fetchZoneDetail(cellId).then((d) => d.population);
export const askCopilot = (question) => request('/copilot', { method: 'POST', body: JSON.stringify({ question }) });
export const runSimulation = (cellId) => request('/simulate', { method: 'POST', body: JSON.stringify({ cell_id: cellId }) });
export { API_BASE };
