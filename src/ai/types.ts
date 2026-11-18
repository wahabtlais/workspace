import type { DataClass } from "@/data/types";

/** A piece of an AI answer. The renderer turns each kind into readable, useful UI. */
export type Block =
  | { kind: "text"; text: string }
  | { kind: "bullets"; title?: string; items: string[] }
  | { kind: "table"; title?: string; head: string[]; rows: (string | number)[][] }
  | { kind: "chart"; title: string; data: { label: string; value: number; flag?: boolean }[]; unit?: string; note?: string }
  | { kind: "doc"; title: string; body: string; docType?: "Google Doc" | "Sheet" | "Slides" | "Email" }
  | { kind: "notice"; tone: "governance" | "info" | "warning"; text: string };

export interface Source { label: string; why?: string; link?: string }

export interface ProposedAction { label: string; apply: () => string }

export interface AIResponse {
  agent: string;
  steps: string[];
  blocks: Block[];
  sources: Source[];
  /** Plain-language explanation of how the answer was produced. */
  reasoning?: string;
  /** Data classes the answer used; shown in "How I got this". */
  dataUsed?: DataClass[];
  proposedAction?: ProposedAction;
  followUps?: string[];
  /** True when the request touched data the assistant may not use. */
  restricted?: boolean;
}

export type FileKind = "xlsx" | "csv" | "docx" | "pdf" | "pptx" | "txt" | "image";

export interface Attachment { id: string; name: string; kind: FileKind; size: string; sampleId?: string }

export const SUPPORTED_TYPES = ".xlsx,.xls,.csv,.docx,.doc,.pdf,.pptx,.txt,.md,.png,.jpg,.jpeg";

export function kindFromName(name: string): FileKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["xlsx", "xls"].includes(ext)) return "xlsx";
  if (ext === "csv") return "csv";
  if (["docx", "doc"].includes(ext)) return "docx";
  if (ext === "pdf") return "pdf";
  if (ext === "pptx") return "pptx";
  if (["png", "jpg", "jpeg"].includes(ext)) return "image";
  return "txt";
}
