import type { RouteObject } from "react-router";
import FBOverview from "@/pages/fb/Overview";
import Admissions from "@/pages/fb/Admissions";
import CohortSessions from "@/pages/fb/Sessions";
import Students from "@/pages/fb/Students";
import Student360 from "@/pages/fb/Student360";
import Projects from "@/pages/fb/Projects";
import Internships from "@/pages/fb/Internships";
import { Clients, FBAttendance, Pathways } from "@/pages/fb/FBPages";
import { Career, Mentorship, Portfolios } from "@/pages/fb/FBMore";
import { FBReports, Graduation } from "@/pages/fb/FBMore2";

export const fbRoutes: RouteObject[] = [
  { path: "future-builders", element: <FBOverview /> },
  { path: "future-builders/admissions", element: <Admissions /> },
  { path: "future-builders/cohorts", element: <CohortSessions /> },
  { path: "future-builders/students", element: <Students /> },
  { path: "future-builders/students/:id", element: <Student360 /> },
  { path: "future-builders/attendance", element: <FBAttendance /> },
  { path: "future-builders/pathways", element: <Pathways /> },
  { path: "future-builders/projects", element: <Projects /> },
  { path: "future-builders/clients", element: <Clients /> },
  { path: "future-builders/portfolios", element: <Portfolios /> },
  { path: "future-builders/career", element: <Career /> },
  { path: "future-builders/mentorship", element: <Mentorship /> },
  { path: "future-builders/internships", element: <Internships /> },
  { path: "future-builders/graduation", element: <Graduation /> },
  { path: "future-builders/reports", element: <FBReports /> },
];
