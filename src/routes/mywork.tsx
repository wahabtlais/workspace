import type { RouteObject } from "react-router";
import { Calendar, MyRequests } from "@/pages/mywork/MyWork";
import { AskChat, MyRuns, TaskLibrary } from "@/pages/mywork/AskPages";

export const myWorkRoutes: RouteObject[] = [
  { path: "calendar", element: <Calendar /> },
  { path: "requests", element: <MyRequests /> },
  { path: "ask", element: <AskChat /> },
  { path: "ask/tasks", element: <TaskLibrary /> },
  { path: "ask/runs", element: <MyRuns /> },
];
