// src/services/roomsApi.js
const API_BASE = process.env.REACT_APP_API_BASE || "";

const seededRooms = [
  { id: "101", name: "Cabin 1", baseHourlyRate: 350, capacity: 4, description: "Cozy cabin with whiteboard & monitor" },
  { id: "102", name: "Focus Room", baseHourlyRate: 275, capacity: 2, description: "Small focus room, ideal for quick meetups" },
  { id: "103", name: "Conference Hall", baseHourlyRate: 1200, capacity: 20, description: "Large room with projector & conferencing" },
  { id: "104", name: "Workshop Space", baseHourlyRate: 800, capacity: 12, description: "Open layout for workshops & trainings" }
];

export async function fetchRooms() {
  if (!API_BASE) {
    await new Promise((r) => setTimeout(r, 300));
    // convert seededRooms to backend expected keys
    return seededRooms.map(r => ({ id: r.id, name: r.name, base_hourly_rate: r.baseHourlyRate, capacity: r.capacity, description: r.description }));
  }
  const res = await fetch(`${API_BASE}/api/rooms`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function createRoom(payload) {
  // payload: { name, base_hourly_rate, capacity, description }
  if (!API_BASE) {
    await new Promise((r) => setTimeout(r, 200));
    return { ...payload, id: String(Math.random().toString(36).slice(2, 7)) };
  }
  const res = await fetch(`${API_BASE}/api/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function updateRoom(id, payload) {
  if (!API_BASE) {
    await new Promise((r) => setTimeout(r, 200));
    return { ...payload, id };
  }
  const res = await fetch(`${API_BASE}/api/rooms/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function seedRooms() {
  if (!API_BASE) {
    await new Promise((r) => setTimeout(r, 300));
    return seededRooms.map(r => ({ id: r.id, name: r.name, base_hourly_rate: r.baseHourlyRate, capacity: r.capacity, description: r.description }));
  }
  const res = await fetch(`${API_BASE}/api/rooms/seed`, { method: "POST" });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function deleteRoom(id) {
  if (!API_BASE) {
    await new Promise((r) => setTimeout(r, 200));
    return { success: true, id };
  }
  const res = await fetch(`${API_BASE}/api/rooms/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
  return res.json();
}
