import { TherapistSchedule, ScheduleMap, DayKey } from '../types';

export const STORAGE_KEY_SCHEDULES = 'therapy_hub_schedules_v1';
export const STORAGE_KEY_USERS = 'therapy_hub_users_v1';
export const STORAGE_KEY_SESSION = 'therapy_hub_active_session_v1';

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Error writing ${key} to localStorage:`, err);
  }
}

/**
 * Intelligently parse any time range string (e.g. "2:30 pm to 3:15 pm", "02:30 PM - 03:15 PM", "2:30 - 3:15 PM", "14:30 - 15:15", "3:15pm")
 * and compute the next slot based on the specified duration in minutes (default 45 minutes).
 *
 * Example:
 * Input: "2:30 pm to 3:15 pm", duration: 45
 * Output: "03:15 PM - 04:00 PM"
 */
export function calculateNextSlotTime(lastSlotTime: string, durationMinutes: number = 45): string {
  const fallback = '03:15 PM - 04:00 PM';
  if (!lastSlotTime || typeof lastSlotTime !== 'string') return fallback;

  try {
    const cleanStr = lastSlotTime.trim();

    // Match all time tokens: e.g. "2:30", "2:30pm", "03:15 PM", "15:15"
    const timeRegex = /(\d{1,2}):(\d{2})(?:\s*([ap]m))?/gi;
    const matches = Array.from(cleanStr.matchAll(timeRegex));

    if (matches.length === 0) return fallback;

    // The last match represents the end time of the previous slot
    const lastMatch = matches[matches.length - 1];
    let hours = parseInt(lastMatch[1], 10);
    const minutes = parseInt(lastMatch[2], 10);
    let modifier = lastMatch[3] ? lastMatch[3].toUpperCase() : null;

    if (isNaN(hours) || isNaN(minutes)) return fallback;

    // If modifier is missing on the last match, check if any token in the string has AM/PM
    if (!modifier) {
      for (const m of matches) {
        if (m[3]) {
          modifier = m[3].toUpperCase();
          break;
        }
      }
    }

    // Clinic context heuristic: If hours are between 1 and 7 and no AM/PM, it's afternoon PM
    // (e.g., 2:30 to 3:15 is afternoon 2:30 PM to 3:15 PM)
    if (!modifier) {
      if (hours >= 1 && hours <= 7) {
        modifier = 'PM';
      } else if (hours >= 8 && hours <= 11) {
        modifier = 'AM';
      } else if (hours === 12) {
        modifier = 'PM';
      }
    }

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

    const formatTime = (dateObj: Date) => {
      let h = dateObj.getHours();
      const m = dateObj.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      h = h ? h : 12;
      const hStr = h < 10 ? '0' + h : '' + h;
      const mStr = m < 10 ? '0' + m : '' + m;
      return `${hStr}:${mStr} ${ampm}`;
    };

    return `${formatTime(startDate)} - ${formatTime(endDate)}`;
  } catch (err) {
    console.error('Time parse error:', err);
    return fallback;
  }
}

/**
 * Get the slot's timing for a specific day (falls back to slot.time)
 */
export function getSlotTimeForDay(slot: { time: string; dayTimes?: Partial<Record<DayKey, string>> }, dayKey: DayKey): string {
  if (slot.dayTimes && slot.dayTimes[dayKey]) {
    return slot.dayTimes[dayKey]!;
  }
  return slot.time;
}

/**
 * Get the last slot's timing from a schedule (optionally for a specific day)
 */
export function getLastSlotTiming(schedule?: TherapistSchedule, dayKey?: DayKey): string {
  if (!schedule || !schedule.slots || schedule.slots.length === 0) return '';
  const lastSlot = schedule.slots[schedule.slots.length - 1];
  if (dayKey && lastSlot.dayTimes && lastSlot.dayTimes[dayKey]) {
    return lastSlot.dayTimes[dayKey]!;
  }
  return lastSlot.time || '';
}

/**
 * Calculate next slot time for a specific day
 */
export function calculateNextSlotTimeForDay(schedule?: TherapistSchedule, dayKey?: DayKey, durationMinutes: number = 45): string {
  const lastTime = getLastSlotTiming(schedule, dayKey);
  return calculateNextSlotTime(lastTime, durationMinutes);
}

export function getScheduleStats(schedule?: TherapistSchedule) {
  if (!schedule || !schedule.slots) {
    return {
      totalSlots: 0,
      bookedSlots: 0,
      openSlots: 0,
      breakSlots: 0,
      uniquePatients: 0,
    };
  }

  const days: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  let totalSlots = 0;
  let bookedSlots = 0;
  let breakSlots = 0;
  const patientsSet = new Set<string>();

  schedule.slots.forEach((slot) => {
    if (slot.isBreak) {
      breakSlots++;
    } else {
      days.forEach((day) => {
        totalSlots++;
        const val = (slot[day] || '').trim();
        if (val) {
          bookedSlots++;
          patientsSet.add(val.toUpperCase());
        }
      });
    }
  });

  return {
    totalSlots,
    bookedSlots,
    openSlots: Math.max(0, totalSlots - bookedSlots),
    breakSlots,
    uniquePatients: patientsSet.size,
  };
}

export function exportScheduleToCsv(schedule: TherapistSchedule): void {
  let csvContent = 'Time Slot,Slot Type,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday\r\n';

  schedule.slots.forEach((row) => {
    const type = row.isBreak ? 'BREAK' : 'REGULAR SESSION';
    const sanitize = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
    const line = [
      sanitize(row.time),
      sanitize(type),
      sanitize(row.mon),
      sanitize(row.tue),
      sanitize(row.wed),
      sanitize(row.thu),
      sanitize(row.fri),
      sanitize(row.sat),
    ].join(',');
    csvContent += line + '\r\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${schedule.title.replace(/[^a-zA-Z0-9]/g, '_')}_Schedule.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAllSchedulesToCsv(schedules: ScheduleMap): void {
  let csvContent = 'Therapist,Shift,Time Slot,Slot Type,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday\r\n';

  (Object.values(schedules) as TherapistSchedule[]).forEach((schedule) => {
    schedule.slots.forEach((row) => {
      const type = row.isBreak ? 'BREAK' : 'REGULAR SESSION';
      const sanitize = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
      const line = [
        sanitize(schedule.title),
        sanitize(schedule.shift),
        sanitize(row.time),
        sanitize(type),
        sanitize(row.mon),
        sanitize(row.tue),
        sanitize(row.wed),
        sanitize(row.thu),
        sanitize(row.fri),
        sanitize(row.sat),
      ].join(',');
      csvContent += line + '\r\n';
    });
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Therapy_Hub_All_Staff_Schedules.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
