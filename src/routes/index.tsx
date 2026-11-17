import type { RouteObject } from "react-router";
import { suRoutes } from "./su";

/** All staff workspace routes. Unlisted paths fall back to the Phase A scaffold page. */
export const staffRoutes: RouteObject[] = [...suRoutes];
