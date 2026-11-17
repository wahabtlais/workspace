import type { RouteObject } from "react-router";
import { suRoutes } from "./su";
import { assessmentRoutes } from "./assessments";
import { curriculumRoutes } from "./curriculum";
import { fbRoutes } from "./fb";
import { learningRoutes } from "./learning";
import { execRoutes } from "./exec";

/** All staff workspace routes. Unlisted paths fall back to the scaffold page. */
export const staffRoutes: RouteObject[] = [...suRoutes, ...assessmentRoutes, ...curriculumRoutes, ...fbRoutes, ...learningRoutes, ...execRoutes];
