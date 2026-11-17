import type { RouteObject } from "react-router";
import SUOverview from "@/pages/su/Overview";
import Schools from "@/pages/su/Schools";
import SchoolProfile from "@/pages/su/SchoolProfile";
import { ClassDetail, ClassesList } from "@/pages/su/Classes";

export const suRoutes: RouteObject[] = [
  { path: "school-upskilling", element: <SUOverview /> },
  { path: "school-upskilling/schools", element: <Schools /> },
  { path: "school-upskilling/schools/:id", element: <SchoolProfile /> },
  { path: "school-upskilling/classes", element: <ClassesList /> },
  { path: "school-upskilling/classes/:id", element: <ClassDetail /> },
];
