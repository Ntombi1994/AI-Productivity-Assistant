import type { GeneratedSchedule } from "./ai.functions";

export type StoredSchedule = GeneratedSchedule & { range: "Daily" | "Weekly" };

const KEY = "court.schedule";

export function saveSchedule(schedule: StoredSchedule) {
  try {
    localStorage.setItem(KEY, JSON.stringify(schedule));
  } catch {
    /* storage unavailable */
  }
}

export function loadSchedule(): StoredSchedule | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredSchedule) : null;
  } catch {
    return null;
  }
}
