import * as React from "react";
import { Dialog as D, DropdownMenu as DM, Popover as P, Tooltip as T, Tabs as TB } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Dialog ---------- */
export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

export function DialogContent({ title, description, children, className, footer, wide }: { title: React.ReactNode; description?: React.ReactNode; children?: React.ReactNode; className?: string; footer?: React.ReactNode; wide?: boolean }) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-ink-950/40 backdrop-blur-[2px] animate-fade-in" />
      <D.Content className={cn("fixed left-1/2 top-[8vh] z-50 w-[calc(100vw-32px)] -translate-x-1/2 rounded-2xl border border-line bg-surface shadow-pop animate-pop-in focus:outline-none", wide ? "max-w-3xl" : "max-w-lg", className)}>
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <D.Title className="text-[17px] font-semibold text-fg">{title}</D.Title>
            {description ? <D.Description className="mt-1 text-[13px] text-muted">{description}</D.Description> : <D.Description className="sr-only">Dialog</D.Description>}
          </div>
          <D.Close className="rounded-md p-1 text-muted hover:bg-canvas hover:text-fg" aria-label="Close"><X className="size-4" /></D.Close>
        </div>
        <div className="max-h-[66vh] overflow-y-auto px-6 py-5 scrollbar-thin">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-line bg-canvas/60 px-6 py-3 rounded-b-2xl">{footer}</div>}
      </D.Content>
    </D.Portal>
  );
}

/* ---------- Side sheet (used by Ask CodeBrave and record previews) ---------- */
export function SheetContent({ title, description, children, className, side = "right" }: { title: React.ReactNode; description?: React.ReactNode; children?: React.ReactNode; className?: string; side?: "right" | "left" }) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-ink-950/25 animate-fade-in" />
      <D.Content className={cn("fixed top-0 z-50 flex h-full w-full max-w-md flex-col border-line bg-surface shadow-pop animate-slide-in-right focus:outline-none", side === "right" ? "right-0 border-l" : "left-0 border-r", className)}>
        <D.Title className="sr-only">{title}</D.Title>
        <D.Description className="sr-only">{description ?? "Panel"}</D.Description>
        {children}
      </D.Content>
    </D.Portal>
  );
}

/* ---------- Dropdown menu ---------- */
export const Menu = DM.Root;
export const MenuTrigger = DM.Trigger;
export function MenuContent({ children, className, align = "end" }: { children: React.ReactNode; className?: string; align?: "start" | "end" | "center" }) {
  return (
    <DM.Portal>
      <DM.Content align={align} sideOffset={6} className={cn("z-50 min-w-48 rounded-xl border border-line bg-surface p-1 shadow-pop animate-pop-in", className)}>
        {children}
      </DM.Content>
    </DM.Portal>
  );
}
export function MenuItem({ className, ...props }: React.ComponentProps<typeof DM.Item>) {
  return <DM.Item className={cn("flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-fg outline-none data-[highlighted]:bg-canvas [&_svg]:size-4 [&_svg]:text-muted", className)} {...props} />;
}
export const MenuSeparator = () => <DM.Separator className="my-1 h-px bg-line" />;
export const MenuLabel = ({ children }: { children: React.ReactNode }) => <DM.Label className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">{children}</DM.Label>;

/* ---------- Popover ---------- */
export const Popover = P.Root;
export const PopoverTrigger = P.Trigger;
export function PopoverContent({ children, className, align = "end" }: { children: React.ReactNode; className?: string; align?: "start" | "end" | "center" }) {
  return (
    <P.Portal>
      <P.Content align={align} sideOffset={8} className={cn("z-50 w-80 rounded-xl border border-line bg-surface shadow-pop animate-pop-in focus:outline-none", className)}>
        {children}
      </P.Content>
    </P.Portal>
  );
}

/* ---------- Tooltip ---------- */
export const TooltipProvider = T.Provider;
export function Tooltip({ label, children, side = "bottom" }: { label: React.ReactNode; children: React.ReactNode; side?: "top" | "bottom" | "left" | "right" }) {
  return (
    <T.Root delayDuration={250}>
      <T.Trigger asChild>{children}</T.Trigger>
      <T.Portal>
        <T.Content side={side} sideOffset={6} className="z-[60] max-w-64 rounded-md bg-ink-900 px-2 py-1 text-[12px] text-white shadow-pop animate-fade-in">{label}</T.Content>
      </T.Portal>
    </T.Root>
  );
}

/* ---------- Tabs ---------- */
export const Tabs = TB.Root;
export const TabsContent = TB.Content;
export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <TB.List className={cn("flex gap-1 overflow-x-auto border-b border-line scrollbar-thin", className)}>{children}</TB.List>;
}
export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TB.Trigger value={value} className="relative -mb-px whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted hover:text-fg data-[state=active]:border-brand-600 data-[state=active]:text-brand-700">
      {children}
    </TB.Trigger>
  );
}
