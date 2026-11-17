import type { RouteObject } from "react-router";
import { MyClassDetail, MyClasses, TakeRegister } from "@/pages/portals/teacher/TeacherClasses";
import { ClassAssessments } from "@/pages/portals/teacher/TeacherAssessments";
import { MyAssignments, MyLearning } from "@/pages/portals/student/StudentLearning";
import { Career, Portfolio, TeamProject } from "@/pages/portals/student/StudentMore";
import { Assistant, Privacy, StudentAnnouncements } from "@/pages/portals/student/StudentMore2";
import { MyTraining, MyTrainingAttendance, TFAssessments } from "@/pages/portals/tf/TFPages";
import { Certificate, Coaching, Deployment, TFResources } from "@/pages/portals/tf/TFPages2";
import { ClientFeedback, ClientMilestones, HostCandidates, HostInterns, HostOpenings } from "@/pages/portals/PartnerPages";
import { DonorIndicators, DonorMilestones, DonorReports, TeacherHelp } from "@/pages/portals/PartnerPages2";

export const teacherRoutes: RouteObject[] = [
  { path: "classes", element: <MyClasses base="/teacher" /> },
  { path: "classes/:id", element: <MyClassDetail base="/teacher" /> },
  { path: "classes/:id/register", element: <TakeRegister base="/teacher" /> },
  { path: "assessments", element: <ClassAssessments base="/teacher" /> },
  { path: "help", element: <TeacherHelp /> },
];

export const tfRoutes: RouteObject[] = [
  { path: "training", element: <MyTraining /> },
  { path: "attendance", element: <MyTrainingAttendance /> },
  { path: "assessments", element: <TFAssessments /> },
  { path: "certificate", element: <Certificate /> },
  { path: "deployment", element: <Deployment /> },
  { path: "classes", element: <MyClasses base="/tf" /> },
  { path: "classes/:id", element: <MyClassDetail base="/tf" /> },
  { path: "classes/:id/register", element: <TakeRegister base="/tf" /> },
  { path: "coaching", element: <Coaching /> },
  { path: "resources", element: <TFResources /> },
];

export const studentRoutes: RouteObject[] = [
  { path: "learning", element: <MyLearning /> },
  { path: "assignments", element: <MyAssignments /> },
  { path: "team", element: <TeamProject /> },
  { path: "portfolio", element: <Portfolio /> },
  { path: "career", element: <Career /> },
  { path: "announcements", element: <StudentAnnouncements env="FB" /> },
  { path: "assistant", element: <Assistant /> },
  { path: "privacy", element: <Privacy /> },
];

export const partnerRoutes: RouteObject[] = [
  { path: "projects", element: <ClientMilestones /> },
  { path: "feedback", element: <ClientFeedback /> },
  { path: "openings", element: <HostOpenings /> },
  { path: "candidates", element: <HostCandidates /> },
  { path: "interns", element: <HostInterns /> },
  { path: "reports", element: <DonorReports /> },
  { path: "indicators", element: <DonorIndicators /> },
  { path: "milestones", element: <DonorMilestones /> },
];
