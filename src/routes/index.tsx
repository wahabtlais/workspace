import type { RouteObject } from "react-router";
import { suRoutes } from "./su";
import { assessmentRoutes } from "./assessments";
import { curriculumRoutes } from "./curriculum";
import { fbRoutes } from "./fb";
import { learningRoutes } from "./learning";
import { execRoutes } from "./exec";
import { resultsRoutes } from "./results";
import { fundraisingRoutes } from "./fundraising";
import { opsRoutes } from "./ops";
import { knowledgeRoutes } from "./knowledge";

/** All staff workspace routes. Unlisted paths fall back to the scaffold page. */
export const staffRoutes: RouteObject[] = [...suRoutes, ...assessmentRoutes, ...curriculumRoutes, ...fbRoutes, ...learningRoutes, ...execRoutes, ...resultsRoutes, ...fundraisingRoutes, ...opsRoutes, ...knowledgeRoutes];
