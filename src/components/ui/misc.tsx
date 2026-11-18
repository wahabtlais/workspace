import * as React from "react";
import { cn, initials } from "@/lib/utils";

const AVATAR_COLORS = ["bg-brand-100 text-brand-800", "bg-emerald-100 text-emerald-800", "bg-amber-100 text-amber-900", "bg-rose-100 text-rose-800", "bg-sky-100 text-sky-800", "bg-violet-100 text-violet-800", "bg-teal-100 text-teal-800"];

export function Avatar({ name, size = 32, className }: { name: string; size?: number; className?: string }) {
  const color = AVATAR_COLORS[[...name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % AVATAR_COLORS.length];
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold", color, className)} style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden>
      {initials(name)}
    </span>
  );
}

export function Progress({ value, className, tone = "brand" }: { value: number; className?: string; tone?: "brand" | "success" | "warning" | "danger" | "ai" }) {
  const color = { brand: "bg-brand-500", success: "bg-emerald-500", warning: "bg-amber-500", danger: "bg-red-500", ai: "bg-ai-500" }[tone];
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-slate-100", className)} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("h-9 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-fg placeholder:text-subtle focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn("w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-fg placeholder:text-subtle focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100", className)} {...props} />
));
Textarea.displayName = "Textarea";

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded border border-white/15 bg-white/10 px-1.5 py-0.5 text-[11px] font-medium">{children}</kbd>;
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px bg-line", className)} />;
}
