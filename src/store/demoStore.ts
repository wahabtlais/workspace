import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { ActivityEvent, DemoData, InboxItem, Notification, RoleKey } from "@/data/types";
import { buildSeed } from "@/data/seed";
import { DEMO_TODAY, uid } from "@/lib/utils";
import { toast } from "./uiStore";

export interface SyncItem {
  id: string;
  kind: "register" | "assessment" | "observation";
  label: string;
  refId: string;
  queuedAt: string;
  status: "queued" | "syncing";
}

interface DemoState {
  data: DemoData;
  personaId: string;
  offline: boolean;
  syncQueue: SyncItem[];
  lang: "en" | "ar";
  /** Bumped on reset so screens can re-key and drop local UI state. */
  resetCount: number;

  setPersona: (id: string) => void;
  setLang: (lang: "en" | "ar") => void;
  setOffline: (offline: boolean) => void;
  syncNow: () => void;
  resetDemo: () => void;

  /** Mutate the shared dataset (immer draft). */
  update: (recipe: (d: DemoData) => void) => void;
  enqueue: (item: Omit<SyncItem, "id" | "queuedAt" | "status">) => void;
  addInbox: (item: Omit<InboxItem, "id" | "createdAt" | "status">) => void;
  completeInbox: (id: string) => void;
  notify: (n: Omit<Notification, "id" | "at" | "read">) => void;
  markNotificationsRead: (personaId: string, role: RoleKey) => void;
  logActivity: (e: Omit<ActivityEvent, "id" | "at">) => void;
}

/** Simulated clock: the demo always happens on DEMO_TODAY, with the real time of day. */
export function nowIso() {
  const t = new Date().toTimeString().slice(0, 8);
  return `${DEMO_TODAY}T${t}`;
}

export const useDemo = create<DemoState>()(
  persist(
    immer((set, get) => ({
      data: buildSeed(),
      personaId: "p-exec",
      offline: false,
      syncQueue: [],
      lang: "en",
      resetCount: 0,

      setPersona: (id) => set((s) => { s.personaId = id; }),
      setLang: (lang) => set((s) => { s.lang = lang; }),

      setOffline: (offline) => {
        set((s) => { s.offline = offline; });
        if (offline) toast({ tone: "warning", title: "You are offline", body: "Work is saved on this device and will sync when you reconnect." });
        else if (get().syncQueue.length) get().syncNow();
        else toast({ tone: "success", title: "Back online" });
      },

      syncNow: () => {
        const queue = get().syncQueue;
        if (!queue.length || get().offline) return;
        set((s) => { s.syncQueue.forEach((q) => { q.status = "syncing"; }); });
        toast({ tone: "info", title: `Syncing ${queue.length} item${queue.length > 1 ? "s" : ""}…` });
        window.setTimeout(() => {
          const at = nowIso();
          set((s) => {
            for (const q of s.syncQueue) {
              if (q.kind === "register") {
                const r = s.data.registers.find((x) => x.id === q.refId);
                if (r && r.status === "pending_sync") { r.status = "submitted"; r.syncedAt = at; }
              }
              if (q.kind === "assessment") {
                const [sessionId, subjectId] = q.refId.split("::");
                const e = s.data.assessmentSessions.find((x) => x.id === sessionId)?.entries.find((x) => x.subjectId === subjectId);
                if (e && e.status === "pending_sync") { e.status = "submitted"; }
              }
              if (q.kind === "observation") {
                const v = s.data.visits.find((x) => x.id === q.refId);
                if (v) v.pendingSync = false;
              }
            }
            s.syncQueue = [];
          });
          toast({ tone: "success", title: "All changes synced", body: `${queue.length} item${queue.length > 1 ? "s" : ""} uploaded and confirmed.` });
        }, 1400);
      },

      resetDemo: () => {
        set((s) => {
          s.data = buildSeed();
          s.syncQueue = [];
          s.offline = false;
          s.lang = "en";
          s.resetCount += 1;
        });
        toast({ tone: "success", title: "Demo reset", body: "The baseline fictional dataset has been restored." });
      },

      update: (recipe) => set((s) => { recipe(s.data as DemoData); }),

      enqueue: (item) => set((s) => { s.syncQueue.push({ ...item, id: uid("sync"), queuedAt: nowIso(), status: "queued" }); }),

      addInbox: (item) => set((s) => { s.data.inbox.unshift({ ...item, id: uid("ib"), createdAt: nowIso(), status: "open" }); }),

      completeInbox: (id) => set((s) => { const i = s.data.inbox.find((x) => x.id === id); if (i) i.status = "done"; }),

      notify: (n) => set((s) => { s.data.notifications.unshift({ ...n, id: uid("nt"), at: nowIso(), read: false }); }),

      markNotificationsRead: (personaId, role) => set((s) => {
        s.data.notifications.forEach((n) => { if (n.toPersona === personaId || n.toRole === role) n.read = true; });
      }),

      logActivity: (e) => set((s) => { s.data.activity.unshift({ ...e, id: uid("ac"), at: nowIso() }); }),
    })),
    {
      name: "codebrave-demo-v1",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ data: s.data, personaId: s.personaId, offline: s.offline, syncQueue: s.syncQueue, lang: s.lang }),
    },
  ),
);
