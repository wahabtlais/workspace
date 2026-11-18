import { useState } from "react";
import { Lock, Shield, Sparkles } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useData } from "@/store/hooks";
import { relativeDay } from "@/lib/utils";
import { useMe } from "./StudentLearning";

export function Assistant() {
  const [msgs, setMsgs] = useState<{ me: boolean; text: string }[]>([{ me: false, text: "Hi! I’m your Learning Assistant. I give hints, not answers. What are you working on?" }]);
  const [input, setInput] = useState("");
  const send = (t: string) => { setMsgs((m) => [...m, { me: true, text: t }, { me: false, text: "Good question! Hint: every input needs a label linked by its id, so screen readers know what to say. Which of your inputs is missing one? Try it, then tell me what you changed." }]); setInput(""); };
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center gap-2"><Sparkles className="size-5 text-ai-600" /><h1 className="text-[24px] font-semibold">Learning Assistant</h1><Badge tone="ai">Hints, not answers</Badge></div>
      <Card><CardBody className="space-y-3 pt-4">{msgs.map((m, i) => <div key={i} className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[14px] ${m.me ? "ml-auto bg-fb text-white" : "bg-canvas"}`}>{m.text}</div>)}</CardBody>
        <form className="flex gap-2 border-t border-line p-3" onSubmit={(e) => { e.preventDefault(); if (input.trim()) send(input.trim()); }}><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="How do I make my sign-up form accessible?" className="h-10 flex-1 rounded-lg border border-line px-3 text-[14px]" aria-label="Message" /><Button type="submit">Send</Button></form></Card>
      <p className="text-center text-[12px] text-muted"><Lock className="inline size-3" /> Uses your course content only. Conversations may be reviewed by staff for safety.</p>
    </div>
  );
}

export function Privacy() {
  const me = useMe();
  const LABEL: Record<string, string> = { participation: "Taking part in Future Builders", dataProcessing: "Keeping your learning records", media: "Photos and videos of you", portfolioSharing: "Sharing your portfolio", internshipSharing: "Sharing with internship hosts", aiAssistant: "Using the Learning Assistant" };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><Shield className="size-5 text-fb" /><h1 className="text-[24px] font-semibold">Profile & privacy</h1></div>
      <Card><CardHeader title="What you and your guardian agreed to" subtitle="To change anything, talk to your Project Officer. Your guardian can withdraw consent at any time." /><CardBody className="grid gap-2 sm:grid-cols-2">{Object.entries(me.consent).map(([k, v]) => <div key={k} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-[13px]"><span>{LABEL[k]}</span><Badge tone={v ? "success" : "neutral"}>{v ? "Yes" : "No"}</Badge></div>)}</CardBody></Card>
      <Card className="p-4 text-[13px] text-muted">Other students only see your first name and team role. Staff notes and safeguarding records are never shown in the Student Portal.</Card>
    </div>
  );
}

export function StudentAnnouncements({ env }: { env: "FB" | "TF" }) {
  const d = useData();
  return (
    <div className="space-y-3">
      <h1 className="text-[24px] font-semibold">Announcements</h1>
      {d.announcements.filter((a) => a.env === env).map((a) => <Card key={a.id} className="p-4"><div className="flex items-center justify-between"><p className="font-semibold">{a.title}</p><span className="text-[12px] text-muted">{relativeDay(a.date)}</span></div><p className="mt-1 text-[14px] text-muted">{a.body}</p></Card>)}
    </div>
  );
}
