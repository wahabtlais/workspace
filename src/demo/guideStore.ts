import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface GuideState {
  scenarioId?: string;
  step: number;
  minimized: boolean;
  completed: string[];
  start: (id: string) => void;
  setStep: (n: number) => void;
  setMinimized: (m: boolean) => void;
  finish: () => void;
  exit: () => void;
}

export const useGuide = create<GuideState>()(
  persist(
    (set) => ({
      step: 0,
      minimized: false,
      completed: [],
      start: (id) => set({ scenarioId: id, step: 0, minimized: false }),
      setStep: (n) => set({ step: n }),
      setMinimized: (m) => set({ minimized: m }),
      finish: () => set((s) => ({ completed: s.scenarioId && !s.completed.includes(s.scenarioId) ? [...s.completed, s.scenarioId] : s.completed })),
      exit: () => set({ scenarioId: undefined, step: 0 }),
    }),
    { name: "codebrave-guide-v1", storage: createJSONStorage(() => sessionStorage) },
  ),
);
