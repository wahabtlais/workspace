import type { DemoData } from "@/data/types";
import { useData } from "@/store/hooks";
import { attendanceRate, registerCompletion } from "./metrics";
import { addDays, DEMO_TODAY } from "./utils";

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Indicator values calculated from the shared records. Anything not in this map is an illustrative snapshot. */
export function liveValues(d: DemoData): Record<string, number> {
  const pupil = d.registers.filter((r) => r.kind === "pupil");
  const fb = d.registers.filter((r) => r.kind === "fb");
  const last = d.pupilResults.filter((r) => r.academicYear === "2025–26" && r.preAvg !== null && r.postAvg !== null);
  const gain = last.length ? last.reduce((a, r) => a + (r.postAvg! - r.preAvg!), 0) / last.length : 0;
  const obs = d.visits.filter((v) => v.score !== undefined && v.date >= "2026-09-01");
  const since = addDays(DEMO_TODAY, -30);
  const active = d.schools.filter((s) => s.status === "Active");
  const visited = active.filter((s) => d.visits.some((v) => v.schoolId === s.id && v.status !== "Planned" && v.date >= since && v.date <= DEMO_TODAY));
  return {
    "ind-su-reach": d.pupils.length,
    "ind-su-gain": r1(gain),
    "ind-su-att": attendanceRate(pupil),
    "ind-su-reg": registerCompletion(pupil).rate,
    "ind-su-cert": d.tfs.filter((t) => t.certifiedAt).length,
    "ind-su-obs": obs.length ? r1(obs.reduce((a, v) => a + (v.score ?? 0), 0) / obs.length) : 0,
    "ind-su-visit": active.length ? Math.round((visited.length / active.length) * 100) : 0,
    "ind-fb-active": d.students.filter((s) => s.cohortId === "fbc-2" && s.status === "Active").length,
    "ind-fb-att": attendanceRate(fb),
    "ind-fb-intern": d.placements.filter((p) => p.stage === "Placed" || p.stage === "Completed").length,
  };
}

export const ILLUSTRATIVE_NOTE = "Illustrative figure for the prototype: not calculated from platform records.";

export function useLiveIndicators() {
  const d = useData();
  const live = liveValues(d);
  return d.indicators.map((i) => {
    const isLive = i.id in live;
    const snapshot = [...i.series].reverse().find((x) => x.value > 0)?.value ?? 0;
    return { ...i, current: isLive ? live[i.id] : snapshot, live: isLive, illustrative: !isLive };
  });
}
