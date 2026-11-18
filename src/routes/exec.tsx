import type { RouteObject } from "react-router";
import { Decisions, ExecOverview, Priorities, ProgramsImpact } from "@/pages/exec/ExecPages";
import { ExecReports, ProjectsMilestones, TeamsWorkload } from "@/pages/exec/ExecPages2";
import { Meetings, Risks } from "@/pages/exec/ExecPages3";

export const execRoutes: RouteObject[] = [
  { path: "executive", element: <ExecOverview /> },
  { path: "executive/programs", element: <ProgramsImpact /> },
  { path: "executive/priorities", element: <Priorities /> },
  { path: "executive/teams", element: <TeamsWorkload /> },
  { path: "executive/projects", element: <ProjectsMilestones /> },
  { path: "executive/risks", element: <Risks /> },
  { path: "executive/decisions", element: <Decisions /> },
  { path: "executive/meetings", element: <Meetings /> },
  { path: "executive/reports", element: <ExecReports /> },
];
