import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  sort?: (row: T) => string | number;
  className?: string;
  hideOnMobile?: boolean;
}

export interface Filter<T> { key: string; label: string; options: string[]; get: (row: T) => string }

/** Searchable, filterable, sortable table used across workspaces. Rows can link to a detail page. */
export function DataTable<T>({ rows, columns, search, filters, rowLink, empty, toolbar, initialSort, pageSize = 25, title, dense }: {
  rows: T[]; columns: Column<T>[]; search?: (row: T) => string; filters?: Filter<T>[]; rowLink?: (row: T) => string | undefined;
  empty?: { title: string; body?: string }; toolbar?: ReactNode; initialSort?: { key: string; dir: "asc" | "desc" }; pageSize?: number; title?: ReactNode; dense?: boolean;
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Record<string, string>>({});
  const [sort, setSort] = useState(initialSort);
  const [limit, setLimit] = useState(pageSize);

  const view = useMemo(() => {
    let out = rows;
    const term = q.trim().toLowerCase();
    if (term && search) out = out.filter((r) => search(r).toLowerCase().includes(term));
    for (const f of filters ?? []) if (sel[f.key]) out = out.filter((r) => f.get(r) === sel[f.key]);
    const col = columns.find((c) => c.key === sort?.key);
    if (col?.sort) {
      const s = col.sort;
      out = [...out].sort((a, b) => {
        const x = s(a), y = s(b);
        const cmp = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
        return sort!.dir === "asc" ? cmp : -cmp;
      });
    }
    return out;
  }, [rows, q, sel, sort, columns, filters, search]);

  return (
    <Card className="overflow-hidden">
      {(title || search || filters?.length || toolbar) && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          {title && <div className="mr-2 font-semibold">{title}</div>}
          {search && (
            <label className="flex h-9 min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-line bg-canvas px-3 sm:max-w-xs">
              <Search className="size-4 text-subtle" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-full bg-transparent text-[13px] outline-none" aria-label="Search table" />
            </label>
          )}
          {filters?.map((f) => (
            <select key={f.key} value={sel[f.key] ?? ""} onChange={(e) => setSel((s) => ({ ...s, [f.key]: e.target.value }))} aria-label={f.label}
              className="h-9 rounded-lg border border-line bg-surface px-2.5 text-[13px] text-fg">
              <option value="">{f.label}: all</option>
              {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
          <span className="ml-auto text-[12px] text-subtle tabular">{view.length} of {rows.length}</span>
          {toolbar}
        </div>
      )}
      {view.length === 0 ? (
        <div className="p-6"><EmptyState title={empty?.title ?? "No matching records"} body={empty?.body ?? "Try clearing the search or filters."} /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line bg-canvas/60 text-left text-[12px] text-muted">
                {columns.map((c) => (
                  <th key={c.key} className={cn("whitespace-nowrap px-4 py-2 font-medium", c.hideOnMobile && "hidden md:table-cell", c.className)}>
                    {c.sort ? (
                      <button className="inline-flex items-center gap-1 hover:text-fg" onClick={() => setSort((s) => ({ key: c.key, dir: s?.key === c.key && s.dir === "asc" ? "desc" : "asc" }))}>
                        {c.header}{sort?.key === c.key && (sort.dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                      </button>
                    ) : c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {view.slice(0, limit).map((r, i) => {
                const link = rowLink?.(r);
                return (
                  <tr key={i} onClick={link ? () => navigate(link) : undefined} className={cn("border-b border-line last:border-0", link && "cursor-pointer hover:bg-brand-50/40")}>
                    {columns.map((c) => <td key={c.key} className={cn("px-4 align-middle", dense ? "py-2" : "py-2.5", c.hideOnMobile && "hidden md:table-cell", c.className)}>{c.cell(r)}</td>)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {view.length > limit && (
        <div className="border-t border-line p-2 text-center"><button className="text-[13px] font-medium text-brand-600 hover:underline" onClick={() => setLimit((l) => l + pageSize)}>Show more ({view.length - limit} remaining)</button></div>
      )}
    </Card>
  );
}
