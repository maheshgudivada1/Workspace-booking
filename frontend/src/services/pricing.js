// src/services/pricing.js
/**
 * Pricing utilities.
 *
 * We:
 * - Interpret startLocal/endLocal conversion outside this module (frontend passes ISO or local strings)
 * - estimatePrice accepts { baseHourlyRate, startLocal, endLocal } where startLocal/endLocal are "YYYY-MM-DDTHH:mm" strings (local IST)
 *
 * Peak windows: Mon-Fri 10:00-13:00 and 16:00-19:00 (inclusive start, exclusive end)
 * Peak multiplier = 1.5
 * Proration by minute.
 *
 * Returns { total, breakdown } where breakdown is array:
 *  [{ label: 'Peak hours', minutes: 90, amount: 450.00 }, { label: 'Off-peak', minutes: 60, amount: 150.00 }]
 */

const PEAK_MULTIPLIER = 1.5;
const MIN_IN_HOUR = 60;

function localToIstDate(localStr) {
  // convert "YYYY-MM-DDTHH:mm" interpreted as IST to a JS Date object (UTC instant)
  if (!localStr) return null;
  const [datePart, timePart] = localStr.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  // IST milliseconds using Date.UTC then subtract offset (IST = UTC + 5:30 => UTC = IST - 5:30)
  const istMillis = Date.UTC(y, m - 1, d, hh, mm);
  const offset = 5 * 60 * 60 * 1000 + 30 * 60 * 1000;
  const utcMillis = istMillis - offset;
  return new Date(utcMillis);
}

function minutesBetween(a, b) {
  return Math.max(0, Math.round((b - a) / 60000));
}

/**
 * For a given date (JS Date object, which may be anywhere in time),
 * compute the UTC millis for that day's peak window start and end in UTC.
 * We need to construct window using IST local day.
 */
function peakWindowsForDate(date) {
  // date is a JS Date representing an instant; we want the IST calendar day of that instant.
  // To get IST date components: get UTC millis + offset
  const offset = 5 * 60 * 60 * 1000 + 30 * 60 * 1000;
  const istMillis = date.getTime() + offset;
  const istDate = new Date(istMillis);
  const y = istDate.getUTCFullYear();
  const m = istDate.getUTCMonth();
  const d = istDate.getUTCDate();

  // Build two windows in IST: 10:00-13:00 and 16:00-19:00
  // Convert IST window to UTC by subtracting offset when building Date.UTC
  function istWindowToUtc(startHour, startMin, endHour, endMin) {
    const istStartMillis = Date.UTC(y, m, d, startHour, startMin); // treats as UTC but actually IST
    const utcStart = istStartMillis - offset;
    const istEndMillis = Date.UTC(y, m, d, endHour, endMin);
    const utcEnd = istEndMillis - offset;
    return { start: new Date(utcStart), end: new Date(utcEnd) };
  }

  const w1 = istWindowToUtc(10, 0, 13, 0);
  const w2 = istWindowToUtc(16, 0, 19, 0);
  return [w1, w2];
}

/** check if weekday (Mon-Fri) for IST date */
function isWeekdayIst(date) {
  const offset = 5 * 60 * 60 * 1000 + 30 * 60 * 1000;
  const istMillis = date.getTime() + offset;
  const istDate = new Date(istMillis);
  const day = istDate.getUTCDay(); // 0 Sun ... 6 Sat
  return day >= 1 && day <= 5;
}

/** compute overlap minutes between [a,b) and [c,d) */
function overlapMinutes(a, b, c, d) {
  const start = Math.max(a.getTime(), c.getTime());
  const end = Math.min(b.getTime(), d.getTime());
  return Math.max(0, Math.round((end - start) / 60000));
}

export function estimatePrice({ baseHourlyRate, startLocal, endLocal }) {
  const start = localToIstDate(startLocal);
  const end = localToIstDate(endLocal);
  if (!start || !end || !(start < end)) return { total: 0, breakdown: [] };
  const totalMinutes = minutesBetween(start, end);

  let peakMinutes = 0;
  // iterate day-by-day from start to end
  const dayStart = new Date(start.getTime());
  dayStart.setUTCHours(0, 0, 0, 0);
  let cursor = new Date(dayStart.getTime());
  while (cursor < end) {
    // if this IST day is a weekday
    if (isWeekdayIst(cursor)) {
      // get peak windows for that IST day in UTC Date objects
      const windows = peakWindowsForDate(cursor);
      windows.forEach((w) => {
        peakMinutes += overlapMinutes(start, end, w.start, w.end);
      });
    }
    // move to next UTC day (24h)
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
  }

  const offpeakMinutes = totalMinutes - peakMinutes;
  const peakAmount = (peakMinutes / MIN_IN_HOUR) * baseHourlyRate * PEAK_MULTIPLIER;
  const offAmount = (offpeakMinutes / MIN_IN_HOUR) * baseHourlyRate;
  const total = peakAmount + offAmount;

  const breakdown = [];
  if (peakMinutes > 0)
    breakdown.push({ label: "Peak hours", minutes: peakMinutes, amount: parseFloat(peakAmount.toFixed(2)) });
  if (offpeakMinutes > 0)
    breakdown.push({ label: "Off-peak hours", minutes: offpeakMinutes, amount: parseFloat(offAmount.toFixed(2)) });

  return { total: parseFloat(total.toFixed(2)), breakdown };
}

/** more verbose segments for UI (per-day or per-window) */
export function breakdownSegments({ baseHourlyRate, startLocal, endLocal }) {
  // For now just returns same as estimatePrice.breakdown
  return estimatePrice({ baseHourlyRate, startLocal, endLocal }).breakdown;
}
