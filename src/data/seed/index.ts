import type { DemoData } from "../types";
import { staff } from "./people";
import { classes, pupilRegisters, pupils, schools, schoolTeachers, suFollowUps, tfCohorts, tfRegisters, tfs, trainingSessions, visits } from "./su";
import { applicants, fbCohorts, fbFollowUps, fbRegisters, fbSessions, openings, organizations, placements, portfolio, projects, students, teams } from "./fb";
import { buildProgress, buildSubmissions, competencies, courses, curricula, lmsAssignments, objectives } from "./learning";
import { buildAssessmentSessions, buildPupilResults, forms } from "./assessments";
import { decisions, grants, indicators, kb, obligations, opportunities, priorities, risks } from "./org";
import { activity, inbox, notifications, requests } from "./work";

/** Builds a fresh, deep-copied baseline dataset. Used on first load and by Reset Demo. */
export function buildSeed(): DemoData {
  const activeFb = students.filter((s) => s.cohortId === "fbc-2" && s.status === "Active");
  const cohort2 = tfs.filter((t) => t.cohortId === "tfc-2").map((t) => t.id);
  const data: DemoData = {
    staff, schools, schoolTeachers, classes, pupils, tfCohorts, tfs, trainingSessions, visits,
    followUps: [...suFollowUps, ...fbFollowUps],
    fbCohorts, students, applicants, fbSessions,
    registers: [...pupilRegisters, ...tfRegisters, ...fbRegisters],
    teams, projects, organizations, openings, placements, portfolio,
    competencies, objectives, curricula, courses, lmsAssignments,
    submissions: buildSubmissions(activeFb, cohort2),
    progress: buildProgress([
      ...activeFb.filter((s) => s.pathway !== "ent").map((s) => ({ id: s.id, courseId: s.pathway === "ai" ? "crs-ai" : "crs-web" })),
      ...cohort2.map((id) => ({ id, courseId: "crs-tf" })),
    ]),
    forms,
    assessmentSessions: buildAssessmentSessions(classes, tfs, students),
    pupilResults: buildPupilResults(classes),
    indicators, grants, obligations, opportunities, requests, risks, decisions, priorities, kb,
    inbox, notifications, activity,
  };
  return structuredClone(data);
}
