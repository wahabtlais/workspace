import { useState } from "react";
import { Save } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Workspace } from "@/components/common/Workspace";
import { MiniTable } from "@/pages/staff/home/widgets";
import { access, ACCESS_LABEL, pupilAttendanceAccess, type Area } from "@/config/access";
import { personas, SURFACE_LABEL } from "@/config/personas";
import { toast } from "@/store/uiStore";
import { useData } from "@/store/hooks";
import { cn } from "@/lib/utils";

const AREAS: [Area, string][] = [["executive", "Exec"], ["su", "SU"], ["fb", "FB"], ["curriculum", "Curric."], ["learning", "Learning"], ["assessments", "Assess."], ["results", "Results"], ["fundraising", "Fundr."], ["operations", "Ops"], ["admin", "Admin"]];
const CELL: Record<string, string> = { full: "bg-brand-600 text-white", scoped: "bg-brand-100 text-brand-800", view: "bg-slate-200 text-slate-700", aggregate: "bg-amber-100 text-amber-800", none: "bg-transparent text-subtle" };

export function UsersRoles() {
  const staff = personas.filter((p) => p.surface === "staff");
  return (
    <Workspace area="admin" title="Users & roles" description="Role × scope × data class. Deny by default. Admins configure access but do not get data access themselves.">
      <Card><CardHeader title="Permission matrix" subtitle="Evaluated live by the same rules that drive navigation and pages" /><CardBody className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-[12px]"><thead><tr><th className="py-2 text-left font-medium text-muted">Role</th>{AREAS.map(([, l]) => <th key={l} className="px-1 py-2 font-medium text-muted">{l}</th>)}<th className="px-1 py-2 font-medium text-muted">Pupil data</th></tr></thead>
          <tbody>{staff.map((p) => <tr key={p.id} className="border-t border-line"><td className="py-1.5 pr-2"><span className="font-medium">{p.title}</span></td>{AREAS.map(([a]) => { const lvl = access(p, a); return <td key={a} className="px-1 py-1.5 text-center"><span title={ACCESS_LABEL[lvl]} className={cn("inline-block w-full rounded px-1 py-0.5", CELL[lvl])}>{lvl === "none" ? "—" : ACCESS_LABEL[lvl].split(" ")[0]}</span></td>; })}<td className="px-1 text-center text-muted">{pupilAttendanceAccess(p).level}</td></tr>)}</tbody></table>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">{Object.entries(CELL).map(([k, c]) => <span key={k} className={cn("rounded px-2 py-0.5", c, k === "none" && "border border-line")}>{ACCESS_LABEL[k as keyof typeof ACCESS_LABEL]}</span>)}</div>
      </CardBody></Card>
      <Card><CardHeader title="All users (demo personas)" /><CardBody><MiniTable head={["Name", "Role", "Experience", "Data grants"]} rows={personas.map((p) => [p.name, p.title, SURFACE_LABEL[p.surface], p.grants.join(", ") || "—"])} /></CardBody></Card>
    </Workspace>
  );
}

export function ProgramsCohorts() {
  const d = useData();
  return (
    <Workspace area="admin" title="Programs & cohorts" description="Program configuration: cohorts, calendars and academic years.">
      <Card><CardBody className="pt-4"><MiniTable head={["Cohort", "Program", "Status", "Dates"]} rows={[...d.tfCohorts.map((c) => [c.name, "School Upskilling", c.status, `${c.start} → ${c.end}`]), ...d.fbCohorts.map((c) => [c.name, "Future Builders", c.status, `${c.start} → ${c.end}`])]} /></CardBody></Card>
    </Workspace>
  );
}

const POLICIES = [
  { key: "fb", title: "Future Builders activities", recorder: "Trainers or authorized staff", roster: "Cohort enrolments / selected students", window: 48, threshold: "3 consecutive absences → PO follow-up", approver: "FB Project Officer / PM", visibility: "Student sees own; staff within scope" },
  { key: "pupil", title: "School pupils (classroom)", recorder: "Class teachers, own classes only", roster: "Class roster (pupils have no accounts)", window: 24, threshold: "Missing register by end of day → reminder", approver: "Assigned SU Project Officer", visibility: "Restricted: pupil-data grant; aggregates elsewhere" },
  { key: "tf", title: "Teaching Fellow training", recorder: "Trainers or authorized staff", roster: "TF cohort", window: 72, threshold: "Below 80% → PM alert; certification criterion", approver: "SU Project Manager", visibility: "TF sees own; trainers and PM within scope" },
];

export function AttendancePolicies() {
  const [windows, setWindows] = useState<Record<string, number>>(Object.fromEntries(POLICIES.map((p) => [p.key, p.window])));
  return (
    <Workspace area="admin" title="Attendance policies" description="One attendance service, three policies. They share the mechanics, not the rules. Statuses for all three: present, absent, late, excused.">
      <div className="grid gap-4 xl:grid-cols-3">
        {POLICIES.map((p) => (
          <Card key={p.key}><CardHeader title={p.title} /><CardBody className="space-y-2 text-[13px]">
            {[["Recorded by", p.recorder], ["Register built from", p.roster], ["Rule", p.threshold], ["Late corrections approved by", p.approver], ["Visibility", p.visibility]].map(([k, v]) => <p key={k}><span className="text-muted">{k}:</span> {v}</p>)}
            <label className="flex items-center gap-2 pt-1"><span className="text-muted">Correction window</span><input type="number" min={1} value={windows[p.key]} onChange={(e) => setWindows((w) => ({ ...w, [p.key]: Number(e.target.value) }))} className="h-8 w-20 rounded-md border border-line px-2" />hours</label>
            <p className="flex flex-wrap gap-1 pt-1">{["Present", "Absent", "Late", "Excused"].map((s) => <Badge key={s} tone="outline">{s}</Badge>)}</p>
            <p className="text-[12px] text-muted">Default mark: <b>none</b>. Registers never mark anyone present automatically.</p>
          </CardBody></Card>
        ))}
      </div>
      <Button onClick={() => toast({ tone: "success", title: "Policies saved", body: "Change recorded in the audit log." })}><Save /> Save policies</Button>
    </Workspace>
  );
}
