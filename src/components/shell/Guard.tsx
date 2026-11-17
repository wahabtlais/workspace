import type { ReactNode } from "react";
import { access, type Area } from "@/config/access";
import { usePersona } from "@/store/hooks";
import { AccessDenied } from "@/components/common/AccessDenied";

const AREA_NAME: Partial<Record<Area, string>> = {
  su: "School Upskilling", fb: "Future Builders", curriculum: "Curriculum Management", learning: "the Learning Hub", assessments: "the Assessment Hub",
  executive: "Executive & Management", results: "Results & Indicators", fundraising: "Fundraising & Partnerships", operations: "Operations & HR",
  admin: "Admin", "safeguarding-cases": "safeguarding cases", field: "Field mode",
};

export function Guard({ area, children }: { area: Area; children: ReactNode }) {
  const persona = usePersona();
  if (access(persona, area) === "none") {
    const reason = area === "safeguarding-cases" ? "Safeguarding cases are visible only to designated safeguarding leads. Everyone can report a concern. Cases are excluded from search, analytics and AI agents." : undefined;
    return <AccessDenied area={AREA_NAME[area] ?? area} reason={reason} />;
  }
  return <>{children}</>;
}
