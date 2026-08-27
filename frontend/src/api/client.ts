const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchOverview() {
  const res = await fetch(`${API_BASE}/analytics/overview`);
  return res.json();
}

export async function fetchModelInfo() {
  const res = await fetch(`${API_BASE}/model-info`);
  return res.json();
}

export async function fetchModelRegistry() {
  const res = await fetch(`${API_BASE}/model-registry`);
  return res.json();
}

export async function fetchModelComparison() {
  const res = await fetch(`${API_BASE}/model-comparison`);
  return res.json();
}

export async function fetchModelHealth() {
  const res = await fetch(`${API_BASE}/model-health`);
  return res.json();
}

export async function fetchCancellationAnalytics() {
  const res = await fetch(`${API_BASE}/analytics/cancellation`);
  return res.json();
}

export async function fetchLeadTimeAnalytics() {
  const res = await fetch(`${API_BASE}/analytics/lead-time`);
  return res.json();
}

export async function fetchChannelAnalytics() {
  const res = await fetch(`${API_BASE}/analytics/channels`);
  return res.json();
}

export async function fetchRadarPoints(limit = 150) {
  const res = await fetch(`${API_BASE}/analytics/radar-sample?n=${limit}`);
  return res.json();
}

export async function fetchSampleBookings(limit = 25) {
  const res = await fetch(`${API_BASE}/bookings/sample?limit=${limit}`);
  return res.json();
}

export async function predictSingleBooking(data: any) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function simulateWhatIf(payload: { base_booking: any; modified_features: any }) {
  const res = await fetch(`${API_BASE}/what-if/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function validateDatasetUpload(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/validate-dataset`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function predictBatch(bookings: any[]) {
  const res = await fetch(`${API_BASE}/predict/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookings),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function askCopilot(query: string) {
  const res = await fetch(`${API_BASE}/copilot/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchWaitlistOverview() {
  const res = await fetch(`${API_BASE}/waitlist/overview`);
  return res.json();
}

export async function fetchWaitlistEntries() {
  const res = await fetch(`${API_BASE}/waitlist/entries`);
  return res.json();
}

export async function runSmartMatch(riskThreshold = 0.60) {
  const res = await fetch(`${API_BASE}/waitlist/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ risk_threshold: riskThreshold }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function reallocateWaitlistBooking(payload: { match_id: string; waitlist_id: string; booking_id: string }) {
  const res = await fetch(`${API_BASE}/waitlist/reallocate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addWaitlistEntry(entry: any) {
  const res = await fetch(`${API_BASE}/waitlist/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchRiskTopologyOverview() {
  const res = await fetch(`${API_BASE}/risk-topology/overview`);
  return res.json();
}

export async function fetchRiskTopologyClusters() {
  const res = await fetch(`${API_BASE}/risk-topology/clusters`);
  return res.json();
}

export async function runCancellationShock(payload: { scope_type: string; scope_value: string; shock_percentage: number }) {
  const res = await fetch(`${API_BASE}/risk-topology/shock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchAttentionQueue(limit = 15) {
  const res = await fetch(`${API_BASE}/risk-topology/attention?limit=${limit}`);
  return res.json();
}

export async function fetchCancellationDnaOverview() {
  const res = await fetch(`${API_BASE}/cancellation-dna/overview`);
  return res.json();
}

export async function fetchCancellationDnaSignatures() {
  const res = await fetch(`${API_BASE}/cancellation-dna/signatures`);
  return res.json();
}

export async function fetchCancellationDnaBookings(sigId: string, limit = 15) {
  const res = await fetch(`${API_BASE}/cancellation-dna/signatures/${sigId}/bookings?limit=${limit}`);
  return res.json();
}

export async function fetchModelBlindZoneOverview() {
  const res = await fetch(`${API_BASE}/model-blind-zone/overview`);
  return res.json();
}

export async function fetchModelBlindZoneBookings(filterStatus = "ALL", limit = 20) {
  const res = await fetch(`${API_BASE}/model-blind-zone/bookings?filter_status=${filterStatus}&limit=${limit}`);
  return res.json();
}
