import type { Attachment } from "./types";

/**
 * Fictional sample files the simulated assistant can "read". In the prototype, files uploaded from the
 * device are not parsed: only their name and type are used, and the answer says so.
 */
export const SAMPLE_FILES: (Attachment & { description: string })[] = [
  { id: "sf-expenses", sampleId: "expenses", name: "Operations-expenses-Jul-Oct-2026.xlsx", kind: "xlsx", size: "48 KB", description: "Monthly operating expenses by category" },
  { id: "sf-survey", sampleId: "survey", name: "Teacher-feedback-survey-Term-1.csv", kind: "csv", size: "22 KB", description: "62 teacher responses, 1–5 ratings and comments" },
  { id: "sf-notes", sampleId: "notes", name: "Partner-meeting-notes-12-Nov.docx", kind: "docx", size: "31 KB", description: "Notes from the Ministry liaison meeting" },
  { id: "sf-call", sampleId: "call", name: "Northbridge-call-for-proposals-2027.pdf", kind: "pdf", size: "1.2 MB", description: "Funding call text, criteria and deadlines" },
  { id: "sf-parents", sampleId: "parents", name: "Parent-letter-digital-skills.docx", kind: "docx", size: "18 KB", description: "Letter to parents about the program (English)" },
  { id: "sf-deck", sampleId: "deck", name: "Board-update-Q3-2026.pptx", kind: "pptx", size: "3.4 MB", description: "Last quarter's board deck" },
];

export const EXPENSES = {
  months: ["Jul", "Aug", "Sep", "Oct"],
  rows: [
    { category: "Staff transport", values: [1840, 1910, 2050, 3460] },
    { category: "Training venue & catering", values: [2200, 900, 2650, 2480] },
    { category: "Devices & repairs", values: [1350, 1420, 1600, 1580] },
    { category: "Internet & phones", values: [610, 615, 640, 1240] },
    { category: "Printing & materials", values: [480, 350, 920, 640] },
    { category: "Office & utilities", values: [1150, 1180, 1160, 1190] },
  ],
};

export const SURVEY_THEMES = [
  { theme: "Not enough time for hands-on practice", count: 21, rating: 2.6 },
  { theme: "Tablets not charged at lesson start", count: 14, rating: 2.4 },
  { theme: "Lesson materials clear and useful", count: 27, rating: 4.4 },
  { theme: "Want Arabic versions of worksheets", count: 11, rating: 3.1 },
  { theme: "Coaching visits helpful", count: 19, rating: 4.2 },
];

export const PARENT_LETTER_EN =
  "Dear parents and guardians,\n\nThis term, your child's class is taking part in a digital skills program run with CodeBrave. Pupils will learn to solve problems step by step, create simple programs and use technology safely.\n\nPupils do not need an account or a device at home. If you have any questions, please contact the school office.\n\nWith thanks,\nThe school administration";

export const PARENT_LETTER_AR =
  "حضرات الأهل وأولياء الأمور الكرام،\n\nيشارك صف ولدكم هذا الفصل في برنامج للمهارات الرقمية بالتعاون مع CodeBrave. سيتعلّم التلاميذ حلّ المشكلات خطوة بخطوة، وإنشاء برامج بسيطة، واستخدام التكنولوجيا بأمان.\n\nلا يحتاج التلاميذ إلى حساب أو جهاز في المنزل. لأي استفسار، يُرجى التواصل مع إدارة المدرسة.\n\nمع الشكر،\nإدارة المدرسة";
