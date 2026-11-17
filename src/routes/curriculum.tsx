import type { RouteObject } from "react-router";
import CurriculumDetail from "@/pages/curriculum/CurriculumDetail";
import { CurriculumOverview, Frameworks } from "@/pages/curriculum/CurriculumPages";
import { CurriculaList, CurriculumAssessments, LessonPlans } from "@/pages/curriculum/CurriculumPages2";
import { Publishing, Resources, Reviews } from "@/pages/curriculum/CurriculumPages3";
import { Backlog, Outcomes, TrainerFeedbackPage } from "@/pages/curriculum/CurriculumPages4";

export const curriculumRoutes: RouteObject[] = [
  { path: "curriculum", element: <CurriculumOverview /> },
  { path: "curriculum/frameworks", element: <Frameworks /> },
  { path: "curriculum/curricula", element: <CurriculaList /> },
  { path: "curriculum/lesson-plans", element: <LessonPlans /> },
  { path: "curriculum/assessments", element: <CurriculumAssessments /> },
  { path: "curriculum/resources", element: <Resources /> },
  { path: "curriculum/reviews", element: <Reviews /> },
  { path: "curriculum/publishing", element: <Publishing /> },
  { path: "curriculum/feedback", element: <TrainerFeedbackPage /> },
  { path: "curriculum/outcomes", element: <Outcomes /> },
  { path: "curriculum/backlog", element: <Backlog /> },
  { path: "curriculum/:id", element: <CurriculumDetail /> },
];
