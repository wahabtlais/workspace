import type { RouteObject } from "react-router";
import { AttendancePolicies, ProgramsCohorts, UsersRoles } from "@/pages/admin/AdminPages";
import { AgentHub, AuditLog, DataProtection, Integrations, RequestTypes } from "@/pages/admin/AdminPages2";

export const adminRoutes: RouteObject[] = [
  { path: "admin", element: <UsersRoles /> },
  { path: "admin/programs", element: <ProgramsCohorts /> },
  { path: "admin/attendance-policies", element: <AttendancePolicies /> },
  { path: "admin/request-types", element: <RequestTypes /> },
  { path: "admin/integrations", element: <Integrations /> },
  { path: "admin/agents", element: <AgentHub /> },
  { path: "admin/audit", element: <AuditLog /> },
  { path: "admin/data-protection", element: <DataProtection /> },
];
