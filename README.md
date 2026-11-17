# CodeBrave Platform: Interactive Prototype

A complete, navigable prototype of the CodeBrave platform for stakeholder review. Front-end only, with a simulated backend and **fictional data**.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173 (use --port to change)
npm run build      # typecheck + production build
```

## What is in place (Phase A)

- **Four connected experiences + Class Teacher surface** on one shared data store: Staff Workspace, Future Builders Student Portal, TF Learning Portal, Partner Access (client / host / donor), and a restricted bilingual Class Teacher experience.
- **Persona switcher** (20 fictional personas) in the prototype bar; navigation, home screens and data change by role.
- **Role × scope × data-class access model** (`src/config/access.ts`), including restricted pupil attendance and safeguarding.
- **Simulated offline mode + sync queue**, **Reset demo**, session-persistent state (sessionStorage).
- **Unified Inbox**, notifications, permission-aware global search (Ctrl K), **Ask CodeBrave** panel with scripted AI and proposed actions.
- English by default; **Arabic / RTL** on school-teacher pages only.
- Every workspace route from the architecture report exists and is access-checked; working screens are built in Phase B/C.

## Structure

```
src/
  data/types.ts        shared domain model
  data/seed/           deterministic fictional dataset (buildSeed)
  store/               zustand store (persist, offline queue, reset) + hooks
  config/              personas, access matrix, navigation
  components/          ui primitives, shell (sidebar, top bar, Ask panel…)
  layouts/             Staff and portal layouts
  pages/               staff and portal pages
  ai/scripts.ts        scripted AI responses over fictional data
```

The demo date is fixed at 17 Nov 2026 so the dataset stays coherent.
