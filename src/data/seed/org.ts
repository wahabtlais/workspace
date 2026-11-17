import type { Decision, FundOpportunity, Grant, Indicator, KBArticle, Obligation, Priority, Risk } from "../types";

const P = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
const s = (vals: number[]) => vals.map((value, i) => ({ period: `${P[i]} 2026`, value }));

export const indicators: Indicator[] = [
  { id: "ind-su-reach", code: "SU-01", name: "Pupils reached in partner schools", program: "SU", unit: "#", target: 900, baseline: 610, series: s([640, 640, 640, 702, 778, 790]), source: "Class rosters (School Upskilling)", ownerId: "s-mira", grantIds: ["gr-1", "gr-2"] },
  { id: "ind-su-gain", code: "SU-02", name: "Average pupil learning gain (pre → post, points)", program: "SU", unit: "score", target: 20, baseline: 14, series: s([22.4, 22.4, 22.4, 22.4, 22.4, 22.4]), source: "Assessment Hub: pupil pre/post 2025–26", ownerId: "s-mira", grantIds: ["gr-1"] },
  { id: "ind-su-att", code: "SU-03", name: "Pupil classroom attendance rate", program: "SU", unit: "%", target: 85, baseline: 80, series: s([0, 0, 0, 0, 88, 86]), source: "Attendance service: pupil registers (aggregated)", ownerId: "s-mira", grantIds: ["gr-1"] },
  { id: "ind-su-reg", code: "SU-04", name: "Class register completion rate", program: "SU", unit: "%", target: 95, baseline: 90, series: s([0, 0, 0, 0, 96, 93]), source: "Attendance service: scheduled vs submitted registers", ownerId: "s-mira", grantIds: [] },
  { id: "ind-su-cert", code: "SU-05", name: "Teaching Fellows certified (cumulative)", program: "SU", unit: "#", target: 26, baseline: 0, series: s([12, 12, 12, 12, 12, 12]), source: "SU certification decisions", ownerId: "s-maya", grantIds: ["gr-1", "gr-2"] },
  { id: "ind-su-obs", code: "SU-06", name: "Average classroom observation score (1–4)", program: "SU", unit: "score", target: 3, baseline: 2.6, series: s([2.9, 2.9, 2.9, 2.8, 2.9, 2.8]), source: "Assessment Hub: observation rubric", ownerId: "s-maya", grantIds: ["gr-2"] },
  { id: "ind-su-visit", code: "SU-07", name: "Schools visited this month", program: "SU", unit: "%", target: 100, baseline: 80, series: s([90, 40, 0, 100, 100, 70]), source: "Visits & observations", ownerId: "s-maya", grantIds: [] },
  { id: "ind-fb-active", code: "FB-01", name: "Active Future Builders students", program: "FB", unit: "#", target: 30, baseline: 18, series: s([14, 14, 0, 24, 24, 24]), source: "FB enrolments", ownerId: "s-tarek", grantIds: ["gr-3"] },
  { id: "ind-fb-att", code: "FB-02", name: "FB session attendance rate", program: "FB", unit: "%", target: 85, baseline: 78, series: s([86, 0, 0, 91, 88, 84]), source: "Attendance service: FB registers", ownerId: "s-tarek", grantIds: ["gr-3"] },
  { id: "ind-fb-intern", code: "FB-03", name: "Internship placements (academic year)", program: "FB", unit: "#", target: 12, baseline: 6, series: s([6, 8, 9, 0, 0, 0]), source: "FB internships", ownerId: "s-hala", grantIds: ["gr-3", "gr-4"] },
  { id: "ind-fb-client", code: "FB-04", name: "Client projects delivered", program: "FB", unit: "#", target: 6, baseline: 3, series: s([4, 4, 4, 0, 0, 0]), source: "FB client projects", ownerId: "s-tarek", grantIds: ["gr-4"] },
  { id: "ind-fb-grad", code: "FB-05", name: "Graduates in education, training or work (6 months)", program: "FB", unit: "%", target: 80, baseline: 70, series: s([0, 0, 0, 0, 0, 79]), source: "Alumni follow-up survey", ownerId: "s-mira", grantIds: ["gr-3"] },
];

export const grants: Grant[] = [
  { id: "gr-1", donorId: "org-do-1", title: "Digital Skills in Public Schools, Phase 2", program: "SU", amount: 420000, currency: "USD", start: "2025-09-01", end: "2027-08-31", indicatorIds: ["ind-su-reach", "ind-su-gain", "ind-su-att", "ind-su-cert"], status: "Active", restrictions: "Restricted to School Upskilling delivery and TF training." },
  { id: "gr-2", donorId: "org-do-2", title: "Teacher Capacity for Digital Learning", program: "SU", amount: 260000, currency: "EUR", start: "2026-01-01", end: "2027-12-31", indicatorIds: ["ind-su-cert", "ind-su-obs", "ind-su-reach"], status: "Active", restrictions: "TF training, coaching and observation only." },
  { id: "gr-3", donorId: "org-do-3", title: "Future Builders: Youth Pathways to Work", program: "FB", amount: 180000, currency: "USD", start: "2026-03-01", end: "2027-02-28", indicatorIds: ["ind-fb-active", "ind-fb-att", "ind-fb-intern", "ind-fb-grad"], status: "Active", restrictions: "FB cohort delivery, mentorship and internships." },
  { id: "gr-4", donorId: "org-do-4", title: "Tech for Good Client Projects", program: "FB", amount: 75000, currency: "USD", start: "2025-10-01", end: "2026-12-31", indicatorIds: ["ind-fb-client", "ind-fb-intern"], status: "Closing", restrictions: "Client project delivery and student stipends." },
];

export const obligations: Obligation[] = [
  { id: "obl-1", grantId: "gr-1", title: "Semi-annual narrative & indicator report", due: "2026-12-15", status: "Drafting", ownerId: "s-joelle" },
  { id: "obl-2", grantId: "gr-4", title: "Final report & financial statement", due: "2026-12-31", status: "Upcoming", ownerId: "s-bassel" },
  { id: "obl-3", grantId: "gr-3", title: "Quarterly indicator update", due: "2026-11-30", status: "In review", ownerId: "s-bassel" },
  { id: "obl-4", grantId: "gr-2", title: "Annual learning report (pupil pre/post results)", due: "2027-01-31", status: "Upcoming", ownerId: "s-joelle" },
  { id: "obl-5", grantId: "gr-1", title: "Donor field visit (two schools)", due: "2027-02-10", status: "Upcoming", ownerId: "s-maya" },
  { id: "obl-6", grantId: "gr-3", title: "Q3 indicator update", due: "2026-08-31", status: "Submitted", ownerId: "s-bassel" },
];

export const opportunities: FundOpportunity[] = [
  { id: "opp-1", title: "Girls in Tech Futures call 2027", funder: "Meridian Tech for Good", amount: 120000, deadline: "2027-01-20", stage: "Identified", program: "FB", ownerId: "s-joelle" },
  { id: "opp-2", title: "Education Resilience Window", funder: "Horizon Education Fund", amount: 350000, deadline: "2027-02-15", stage: "Qualifying", fit: 82, program: "SU", ownerId: "s-joelle",
    eligibility: [{ item: "Registered non-profit for 3+ years", met: true }, { item: "Works in public schools", met: true }, { item: "Teacher training component", met: true }, { item: "Audited accounts for last 2 years", met: true }, { item: "Co-funding of at least 10%", met: null }] },
  { id: "opp-3", title: "Youth Employability Grants", funder: "Blue Harbor Bank Foundation", amount: 60000, deadline: "2026-12-05", stage: "Drafting", fit: 76, program: "FB", ownerId: "s-bassel" },
  { id: "opp-4", title: "Community Innovation Fund", funder: "Atlas Community Trust", amount: 40000, deadline: "2026-11-28", stage: "Drafting", fit: 68, program: "Org", ownerId: "s-bassel" },
  { id: "opp-5", title: "Digital Classrooms Challenge", funder: "Northbridge Foundation", amount: 200000, deadline: "2026-10-30", stage: "Submitted", fit: 88, program: "SU", ownerId: "s-joelle" },
  { id: "opp-6", title: "Responsible AI Education Pilot", funder: "Meridian Tech for Good", amount: 90000, deadline: "2026-09-15", stage: "Awarded", fit: 90, program: "FB", ownerId: "s-joelle" },
  { id: "opp-7", title: "Rural Connectivity Fund", funder: "Civic Futures Alliance", amount: 150000, deadline: "2026-08-01", stage: "Declined", fit: 45, program: "SU", ownerId: "s-bassel" },
  { id: "opp-8", title: "Mentorship Matters", funder: "Atlas Community Trust", amount: 35000, deadline: "2027-03-01", stage: "Identified", program: "FB", ownerId: "s-carla" },
];

export const risks: Risk[] = [
  { id: "rsk-1", title: "Declining pupil attendance at one partner school", area: "School Upskilling", likelihood: 4, impact: 3, ownerId: "s-maya", mitigation: "PO investigation, principal meeting, timetable review.", status: "Open" },
  { id: "rsk-2", title: "Two TFs below the certification attendance threshold", area: "School Upskilling", likelihood: 3, impact: 3, ownerId: "s-maya", mitigation: "Catch-up sessions; individual check-ins with trainer.", status: "Mitigating" },
  { id: "rsk-3", title: "Grant gr-4 closes Dec 31 with one client project still open", area: "Fundraising", likelihood: 3, impact: 4, ownerId: "s-joelle", mitigation: "Agree a no-cost extension or reallocate to gr-3.", status: "Open" },
  { id: "rsk-4", title: "Internship host safeguarding checks incomplete", area: "Future Builders", likelihood: 2, impact: 5, ownerId: "s-nadine", mitigation: "No placements with hosts until checks pass (enforced by platform).", status: "Mitigating" },
  { id: "rsk-5", title: "Field devices unreliable for offline data collection", area: "Operations", likelihood: 3, impact: 3, ownerId: "s-ziad", mitigation: "Device audit; replace 6 tablets; offline spike in build stage.", status: "Open" },
  { id: "rsk-6", title: "MoU renewals due at two schools", area: "School Upskilling", likelihood: 2, impact: 3, ownerId: "s-maya", mitigation: "Renewal meetings scheduled.", status: "Mitigating" },
];

export const decisions: Decision[] = [
  { id: "dec-1", obligationId: "obl-1", title: "Approve semi-annual report to Northbridge Foundation", context: "Draft prepared by Fundraising with indicator figures verified by M&E.", requestedBy: "s-joelle", due: "2026-12-10", status: "Pending", link: "/fundraising/grants/gr-1" },
  { id: "dec-2", opportunityId: "opp-2", title: "Go / no-go: Education Resilience Window (USD 350k)", context: "Eligibility 4 of 5 criteria met; co-funding to confirm.", requestedBy: "s-joelle", due: "2026-11-25", status: "Pending", link: "/fundraising/opportunities/opp-2" },
  { id: "dec-3", title: "Extend TF cohort 2026–27 training by one week", context: "Requested by SU PM to accommodate catch-up sessions.", requestedBy: "s-maya", due: "2026-11-24", status: "Pending" },
  { id: "dec-4", requestId: "REQ-0007", title: "Budget for 6 replacement field tablets", context: "Ops request REQ-0007 above the line-manager approval limit.", requestedBy: "s-ziad", due: "2026-11-20", status: "Pending", link: "/operations/requests" },
  { id: "dec-5", title: "Adopt annual pupil pre/post assessment as standard", context: "Agreed with all partner schools for 2026–27.", requestedBy: "s-maya", due: "2026-09-10", status: "Approved" },
];

export const priorities: Priority[] = [
  { id: "pri-1", objective: "Every pupil in partner schools gains measurable digital skills", ownerId: "s-karim", keyResults: [
    { text: "Average pre→post gain of 20 points", indicatorId: "ind-su-gain", progress: 100 },
    { text: "Reach 900 pupils in 2026–27", indicatorId: "ind-su-reach", progress: 88 },
    { text: "Pupil attendance at or above 85%", indicatorId: "ind-su-att", progress: 95 } ] },
  { id: "pri-2", objective: "Build a certified, well-supported Teaching Fellow corps", ownerId: "s-maya", keyResults: [
    { text: "Certify 26 TFs cumulatively", indicatorId: "ind-su-cert", progress: 46 },
    { text: "Average observation score ≥ 3.0", indicatorId: "ind-su-obs", progress: 80 } ] },
  { id: "pri-3", objective: "Future Builders graduates move into work, study or enterprise", ownerId: "s-tarek", keyResults: [
    { text: "12 internship placements", indicatorId: "ind-fb-intern", progress: 50 },
    { text: "6 client projects delivered", indicatorId: "ind-fb-client", progress: 66 },
    { text: "80% of graduates in education, training or work", indicatorId: "ind-fb-grad", progress: 98 } ] },
  { id: "pri-4", objective: "Diversify and grow funding", ownerId: "s-joelle", keyResults: [
    { text: "Two new multi-year donors", progress: 50 },
    { text: "All donor reports submitted on time", progress: 100 } ] },
];

export const kb: KBArticle[] = [
  { id: "kb-1", title: "Child Safeguarding Policy (summary)", category: "Policy", ownerId: "s-nadine", reviewDue: "2027-03-01", summary: "How to recognise and report a safeguarding concern, and who is designated to handle cases." },
  { id: "kb-2", title: "How to take a class register (teachers)", category: "Guide", ownerId: "s-maya", reviewDue: "2027-01-15", summary: "Mark every pupil, use excused categories only, and submit even when offline." },
  { id: "kb-3", title: "Running annual pupil pre/post assessments", category: "SOP", ownerId: "s-maya", reviewDue: "2027-05-01", summary: "Scheduling, live tracking, handling failed uploads and reconciling before closure." },
  { id: "kb-4", title: "Attendance corrections and approvals", category: "SOP", ownerId: "s-maya", reviewDue: "2027-01-31", summary: "Correction windows, who approves late changes, and why original marks are kept." },
  { id: "kb-5", title: "Equipment and laptop requests", category: "FAQ", ownerId: "s-ziad", reviewDue: "2027-02-01", summary: "What to request, approval limits and expected turnaround." },
  { id: "kb-6", title: "Staff Laptop Policy (summary)", category: "Policy", ownerId: "s-ziad", reviewDue: "2027-06-01", summary: "Care, security and return of CodeBrave devices." },
  { id: "kb-7", title: "Leave policy and requesting time off", category: "Policy", ownerId: "s-reem", reviewDue: "2027-01-01", summary: "Leave types, balances and the approval chain." },
  { id: "kb-8", title: "Guardian consent: what we collect and why", category: "Guide", ownerId: "s-nadine", reviewDue: "2027-04-01", summary: "Consent types for Future Builders students and how activation is gated." },
  { id: "kb-9", title: "Publishing a curriculum version", category: "SOP", ownerId: "s-yasmin", reviewDue: "2027-02-15", summary: "Review, approval and publishing to the Student or TF portal; pinned cohort versions." },
  { id: "kb-10", title: "Writing a donor report with indicator evidence", category: "Guide", ownerId: "s-joelle", reviewDue: "2027-03-15", summary: "Using the report builder, citing indicators and getting approval." },
];
