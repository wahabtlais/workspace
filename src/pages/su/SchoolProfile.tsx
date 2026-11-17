import { Link, useParams } from "react-router";
import { FileText, Lock, Mail, MapPin, Phone } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlay";
import { KeyValue, Workspace } from "@/components/common/Workspace";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AIAction } from "@/components/shell/AskPanel";
import { MiniTable } from "@/pages/staff/home/widgets";
import { pupilAttendanceAccess } from "@/config/access";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { formatDate } from "@/lib/utils";
import { PupilAttendancePanel } from "./PupilAttendancePanel";

const DAYS = ["", "Mon", "Tue", "Wed", "Thu", "Fri"];

export default function SchoolProfile() {
  const { id } = useParams();
  const d = useData();
  const L = useLookup();
  const persona = usePersona();
  const s = d.schools.find((x) => x.id === id);
  if (!s) return <Workspace area="su" title="School not found"><p>Unknown school.</p></Workspace>;
  const classes = d.classes.filter((c) => c.schoolId === s.id);
  const visits = d.visits.filter((v) => v.schoolId === s.id).sort((a, b) => b.date.localeCompare(a.date));
  const tfs = d.tfs.filter((t) => t.schoolId === s.id);
  const pupilTab = pupilAttendanceAccess(persona).level !== "none";
  const docs = d.documents.filter((x) => x.context.includes(s.name.split(" ")[0]));

  return (
    <Workspace area="su" title={s.name} hideSubnav
      crumbs={[{ label: "School Upskilling", to: "/school-upskilling" }, { label: "Schools", to: "/school-upskilling/schools" }, { label: s.name }]}
      description={`${s.region} · partner since ${formatDate(s.joined, { month: "long", year: "numeric" })}`}
      meta={<><StatusBadge status={s.status} /><StatusBadge status={s.mouStatus} /></>}
      aiActions={<AIAction label="Draft visit report" prompt={`Draft visit report for ${s.name}`} context={s.name} />}>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="classes">Classes ({classes.length})</TabsTrigger>
          <TabsTrigger value="attendance"><span className="inline-flex items-center gap-1">{!pupilTab && <Lock className="size-3" />}Pupil attendance</span></TabsTrigger>
          <TabsTrigger value="visits">Visits ({visits.length})</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card><CardBody className="pt-5"><KeyValue cols={4} items={[["Principal", s.principal], ["Grades served", s.grades.map((g) => `Grade ${g}`).join(", ")], ["Project Officer", L.person(s.poId)], ["Trainer", L.person(s.trainerId)], ["Agreement", <>{s.mouStatus} · until {formatDate(s.mouExpires, { day: "numeric", month: "short", year: "numeric" })}</>], ["Classes", classes.length], ["Pupils (records, no accounts)", classes.reduce((a, c) => a + c.pupilIds.length, 0)], ["Teaching Fellows", tfs.length]]} /></CardBody></Card>
          <Card>
            <CardHeader title="Teaching Fellows deployed here" />
            <CardBody>
              <MiniTable empty="No Teaching Fellows deployed yet" head={["Teaching Fellow", "Classes", "Latest observation"]} rows={tfs.map((t) => {
                const o = visits.find((v) => v.tfId === t.id && v.score !== undefined);
                return [<Link to={`/school-upskilling/teaching-fellows/${t.id}`} className="font-medium hover:underline">{t.name}</Link>, classes.filter((c) => c.teacherId === t.id).map((c) => `${c.grade}-${c.section}`).join(", ") || "—", o ? `${o.score} / 4 · ${formatDate(o.date)}` : "—"];
              })} />
            </CardBody>
          </Card>
        </TabsContent>
        <TabsContent value="classes" className="mt-4">
          <Card><CardBody className="pt-4">
            <MiniTable head={["Class", "Class teacher", "Timetable", "Pupils"]} rows={classes.map((c) => [
              <Link to={`/school-upskilling/classes/${c.id}`} className="font-medium hover:underline">Grade {c.grade}-{c.section}</Link>,
              <span>{L.person(c.teacherId)} <span className="text-[11px] text-subtle">({c.teacherType === "tf" ? "Teaching Fellow" : "school teacher"})</span></span>,
              <span className="text-muted">{c.days.map((x) => DAYS[x]).join(" & ")} · {c.period}</span>, c.pupilIds.length])} />
          </CardBody></Card>
        </TabsContent>
        <TabsContent value="attendance" className="mt-4"><PupilAttendancePanel schoolId={s.id} /></TabsContent>
        <TabsContent value="visits" className="mt-4">
          <Card><CardBody className="pt-4">
            <MiniTable head={["Date", "Purpose", "Officer", "Teaching Fellow", "Score", "Status"]} rows={visits.map((v) => [formatDate(v.date), v.purpose, L.person(v.officerId), v.tfId ? L.person(v.tfId) : "—", v.score !== undefined ? `${v.score} / 4` : "—", <StatusBadge status={v.status} />])} />
          </CardBody></Card>
        </TabsContent>
        <TabsContent value="contacts" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {[[s.principal, "Principal"], ["School secretariat", "Scheduling & rosters"], [L.person(s.poId), "CodeBrave Project Officer"]].map(([n, r]) => (
              <Card key={n} className="p-4"><p className="font-medium">{n}</p><p className="text-[13px] text-muted">{r}</p>
                <div className="mt-2 flex gap-3 text-[12px] text-muted"><span className="inline-flex items-center gap-1"><Phone className="size-3.5" />+000 00 000 000</span><span className="inline-flex items-center gap-1"><Mail className="size-3.5" />contact@school.example</span><span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{s.region}</span></div>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <Card><CardBody className="space-y-2 pt-4">
            {[...docs, { id: "x", title: `School needs assessment (${s.name})`, type: "Google Doc", updatedAt: s.joined, access: "Inherits from school record" }].map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-line p-3"><FileText className="size-4 text-muted" /><span className="flex-1"><span className="block text-[14px] font-medium">{doc.title}</span><span className="text-[12px] text-muted">{doc.type} · {doc.access}</span></span><span className="text-[12px] text-muted">{formatDate(doc.updatedAt)}</span></div>
            ))}
          </CardBody></Card>
        </TabsContent>
      </Tabs>
    </Workspace>
  );
}
