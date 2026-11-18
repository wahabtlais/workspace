import { useLocation } from "react-router";
import { Hammer } from "lucide-react";
import { STUDENT_NAV, TF_NAV, TEACHER_NAV, PARTNER_NAV } from "@/config/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

const ALL = [...STUDENT_NAV, ...TF_NAV, ...TEACHER_NAV, ...Object.values(PARTNER_NAV).flat()];

export default function PortalSection() {
  const { pathname } = useLocation();
  const match = [...ALL].sort((a, b) => b.path.length - a.path.length).find((i) => pathname === i.path || pathname.startsWith(i.path + "/"));
  const title = match && match.path === pathname ? match.label : "Detail";
  return (
    <>
      <h1 className="mb-4 text-[24px] font-semibold">{title}</h1>
      <Card>
        <CardHeader icon={<Hammer />} title="Scaffolded in Phase A" subtitle="This screen and its navigation exist; the working workflow is built in the next phase." />
        <CardBody><p className="text-[13px] text-muted">It will use the same shared data as every other experience, so actions taken here appear in the Staff Workspace.</p></CardBody>
      </Card>
    </>
  );
}
