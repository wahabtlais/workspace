import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium whitespace-nowrap [&_svg]:size-3", {
  variants: {
    tone: {
      neutral: "bg-slate-100 text-slate-700",
      info: "bg-brand-50 text-brand-700",
      success: "bg-emerald-50 text-emerald-700",
      warning: "bg-amber-50 text-amber-800",
      danger: "bg-red-50 text-red-700",
      ai: "bg-ai-50 text-ai-700",
      su: "bg-su-50 text-su",
      fb: "bg-fb-50 text-fb",
      outline: "border border-line-strong text-muted",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, tone, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && <span className="size-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
}

export type Tone = NonNullable<BadgeProps["tone"]>;
