import type { RouteObject } from "react-router";
import { suRoutes } from "./su";
import { assessmentRoutes } from "./assessments";
import { curriculumRoutes } from "./curriculum";

/** All staff workspace routes. Unlisted paths fall back to the scaffold page. */
export const staffRoutes: RouteObject[] = [...suRoutes, ...assessmentRoutes, ...curriculumRoutes];
