import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Layout components
import MainLayout from "./components/layout/MainLayout";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Recruiter Pages & Route Guard
import RecruiterLogin from "./pages/auth/RecruiterLogin";
import RecruiterRegister from "./pages/auth/RecruiterRegister";
import Dashboard from "./pages/dashboard/Dashboard";
import Jobs from "./pages/jobs/Jobs";
import Applications from "./pages/applications/Applications";
import Kanban from "./pages/kanban/Kanban";
import Ranking from "./pages/ranking/Ranking";
import RecruiterProtectedRoute from "./routes/ProtectedRoute";

// Applicant Pages & Route Guard
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import JobBoardPage from "./pages/JobBoardPage";
import JobDetailPage from "./pages/JobDetailPage";
import ApplyPage from "./pages/ApplyPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import ApplicationDetailPage from "./pages/ApplicationDetailPage";
import ProfilePage from "./pages/ProfilePage";
import ApplicantProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function ApplicantLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* 1. Recruiter Public Auth Routes */}
      <Route path="/recruiter/login" element={<RecruiterLogin />} />
      <Route path="/recruiter/register" element={<RecruiterRegister />} />

      {/* 2. Recruiter Protected Routes (MainLayout with Sidebar & Navigation) */}
      <Route element={<RecruiterProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/recruiter/jobs" element={<Jobs />} />
          <Route path="/recruiter/applications" element={<Applications />} />
          <Route path="/kanban" element={<Kanban />} />
          <Route path="/ranking" element={<Ranking />} />
        </Route>
      </Route>

      {/* 3. Applicant Public & Protected Routes (ApplicantLayout with Navbar & Footer) */}
      <Route element={<ApplicantLayout />}>
        <Route index element={<Navigate to="/jobs" replace />} />

        {/* Public Applicant Routes */}
        <Route path="jobs" element={<JobBoardPage />} />
        <Route path="jobs/:id" element={<JobDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Protected Applicant Routes */}
        <Route element={<ApplicantProtectedRoute />}>
          <Route path="jobs/:id/apply" element={<ApplyPage />} />
          <Route path="my-applications" element={<MyApplicationsPage />} />
          <Route path="applications" element={<MyApplicationsPage />} />
          <Route path="applications/:id" element={<ApplicationDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* 4. Fallback */}
      <Route path="*" element={<Navigate to="/jobs" replace />} />
    </Routes>
  );
}

export default App;