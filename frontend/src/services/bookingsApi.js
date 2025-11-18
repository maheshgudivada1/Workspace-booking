// src/services/bookingsApi.js
const API_BASE = process.env.REACT_APP_API_BASE || "";

async function parseJSON(res) {
  const txt = await res.text();
  try { return JSON.parse(txt); } catch { return txt; }
}

export async function createBooking(payload) {
  if (!API_BASE) {
    await new Promise((r) => setTimeout(r, 500));
    const bookingId = `b${Math.random().toString(36).substr(2, 8)}`;
    return {
      bookingId,
      roomId: payload.roomId,
      userName: payload.userName,
      totalPrice: Math.round(Math.random() * 900 + 100),
      status: "CONFIRMED",
      startTime: payload.startTime,
      endTime: payload.endTime,
      createdAt: new Date().toISOString()
    };
  }
  const res = await fetch(`${API_BASE}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const body = await parseJSON(res);
  if (!res.ok) throw new Error(body?.error || body?.message || `HTTP ${res.status}`);
  return body;
}

export async function fetchBookings({ from, to, roomId } = {}) {
  if (!API_BASE) {
    // mock a few bookings (demo)
    await new Promise((r) => setTimeout(r, 350));
    const now = new Date();
    const iso = now.toISOString();
    return [
      { bookingId: "b111", roomId: "101", roomName: "Cabin 1", userName: "Priya", startTime: iso, endTime: new Date(now.getTime() + 60 * 60 * 1000).toISOString(), totalPrice: 350, status: "CONFIRMED" }
    ];
  }
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (roomId) params.set("roomId", roomId);
  const res = await fetch(`${API_BASE}/api/bookings?${params.toString()}`);
  const body = await parseJSON(res);
  if (!res.ok) throw new Error(body?.error || body?.message || `HTTP ${res.status}`);
  return body;
}

export async function getBookingById(id) {
  if (!API_BASE) {
    await new Promise((r) => setTimeout(r, 300));
    return { bookingId: id, roomId: "101", roomName: "Cabin 1", userName: "Demo", startTime: new Date().toISOString(), endTime: new Date(Date.now() + 3600000).toISOString(), totalPrice: 350, status: "CONFIRMED" };
  }
  const res = await fetch(`${API_BASE}/api/bookings/${id}`);
  const body = await parseJSON(res);
  if (!res.ok) throw new Error(body?.error || body?.message || `HTTP ${res.status}`);
  return body;
}

export async function cancelBooking(id) {
  if (!API_BASE) {
    await new Promise((r) => setTimeout(r, 300));
    return { success: true, bookingId: id, status: "CANCELLED" };
  }
  const res = await fetch(`${API_BASE}/api/bookings/${id}/cancel`, { method: "POST" });
  const body = await parseJSON(res);
  if (!res.ok) throw new Error(body?.error || body?.message || `HTTP ${res.status}`);
  return body;
}
