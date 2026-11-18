import type { DemoData, DocumentRec, Persona } from "@/data/types";
import { DEMO_TODAY, uid } from "@/lib/utils";
import { useDemo } from "@/store/demoStore";
import { EXPENSES, PARENT_LETTER_AR, PARENT_LETTER_EN, SURVEY_THEMES } from "./files";
import type { AIResponse, Attachment, Block } from "./types";

const has = (p: string, ...w: string[]) => w.some((x) => p.includes(x));

/** Saves a generated result into Documents (shared data) and returns the confirmation sentence. */
export function saveDoc(title: string, type: DocumentRec["type"], context: string) {
  useDemo.getState().update((d) => {
    d.documents.unshift({ id: uid("dc"), title, type, context, ownerId: currentStaffId(), updatedAt: DEMO_TODAY, access: "Only you until you share it" });
  });
  return `“${title}” saved to Documents (private to you until you share it).`;
}

function currentStaffId() {
  const id = useDemo.getState().personaId;
  const map: Record<string, string> = { "p-exec": "s-rana", "p-su-pm": "s-maya", "p-su-po": "s-omar", "p-su-trainer": "s-jad", "p-fb-pm": "s-tarek", "p-fb-po": "s-hala", "p-fb-trainer": "s-sami", "p-curriculum": "s-yasmin", "p-ops": "s-ziad", "p-fundraising": "s-joelle", "p-me": "s-mira", "p-admin": "s-elie", "p-safeguarding": "s-nadine" };
  return map[id] ?? "s-rana";
}

const usd = (n: number) => `USD ${n.toLocaleString("en-US")}`;

function expenseAnalysis(): AIResponse {
  const total = (i: number) => EXPENSES.rows.reduce((a, r) => a + r.values[i], 0);
  const rows = EXPENSES.rows.map((r) => {
    const base = (r.values[0] + r.values[1] + r.values[2]) / 3;
    const ch = Math.round(((r.values[3] - base) / base) * 100);
    return { ...r, base, ch };
  });
  const flagged = rows.filter((r) => r.ch >= 40);
  return {
    agent: "AI Workspace",
    steps: ["Reading Operations-expenses-Jul-Oct-2026.xlsx (6 categories × 4 months)", "Calculating month-on-month change", "Looking for unusual values", "Preparing a summary you can reuse"],
    blocks: [
      { kind: "text", text: `October spending was ${usd(total(3))}, ${Math.round(((total(3) - (total(0) + total(1) + total(2)) / 3) / ((total(0) + total(1) + total(2)) / 3)) * 100)}% above the July–September average. Two categories explain most of the increase.` },
      { kind: "chart", title: "October compared with the Jul–Sep average (% change)", unit: "%", data: rows.map((r) => ({ label: r.category, value: r.ch, flag: r.ch >= 40 })), note: "Highlighted bars are more than 40% above the average." },
      { kind: "table", title: "Expenses by month (USD)", head: ["Category", ...EXPENSES.months, "Oct vs avg"], rows: rows.map((r) => [r.category, ...r.values.map((v) => v.toLocaleString("en-US")), `${r.ch > 0 ? "+" : ""}${r.ch}%`]) },
      { kind: "bullets", title: "Possible anomalies to check", items: [
        ...flagged.map((r) => r.category === "Internet & phones" ? `Internet & phones almost doubled in October (${usd(r.values[3])}). The amount is close to two monthly bills: possibly a duplicate invoice.` : `Staff transport rose ${r.ch}% in October. This matches the new northern-region visit schedule, but fuel claims should be checked against visit records.`),
        "Training venue costs dropped in August. That is expected (no training in the summer break) and is not an anomaly.",
      ] },
      { kind: "notice", tone: "info", text: "I treated this as a working file. The figures were not sent to any external service and the original file is unchanged." },
    ],
    sources: [{ label: "Operations-expenses-Jul-Oct-2026.xlsx", why: "The file you attached" }, { label: "Visits & observations", why: "Used to explain the transport increase (visit counts by month)", link: "/school-upskilling/visits" }],
    reasoning: "I compared each category's October value with its own three-month average and flagged changes above 40%. For each flag I looked for an explanation in records you can access (for example, the visit schedule).",
    dataUsed: ["financial", "standard"],
    proposedAction: { label: "Create a management report from this", apply: () => saveDoc("Expense review Jul–Oct 2026 (AI draft)", "Google Doc", "Operations & HR · Finance") },
    followUps: ["Draft an email to Finance about the possible duplicate internet invoice", "Make a one-slide summary for the management meeting", "How could we reduce transport costs?"],
  };
}

function surveyAnalysis(): AIResponse {
  return {
    agent: "AI Workspace",
    steps: ["Reading 62 survey responses", "Grouping comments into themes", "Linking themes to ratings"],
    blocks: [
      { kind: "text", text: "Teachers rate the lesson materials highly (4.4 / 5), but two practical problems come up again and again: not enough hands-on time and tablets that are not charged at the start of lessons." },
      { kind: "chart", title: "How often each theme appears (responses)", data: SURVEY_THEMES.map((t) => ({ label: t.theme, value: t.count, flag: t.rating < 3 })), note: "Highlighted themes have an average rating below 3 / 5." },
      { kind: "table", title: "Themes", head: ["Theme", "Responses", "Average rating"], rows: SURVEY_THEMES.map((t) => [t.theme, t.count, t.rating]) },
      { kind: "bullets", title: "Suggested next steps", items: ["Add 10 minutes of guided practice to Unit 2 lessons (curriculum team)", "Share a 'charge the night before' routine with schools (Project Officers)", "Translate the three most-used worksheets into Arabic"] },
    ],
    sources: [{ label: "Teacher-feedback-survey-Term-1.csv", why: "The file you attached" }, { label: "Curriculum: trainer feedback", why: "To check whether trainers report the same themes", link: "/curriculum/feedback" }],
    reasoning: "I grouped similar comments, counted how many responses mention each theme, and averaged the ratings given alongside them.",
    dataUsed: ["standard"],
    proposedAction: { label: "Save the analysis to Documents", apply: () => saveDoc("Teacher survey Term 1: themes (AI draft)", "Google Doc", "Curriculum · feedback") },
    followUps: ["Draft improvement recommendations for the curriculum team", "Write a short thank-you message to teachers"],
  };
}

function meetingSummary(): AIResponse {
  return {
    agent: "AI Workspace",
    steps: ["Reading the meeting notes", "Separating decisions from discussion", "Listing actions with owners"],
    blocks: [
      { kind: "text", text: "Ministry liaison meeting, 12 November: the Ministry supports expanding to four more schools in 2027 if Term 1 attendance and assessment completion stay above target." },
      { kind: "bullets", title: "Decisions", items: ["Share the Term 1 results summary with the Ministry by 15 December", "Pilot Arabic worksheets in two schools from January"] },
      { kind: "table", title: "Action items", head: ["Action", "Owner", "Due"], rows: [["Prepare the Term 1 results summary", "Maya Saleh", "10 Dec"], ["Shortlist four candidate schools", "Omar Haddad", "5 Dec"], ["Translate three worksheets", "Yasmin Awad", "20 Dec"]] },
    ],
    sources: [{ label: "Partner-meeting-notes-12-Nov.docx", why: "The file you attached" }],
    reasoning: "Sentences with an agreed outcome became decisions; sentences with a person and a verb became action items.",
    dataUsed: ["standard"],
    proposedAction: { label: "Add these actions to the calendar and Inbox", apply: () => { useDemo.getState().addInbox({ toPersona: useDemo.getState().personaId, kind: "task", title: "3 actions from the Ministry liaison meeting", detail: "Created by AI Workspace from meeting notes · review owners and dates", link: "/calendar", source: "AI Workspace" }); return "Three actions added to your Inbox for review."; } },
    followUps: ["Draft a follow-up email to the Ministry liaison", "Translate the summary into Arabic"],
  };
}

function callExtract(): AIResponse {
  return {
    agent: "AI Workspace",
    steps: ["Reading the call for proposals (14 pages)", "Extracting criteria, dates and amounts"],
    blocks: [
      { kind: "table", title: "Key information", head: ["Item", "Detail", "Page"], rows: [["Funder", "Northbridge Foundation", "1"], ["Maximum grant", "USD 120,000 over 2 years", "3"], ["Deadline", "15 January 2027, 17:00", "2"], ["Eligible applicants", "Registered non-profits, 3+ years", "4"], ["Focus", "Digital skills for young people aged 12–18", "4"], ["Co-funding", "At least 15%", "6"], ["Required evidence", "Two years of outcome data", "7"]] },
      { kind: "notice", tone: "info", text: "CodeBrave already has two years of pre/post learning-gain data in Results & Indicators, which meets the evidence requirement." },
    ],
    sources: [{ label: "Northbridge-call-for-proposals-2027.pdf", why: "The file you attached" }, { label: "Results & Indicators", why: "To check the evidence requirement", link: "/results" }],
    reasoning: "I looked for dates, amounts and eligibility statements and kept the page number of each so you can verify them.",
    dataUsed: ["standard"],
    followUps: ["Check our eligibility for this call", "Draft a proposal outline for this call"],
  };
}

function translate(p: string, files: Attachment[]): AIResponse {
  const toEn = has(p, "to english", "into english");
  return {
    agent: "AI Workspace",
    steps: [files.length ? `Reading ${files[0].name}` : "Reading your text", toEn ? "Translating into English" : "Translating into Arabic (Modern Standard)", "Keeping names, dates and tone"],
    blocks: [
      { kind: "doc", title: toEn ? "Translation (English)" : "Translation (Arabic)", body: toEn ? PARENT_LETTER_EN : PARENT_LETTER_AR, docType: "Google Doc" },
      { kind: "notice", tone: "info", text: "Please have a fluent colleague check translations before sending them to families." },
    ],
    sources: files.length ? [{ label: files[0].name, why: "The file you attached" }] : [],
    reasoning: "I translated sentence by sentence and kept the formal register used in school letters.",
    dataUsed: ["standard"],
    proposedAction: { label: "Save the translation to Documents", apply: () => saveDoc("Parent letter (Arabic) (AI draft)", "Google Doc", "School Upskilling · communications") },
    followUps: ["Make the letter shorter and simpler", "Draft an SMS version for parents"],
  };
}

function email(p: string, persona: Persona): AIResponse {
  const first = persona.name.split(" ")[0];
  let to = "the recipient", subject = "Follow-up", body = "";
  if (has(p, "invoice", "finance")) { to = "Ghassan Tamer (Finance)"; subject = "Possible duplicate internet invoice, October"; body = `Hi Ghassan,\n\nWhile reviewing October expenses I noticed that Internet & phones came to USD 1,240, almost double the usual USD 610–640. It looks like we may have paid the provider's invoice twice.\n\nCould you check the October payments and let me know? If it is a duplicate, we can ask for a credit on the November bill.\n\nThanks,\n${first}`; }
  else if (has(p, "principal", "school")) { to = "School principal"; subject = "Request to meet about Term 1 progress"; body = `Dear Principal,\n\nThank you for your continued partnership. I would like to arrange a short meeting to review Term 1 progress, including attendance, the pre-assessment results and plans for Term 2.\n\nWould Tuesday or Wednesday next week suit you? I can come to the school or we can meet online.\n\nKind regards,\n${persona.name}\n${persona.title}`; }
  else if (has(p, "donor", "thank")) { to = "Helen Moore, Northbridge Foundation"; subject = "Thank you, and an update from CodeBrave"; body = `Dear Helen,\n\nThank you for Northbridge's continued support. I'm pleased to share that pupils in our partner schools improved by more than 20 points between the pre- and post-assessments last year.\n\nOur semi-annual report will follow shortly. Please let me know if you would like to visit a school this term.\n\nWarm regards,\n${persona.name}`; }
  else if (has(p, "parent", "guardian")) { to = "Parents and guardians"; subject = "Update on the digital skills program"; body = PARENT_LETTER_EN; }
  else { const topic = p.replace(/.*(about|regarding|on)\s+/, "").replace(/[?.]$/, ""); subject = topic ? topic.charAt(0).toUpperCase() + topic.slice(1) : "Follow-up"; body = `Hello,\n\nI'm writing about ${topic || "the matter we discussed"}. I'd like to share a short update and agree next steps.\n\n• What has happened so far\n• What we need from you\n• Proposed next step and date\n\nPlease let me know if this works for you.\n\nBest regards,\n${persona.name}`; }
  return {
    agent: "AI Workspace",
    steps: ["Understanding who the email is for", "Choosing a professional tone", "Drafting"],
    blocks: [{ kind: "text", text: `Here is a draft to ${to}. Edit anything before you copy or send it.` }, { kind: "doc", title: `Subject: ${subject}`, body, docType: "Email" }],
    sources: [],
    reasoning: "I used a short, polite structure: context, the specific ask, and a clear next step.",
    dataUsed: ["standard"],
    followUps: ["Make it more formal", "Make it shorter", "Translate it into Arabic"],
  };
}

function presentation(p: string, d: DemoData): AIResponse {
  const board = has(p, "board", "co-founder", "management");
  const rows: (string | number)[][] = board
    ? [[1, "Where we are", "Two programs, 12 partner schools, 3 FB cohorts"], [2, "Learning results", "Pre/post gain, attendance, assessment completion"], [3, "Teaching Fellows", "Certification pipeline and deployment"], [4, "Future Builders", "Projects, internships and placements"], [5, "Risks & decisions", "Top risks and decisions needed"], [6, "Next quarter", "Priorities and asks"]]
    : [[1, "Title & purpose", "What this presentation is for"], [2, "Context", "The situation in two or three facts"], [3, "What we found", "Key evidence, one chart"], [4, "Options", "Two or three options with trade-offs"], [5, "Recommendation", "The option we suggest and why"], [6, "Next steps", "Owners and dates"]];
  return {
    agent: "AI Workspace",
    steps: ["Choosing a structure for the audience", board ? "Pulling live figures for each slide" : "Outlining the story", "Writing speaker notes"],
    blocks: [
      { kind: "table", title: "Slide outline", head: ["#", "Slide", "Content"], rows },
      { kind: "doc", title: "Speaker notes (slide 2)", body: board ? `We work with ${d.schools.filter((s) => s.status === "Active").length} active partner schools. Last year pupils improved by more than 20 points on average between the pre- and post-assessments. The full figures and sources are in Results & Indicators.` : "Start with the one fact that matters most to this audience, then explain why it matters now.", docType: "Slides" },
    ],
    sources: board ? [{ label: "Results & Indicators (live)", why: "Figures for slides 2–4", link: "/results" }, { label: "Executive: risks & decisions", link: "/executive/risks" }] : [],
    reasoning: "Six slides is the usual length for a 15-minute update. Each slide has one message.",
    dataUsed: ["standard"],
    proposedAction: { label: "Create the slides in Google Slides (simulated)", apply: () => saveDoc(board ? "Board update, December 2026 (AI draft)" : "Presentation outline (AI draft)", "Google Doc", "Slides") },
    followUps: ["Add a chart of learning gains by school", "Shorten to three slides"],
  };
}

function plan(persona: Persona): AIResponse {
  return {
    agent: "AI Workspace",
    steps: ["Reading your Inbox and calendar", "Estimating effort", "Ordering by deadline and importance"],
    blocks: [
      { kind: "table", title: "Suggested plan for the rest of the week", head: ["Day", "Focus", "Why"], rows: [["Today", "Clear approvals waiting on you", "Others are blocked until you decide"], ["Wednesday", "Prepare for upcoming meetings", "Agendas are already in your calendar"], ["Thursday", "Deep work on your main deliverable", "No meetings scheduled in the morning"], ["Friday", "Follow-ups and next week's plan", "Close open loops before the weekend"]] },
      { kind: "notice", tone: "info", text: `This plan uses only your own Inbox and calendar, ${persona.name.split(" ")[0]}. Nothing has been moved; you decide what to schedule.` },
    ],
    sources: [{ label: "Your Inbox", link: "/inbox" }, { label: "Your calendar", link: "/calendar" }],
    reasoning: "Items that block other people come first, then items with the nearest deadline.",
    dataUsed: ["standard"],
    followUps: ["Block focus time on Thursday morning", "Which of my tasks could AI do for me?"],
  };
}

function repetitive(persona: Persona): AIResponse {
  const ideas: Record<string, string[][]> = {
    ops_hr: [["Monthly expense summary", "Upload the expense sheet each month; AI flags anomalies and drafts the management note", "~3 hours/month"], ["Leave balance replies", "AI answers 'how many days do I have left?' from the leave records", "~2 hours/month"], ["Onboarding checklists", "AI creates the checklist and reminders when a new hire is added", "~1 hour/hire"]],
    su_po: [["Visit reports", "AI drafts the report from your observation scores and notes", "~30 min/visit"], ["Monthly school summaries", "AI writes one paragraph per school from visits and attendance", "~2 hours/month"]],
    curriculum: [["Feedback digests", "AI groups new trainer and teacher feedback by lesson every Friday", "~2 hours/week"], ["Arabic worksheet drafts", "AI translates worksheets for a reviewer to check", "~1 hour/worksheet"]],
    fundraising: [["Donor report first drafts", "AI fills the template from live indicators and consented stories", "~1 day/report"], ["Call screening", "AI checks each new call against our eligibility profile", "~1 hour/call"]],
    exec: [["Weekly briefing", "AI summarises what changed, what's off track and what needs a decision", "~2 hours/week"], ["Meeting preparation", "AI builds the agenda from pending decisions and risks", "~1 hour/meeting"]],
  };
  const list = ideas[persona.role] ?? [["Meeting notes to actions", "Paste or attach notes; AI lists decisions and actions with owners", "~20 min/meeting"], ["Email drafts", "Describe what you need in a sentence; AI drafts a professional email", "~10 min/email"], ["Weekly plan", "AI orders your tasks by deadline and impact", "~30 min/week"]];
  return {
    agent: "AI Workspace",
    steps: ["Looking at the kind of work your role does", "Finding tasks that repeat", "Estimating time saved"],
    blocks: [{ kind: "table", title: "Repetitive work AI could take on", head: ["Task", "How it would work", "Time saved"], rows: list }, { kind: "notice", tone: "governance", text: "Anything that changes a record (for example, sending a report or updating a register) would still wait for your confirmation." }],
    sources: [{ label: "AI Discovery", why: "More ideas based on your current work", link: "/ai/discover" }],
    reasoning: "I looked for tasks your role does often that follow the same pattern each time.",
    dataUsed: ["standard"],
    followUps: ["Show me what AI found in my current work", "Set this up as a weekly routine"],
  };
}

function brainstorm(p: string): AIResponse {
  const topic = p.replace(/.*(ideas for|ideas about|brainstorm|research)\s*/, "").replace(/[?.]$/, "") || "this topic";
  return {
    agent: "AI Workspace",
    steps: ["Exploring the topic", "Grouping ideas", "Checking which ones fit CodeBrave's programs"],
    blocks: [
      { kind: "bullets", title: `Ideas: ${topic}`, items: ["Start small: a two-school pilot with a clear success measure", "Involve pupils or students as co-designers to raise engagement", "Partner with a local organization that already has the audience", "Use existing CodeBrave data to show impact from day one", "Make it easy to repeat: a one-page guide and template"] },
      { kind: "notice", tone: "info", text: "These ideas come from general knowledge, not from CodeBrave records. Check facts before using them externally." },
    ],
    sources: [],
    reasoning: "General brainstorming, grouped from quick wins to bigger bets.",
    followUps: ["Turn the best idea into a one-page proposal", "What are the risks of each idea?"],
  };
}

function rewrite(): AIResponse {
  return {
    agent: "AI Workspace",
    steps: ["Reading your text", "Simplifying sentences", "Keeping the meaning"],
    blocks: [{ kind: "doc", title: "Rewritten version", body: "This term, your child's class is learning digital skills with CodeBrave. Pupils will solve problems step by step, make simple programs and learn to use technology safely. No account or home device is needed. Questions? Contact the school office.", docType: "Google Doc" }],
    sources: [],
    reasoning: "Shorter sentences, everyday words, and the most important information first.",
    followUps: ["Make it more formal", "Translate it into Arabic"],
  };
}

/** General-purpose professional work. Returns null when the prompt is about CodeBrave records instead. */
export function generalResponse(p: string, persona: Persona, d: DemoData, files: Attachment[]): AIResponse | null {
  const sample = (id: string) => files.some((f) => f.sampleId === id);
  if (sample("expenses") && !has(p, "email")) return expenseAnalysis();
  if (sample("survey")) return surveyAnalysis();
  if (sample("notes") && !has(p, "email", "translate")) return meetingSummary();
  if (sample("call") && !has(p, "eligib", "proposal")) return callExtract();
  if (has(p, "translate")) return translate(p, files);
  if (has(p, "email", "letter to", "write to", "reply to")) return email(p, persona);
  if (has(p, "presentation", "slides", "deck", "slide")) return presentation(p, d);
  if (has(p, "rewrite", "simplify", "shorter", "more formal", "proofread")) return rewrite();
  if (has(p, "plan my", "my week", "organize", "organise", "prioriti", "to-do", "todo")) return plan(persona);
  if (has(p, "repetitive", "automate", "save time", "could ai do", "ai do for me", "improve my work")) return repetitive(persona);
  if (has(p, "brainstorm", "ideas for", "ideas about", "research ")) return brainstorm(p);
  if (has(p, "summar") && files.some((f) => ["docx", "pdf", "txt"].includes(f.kind))) return meetingSummary();
  if (files.length && files.every((f) => !f.sampleId)) return uploadedFile(files);
  return null;
}

function uploadedFile(files: Attachment[]): AIResponse {
  const f = files[0];
  const blocks: Block[] = [
    { kind: "notice", tone: "warning", text: `Simulated: the prototype does not read the contents of files you upload. “${f.name}” was recognised as a ${f.kind.toUpperCase()} file only.` },
    { kind: "bullets", title: "In production, for this kind of file I would:", items: f.kind === "xlsx" || f.kind === "csv" ? ["Describe the columns and data quality", "Show trends and unusual values with charts", "Offer a short report or a cleaned-up sheet"] : f.kind === "pptx" ? ["Summarise each slide", "Suggest a clearer storyline", "Draft speaker notes"] : f.kind === "image" ? ["Describe what the image shows", "Extract any text in it"] : ["Summarise the document", "Extract dates, names and amounts", "Translate or rewrite sections"] },
    { kind: "text", text: "To see a full example, attach one of the sample files instead." },
  ];
  return { agent: "AI Workspace", steps: [`Checking ${f.name}`], blocks, sources: [], reasoning: "The prototype has no file-processing service.", followUps: ["Analyze the sample expense spreadsheet"] };
}
