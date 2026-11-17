import type { RouteObject } from "react-router";
import FormsLibrary from "@/pages/assessments/Forms";
import Builder from "@/pages/assessments/Builder";
import Assignments from "@/pages/assessments/Assignments";
import { TrackerDetail, TrackerList } from "@/pages/assessments/Tracker";
import { Analytics, Responses } from "@/pages/assessments/AssessOther";
import SyncMonitor from "@/pages/assessments/SyncMonitor";

export const assessmentRoutes: RouteObject[] = [
  { path: "assessments", element: <FormsLibrary /> },
  { path: "assessments/builder", element: <Builder /> },
  { path: "assessments/assignments", element: <Assignments /> },
  { path: "assessments/tracker", element: <TrackerList /> },
  { path: "assessments/tracker/:id", element: <TrackerDetail /> },
  { path: "assessments/responses", element: <Responses /> },
  { path: "assessments/analytics", element: <Analytics /> },
  { path: "assessments/sync", element: <SyncMonitor /> },
];
