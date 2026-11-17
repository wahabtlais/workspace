/* ==================================================================
   CodeBrave prototype: shared domain model.
   All four application surfaces read and write this one model.
   Every record is fictional.
   ================================================================== */

export type Program = "SU" | "FB";
export type Surface = "staff" | "student" | "tf" | "partner" | "teacher";

export type RoleKey =
  | "exec"
  | "su_pm"
  | "su_po"
  | "su_trainer"
  | "fb_pm"
  | "fb_po"
  | "fb_trainer"
  | "curriculum"
  | "ops_hr"
  | "fundraising"
  | "me"
  | "admin"
  | "safeguarding_lead"
  | "fb_student"
  | "tf"
  | "class_teacher"
  | "client"
  | "host"
  | "donor";

export type DataClass =
  | "standard"
  | "staff-HR"
  | "learner-PII"
  | "minor-PII"
  | "pupil-data"
  | "safeguarding"
  | "financial";

export interface PersonaScope {
  schoolIds?: string[];
  classIds?: string[];
  tfCohortIds?: string[];
  fbCohortIds?: string[];
  orgId?: string;
  grantIds?: string[];
  studentId?: string;
  tfId?: string;
  teacherId?: string;
}

export interface Persona {
  id: string;
  name: string;
  title: string;
  role: RoleKey;
  surface: Surface;
  staffId?: string;
  grants: DataClass[];
  scope: PersonaScope;
  /** One-line description shown in the persona switcher. */
  summary: string;
  /** Signature demo moment for this persona (architecture report 6.5). */
  demoMoment: string;
  /** Supports Arabic / RTL (school-teacher-related experiences only). */
  bilingual?: boolean;
}

export interface Staff {
  id: string;
  name: string;
  title: string;
  department:
    | "Executive"
    | "School Upskilling"
    | "Future Builders"
    | "Curriculum"
    | "Operations & HR"
    | "Fundraising"
    | "M&E"
    | "Platform";
  role: RoleKey;
  email: string;
  managerId?: string;
  location: string;
  startDate: string;
}

/* ---------------- School Upskilling ---------------- */

export interface School {
  id: string;
  name: string;
  nameAr: string;
  region: string;
  grades: number[];
  status: "Active" | "Onboarding" | "Paused";
  mouStatus: "Signed" | "Renewal due" | "Draft";
  mouExpires: string;
  principal: string;
  poId: string;
  trainerId: string;
  joined: string;
}

export interface SchoolTeacher {
  id: string;
  name: string;
  nameAr: string;
  schoolId: string;
  subject: string;
}

export interface SchoolClass {
  id: string;
  schoolId: string;
  grade: number;
  section: string;
  /** Teacher of record: a deployed TF or a school-employed teacher. */
  teacherId: string;
  teacherType: "tf" | "school";
  subject: string;
  /** Weekday numbers (1=Mon to 5=Fri) the class meets for CodeBrave sessions. */
  days: number[];
  period: string;
  pupilIds: string[];
}

/** School pupils are records, never users. No accounts, no portal. */
export interface Pupil {
  id: string;
  classId: string;
  schoolId: string;
  code: string;
  firstName: string;
  firstNameAr: string;
  initial: string;
  initialAr: string;
  gender: "F" | "M";
}

export type AttendanceStatus = "P" | "A" | "L" | "E";
export type ExcusedReason = "Illness" | "Family" | "School activity" | "Transport" | "Other";

export interface AttendanceCorrection {
  id: string;
  index: number;
  from: AttendanceStatus | null;
  to: AttendanceStatus;
  reason: string;
  requestedBy: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  decidedBy?: string;
  decidedAt?: string;
}

/** One register shape shared by all three attendance workflows. */
export interface Register {
  id: string;
  kind: "pupil" | "fb" | "tf";
  /** classId (pupil), FB session id (fb) or training session id (tf). */
  contextId: string;
  date: string;
  attendeeIds: string[];
  /** null = not recorded yet. A register never defaults to present. */
  marks: (AttendanceStatus | null)[];
  reasons: Record<number, ExcusedReason>;
  lateMinutes: Record<number, number>;
  status: "missing" | "draft" | "submitted" | "pending_sync";
  recordedBy?: string;
  recordedAt?: string;
  syncedAt?: string;
  corrections: AttendanceCorrection[];
}

export interface TFCohort {
  id: string;
  name: string;
  status: "Recruiting" | "In training" | "Deployed";
  start: string;
  end: string;
  trainerIds: string[];
}

export type TFStage =
  | "Applied"
  | "Screening"
  | "Interview"
  | "Offer"
  | "Onboarding"
  | "In training"
  | "Certified"
  | "Deployed"
  | "Alumni";

export interface TeachingFellow {
  id: string;
  name: string;
  nameAr: string;
  cohortId: string;
  stage: TFStage;
  email: string;
  schoolId?: string;
  preScore?: number;
  postScore?: number;
  certifiedAt?: string;
  appliedAt: string;
  background: string;
}

export interface TrainingSession {
  id: string;
  tfCohortId: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  trainerId: string;
  module: string;
}

export interface Visit {
  id: string;
  schoolId: string;
  date: string;
  officerId: string;
  tfId?: string;
  classId?: string;
  purpose: "Classroom observation" | "Coaching check-in" | "School meeting" | "Equipment check";
  status: "Planned" | "Completed" | "Report drafted" | "Report approved";
  score?: number;
  notes?: string;
  pendingSync?: boolean;
}

export interface FollowUp {
  id: string;
  title: string;
  program: Program;
  schoolId?: string;
  tfId?: string;
  studentId?: string;
  ownerId: string;
  due: string;
  status: "Open" | "In progress" | "Done";
  source: string;
  createdAt: string;
}

/* ---------------- Future Builders ---------------- */

export type Pathway = "ai" | "web" | "ent";

export interface FBCohort {
  id: string;
  name: string;
  status: "Admissions" | "Active" | "Graduated";
  start: string;
  end: string;
  trainerIds: string[];
  poId: string;
}

export interface Consent {
  participation: boolean;
  dataProcessing: boolean;
  media: boolean;
  portfolioSharing: boolean;
  internshipSharing: boolean;
  aiAssistant: boolean;
}

export interface FBStudent {
  id: string;
  name: string;
  firstName: string;
  age: number;
  cohortId: string;
  pathway: Pathway;
  status: "Pending consent" | "Active" | "Graduated" | "Withdrawn";
  guardianName: string;
  consent: Consent;
  teamId?: string;
  mentorId?: string;
  readiness: number;
  competencies: Record<string, number>;
}

export interface Applicant {
  id: string;
  name: string;
  age: number;
  school: string;
  pathwayPref: Pathway;
  stage: "Applied" | "Screening" | "Interview" | "Decision" | "Admitted" | "Waitlist" | "Declined";
  score?: number;
  appliedAt: string;
  guardianName: string;
  motivation: string;
}

export interface FBSession {
  id: string;
  cohortId: string;
  type: "Learning session" | "Workshop" | "Student meeting" | "Mentor meeting";
  title: string;
  date: string;
  time: string;
  leadId: string;
  pathway?: Pathway;
}

export interface Team {
  id: string;
  name: string;
  cohortId: string;
  pathway: Pathway;
  memberIds: string[];
  projectId: string;
}

export interface Milestone {
  id: string;
  title: string;
  due: string;
  status: "Not started" | "In progress" | "Submitted" | "Approved" | "Changes requested";
  feedback?: string;
}

export interface Project {
  id: string;
  kind: "team" | "client";
  title: string;
  teamId: string;
  clientId?: string;
  summary: string;
  milestones: Milestone[];
}

export interface Organization {
  id: string;
  name: string;
  type: "Client" | "Internship host" | "Donor" | "Partner";
  sector: string;
  contact: string;
  ownerId: string;
  safeguardingCheck?: "Passed" | "Pending" | "Not started";
}

export interface InternshipOpening {
  id: string;
  hostId: string;
  title: string;
  pathway: Pathway;
  seats: number;
  start: string;
  status: "Open" | "Matching" | "Filled";
}

export interface Placement {
  id: string;
  openingId: string;
  studentId: string;
  stage: "Shortlisted" | "Shared with host" | "Interview" | "Agreement" | "Placed" | "Completed";
  checkIns: { date: string; by: string; note: string; rating: number }[];
}

export interface PortfolioItem {
  id: string;
  studentId: string;
  title: string;
  kind: "Project" | "Assignment" | "Certificate" | "Reflection";
  visibility: "Private" | "Cohort" | "Shared with host" | "Public";
  endorsed: boolean;
  addedAt: string;
}

/* ---------------- Curriculum & Learning ---------------- */

export interface Competency {
  id: string;
  name: string;
  pathway?: Pathway;
}

export interface Objective {
  id: string;
  collection: Program;
  code: string;
  text: string;
  competencyId?: string;
}

export interface LessonPlan {
  objectives: string;
  activities: string[];
  materials: string;
  differentiation: string;
  assessment: string;
}

export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  objectiveIds: string[];
  plan?: LessonPlan;
  aiDrafted?: boolean;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export type VersionStatus = "draft" | "in_review" | "approved" | "published";

export interface ReviewComment {
  id: string;
  authorId: string;
  text: string;
  at: string;
  target?: string;
  resolved?: boolean;
}

export interface CurriculumVersion {
  id: string;
  label: string;
  status: VersionStatus;
  modules: Module[];
  changeLog: string;
  createdAt: string;
  reviewerIds: string[];
  comments: ReviewComment[];
  approvedBy?: string;
  approvedAt?: string;
  publishedAt?: string;
}

export interface Curriculum {
  id: string;
  collection: Program;
  title: string;
  audience: string;
  pathway?: Pathway;
  ownerId: string;
  versions: CurriculumVersion[];
}

/** A published, immutable snapshot of a curriculum version inside a Learning Hub environment. */
export interface Course {
  id: string;
  env: "FB" | "TF";
  curriculumId: string;
  versionId: string;
  title: string;
  pathway?: Pathway;
  cohortIds: string[];
  publishedAt: string;
}

export interface LMSAssignment {
  id: string;
  courseId: string;
  title: string;
  due: string;
  points: number;
  rubric: { criterion: string; levels: string[] }[];
}

export interface LMSSubmission {
  id: string;
  assignmentId: string;
  learnerId: string;
  submittedAt: string;
  status: "Submitted" | "Graded" | "Returned";
  content: string;
  score?: number;
  feedback?: string;
  gradedBy?: string;
}

export interface LessonProgress {
  learnerId: string;
  courseId: string;
  completedLessonIds: string[];
}

/* ---------------- Assessment Hub ---------------- */

export type AssessmentType =
  | "Pre/post test"
  | "Quiz"
  | "Observation"
  | "Survey"
  | "Evaluation"
  | "Visit"
  | "Data collection";

export interface AssessmentForm {
  id: string;
  title: string;
  type: AssessmentType;
  program: Program | "Org";
  audience: "Pupils" | "Teaching Fellows" | "FB students" | "Staff" | "Schools" | "Hosts";
  questionCount: number;
  status: "Draft" | "Published" | "Archived";
  ownerId: string;
  updatedAt: string;
  objectiveIds: string[];
}

export type EntryStatus = "not_started" | "in_progress" | "submitted" | "pending_sync" | "failed";

export interface AssessmentEntry {
  subjectId: string;
  status: EntryStatus;
  score?: number;
  submittedAt?: string;
  device?: string;
  error?: string;
  /** Recorded during reconciliation when a subject has no valid submission. */
  resolution?: "Absent" | "Exempt" | "Paper copy entered" | "Retake scheduled";
}

export interface AssessmentSession {
  id: string;
  formId: string;
  title: string;
  phase: "pre" | "post" | "quiz";
  audience: "pupils" | "tf" | "fb";
  academicYear: string;
  schoolId?: string;
  classId?: string;
  cohortId?: string;
  date: string;
  conductedBy: string;
  status: "Scheduled" | "Live" | "Reconciling" | "Closed";
  entries: AssessmentEntry[];
  closedAt?: string;
  closedBy?: string;
}

/** Aggregated pupil pre/post results per class and academic year (annual reporting). */
export interface PupilAnnualResult {
  academicYear: string;
  classId: string;
  schoolId: string;
  grade: number;
  preAvg: number | null;
  postAvg: number | null;
  assessedPre: number;
  assessedPost: number;
  enrolled: number;
}

/* ---------------- Organization ---------------- */

export interface Indicator {
  id: string;
  code: string;
  name: string;
  program: Program | "Org";
  unit: "%" | "#" | "score";
  target: number;
  baseline: number;
  series: { period: string; value: number }[];
  source: string;
  ownerId: string;
  grantIds: string[];
}

export interface Grant {
  id: string;
  donorId: string;
  title: string;
  program: Program | "Org";
  amount: number;
  currency: "USD" | "EUR";
  start: string;
  end: string;
  indicatorIds: string[];
  status: "Active" | "Closing" | "Closed";
  restrictions: string;
}

export interface Obligation {
  id: string;
  grantId: string;
  title: string;
  due: string;
  status: "Upcoming" | "Drafting" | "In review" | "Approved" | "Submitted";
  ownerId: string;
}

export interface FundOpportunity {
  id: string;
  title: string;
  funder: string;
  amount: number;
  deadline: string;
  stage: "Identified" | "Qualifying" | "Drafting" | "Submitted" | "Awarded" | "Declined";
  fit?: number;
  program: Program | "Org";
  ownerId: string;
  eligibility?: { item: string; met: boolean | null }[];
}

export interface ApprovalStep {
  role: RoleKey;
  label: string;
  status: "waiting" | "pending" | "approved" | "rejected";
  by?: string;
  at?: string;
}

export interface OpsRequest {
  id: string;
  type: "Leave" | "Equipment" | "Travel" | "Purchase" | "General";
  title: string;
  requesterId: string;
  createdAt: string;
  amount?: number;
  details: string;
  chain: ApprovalStep[];
  status: "In approval" | "Approved" | "Assigned" | "Completed" | "Rejected";
  assigneeId?: string;
}

export interface Risk {
  id: string;
  title: string;
  area: string;
  likelihood: number;
  impact: number;
  ownerId: string;
  mitigation: string;
  status: "Open" | "Mitigating" | "Closed";
}

export interface Decision {
  id: string;
  title: string;
  context: string;
  requestedBy: string;
  due: string;
  status: "Pending" | "Approved" | "Declined" | "Deferred";
  link?: string;
}

export interface Priority {
  id: string;
  objective: string;
  ownerId: string;
  keyResults: { text: string; indicatorId?: string; progress: number }[];
}

export interface KBArticle {
  id: string;
  title: string;
  category: "Policy" | "SOP" | "FAQ" | "Guide";
  ownerId: string;
  reviewDue: string;
  summary: string;
}

/* ---------------- Work, Inbox, Notifications ---------------- */

export type InboxKind = "approval" | "task" | "grading" | "form" | "register" | "alert" | "mention" | "review";

export interface InboxItem {
  id: string;
  /** Addressed to a role (everyone holding it) and/or a specific persona. */
  toRole?: RoleKey;
  toPersona?: string;
  kind: InboxKind;
  title: string;
  detail: string;
  link: string;
  createdAt: string;
  due?: string;
  status: "open" | "done";
  source: string;
  priority?: "high" | "normal";
}

export interface Notification {
  id: string;
  toRole?: RoleKey;
  toPersona?: string;
  text: string;
  link?: string;
  at: string;
  read: boolean;
  tone: "info" | "success" | "warning" | "danger" | "ai";
}

export interface ActivityEvent {
  id: string;
  at: string;
  actor: string;
  text: string;
  area: string;
  link?: string;
}

export interface DemoData {
  staff: Staff[];
  schools: School[];
  schoolTeachers: SchoolTeacher[];
  classes: SchoolClass[];
  pupils: Pupil[];
  tfCohorts: TFCohort[];
  tfs: TeachingFellow[];
  trainingSessions: TrainingSession[];
  visits: Visit[];
  followUps: FollowUp[];
  fbCohorts: FBCohort[];
  students: FBStudent[];
  applicants: Applicant[];
  fbSessions: FBSession[];
  registers: Register[];
  teams: Team[];
  projects: Project[];
  organizations: Organization[];
  openings: InternshipOpening[];
  placements: Placement[];
  portfolio: PortfolioItem[];
  competencies: Competency[];
  objectives: Objective[];
  curricula: Curriculum[];
  courses: Course[];
  lmsAssignments: LMSAssignment[];
  submissions: LMSSubmission[];
  progress: LessonProgress[];
  forms: AssessmentForm[];
  assessmentSessions: AssessmentSession[];
  pupilResults: PupilAnnualResult[];
  indicators: Indicator[];
  grants: Grant[];
  obligations: Obligation[];
  opportunities: FundOpportunity[];
  requests: OpsRequest[];
  risks: Risk[];
  decisions: Decision[];
  priorities: Priority[];
  kb: KBArticle[];
  inbox: InboxItem[];
  notifications: Notification[];
  activity: ActivityEvent[];
}
