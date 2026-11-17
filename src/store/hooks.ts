import { useMemo } from "react";
import { getPersona } from "@/config/personas";
import type { DemoData, InboxItem, Persona } from "@/data/types";
import { useDemo } from "./demoStore";

export function usePersona(): Persona {
  const id = useDemo((s) => s.personaId);
  return getPersona(id);
}

export function useData(): DemoData {
  return useDemo((s) => s.data);
}

export function isForPersona(item: { toRole?: string; toPersona?: string }, p: Persona) {
  if (item.toPersona) return item.toPersona === p.id;
  // Role-addressed items reach staff holding that role (learner/partner items are always persona-addressed)
  return p.surface === "staff" && item.toRole === p.role;
}

export function useInbox(): InboxItem[] {
  const p = usePersona();
  const inbox = useDemo((s) => s.data.inbox);
  return useMemo(() => inbox.filter((i) => isForPersona(i, p)), [inbox, p]);
}

export function useOpenInboxCount() {
  return useInbox().filter((i) => i.status === "open").length;
}

export function useNotifications() {
  const p = usePersona();
  const list = useDemo((s) => s.data.notifications);
  return useMemo(() => list.filter((n) => isForPersona(n, p)), [list, p]);
}

/** Simple lookup helpers bound to the current dataset. */
export function useLookup() {
  const data = useData();
  return useMemo(() => {
    const staff = new Map(data.staff.map((x) => [x.id, x]));
    const schools = new Map(data.schools.map((x) => [x.id, x]));
    const tfs = new Map(data.tfs.map((x) => [x.id, x]));
    const teachers = new Map(data.schoolTeachers.map((x) => [x.id, x]));
    const students = new Map(data.students.map((x) => [x.id, x]));
    const classes = new Map(data.classes.map((x) => [x.id, x]));
    const orgs = new Map(data.organizations.map((x) => [x.id, x]));
    const person = (id?: string) => {
      if (!id) return "—";
      return staff.get(id)?.name ?? tfs.get(id)?.name ?? teachers.get(id)?.name ?? students.get(id)?.name ?? id;
    };
    const className = (id: string) => {
      const c = classes.get(id);
      return c ? `Grade ${c.grade}-${c.section}` : id;
    };
    return { staff, schools, tfs, teachers, students, classes, orgs, person, className };
  }, [data]);
}
