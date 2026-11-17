import type { RouteObject } from "react-router";
import Requests from "@/pages/ops/Requests";
import { Directory, OrgChart, Recruitment, StaffOnboarding } from "@/pages/ops/OpsPages";
import { Assets, Leave, OpsTasks, Policies } from "@/pages/ops/OpsPages2";
import { TeamsWorkload } from "@/pages/exec/ExecPages2";

export const opsRoutes: RouteObject[] = [
  { path: "operations", element: <Directory /> },
  { path: "operations/org-chart", element: <OrgChart /> },
  { path: "operations/recruitment", element: <Recruitment /> },
  { path: "operations/onboarding", element: <StaffOnboarding /> },
  { path: "operations/leave", element: <Leave /> },
  { path: "operations/requests", element: <Requests /> },
  { path: "operations/assets", element: <Assets /> },
  { path: "operations/projects", element: <OpsTasks /> },
  { path: "operations/workload", element: <TeamsWorkload /> },
  { path: "operations/policies", element: <Policies /> },
];
