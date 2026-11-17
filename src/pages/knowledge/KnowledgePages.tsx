import { useParams } from "react-router";
import { BookOpen } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Workspace } from "@/components/common/Workspace";
import { DataTable } from "@/components/data/DataTable";
import { AIAction } from "@/components/shell/AskPanel";
import { useData, useLookup } from "@/store/hooks";
import { formatDate } from "@/lib/utils";

export function KnowledgeBase() {
  const d = useData();
  const L = useLookup();
  return (
    <Workspace area="knowledge" title="Knowledge base" description="Policies, SOPs, guides and FAQs. Also the main source Ask CodeBrave answers from." aiActions={<AIAction label="Ask a how-to question" prompt="What can you help me with?" />}>
      <DataTable rows={d.kb} rowLink={(k) => `/knowledge/${k.id}`} search={(k) => `${k.title} ${k.summary}`} filters={[{ key: "c", label: "Category", options: ["Policy", "SOP", "Guide", "FAQ"], get: (k) => k.category }]}
        columns={[{ key: "t", header: "Article", cell: (k) => <span><span className="block font-medium">{k.title}</span><span className="text-[12px] text-muted">{k.summary}</span></span> }, { key: "c", header: "Category", cell: (k) => <Badge tone="outline">{k.category}</Badge> }, { key: "o", header: "Owner", cell: (k) => <span className="text-muted">{L.person(k.ownerId)}</span>, hideOnMobile: true }, { key: "r", header: "Review due", sort: (k) => k.reviewDue, cell: (k) => formatDate(k.reviewDue) }]} />
    </Workspace>
  );
}

export function Article() {
  const { id } = useParams();
  const d = useData();
  const L = useLookup();
  const k = d.kb.find((x) => x.id === id);
  if (!k) return <Workspace area="knowledge" title="Article not found"><p>Unknown article.</p></Workspace>;
  return (
    <Workspace area="knowledge" hideSubnav title={k.title} crumbs={[{ label: "Knowledge", to: "/knowledge" }, { label: k.title }]} meta={<Badge tone="outline">{k.category}</Badge>} description={`Owner ${L.person(k.ownerId)} · next review ${formatDate(k.reviewDue)}`}>
      <Card><CardBody className="max-w-3xl space-y-3 pt-5 text-[14px]">
        <p className="text-[15px]">{k.summary}</p>
        <h3 className="font-semibold">Steps</h3>
        <ol className="list-decimal space-y-1 ps-5"><li>Open the relevant workspace from the menu.</li><li>Use the primary button at the top of the page.</li><li>Follow the on-screen checks; the platform blocks steps that need consent or approval.</li><li>Check your Inbox for approvals and confirmations.</li></ol>
        <p className="text-muted">Fictional prototype content. Real policies are not reproduced here.</p>
      </CardBody></Card>
    </Workspace>
  );
}

export function Documents() {
  const d = useData();
  const L = useLookup();
  return (
    <Workspace area="knowledge" title="Documents" description="Platform-generated and linked documents. Access is inherited from the record each document belongs to.">
      <DataTable rows={d.documents} search={(x) => `${x.title} ${x.context}`} columns={[{ key: "t", header: "Document", cell: (x) => <span className="flex items-center gap-2"><BookOpen className="size-4 text-muted" /><span className="font-medium">{x.title}</span></span> }, { key: "ty", header: "Type", cell: (x) => <Badge tone="outline">{x.type}</Badge> }, { key: "c", header: "Context", cell: (x) => <span className="text-muted">{x.context}</span> }, { key: "a", header: "Access", cell: (x) => <span className="text-[12px] text-muted">{x.access}</span>, hideOnMobile: true }, { key: "o", header: "Owner", cell: (x) => L.person(x.ownerId), hideOnMobile: true }, { key: "u", header: "Updated", cell: (x) => formatDate(x.updatedAt) }]} />
    </Workspace>
  );
}
