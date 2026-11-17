import type { Persona, RoleKey } from "@/data/types";

/**
 * Role × scope × data-class access model (architecture report, section 2).
 * The prototype evaluates it in the UI so every persona sees what they would really see,
 * including clear "no access" states.
 */
export type Area =
  | "home" | "inbox" | "calendar" | "requests" | "ask" | "field"
  | "su" | "fb" | "curriculum" | "learning" | "assessments"
  | "executive" | "results" | "fundraising" | "operations" | "knowledge"
  | "safeguarding" | "safeguarding-cases" | "admin";

/** full = manage · scoped = own assignments · view = read · aggregate = de-identified only */
export type AccessLevel = "full" | "scoped" | "view" | "aggregate" | "none";

const EVERYONE: Partial<Record<Area, AccessLevel>> = {
  home: "full", inbox: "full", calendar: "full", requests: "full", ask: "full", knowledge: "view", safeguarding: "full",
};

const MATRIX: Partial<Record<RoleKey, Partial<Record<Area, AccessLevel>>>> = {
  exec: { executive: "full", su: "view", fb: "view", curriculum: "view", learning: "aggregate", assessments: "view", results: "full", fundraising: "full", operations: "view", knowledge: "full", admin: "view" },
  su_pm: { su: "full", curriculum: "view", learning: "full", assessments: "full", executive: "scoped", results: "view", fundraising: "scoped", operations: "scoped" },
  su_po: { su: "scoped", curriculum: "view", learning: "view", assessments: "scoped", field: "full", results: "view" },
  su_trainer: { su: "scoped", curriculum: "scoped", learning: "scoped", assessments: "scoped" },
  fb_pm: { fb: "full", curriculum: "view", learning: "full", assessments: "full", executive: "scoped", results: "view", fundraising: "scoped", operations: "scoped" },
  fb_po: { fb: "scoped", curriculum: "view", learning: "view", assessments: "scoped", results: "view" },
  fb_trainer: { fb: "scoped", curriculum: "scoped", learning: "scoped", assessments: "scoped" },
  curriculum: { curriculum: "full", learning: "full", assessments: "full", su: "aggregate", fb: "aggregate", executive: "view", results: "view", fundraising: "scoped", knowledge: "full" },
  ops_hr: { operations: "full", executive: "view", su: "view", fb: "view", assessments: "scoped", knowledge: "full", admin: "scoped" },
  fundraising: { fundraising: "full", executive: "view", su: "aggregate", fb: "aggregate", assessments: "scoped", results: "view" },
  me: { results: "full", executive: "view", su: "view", fb: "view", curriculum: "aggregate", learning: "aggregate", assessments: "full", fundraising: "scoped" },
  admin: { admin: "full" },
  safeguarding_lead: { "safeguarding-cases": "full", operations: "view" },
};

export function access(persona: Persona, area: Area): AccessLevel {
  if (persona.surface !== "staff") return "none";
  return MATRIX[persona.role]?.[area] ?? EVERYONE[area] ?? "none";
}

export function canSee(persona: Persona, area: Area) {
  return access(persona, area) !== "none";
}

export const ACCESS_LABEL: Record<AccessLevel, string> = {
  full: "Manage",
  scoped: "Own assignments",
  view: "View",
  aggregate: "Aggregated only",
  none: "No access",
};

/**
 * Pupil classroom attendance is restricted and separate from general school access (2.5).
 * Returns the level of detail this persona may see, with the reason shown in the UI.
 */
export type PupilAccess = { level: "individual" | "summary" | "aggregate" | "none"; reason: string };

export function pupilAttendanceAccess(persona: Persona): PupilAccess {
  const hasGrant = persona.grants.includes("pupil-data");
  switch (persona.role) {
    case "class_teacher":
    case "tf":
      return hasGrant
        ? { level: "individual", reason: "Class teacher: own classes only." }
        : { level: "none", reason: "Only class teachers record and view pupil registers." };
    case "su_po":
      return hasGrant
        ? { level: "individual", reason: "Assigned Project Officer with the pupil-data grant (every view is logged)." }
        : { level: "summary", reason: "Assigned Project Officer: class and school summaries." };
    case "su_pm":
      return { level: "summary", reason: "Summaries for all program schools. Individual pupil rows need a logged justification." };
    case "su_trainer":
      return { level: "summary", reason: "Summaries for assigned schools." };
    case "exec":
    case "curriculum":
    case "fundraising":
    case "me":
      return { level: "aggregate", reason: "Aggregated school- and grade-level figures only." };
    default:
      return { level: "none", reason: "Access to a school’s general information never grants access to pupil data. This needs the separate pupil-data grant." };
  }
}
