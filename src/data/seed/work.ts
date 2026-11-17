import type { ActivityEvent, ApprovalStep, InboxItem, Notification, OpsRequest } from "../types";

const step = (role: ApprovalStep["role"], label: string, status: ApprovalStep["status"], by?: string, at?: string): ApprovalStep => ({ role, label, status, by, at });

export const requests: OpsRequest[] = [
  { id: "REQ-0001", type: "Leave", title: "Annual leave, 3 days (22–24 Dec)", requesterId: "s-dana", createdAt: "2026-11-10", details: "Family travel.", chain: [step("fb_pm", "Line manager", "approved", "s-tarek", "2026-11-11"), step("ops_hr", "HR", "pending")], status: "In approval" },
  { id: "REQ-0002", type: "Equipment", title: "Laptop for new SU trainer starting 1 Dec", requesterId: "s-maya", createdAt: "2026-11-12", amount: 950, details: "Standard staff laptop with charger and bag.", chain: [step("exec", "Line manager", "approved", "s-karim", "2026-11-12"), step("ops_hr", "Operations", "pending")], status: "In approval" },
  { id: "REQ-0003", type: "Travel", title: "Field travel: Coastal schools, week of 23 Nov", requesterId: "s-lina", createdAt: "2026-11-13", amount: 180, details: "Transport for 4 school visits.", chain: [step("su_pm", "Line manager", "pending"), step("ops_hr", "Operations", "waiting")], status: "In approval" },
  { id: "REQ-0004", type: "Purchase", title: "Snacks and prizes for FB demo day", requesterId: "s-hala", createdAt: "2026-11-09", amount: 240, details: "Demo day on 16 Dec, ~40 attendees.", chain: [step("fb_pm", "Line manager", "approved", "s-tarek", "2026-11-09"), step("ops_hr", "Finance", "approved", "s-ghassan", "2026-11-10")], status: "Approved" },
  { id: "REQ-0005", type: "General", title: "Room booking for TF certification ceremony", requesterId: "s-maya", createdAt: "2026-11-04", details: "Hall for ~60 people on 18 Dec.", chain: [step("ops_hr", "Operations", "approved", "s-ziad", "2026-11-05")], status: "Assigned", assigneeId: "s-reem" },
  { id: "REQ-0006", type: "Leave", title: "Sick leave, 1 day (12 Nov)", requesterId: "s-omar", createdAt: "2026-11-12", details: "Medical certificate attached.", chain: [step("su_pm", "Line manager", "approved", "s-maya", "2026-11-12"), step("ops_hr", "HR", "approved", "s-reem", "2026-11-13")], status: "Completed" },
  { id: "REQ-0007", type: "Purchase", title: "6 replacement field tablets", requesterId: "s-ziad", createdAt: "2026-11-11", amount: 2100, details: "Replaces devices failing during offline collection.", chain: [step("ops_hr", "Finance", "approved", "s-ghassan", "2026-11-12"), step("exec", "Executive (over USD 1,000)", "pending")], status: "In approval" },
  { id: "REQ-0008", type: "Equipment", title: "Projector for Lighthouse practicum", requesterId: "s-nour", createdAt: "2026-11-14", amount: 420, details: "Loan for 2 weeks.", chain: [step("su_pm", "Line manager", "pending"), step("ops_hr", "Operations", "waiting")], status: "In approval" },
  { id: "REQ-0009", type: "Travel", title: "Donor meeting travel (capital)", requesterId: "s-joelle", createdAt: "2026-11-02", amount: 320, details: "Meeting with Horizon Education Fund.", chain: [step("exec", "Line manager", "approved", "s-rana", "2026-11-03"), step("ops_hr", "Finance", "approved", "s-ghassan", "2026-11-03")], status: "Completed" },
  { id: "REQ-0010", type: "General", title: "Access to M&E dashboard for new grants officer", requesterId: "s-bassel", createdAt: "2026-11-15", details: "View-only access to indicators.", chain: [step("fundraising", "Line manager", "approved", "s-joelle", "2026-11-15"), step("admin", "Platform admin", "pending")], status: "In approval" },
  { id: "REQ-0011", type: "Equipment", title: "Headsets for online mentor sessions", requesterId: "s-sami", createdAt: "2026-10-28", amount: 150, details: "4 headsets.", chain: [step("fb_pm", "Line manager", "approved", "s-tarek", "2026-10-28"), step("ops_hr", "Operations", "approved", "s-ziad", "2026-10-29")], status: "Completed" },
  { id: "REQ-0012", type: "Leave", title: "Annual leave, 1 day (27 Nov)", requesterId: "s-yasmin", createdAt: "2026-11-16", details: "", chain: [step("exec", "Line manager", "pending"), step("ops_hr", "HR", "waiting")], status: "In approval" },
];

export const activity: ActivityEvent[] = [
  { id: "ac-1", at: "2026-11-16T17:40:00", actor: "Dana Issa", text: "recorded attendance for a Web learning session", area: "Future Builders" },
  { id: "ac-2", at: "2026-11-16T15:05:00", actor: "Lina Farah", text: "submitted an observation for Stonebridge (score 1.9)", area: "School Upskilling" },
  { id: "ac-3", at: "2026-11-15T11:00:00", actor: "Yasmin Awad", text: "sent AI & ML Pathway v1.3 for review", area: "Curriculum" },
  { id: "ac-4", at: "2026-11-14T10:20:00", actor: "Jad Mansour", text: "requested an attendance correction for a TF", area: "Attendance" },
  { id: "ac-5", at: "2026-11-13T09:30:00", actor: "Joelle Matar", text: "moved Youth Employability Grants to Drafting", area: "Fundraising" },
];

const T = "2026-11-17T08:00:00";
const Y = "2026-11-16T16:00:00";

export const inbox: InboxItem[] = [
  { id: "ib-1", ref: "dec-4", toRole: "exec", kind: "approval", title: "Approve: 6 replacement field tablets (USD 2,100)", detail: "REQ-0007 · above the line-manager limit", link: "/operations/requests", createdAt: Y, status: "open", source: "Operations & HR", priority: "high" },
  { id: "ib-2", ref: "dec-2", toRole: "exec", kind: "approval", title: "Decide: Education Resilience Window go / no-go", detail: "Eligibility 4/5 met · deadline 15 Feb", link: "/executive/decisions", createdAt: Y, status: "open", source: "Fundraising" },
  { id: "ib-3", toRole: "exec", kind: "alert", title: "Off-track: average observation score 2.8 (target 3.0)", detail: "Two schools below 2.2 this term", link: "/results/indicators", createdAt: T, status: "open", source: "Results & Indicators" },
  { id: "ib-4", toRole: "su_pm", kind: "approval", title: "Attendance correction: Mira Haddad, training session", detail: "Absent → Excused · requested by Jad Mansour", link: "/school-upskilling/training", createdAt: "2026-11-14T10:20:00", status: "open", source: "Attendance", priority: "high" },
  { id: "ib-5", toRole: "su_pm", kind: "alert", title: "2 TFs below the 80% training attendance threshold", detail: "Certification criterion at risk · Cohort 2026–27", link: "/school-upskilling/teaching-fellows", createdAt: T, status: "open", source: "Attendance rule" },
  { id: "ib-6", toRole: "su_pm", kind: "approval", title: "Approve travel: Lina Farah, Coastal schools", detail: "REQ-0003 · USD 180", link: "/operations/requests", createdAt: "2026-11-13T09:00:00", status: "open", source: "Operations & HR" },
  { id: "ib-7", toRole: "su_pm", kind: "alert", title: "Pupil pre-assessment waiting for reconciliation", detail: "Sunrise Intermediate · Grade 8-A", link: "/assessments/tracker", createdAt: T, status: "open", source: "Assessment Hub" },
  { id: "ib-8", toPersona: "p-su-po", kind: "form", title: "Classroom observation: Cedar Hill, Layla Hassan", detail: "Planned visit today · Grade 5-A", link: "/school-upskilling/visits", createdAt: T, due: "2026-11-17", status: "open", source: "Visits" },
  { id: "ib-9", toPersona: "p-su-po", kind: "task", title: "Missing registers: Sunrise Grade 8-A", detail: "Follow up with the class teacher", link: "/school-upskilling/follow-ups", createdAt: "2026-11-13T09:00:00", due: "2026-11-19", status: "open", source: "Attendance rule" },
  { id: "ib-10", toRole: "su_trainer", kind: "register", title: "Take today’s training register", detail: "TF Cohort 2026–27 · 14:00", link: "/school-upskilling/training", createdAt: T, due: "2026-11-17", status: "open", source: "Attendance" },
  { id: "ib-11", toRole: "su_trainer", kind: "grading", title: "Grade: Lesson plan, loops with block-based coding", detail: "Submissions waiting for rubric grading", link: "/learning/grading", createdAt: "2026-11-12T08:00:00", status: "open", source: "Learning Hub" },
  { id: "ib-12", toRole: "fb_pm", kind: "review", title: "Review curriculum: AI & ML Pathway v1.3", detail: "Sent for review by Yasmin Awad", link: "/curriculum/cur-ai", createdAt: "2026-11-05T10:00:00", status: "open", source: "Curriculum" },
  { id: "ib-13", toRole: "fb_pm", kind: "approval", title: "Admissions decisions: 2 applicants ready", detail: "Christelle Nader · Mohammad Srour", link: "/future-builders/admissions", createdAt: Y, status: "open", source: "Admissions" },
];

inbox.push(
  { id: "ib-15", toRole: "fb_po", kind: "task", title: "Absence follow-up: 3 sessions missed", detail: "Rule-generated · Future Builders 2026–27", link: "/future-builders/attendance", createdAt: "2026-11-12T18:00:00", due: "2026-11-18", status: "open", source: "Attendance rule", priority: "high" },
  { id: "ib-16", toRole: "fb_po", kind: "task", title: "Guardian consent outstanding (2 students)", detail: "Accounts stay inactive until consent is given", link: "/future-builders/admissions", createdAt: "2026-11-08T09:00:00", status: "open", source: "Consent rule" },
  { id: "ib-17", toRole: "fb_trainer", kind: "grading", title: "Grade: Train your first classifier", detail: "AI pathway submissions", link: "/learning/grading", createdAt: "2026-11-16T08:00:00", status: "open", source: "Learning Hub" },
  { id: "ib-18", toRole: "fb_trainer", kind: "review", title: "Review curriculum: AI & ML Pathway v1.3", detail: "Your comments are requested", link: "/curriculum/cur-ai", createdAt: "2026-11-05T10:00:00", status: "open", source: "Curriculum" },
  { id: "ib-19", toRole: "curriculum", kind: "task", title: "Ready to publish: Entrepreneurship Pathway v1.0", detail: "Approved by Tarek Daher on 10 Nov", link: "/curriculum/cur-ent", createdAt: "2026-11-10T12:00:00", status: "open", source: "Curriculum", priority: "high" },
  { id: "ib-20", toRole: "curriculum", kind: "mention", title: "Sami Khalil commented on AI & ML v1.3", detail: "“Can we add a short lesson on train/test splits…”", link: "/curriculum/cur-ai", createdAt: "2026-11-12T14:10:00", status: "open", source: "Curriculum" },
  { id: "ib-21", toRole: "ops_hr", kind: "approval", title: "Approve: Laptop for new SU trainer", detail: "REQ-0002 · USD 950", link: "/operations/requests", createdAt: "2026-11-12T12:00:00", status: "open", source: "Operations & HR" },
  { id: "ib-22", toRole: "ops_hr", kind: "approval", title: "Approve leave: Dana Issa (22–24 Dec)", detail: "REQ-0001 · line manager approved", link: "/operations/requests", createdAt: "2026-11-11T09:00:00", status: "open", source: "Operations & HR" },
  { id: "ib-23", toRole: "fundraising", kind: "task", title: "Report due 30 Nov: Atlas quarterly indicator update", detail: "In review · figures need M&E check", link: "/fundraising/obligations", createdAt: Y, status: "open", source: "Obligation reminder" },
  { id: "ib-24", toRole: "fundraising", kind: "task", title: "Check eligibility: Girls in Tech Futures 2027", detail: "New call identified · USD 120k", link: "/fundraising/opportunities", createdAt: T, status: "open", source: "Fundraising" },
  { id: "ib-25", toRole: "me", kind: "task", title: "Verify indicator figures for Atlas quarterly update", detail: "FB-01, FB-02, FB-03", link: "/results/indicators", createdAt: Y, status: "open", source: "Fundraising" },
  { id: "ib-26", toRole: "admin", kind: "approval", title: "Access request: M&E dashboard for Bassel Najjar", detail: "REQ-0010 · view-only", link: "/admin/users", createdAt: "2026-11-15T10:00:00", status: "open", source: "Operations & HR" },
  { id: "ib-27", toPersona: "p-teacher", kind: "register", title: "Take register: Grade 6-A", detail: "Today · Period 3", link: "/teacher", createdAt: T, due: "2026-11-17", status: "open", source: "Attendance" },
  { id: "ib-28", toPersona: "p-teacher", kind: "form", title: "Pupil pre-assessment in progress: Grade 6-A", detail: "Track submissions live", link: "/teacher/assessments", createdAt: T, status: "open", source: "Assessment Hub" },
  { id: "ib-29", toPersona: "p-tf", kind: "form", title: "Mid-training checkpoint is open", detail: "15 questions · closes today 17:00", link: "/tf/assessments", createdAt: T, status: "open", source: "Assessment Hub" },
  { id: "ib-30", toPersona: "p-student", kind: "task", title: "Assignment due Friday: Accessible sign-up form", detail: "Web Development Pathway", link: "/student/assignments", createdAt: T, status: "open", source: "Learning Hub" },
  { id: "ib-31", toPersona: "p-client", kind: "review", title: "Milestone ready for your review: Working prototype", detail: "Online ordering site · Team Pixel", link: "/partner/projects", createdAt: Y, status: "open", source: "Future Builders" },
  { id: "ib-32", toPersona: "p-host", kind: "review", title: "New candidate shared with you", detail: "Junior front-end intern · consented portfolio", link: "/partner/candidates", createdAt: Y, status: "open", source: "Future Builders" },
);

export const notifications: Notification[] = [
  { id: "nt-1", toRole: "su_pm", text: "Stonebridge pupil attendance is down 18 pts over 6 weeks", link: "/school-upskilling/schools/sch-08", at: "2026-11-16T18:00:00", read: false, tone: "warning" },
  { id: "nt-2", toRole: "curriculum", text: "Tarek Daher approved Entrepreneurship Pathway v1.0", link: "/curriculum/cur-ent", at: "2026-11-10T12:00:00", read: false, tone: "success" },
  { id: "nt-3", toRole: "exec", text: "Monthly indicators refreshed for November", link: "/results/indicators", at: "2026-11-16T07:00:00", read: false, tone: "info" },
  { id: "nt-4", toRole: "fb_po", text: "Absence streak detected for a student", link: "/future-builders/attendance", at: "2026-11-13T18:00:00", read: false, tone: "warning" },
  { id: "nt-5", toRole: "fundraising", text: "Obligation due in 13 days: Atlas quarterly update", link: "/fundraising/obligations", at: "2026-11-17T07:00:00", read: false, tone: "warning" },
  { id: "nt-6", toPersona: "p-student", text: "Your Responsive landing page was graded: 88/100", link: "/student/assignments", at: "2026-11-08T12:00:00", read: false, tone: "success" },
  { id: "nt-7", toPersona: "p-tf", text: "New resource: Using rubrics with pupils", link: "/tf/training", at: "2026-11-15T12:00:00", read: true, tone: "info" },
  { id: "nt-8", toRole: "su_trainer", text: "Mid-training checkpoint is live: 14 TFs assigned", link: "/assessments/tracker", at: "2026-11-17T08:30:00", read: false, tone: "info" },
];
