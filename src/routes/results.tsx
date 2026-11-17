import type { RouteObject } from "react-router";
import { IndicatorDetail, IndicatorLibrary } from "@/pages/results/ResultsPages";
import { Annual, Evidence, Targets } from "@/pages/results/ResultsPages2";

export const resultsRoutes: RouteObject[] = [
  { path: "results", element: <IndicatorLibrary /> },
  { path: "results/targets", element: <Targets /> },
  { path: "results/annual", element: <Annual /> },
  { path: "results/evidence", element: <Evidence /> },
  { path: "results/:id", element: <IndicatorDetail /> },
];
