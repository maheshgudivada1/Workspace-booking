// src/services/analyticsApi.js
const API_BASE = process.env.REACT_APP_API_BASE || "";

export async function fetchAnalytics({ from, to } = {}) {
  if (!API_BASE) {
    await new Promise((r) => setTimeout(r, 300));
    return [
      { roomId: "101", roomName: "Cabin 1", totalHours: 15.5, totalRevenue: 5250 },
      { roomId: "103", roomName: "Conference Hall", totalHours: 8, totalRevenue: 9600 }
    ];
  }
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const res = await fetch(`${API_BASE}/api/analytics?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
