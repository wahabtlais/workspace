import type { RouteObject } from "react-router";
import SUOverview from "@/pages/su/Overview";
import Schools from "@/pages/su/Schools";
import SchoolProfile from "@/pages/su/SchoolProfile";
import { ClassDetail, ClassesList } from "@/pages/su/Classes";
import TeachingFellows from "@/pages/su/TeachingFellows";
import Training from "@/pages/su/Training";
import Visits from "@/pages/su/Visits";
import SUReports from "@/pages/su/Reports";
import { FieldActivities, FollowUps, TeamAssignments, Trainers } from "@/pages/su/SUOther";

export const suRoutes: RouteObject[] = [
  { path: "school-upskilling", element: <SUOverview /> },
  { path: "school-upskilling/schools", element: <Schools /> },
  { path: "school-upskilling/schools/:id", element: <SchoolProfile /> },
  { path: "school-upskilling/classes", element: <ClassesList /> },
  { path: "school-upskilling/classes/:id", element: <ClassDetail /> },
  { path: "school-upskilling/teaching-fellows", element: <TeachingFellows /> },
  { path: "school-upskilling/teaching-fellows/:sub", element: <TeachingFellows /> },
  { path: "school-upskilling/trainers", element: <Trainers /> },
  { path: "school-upskilling/training", element: <Training /> },
  { path: "school-upskilling/visits", element: <Visits /> },
  { path: "school-upskilling/follow-ups", element: <FollowUps program="SU" /> },
  { path: "school-upskilling/field-activities", element: <FieldActivities /> },
  { path: "school-upskilling/team", element: <TeamAssignments /> },
  { path: "school-upskilling/reports", element: <SUReports /> },
];
