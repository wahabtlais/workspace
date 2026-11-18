import {
  BookOpen, Briefcase, CalendarDays, ClipboardCheck, GraduationCap, HandCoins,
  Home, Inbox, Smartphone, Landmark, Library, Rocket, School, Settings, ShieldAlert, Sparkles, Target, Send, type LucideIcon,
} from "lucide-react";
import type { Area } from "./access";

export interface NavChild { label: string; path: string }
export interface NavItem { label: string; path: string; icon: LucideIcon; area: Area; children?: NavChild[]; badge?: "inbox" }
export interface NavGroup { label: string; items: NavItem[] }

const c = (label: string, path: string): NavChild => ({ label, path });

export const STAFF_NAV: NavGroup[] = [
  {
    label: "My Work",
    items: [
      { label: "Home", path: "/", icon: Home, area: "home" },
      { label: "Inbox", path: "/inbox", icon: Inbox, area: "inbox", badge: "inbox" },
      { label: "AI Workspace", path: "/ai", icon: Sparkles, area: "ask", children: [c("Workspace", "/ai"), c("Discover", "/ai/discover"), c("AI & your data", "/ai/trust")] },
      { label: "My calendar", path: "/calendar", icon: CalendarDays, area: "calendar" },
      { label: "My requests", path: "/requests", icon: Send, area: "requests" },
      { label: "Field mode (mobile)", path: "/field", icon: Smartphone, area: "field" },
          ],
  },
  {
    label: "Programs",
    items: [
      { label: "School Upskilling", path: "/school-upskilling", icon: School, area: "su", children: [
        c("Overview", "/school-upskilling"), c("Schools", "/school-upskilling/schools"), c("Classes & rosters", "/school-upskilling/classes"),
        c("Teaching Fellows", "/school-upskilling/teaching-fellows"), c("Trainers", "/school-upskilling/trainers"),
        c("Training & TF attendance", "/school-upskilling/training"), c("Visits & observations", "/school-upskilling/visits"),
        c("Follow-ups & coaching", "/school-upskilling/follow-ups"), c("Field activities", "/school-upskilling/field-activities"),
        c("Team & assignments", "/school-upskilling/team"), c("Reports", "/school-upskilling/reports"),
      ] },
      { label: "Future Builders", path: "/future-builders", icon: Rocket, area: "fb", children: [
        c("Overview", "/future-builders"), c("Admissions", "/future-builders/admissions"), c("Cohorts & sessions", "/future-builders/cohorts"),
        c("Students", "/future-builders/students"), c("Attendance", "/future-builders/attendance"), c("Pathways & competencies", "/future-builders/pathways"),
        c("Projects", "/future-builders/projects"), c("Clients", "/future-builders/clients"), c("Portfolios", "/future-builders/portfolios"),
        c("Career readiness", "/future-builders/career"), c("Mentorship", "/future-builders/mentorship"), c("Internships", "/future-builders/internships"),
        c("Graduation & alumni", "/future-builders/graduation"), c("Reports", "/future-builders/reports"),
      ] },
    ],
  },
  {
    label: "Learning",
    items: [
      { label: "Curriculum", path: "/curriculum", icon: BookOpen, area: "curriculum", children: [
        c("Overview", "/curriculum"), c("Frameworks", "/curriculum/frameworks"), c("Curricula & builder", "/curriculum/curricula"),
        c("Lessons", "/curriculum/lesson-plans"), c("Assessments & rubrics", "/curriculum/assessments"), c("Resources", "/curriculum/resources"),
        c("Reviews", "/curriculum/reviews"), c("Publishing", "/curriculum/publishing"), c("Trainer feedback", "/curriculum/feedback"),
        c("Outcomes", "/curriculum/outcomes"), c("Improvement backlog", "/curriculum/backlog"),
      ] },
      { label: "Learning Hub", path: "/learning", icon: GraduationCap, area: "learning", children: [
        c("Courses", "/learning"), c("Cohort progress", "/learning/progress"), c("Grading queue", "/learning/grading"),
        c("Certificates", "/learning/certificates"), c("Announcements", "/learning/announcements"),
      ] },
      { label: "Assessments", path: "/assessments", icon: ClipboardCheck, area: "assessments", children: [
        c("Forms library", "/assessments"), c("Form builder", "/assessments/builder"), c("Assignments", "/assessments/assignments"),
        c("Live tracker", "/assessments/tracker"), c("Responses", "/assessments/responses"), c("Analytics", "/assessments/analytics"),
        c("Sync monitor", "/assessments/sync"),
      ] },
    ],
  },
  {
    label: "Organization",
    items: [
      { label: "Executive", path: "/executive", icon: Landmark, area: "executive", children: [
        c("Overview", "/executive"), c("Programs & impact", "/executive/programs"), c("Strategic priorities", "/executive/priorities"),
        c("Teams & workload", "/executive/teams"), c("Projects & milestones", "/executive/projects"), c("Risks & issues", "/executive/risks"),
        c("Decisions", "/executive/decisions"), c("Meetings", "/executive/meetings"), c("Reports", "/executive/reports"),
      ] },
      { label: "Results & Indicators", path: "/results", icon: Target, area: "results", children: [
        c("Dashboard", "/results"), c("Indicator library", "/results/library"), c("Targets", "/results/targets"), c("Annual results", "/results/annual"), c("Evidence library", "/results/evidence"),
      ] },
      { label: "Fundraising & Partnerships", path: "/fundraising", icon: HandCoins, area: "fundraising", children: [
        c("Overview", "/fundraising"), c("Donors & partners", "/fundraising/donors"), c("Opportunities", "/fundraising/opportunities"),
        c("Proposals", "/fundraising/proposals"), c("Grants", "/fundraising/grants"), c("Obligations calendar", "/fundraising/obligations"),
        c("Reports", "/fundraising/reports"), c("Evidence & stories", "/fundraising/evidence"),
      ] },
      { label: "Operations & HR", path: "/operations", icon: Briefcase, area: "operations", children: [
        c("People directory", "/operations"), c("Org chart", "/operations/org-chart"), c("Recruitment", "/operations/recruitment"),
        c("Onboarding", "/operations/onboarding"), c("Leave & attendance", "/operations/leave"), c("Requests", "/operations/requests"),
        c("Assets", "/operations/assets"), c("Projects & tasks", "/operations/projects"), c("Workload", "/operations/workload"),
        c("Policies", "/operations/policies"),
      ] },
      { label: "Knowledge", path: "/knowledge", icon: Library, area: "knowledge", children: [
        c("Knowledge base", "/knowledge"), c("Templates", "/knowledge/templates"), c("Documents", "/knowledge/documents"),
      ] },
      { label: "Safeguarding", path: "/safeguarding", icon: ShieldAlert, area: "safeguarding", children: [
        c("Report a concern", "/safeguarding"), c("Cases (restricted)", "/safeguarding/cases"),
      ] },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Admin", path: "/admin", icon: Settings, area: "admin", children: [
        c("Users & roles", "/admin"), c("Programs & cohorts", "/admin/programs"), c("Attendance policies", "/admin/attendance-policies"),
        c("Request types & approvals", "/admin/request-types"), c("Integrations", "/admin/integrations"), c("Agent Hub", "/admin/agents"),
        c("Audit log", "/admin/audit"), c("Data protection", "/admin/data-protection"),
      ] },
    ],
  },
];

export const ALL_STAFF_ITEMS = STAFF_NAV.flatMap((g) => g.items);

/** Finds the nav item (and sub-page) for a staff path using longest-prefix match. */
export function findNav(pathname: string): { item: NavItem; child?: NavChild } | undefined {
  let best: { item: NavItem; child?: NavChild } | undefined;
  let bestLen = -1;
  for (const item of ALL_STAFF_ITEMS) {
    const candidates: { path: string; child?: NavChild }[] = [{ path: item.path }, ...(item.children ?? []).map((ch) => ({ path: ch.path, child: ch }))];
    for (const cand of candidates) {
      const match = cand.path === "/" ? pathname === "/" : pathname === cand.path || pathname.startsWith(cand.path + "/");
      if (match && cand.path.length > bestLen) {
        best = { item, child: cand.child };
        bestLen = cand.path.length;
      }
    }
  }
  return best;
}

/* ---------------- Portal navigation ---------------- */

export interface PortalNavItem { label: string; labelAr?: string; path: string; icon: string }

export const STUDENT_NAV: PortalNavItem[] = [
  { label: "Home", path: "/student", icon: "home" },
  { label: "My learning", path: "/student/learning", icon: "book" },
  { label: "Assignments", path: "/student/assignments", icon: "clipboard" },
  { label: "Team project", path: "/student/team", icon: "users" },
  { label: "Portfolio", path: "/student/portfolio", icon: "briefcase" },
  { label: "Career & internships", path: "/student/career", icon: "rocket" },
  { label: "Announcements", path: "/student/announcements", icon: "megaphone" },
  { label: "Learning Assistant", path: "/student/assistant", icon: "sparkles" },
  { label: "Profile & privacy", path: "/student/privacy", icon: "shield" },
];

export const TF_NAV: PortalNavItem[] = [
  { label: "Home", labelAr: "الرئيسية", path: "/tf", icon: "home" },
  { label: "My training", labelAr: "تدريبي", path: "/tf/training", icon: "book" },
  { label: "Training attendance", labelAr: "حضور التدريب", path: "/tf/attendance", icon: "calendar" },
  { label: "Assessments", labelAr: "التقييمات", path: "/tf/assessments", icon: "clipboard" },
  { label: "Certificate", labelAr: "الشهادة", path: "/tf/certificate", icon: "award" },
  { label: "My deployment", labelAr: "مكان التعيين", path: "/tf/deployment", icon: "school" },
  { label: "My classes", labelAr: "صفوفي", path: "/tf/classes", icon: "users" },
  { label: "Observations & coaching", labelAr: "الملاحظات والتوجيه", path: "/tf/coaching", icon: "eye" },
  { label: "Resources", labelAr: "الموارد", path: "/tf/resources", icon: "library" },
];

export const TEACHER_NAV: PortalNavItem[] = [
  { label: "Today", labelAr: "اليوم", path: "/teacher", icon: "home" },
  { label: "My classes", labelAr: "صفوفي", path: "/teacher/classes", icon: "users" },
  { label: "Assessments", labelAr: "التقييمات", path: "/teacher/assessments", icon: "clipboard" },
  { label: "Help", labelAr: "مساعدة", path: "/teacher/help", icon: "help" },
];

export const PARTNER_NAV: Record<"client" | "host" | "donor", PortalNavItem[]> = {
  client: [
    { label: "My project", path: "/partner", icon: "home" },
    { label: "Milestones", path: "/partner/projects", icon: "flag" },
    { label: "Feedback", path: "/partner/feedback", icon: "message" },
  ],
  host: [
    { label: "Overview", path: "/partner", icon: "home" },
    { label: "Openings", path: "/partner/openings", icon: "briefcase" },
    { label: "Candidates", path: "/partner/candidates", icon: "users" },
    { label: "Interns & check-ins", path: "/partner/interns", icon: "clipboard" },
  ],
  donor: [
    { label: "Overview", path: "/partner", icon: "home" },
    { label: "Reports", path: "/partner/reports", icon: "file" },
    { label: "Indicators", path: "/partner/indicators", icon: "chart" },
    { label: "Milestones", path: "/partner/milestones", icon: "flag" },
  ],
};
