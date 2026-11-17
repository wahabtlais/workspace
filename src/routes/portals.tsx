import type { RouteObject } from "react-router";
import { MyClassDetail, MyClasses, TakeRegister } from "@/pages/portals/teacher/TeacherClasses";
import { ClassAssessments } from "@/pages/portals/teacher/TeacherAssessments";

export const teacherRoutes: RouteObject[] = [
  { path: "classes", element: <MyClasses base="/teacher" /> },
  { path: "classes/:id", element: <MyClassDetail base="/teacher" /> },
  { path: "classes/:id/register", element: <TakeRegister base="/teacher" /> },
  { path: "assessments", element: <ClassAssessments base="/teacher" /> },
];

export const tfRoutes: RouteObject[] = [
  { path: "classes", element: <MyClasses base="/tf" /> },
  { path: "classes/:id", element: <MyClassDetail base="/tf" /> },
  { path: "classes/:id/register", element: <TakeRegister base="/tf" /> },
];

export const studentRoutes: RouteObject[] = [];
export const partnerRoutes: RouteObject[] = [];
