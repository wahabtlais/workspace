import type { RouteObject } from "react-router";
import Opportunities from "@/pages/fundraising/Opportunities";
import ReportBuilder from "@/pages/fundraising/ReportBuilder";
import { GrantDetail, GrantsList, Obligations } from "@/pages/fundraising/Grants";
import { Donors, FundOverview, Proposals } from "@/pages/fundraising/FundPages";
import { Evidence } from "@/pages/results/ResultsPages2";

export const fundraisingRoutes: RouteObject[] = [
  { path: "fundraising", element: <FundOverview /> },
  { path: "fundraising/donors", element: <Donors /> },
  { path: "fundraising/opportunities", element: <Opportunities /> },
  { path: "fundraising/proposals", element: <Proposals /> },
  { path: "fundraising/grants", element: <GrantsList /> },
  { path: "fundraising/grants/:id", element: <GrantDetail /> },
  { path: "fundraising/obligations", element: <Obligations /> },
  { path: "fundraising/reports", element: <ReportBuilder /> },
  { path: "fundraising/evidence", element: <Evidence /> },
];
