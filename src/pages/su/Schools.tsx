import { Workspace } from "@/components/common/Workspace";
import { DataTable } from "@/components/data/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Progress } from "@/components/ui/misc";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { attendanceRate } from "@/lib/metrics";
import { pupilAttendanceAccess } from "@/config/access";
import { formatDate } from "@/lib/utils";

export default function Schools() {
  const d = useData();
  const L = useLookup();
  const persona = usePersona();
  const showAtt = pupilAttendanceAccess(persona).level !== "none";
  const rows = d.schools.map((s) => {
    const cls = d.classes.filter((c) => c.schoolId === s.id);
    const regs = d.registers.filter((r) => r.kind === "pupil" && cls.some((c) => c.id === r.contextId));
    const last = d.visits.filter((v) => v.schoolId === s.id && v.status !== "Planned").sort((a, b) => b.date.localeCompare(a.date))[0];
    return { s, classes: cls.length, pupils: cls.reduce((a, c) => a + c.pupilIds.length, 0), att: regs.length ? attendanceRate(regs) : null, last: last?.date, tfs: d.tfs.filter((t) => t.schoolId === s.id).length };
  });
  return (
    <Workspace area="su" title="Schools" description="Partner school registry: agreements, contacts, classes, Teaching Fellows and visit history.">
      <DataTable rows={rows} search={(r) => `${r.s.name} ${r.s.region} ${r.s.principal}`} rowLink={(r) => `/school-upskilling/schools/${r.s.id}`}
        filters={[{ key: "region", label: "Region", options: [...new Set(d.schools.map((s) => s.region))], get: (r) => r.s.region }, { key: "status", label: "Status", options: ["Active", "Onboarding", "Paused"], get: (r) => r.s.status }, { key: "po", label: "Project Officer", options: ["Omar Haddad", "Lina Farah"], get: (r) => L.person(r.s.poId) }]}
        initialSort={{ key: "name", dir: "asc" }}
        columns={[
          { key: "name", header: "School", sort: (r) => r.s.name, cell: (r) => <span><span className="block font-medium">{r.s.name}</span><span className="text-[12px] text-muted">{r.s.region}</span></span> },
          { key: "status", header: "Status", sort: (r) => r.s.status, cell: (r) => <StatusBadge status={r.s.status} /> },
          { key: "mou", header: "Agreement", cell: (r) => <span><StatusBadge status={r.s.mouStatus} dot={false} /><span className="block text-[11px] text-subtle">until {formatDate(r.s.mouExpires, { month: "short", year: "numeric" })}</span></span>, hideOnMobile: true },
          { key: "classes", header: "Classes", sort: (r) => r.classes, cell: (r) => <span className="tabular">{r.classes} · {r.pupils} pupils</span>, hideOnMobile: true },
          { key: "tfs", header: "TFs", sort: (r) => r.tfs, cell: (r) => <span className="tabular">{r.tfs}</span>, hideOnMobile: true },
          ...(showAtt ? [{ key: "att", header: "Pupil attendance", sort: (r: (typeof rows)[number]) => r.att ?? 0, cell: (r: (typeof rows)[number]) => r.att === null ? <span className="text-subtle">—</span> : <span className="flex items-center gap-2"><span className="w-12 tabular">{r.att}%</span><Progress value={r.att} className="w-16" tone={r.att < 80 ? "warning" : "brand"} /></span> }] : []),
          { key: "po", header: "Project Officer", cell: (r) => <span className="text-muted">{L.person(r.s.poId)}</span>, hideOnMobile: true },
          { key: "visit", header: "Last visit", sort: (r) => r.last ?? "", cell: (r) => <span className="text-muted">{r.last ? formatDate(r.last) : "—"}</span> },
        ]} />
    </Workspace>
  );
}
