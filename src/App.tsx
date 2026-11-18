import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import { TooltipProvider } from "@/components/ui/overlay";
import { PrototypeBar } from "@/components/shell/PrototypeBar";
import { PersonaSwitcher } from "@/components/shell/PersonaSwitcher";
import { Toaster } from "@/components/shell/Toaster";
import { StaffLayout } from "@/layouts/StaffLayout";
import { PortalLayout } from "@/layouts/PortalLayout";
import { PARTNER_NAV, STUDENT_NAV, TEACHER_NAV, TF_NAV } from "@/config/navigation";
import { usePersona } from "@/store/hooks";
import Home from "@/pages/staff/Home";
import Inbox from "@/pages/staff/Inbox";
import SectionPage from "@/pages/SectionPage";
import StudentHome from "@/pages/portals/StudentHome";
import TFHome from "@/pages/portals/TFHome";
import TeacherToday from "@/pages/portals/TeacherToday";
import PartnerHome from "@/pages/portals/PartnerHome";
import PortalSection from "@/pages/portals/PortalSection";
import { staffRoutes } from "@/routes";
import { FieldLayout } from "@/pages/field/FieldLayout";
import { FieldToday } from "@/pages/field/FieldToday";
import { FieldVisit } from "@/pages/field/FieldVisit";
import { FieldAttendance, FieldSchools } from "@/pages/field/FieldMore";
import { FieldForms, FieldSync } from "@/pages/field/FieldMore2";
import DemoCenter from "@/demo/DemoCenter";
import { GuidePanel } from "@/demo/GuidePanel";
import { partnerRoutes, studentRoutes, teacherRoutes, tfRoutes } from "@/routes/portals";

function Root() {
  return (
    <TooltipProvider>
      <PrototypeBar />
      <Outlet />
      <PersonaSwitcher />
      <GuidePanel />
      <Toaster />
    </TooltipProvider>
  );
}

function PartnerLayout() {
  const p = usePersona();
  const key = p.role === "client" || p.role === "host" || p.role === "donor" ? p.role : "client";
  const title = { client: "Partner Access · Client", host: "Partner Access · Internship host", donor: "Partner Access · Donor" }[key];
  return <PortalLayout surface="partner" title={title} nav={PARTNER_NAV[key]} />;
}

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: "/", element: <StaffLayout />, children: [{ index: true, element: <Home /> }, { path: "inbox", element: <Inbox /> }, ...staffRoutes, { path: "*", element: <SectionPage /> }] },
      { path: "/student", element: <PortalLayout surface="student" title="Future Builders · Student Portal" nav={STUDENT_NAV} />, children: [{ index: true, element: <StudentHome /> }, ...studentRoutes, { path: "*", element: <PortalSection /> }] },
      { path: "/tf", element: <PortalLayout surface="tf" title="TF Learning Portal" nav={TF_NAV} />, children: [{ index: true, element: <TFHome /> }, ...tfRoutes, { path: "*", element: <PortalSection /> }] },
      { path: "/teacher", element: <PortalLayout surface="teacher" title="Class Teacher" nav={TEACHER_NAV} bilingual />, children: [{ index: true, element: <TeacherToday /> }, ...teacherRoutes, { path: "*", element: <PortalSection /> }] },
      { path: "/field", element: <FieldLayout />, children: [{ index: true, element: <FieldToday /> }, { path: "visit/:id", element: <FieldVisit /> }, { path: "schools", element: <FieldSchools /> }, { path: "attendance", element: <FieldAttendance /> }, { path: "forms", element: <FieldForms /> }, { path: "sync", element: <FieldSync /> }] },
      { path: "/demo", element: <DemoCenter /> },
      { path: "/partner", element: <PartnerLayout />, children: [{ index: true, element: <PartnerHome /> }, ...partnerRoutes, { path: "*", element: <PortalSection /> }] },
    ],
  },
], { basename: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" });

export default function App() {
  return <RouterProvider router={router} />;
}
