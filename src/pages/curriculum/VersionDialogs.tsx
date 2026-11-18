import { useState } from "react";
import { Check, Rocket, Undo2 } from "lucide-react";
import type { Course, Curriculum, CurriculumVersion } from "@/data/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/misc";
import { DialogClose, DialogContent } from "@/components/ui/overlay";
import { decideVersion, publishVersion } from "@/store/actions";

export function PublishDialog({ cur, ver, env, course, onClose }: { cur: Curriculum; ver: CurriculumVersion; env: string; course?: Course; onClose: () => void }) {
  return (
    <DialogContent title={`Publish ${cur.title} ${ver.label}`} description="Creates an immutable course snapshot."
      footer={<><DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose><Button onClick={() => { publishVersion(cur.id, ver.id); onClose(); }}><Rocket /> Publish</Button></>}>
      <ul className="space-y-2 text-[14px]">
        <li><b>Target:</b> {env}</li>
        <li><b>Cohort:</b> {cur.collection === "FB" ? "Future Builders 2026–27" : "TF Cohort 2026–27"}{cur.pathway ? ` (${cur.pathway.toUpperCase()} pathway)` : ""} will be pinned to {ver.label}.</li>
        <li><b>Learners notified:</b> yes, through a portal notification.</li>
        {course && <li className="text-muted">Currently live: {cur.versions.find((v) => v.id === course.versionId)?.label}. Progress is kept for lessons that still exist.</li>}
      </ul>
    </DialogContent>
  );
}

export function DecideDialog({ cur, ver, approver, onClose }: { cur: Curriculum; ver: CurriculumVersion; approver: boolean; onClose: () => void }) {
  const [note, setNote] = useState("");
  return (
    <DialogContent title={`Review ${cur.title} ${ver.label}`} description={approver ? "As approver, your decision changes the version status." : "Add comments in the Review tab. The Project Manager approves."}
      footer={<><DialogClose asChild><Button variant="secondary">Close</Button></DialogClose>
        {approver && <><Button variant="secondary" onClick={() => { decideVersion(cur.id, ver.id, false, note || "See comments"); onClose(); }}><Undo2 /> Request changes</Button><Button variant="success" onClick={() => { decideVersion(cur.id, ver.id, true, note); onClose(); }}><Check /> Approve</Button></>}</>}>
      {approver ? <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Comment (optional for approval, recommended when requesting changes)" /> : <p className="text-[14px] text-muted">Reviewers comment; the Project Manager makes the approval decision.</p>}
    </DialogContent>
  );
}
