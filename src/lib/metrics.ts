import type { AttendanceStatus, DemoData, Register } from "@/data/types";
import { DEMO_TODAY } from "./utils";

/** Present + late count as attended. Excused is excluded from the denominator. */
export function attendanceRate(registers: Register[]) {
  let attended = 0;
  let counted = 0;
  for (const r of registers) {
    if (r.status === "missing") continue;
    for (const m of r.marks) {
      if (m === null || m === "E") continue;
      counted++;
      if (m === "P" || m === "L") attended++;
    }
  }
  return counted ? Math.round((attended / counted) * 1000) / 10 : 0;
}

export function countMarks(r: Register) {
  const c: Record<AttendanceStatus | "unmarked", number> = { P: 0, A: 0, L: 0, E: 0, unmarked: 0 };
  r.marks.forEach((m) => { c[m ?? "unmarked"]++; });
  return c;
}

export function registerCompletion(registers: Register[]) {
  const due = registers.filter((r) => r.date < DEMO_TODAY);
  const done = due.filter((r) => r.status !== "missing");
  return { due: due.length, done: done.length, rate: due.length ? Math.round((done.length / due.length) * 1000) / 10 : 100 };
}

export function attendeeRate(registers: Register[], attendeeId: string) {
  let attended = 0;
  let counted = 0;
  for (const r of registers) {
    const i = r.attendeeIds.indexOf(attendeeId);
    if (i < 0 || r.status === "missing") continue;
    const m = r.marks[i];
    if (m === null || m === "E") continue;
    counted++;
    if (m === "P" || m === "L") attended++;
  }
  return counted ? Math.round((attended / counted) * 1000) / 10 : 100;
}

export function pupilRegistersFor(data: DemoData, classIds: string[]) {
  const set = new Set(classIds);
  return data.registers.filter((r) => r.kind === "pupil" && set.has(r.contextId));
}

export function tfRegisters(data: DemoData) {
  return data.registers.filter((r) => r.kind === "tf");
}

export function fbRegisters(data: DemoData) {
  return data.registers.filter((r) => r.kind === "fb");
}

export const TF_ATTENDANCE_THRESHOLD = 80;

export function sessionProgress(entries: { status: string }[]) {
  const c = { submitted: 0, in_progress: 0, not_started: 0, pending_sync: 0, failed: 0 } as Record<string, number>;
  entries.forEach((e) => { c[e.status] = (c[e.status] ?? 0) + 1; });
  return c;
}
