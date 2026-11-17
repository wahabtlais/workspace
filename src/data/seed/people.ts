import type { Staff } from "../types";

/** Fictional CodeBrave staff. Names and roles are illustrative only. */
export const staff: Staff[] = [
  { id: "s-rana", name: "Rana Khoury", title: "Co-founder & Executive Director", department: "Executive", role: "exec", email: "rana.k@codebrave.example", location: "Head office", startDate: "2019-03-01" },
  { id: "s-karim", name: "Karim Nassar", title: "Co-founder & Programs Director", department: "Executive", role: "exec", email: "karim.n@codebrave.example", location: "Head office", startDate: "2019-03-01" },
  { id: "s-maya", name: "Maya Saleh", title: "Project Manager, School Upskilling", department: "School Upskilling", role: "su_pm", email: "maya.s@codebrave.example", managerId: "s-karim", location: "Head office", startDate: "2021-09-01" },
  { id: "s-omar", name: "Omar Haddad", title: "Project Officer, School Upskilling", department: "School Upskilling", role: "su_po", email: "omar.h@codebrave.example", managerId: "s-maya", location: "Northern Region", startDate: "2022-10-15" },
  { id: "s-lina", name: "Lina Farah", title: "Project Officer, School Upskilling", department: "School Upskilling", role: "su_po", email: "lina.f@codebrave.example", managerId: "s-maya", location: "Coastal Region", startDate: "2023-02-01" },
  { id: "s-jad", name: "Jad Mansour", title: "Trainer, School Upskilling", department: "School Upskilling", role: "su_trainer", email: "jad.m@codebrave.example", managerId: "s-maya", location: "Training centre", startDate: "2022-01-10" },
  { id: "s-nour", name: "Nour Aziz", title: "Trainer, School Upskilling", department: "School Upskilling", role: "su_trainer", email: "nour.a@codebrave.example", managerId: "s-maya", location: "Training centre", startDate: "2023-08-20" },
  { id: "s-tarek", name: "Tarek Daher", title: "Project Manager, Future Builders", department: "Future Builders", role: "fb_pm", email: "tarek.d@codebrave.example", managerId: "s-karim", location: "Innovation hub", startDate: "2021-05-01" },
  { id: "s-hala", name: "Hala Rizk", title: "Project Officer, Future Builders", department: "Future Builders", role: "fb_po", email: "hala.r@codebrave.example", managerId: "s-tarek", location: "Innovation hub", startDate: "2023-01-09" },
  { id: "s-sami", name: "Sami Khalil", title: "Trainer & Mentor, AI Pathway", department: "Future Builders", role: "fb_trainer", email: "sami.k@codebrave.example", managerId: "s-tarek", location: "Innovation hub", startDate: "2022-06-01" },
  { id: "s-dana", name: "Dana Issa", title: "Trainer, Web Development Pathway", department: "Future Builders", role: "fb_trainer", email: "dana.i@codebrave.example", managerId: "s-tarek", location: "Innovation hub", startDate: "2023-09-01" },
  { id: "s-fadi", name: "Fadi Barakat", title: "Trainer, Entrepreneurship Pathway", department: "Future Builders", role: "fb_trainer", email: "fadi.b@codebrave.example", managerId: "s-tarek", location: "Innovation hub", startDate: "2024-02-12" },
  { id: "s-yasmin", name: "Yasmin Awad", title: "Curriculum Manager", department: "Curriculum", role: "curriculum", email: "yasmin.a@codebrave.example", managerId: "s-karim", location: "Head office", startDate: "2022-03-14" },
  { id: "s-ziad", name: "Ziad Hamdan", title: "Operations & HR Lead", department: "Operations & HR", role: "ops_hr", email: "ziad.h@codebrave.example", managerId: "s-rana", location: "Head office", startDate: "2020-07-01" },
  { id: "s-reem", name: "Reem Sabbagh", title: "HR & Administration Officer", department: "Operations & HR", role: "ops_hr", email: "reem.s@codebrave.example", managerId: "s-ziad", location: "Head office", startDate: "2024-01-15" },
  { id: "s-ghassan", name: "Ghassan Tamer", title: "Finance Officer", department: "Operations & HR", role: "ops_hr", email: "ghassan.t@codebrave.example", managerId: "s-ziad", location: "Head office", startDate: "2021-11-01" },
  { id: "s-joelle", name: "Joelle Matar", title: "Fundraising & Partnerships Lead", department: "Fundraising", role: "fundraising", email: "joelle.m@codebrave.example", managerId: "s-rana", location: "Head office", startDate: "2021-04-19" },
  { id: "s-bassel", name: "Bassel Najjar", title: "Grants Officer", department: "Fundraising", role: "fundraising", email: "bassel.n@codebrave.example", managerId: "s-joelle", location: "Head office", startDate: "2024-05-06" },
  { id: "s-mira", name: "Mira Chahine", title: "M&E Officer", department: "M&E", role: "me", email: "mira.c@codebrave.example", managerId: "s-karim", location: "Head office", startDate: "2023-03-01" },
  { id: "s-elie", name: "Elie Gerges", title: "Platform Administrator", department: "Platform", role: "admin", email: "elie.g@codebrave.example", managerId: "s-ziad", location: "Head office", startDate: "2024-09-02" },
  { id: "s-nadine", name: "Nadine Fares", title: "Safeguarding Lead", department: "Operations & HR", role: "safeguarding_lead", email: "nadine.f@codebrave.example", managerId: "s-rana", location: "Head office", startDate: "2022-02-01" },
  { id: "s-carla", name: "Carla Ayoub", title: "Communications Officer", department: "Fundraising", role: "fundraising", email: "carla.a@codebrave.example", managerId: "s-joelle", location: "Head office", startDate: "2025-01-13" },
];

export const FEMALE_NAMES: [string, string][] = [
  ["Lara", "لارا"], ["Nour", "نور"], ["Sara", "سارة"], ["Rima", "ريما"], ["Hiba", "هبة"],
  ["Yara", "يارا"], ["Zeina", "زينة"], ["Dana", "دانا"], ["Lina", "لينا"], ["Tala", "تالا"],
  ["Jana", "جنى"], ["Rania", "رانيا"], ["Aya", "آية"], ["Farah", "فرح"], ["Ghina", "غنى"],
  ["Mira", "ميرا"], ["Layal", "ليال"], ["Joud", "جود"], ["Celine", "سيلين"], ["Maryam", "مريم"],
];

export const MALE_NAMES: [string, string][] = [
  ["Ali", "علي"], ["Omar", "عمر"], ["Karim", "كريم"], ["Hadi", "هادي"], ["Rami", "رامي"],
  ["Jad", "جاد"], ["Sami", "سامي"], ["Fadi", "فادي"], ["Ziad", "زياد"], ["Adam", "آدم"],
  ["Hassan", "حسن"], ["Youssef", "يوسف"], ["Tarek", "طارق"], ["Nabil", "نبيل"], ["Majd", "مجد"],
  ["Wael", "وائل"], ["Khaled", "خالد"], ["Bilal", "بلال"], ["Elias", "إلياس"], ["Ahmad", "أحمد"],
];

export const INITIALS: [string, string][] = [
  ["K", "ك"], ["H", "ح"], ["S", "س"], ["M", "م"], ["N", "ن"], ["R", "ر"], ["D", "د"],
  ["F", "ف"], ["A", "ع"], ["B", "ب"], ["T", "ت"], ["Z", "ز"], ["G", "غ"], ["Y", "ي"], ["J", "ج"],
];

export const FAMILY_NAMES = [
  "Khoury", "Haddad", "Saab", "Nasr", "Rahal", "Aoun", "Daou", "Sleiman", "Hamdan", "Karam",
  "Ghanem", "Mrad", "Atallah", "Zein", "Chamoun", "Bitar", "Fakhoury", "Hobeika", "Moussa", "Salem",
];
