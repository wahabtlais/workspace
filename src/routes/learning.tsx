import type { RouteObject } from "react-router";
import Grading from "@/pages/learning/Grading";
import { Announcements, Certificates, Courses, Progress_ } from "@/pages/learning/LearningPages";

export const learningRoutes: RouteObject[] = [
  { path: "learning", element: <Courses /> },
  { path: "learning/progress", element: <Progress_ /> },
  { path: "learning/grading", element: <Grading /> },
  { path: "learning/certificates", element: <Certificates /> },
  { path: "learning/announcements", element: <Announcements /> },
];
