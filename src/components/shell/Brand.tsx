import { cn } from "@/lib/utils";

export function BrandMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={cn("shrink-0", className)} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#254fa3" />
      <path d="M12 10l-5 6 5 6M20 10l5 6-5 6" stroke="#F6B04A" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Brand({ sub, dark = true }: { sub?: string; dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark />
      <div className="leading-tight">
        <p className={cn("text-[15px] font-semibold tracking-tight", dark ? "text-white" : "text-fg")}>CodeBrave</p>
        {sub && <p className={cn("text-[11px]", dark ? "text-white/55" : "text-muted")}>{sub}</p>}
      </div>
    </div>
  );
}
