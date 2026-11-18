import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Pipeline / kanban board used for admissions, recruitment, opportunities, follow-ups and requests. */
export function Board<T>({ columns, items, getColumn, renderCard, onMove, columnTone }: {
  columns: string[]; items: T[]; getColumn: (t: T) => string; renderCard: (t: T) => ReactNode;
  onMove?: (t: T, to: string) => void; columnTone?: (c: string) => string;
}) {
  return (
    <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 scrollbar-thin">
      {columns.map((col) => {
        const list = items.filter((i) => getColumn(i) === col);
        return (
          <div key={col} className="flex w-[272px] shrink-0 flex-col rounded-xl bg-slate-100/70 p-2"
            onDragOver={(e) => onMove && e.preventDefault()}
            onDrop={(e) => { const idx = Number(e.dataTransfer.getData("text/plain")); const it = items[idx]; if (onMove && it) onMove(it, col); }}>
            <div className="flex items-center justify-between px-1.5 pb-2 pt-1">
              <span className={cn("text-[12px] font-semibold uppercase tracking-wide text-muted", columnTone?.(col))}>{col}</span>
              <span className="rounded-full bg-surface px-2 text-[11px] font-medium text-muted tabular">{list.length}</span>
            </div>
            <div className="flex min-h-16 flex-col gap-2">
              {list.map((it) => (
                <div key={items.indexOf(it)} draggable={!!onMove} onDragStart={(e) => e.dataTransfer.setData("text/plain", String(items.indexOf(it)))}
                  className={cn("rounded-lg border border-line bg-surface p-3 shadow-card", onMove && "cursor-grab active:cursor-grabbing")}>
                  {renderCard(it)}
                </div>
              ))}
              {list.length === 0 && <p className="px-2 py-3 text-center text-[12px] text-subtle">Nothing here</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
