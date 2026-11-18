import type { RouteObject } from "react-router";
import { Calendar, MyRequests } from "@/pages/mywork/MyWork";
import AIWorkspace from "@/pages/ai/AIWorkspace";
import { AIDiscover, AITrust } from "@/pages/ai/AIPages";

export const myWorkRoutes: RouteObject[] = [
  { path: "calendar", element: <Calendar /> },
  { path: "requests", element: <MyRequests /> },
  { path: "ai", element: <AIWorkspace /> },
  { path: "ai/discover", element: <AIDiscover /> },
  { path: "ai/trust", element: <AITrust /> },
  { path: "ask", element: <AIWorkspace /> },
];
