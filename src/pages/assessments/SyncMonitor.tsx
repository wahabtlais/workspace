import { Link } from "react-router";
import { CloudOff, RefreshCw, Smartphone } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Workspace } from "@/components/common/Workspace";
import { StatTile } from "@/components/common/StatTile";
import { MiniTable } from "@/pages/staff/home/widgets";
import { useDemo } from "@/store/demoStore";
import { useData } from "@/store/hooks";
import { sessionContext } from "@/lib/names";

export default function SyncMonitor() {
  const d = useData();
  const queue = useDemo((s) => s.syncQueue);
  const offline = useDemo((s) => s.offline);
  const syncNow = useDemo((s) => s.syncNow);
  const pending = d.assessmentSessions.flatMap((s) => s.entries.filter((e) => e.status === "pending_sync").map((e) => ({ s, e })));
  const failed = d.assessmentSessions.flatMap((s) => s.entries.filter((e) => e.status === "failed").map((e) => ({ s, e })));
  const regs = d.registers.filter((r) => r.status === "pending_sync");
  const devices = [...new Set(d.assessmentSessions.flatMap((s) => s.entries.map((e) => e.device).filter(Boolean)))] as string[];
  return (
    <Workspace area="assessments" title="Sync monitor" description="Offline collection health: device outboxes, waiting submissions and failed uploads.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Outbox on this device" value={queue.length} sub={offline ? "Offline: syncs on reconnect" : "Online"} tone={queue.length ? "warning" : "success"} icon={<CloudOff />} />
        <StatTile label="Submissions waiting to sync" value={pending.length} sub="from classroom devices" tone={pending.length ? "warning" : "success"} />
        <StatTile label="Failed uploads" value={failed.length} sub="retry from the live tracker" tone={failed.length ? "danger" : "success"} />
        <StatTile label="Registers waiting to sync" value={regs.length} />
      </div>
      <Card>
        <CardHeader title="Outbox on this device" action={<Button size="sm" variant="secondary" disabled={offline || !queue.length} onClick={() => syncNow()}><RefreshCw /> Sync now</Button>} />
        <CardBody>{queue.length === 0 ? <p className="text-[13px] text-muted">Nothing waiting. Go offline from the prototype bar and submit a register or observation to see items queue here.</p> : <MiniTable head={["Item", "Type", "Queued", "Status"]} rows={queue.map((q) => [q.label, q.kind, q.queuedAt.slice(11, 16), <Badge tone={q.status === "syncing" ? "info" : "warning"}>{q.status}</Badge>])} />}</CardBody>
      </Card>
      <Card>
        <CardHeader title="Failed and waiting submissions" />
        <CardBody><MiniTable empty="No problems" head={["Session", "Device", "Problem"]} rows={[...failed, ...pending].map(({ s, e }) => [<Link to={`/assessments/tracker/${s.id}`} className="hover:underline">{sessionContext(d, s)}</Link>, e.device ?? "—", e.error ?? "Waiting to sync"])} /></CardBody>
      </Card>
      <Card>
        <CardHeader icon={<Smartphone />} title="Field devices" />
        <CardBody className="flex flex-wrap gap-2">{devices.map((dv) => <Badge key={dv} tone="outline">{dv}</Badge>)}</CardBody>
      </Card>
    </Workspace>
  );
}
