// src/utils/time.js
/**
 * Utilities for interpreting datetime-local as Asia/Kolkata (IST)
 * and formatting for display.
 */

// IST offset in milliseconds (UTC +5:30)
export const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

export function localToIstISO(localStr) {
  // localStr = "YYYY-MM-DDTHH:mm" -> interpret as IST -> convert to UTC ISO string
  if (!localStr) return null;
  const [datePart, timePart] = localStr.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  const istMillis = Date.UTC(y, m - 1, d, hh, mm); // this treats as UTC, so subtract offset for real UTC
  const utcMillis = istMillis - IST_OFFSET_MS;
  return new Date(utcMillis).toISOString();
}

export function isoToIstLocal(isoStr) {
  // Convert ISO UTC string to local datetime-local style string representing IST (YYYY-MM-DDTHH:mm)
  if (!isoStr) return "";
  const date = new Date(isoStr);
  const istMillis = date.getTime() + IST_OFFSET_MS;
  const d = new Date(istMillis);
  const pad = (v) => String(v).padStart(2, "0");
  const ts = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  return ts;
}

export function isoToDisplay(isoStr) {
  // Friendly display in IST timezone (e.g., "20 Nov 2025, 10:00 IST")
  if (!isoStr) return "";
  const date = new Date(isoStr);
  const istMillis = date.getTime() + IST_OFFSET_MS;
  const d = new Date(istMillis);
  const opts = { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" };
  // We will use Intl with UTC to avoid local machine timezone issues because we've adjusted millis to IST
  return new Intl.DateTimeFormat("en-GB", opts).format(new Date(istMillis)) + " IST";
}
