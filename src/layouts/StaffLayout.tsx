import { Outlet } from "react-router";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopBar } from "@/components/shell/TopBar";
import { AskPanel } from "@/components/shell/AskPanel";
import { GlobalSearch } from "@/components/shell/GlobalSearch";
import { useDemo } from "@/store/demoStore";
import { usePersona } from "@/store/hooks";
import { SurfaceMismatch } from "./SurfaceMismatch";

export function StaffLayout() {
  const persona = usePersona();
  const resetCount = useDemo((s) => s.resetCount);
  return (
    <div className="flex min-h-[calc(100vh-40px)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main key={`${persona.id}-${resetCount}`} className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 animate-fade-in sm:px-6 lg:px-8">
          {persona.surface === "staff" ? <Outlet /> : <SurfaceMismatch target="staff" />}
        </main>
      </div>
      <AskPanel />
      <GlobalSearch />
    </div>
  );
}
