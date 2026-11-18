import { create } from "zustand";
import { uid } from "@/lib/utils";

export interface Toast { id: string; tone: "info" | "success" | "warning" | "danger" | "ai"; title: string; body?: string }

interface UIState {
  toasts: Toast[];
  askOpen: boolean;
  askContext?: string;
  askPrompt?: string;
  searchOpen: boolean;
  personaPickerOpen: boolean;
  mobileNavOpen: boolean;
  setAsk: (open: boolean, context?: string, prompt?: string) => void;
  setSearch: (open: boolean) => void;
  setPersonaPicker: (open: boolean) => void;
  setMobileNav: (open: boolean) => void;
  dismiss: (id: string) => void;
}

export const useUI = create<UIState>()((set) => ({
  toasts: [],
  askOpen: false,
  searchOpen: false,
  personaPickerOpen: false,
  mobileNavOpen: false,
  setAsk: (open, context, prompt) => set({ askOpen: open, askContext: context, askPrompt: prompt }),
  setSearch: (open) => set({ searchOpen: open }),
  setPersonaPicker: (open) => set({ personaPickerOpen: open }),
  setMobileNav: (open) => set({ mobileNavOpen: open }),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function toast(t: Omit<Toast, "id">) {
  const id = uid("toast");
  useUI.setState((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
  window.setTimeout(() => useUI.getState().dismiss(id), 4200);
}
