import { useState } from "react";
import { useParams } from "react-router";
import { CopyPlus, Rocket, Send, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/misc";
import { Dialog, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlay";
import { Workspace } from "@/components/common/Workspace";
import { useData, usePersona } from "@/store/hooks";
import { useUI } from "@/store/uiStore";
import { createDraft, sendForReview, updateChangeLog } from "@/store/actions";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { VERSION_LABEL } from "@/pages/staff/home/panelsLearning";
import { AIDraftLesson } from "./AIDraftLesson";
import { Compare, History, Review, Structure } from "./VersionViews";
import { DecideDialog, PublishDialog } from "./VersionDialogs";

const TONE = { draft: "neutral", in_review: "warning", approved: "info", published: "success" } as const;

export function envFor(cur: { collection: string; audience: string }) {
  return cur.collection === "FB" ? "Future Builders Student Portal" : cur.audience.startsWith("Teaching Fellows") ? "TF Learning Portal" : "SU classroom materials";
}

export default function CurriculumDetail() {
  const { id } = useParams();
  const d = useData();
  const persona = usePersona();
  const setAsk = useUI((s) => s.setAsk);
  const cur = d.curricula.find((c) => c.id === id);
  const [verId, setVer] = useState<string | undefined>(undefined);
  const [dialog, setDialog] = useState<"ai" | "publish" | "decide" | null>(null);
  if (!cur) return <Workspace area="curriculum" title="Curriculum not found"><p>Unknown curriculum.</p></Workspace>;
  const ver = cur.versions.find((v) => v.id === verId) ?? cur.versions[cur.versions.length - 1];
  const isOwner = persona.role === "curriculum";
  const isReviewer = (cur.collection === "SU" ? ["su_pm", "su_trainer"] : ["fb_pm", "fb_trainer"]).includes(persona.role);
  const approver = persona.role === (cur.collection === "SU" ? "su_pm" : "fb_pm");
  const env = envFor(cur);
  const course = d.courses.find((c) => c.curriculumId === cur.id);
  const latest = ver.id === cur.versions[cur.versions.length - 1].id;

  return (
    <Workspace area="curriculum" hideSubnav title={cur.title} description={`${cur.audience} · publishes to the ${env}`}
      crumbs={[{ label: "Curriculum", to: "/curriculum" }, { label: "Curricula & builder", to: "/curriculum/curricula" }, { label: cur.title }]}
      meta={<><Badge tone={cur.collection === "SU" ? "su" : "fb"}>{cur.collection === "SU" ? "School Upskilling collection" : "Future Builders collection"}</Badge>{course && <Badge tone="success">Live: {cur.versions.find((v) => v.id === course.versionId)?.label} · cohort pinned</Badge>}</>}>
      <div className="flex flex-wrap gap-2">
        {cur.versions.map((v) => (
          <button key={v.id} onClick={() => setVer(v.id)} className={cn("rounded-lg border px-3 py-2 text-left", v.id === ver.id ? "border-brand-400 bg-brand-50 ring-1 ring-brand-200" : "border-line bg-surface hover:border-line-strong")}>
            <span className="block text-[14px] font-semibold">{v.label}</span>
            <Badge tone={TONE[v.status]} dot>{VERSION_LABEL[v.status]}</Badge>
          </button>
        ))}
      </div>
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-muted">{ver.label} · created {formatDate(ver.createdAt)}{ver.approvedAt && ` · approved ${formatDate(ver.approvedAt)}`}{ver.publishedAt && ` · published ${formatDate(ver.publishedAt)}`}</span>
          <span className="ms-auto flex flex-wrap gap-2">
            {ver.status === "draft" && isOwner && <>
              <Button variant="ai" size="sm" onClick={() => setDialog("ai")}><Sparkles /> Draft lesson with AI</Button>
              <Button variant="ai" size="sm" onClick={() => setAsk(true, `Lesson: ${ver.modules.flatMap((m) => m.lessons).slice(-1)[0]?.title ?? cur.title}`, "Review this lesson")}><Sparkles /> AI review before sending</Button>
              <Button size="sm" onClick={() => sendForReview(cur.id, ver.id)}><Send /> Send for review</Button>
            </>}
            {ver.status === "in_review" && (isReviewer || approver) && <Button size="sm" onClick={() => setDialog("decide")}>{approver ? "Approve or request changes" : "Review"}</Button>}
            {ver.status === "in_review" && isOwner && <Badge tone="warning">Waiting for reviewers</Badge>}
            {ver.status === "approved" && isOwner && <Button size="sm" onClick={() => setDialog("publish")}><Rocket /> Publish to {env.replace("Future Builders ", "")}</Button>}
            {ver.status === "approved" && !isOwner && <Badge tone="info">Approved · waiting for the Curriculum Manager to publish</Badge>}
            {(ver.status === "published" || ver.status === "approved") && isOwner && latest && <Button size="sm" variant="secondary" onClick={() => createDraft(cur.id)}><CopyPlus /> New draft version</Button>}
          </span>
        </div>
        {ver.status === "draft" && isOwner && <Textarea key={ver.id} rows={2} className="mt-3" defaultValue={ver.changeLog} onBlur={(e) => updateChangeLog(cur.id, ver.id, e.target.value)} placeholder="Change log: what changed in this version and why" />}
      </Card>
      <Tabs defaultValue="structure">
        <TabsList><TabsTrigger value="structure">Structure</TabsTrigger><TabsTrigger value="review">Review ({ver.comments.length})</TabsTrigger><TabsTrigger value="compare">Compare</TabsTrigger><TabsTrigger value="history">History</TabsTrigger></TabsList>
        <TabsContent value="structure" className="mt-4"><Structure ver={ver} /></TabsContent>
        <TabsContent value="review" className="mt-4"><Review cur={cur} ver={ver} /></TabsContent>
        <TabsContent value="compare" className="mt-4"><Compare cur={cur} ver={ver} /></TabsContent>
        <TabsContent value="history" className="mt-4"><History cur={cur} /></TabsContent>
      </Tabs>
      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        {dialog === "ai" && <AIDraftLesson cur={cur} ver={ver} onClose={() => setDialog(null)} />}
        {dialog === "publish" && <PublishDialog cur={cur} ver={ver} env={env} course={course} onClose={() => setDialog(null)} />}
        {dialog === "decide" && <DecideDialog cur={cur} ver={ver} approver={approver} onClose={() => setDialog(null)} />}
      </Dialog>
    </Workspace>
  );
}
