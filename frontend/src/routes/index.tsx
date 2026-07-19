import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LandingLayout } from "@/components/layout/LandingLayout";

// Lazy loaded pages
const LandingPage = lazy(() => import("@/pages/LandingPage").then(m => ({ default: m.LandingPage })));
const DashboardPage = lazy(() => import("@/pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const JobUploadPage = lazy(() => import("@/pages/JobUploadPage").then(m => ({ default: m.JobUploadPage })));
const ResumeUploadPage = lazy(() => import("@/pages/ResumeUploadPage").then(m => ({ default: m.ResumeUploadPage })));
const CandidateRankingPage = lazy(() => import("@/pages/CandidateRankingPage").then(m => ({ default: m.CandidateRankingPage })));
const CandidateDetailsPage = lazy(() => import("@/pages/CandidateDetailsPage").then(m => ({ default: m.CandidateDetailsPage })));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage").then(m => ({ default: m.AnalyticsPage })));
const ReportsPage = lazy(() => import("@/pages/ReportsPage").then(m => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import("@/pages/SettingsPage").then(m => ({ default: m.SettingsPage })));
const AIDashboard = lazy(() => import("@/pages/AIDashboard").then(m => ({ default: m.AIDashboard })));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));
const LoginPage = lazy(() => import("@/pages/LoginPage").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("@/pages/RegisterPage").then(m => ({ default: m.RegisterPage })));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-gray-50 text-blue-600 font-medium">Loading...</div>}>
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <LandingLayout>
        <SuspenseWrapper><LandingPage /></SuspenseWrapper>
      </LandingLayout>
    ),
  },
  {
    path: "/login",
    element: <SuspenseWrapper><LoginPage /></SuspenseWrapper>,
  },
  {
    path: "/register",
    element: <SuspenseWrapper><RegisterPage /></SuspenseWrapper>,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <SuspenseWrapper><DashboardPage /></SuspenseWrapper>,
      },
      {
        path: "job-description",
        element: <SuspenseWrapper><JobUploadPage /></SuspenseWrapper>,
      },
      {
        path: "upload",
        element: <SuspenseWrapper><ResumeUploadPage /></SuspenseWrapper>,
      },
      {
        path: "candidates",
        element: <SuspenseWrapper><CandidateRankingPage /></SuspenseWrapper>,
      },
      {
        path: "candidate/:id",
        element: <SuspenseWrapper><CandidateDetailsPage /></SuspenseWrapper>,
      },
      {
        path: "analytics",
        element: <SuspenseWrapper><AnalyticsPage /></SuspenseWrapper>,
      },
      {
        path: "reports",
        element: <SuspenseWrapper><ReportsPage /></SuspenseWrapper>,
      },
      {
        path: "settings",
        element: <SuspenseWrapper><SettingsPage /></SuspenseWrapper>,
      },
      {
        path: "ai",
        element: <SuspenseWrapper><AIDashboard /></SuspenseWrapper>,
      },
    ],
  },
  {
    path: "*",
    element: <SuspenseWrapper><NotFoundPage /></SuspenseWrapper>,
  }
]);
