import type { RouteObject } from "react-router";
import { Article, Documents, KnowledgeBase } from "@/pages/knowledge/KnowledgePages";
import { Cases, ReportConcern, Templates } from "@/pages/knowledge/KnowledgePages2";

export const knowledgeRoutes: RouteObject[] = [
  { path: "knowledge", element: <KnowledgeBase /> },
  { path: "knowledge/templates", element: <Templates /> },
  { path: "knowledge/documents", element: <Documents /> },
  { path: "knowledge/:id", element: <Article /> },
  { path: "safeguarding", element: <ReportConcern /> },
  { path: "safeguarding/cases", element: <Cases /> },
];
