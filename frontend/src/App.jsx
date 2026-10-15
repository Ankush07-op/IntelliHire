import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import RecruiterLogin from "./pages/auth/RecruiterLogin";
import RecruiterRegister from "./pages/auth/RecruiterRegister";
import Dashboard from "./pages/dashboard/Dashboard";
import Jobs from "./pages/jobs/Jobs";
import Applications from "./pages/applications/Applications";
import Kanban from "./pages/kanban/Kanban";
import Ranking from "./pages/ranking/Ranking";
import Interviews from "./pages/interviews/Interviews";
import RecruiterProtectedRoute from "./routes/ProtectedRoute";

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
      {/* Recruiter authentication */}
      <Route path="/recruiter/login" element={<RecruiterLogin />} />
      <Route path="/recruiter/register" element={<RecruiterRegister />} />

      {/* Recruiter portal */}
      <Route element={<RecruiterProtectedRoute />}>
        <Route path="/recruiter" element={<MainLayout />}>
          <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="applications" element={<Applications />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="ranking" element={<Ranking />} />
          <Route path="interviews" element={<Interviews />} />
        </Route>
      </Route>

      {/* Applicant portal */}
      <Route element={<ApplicantLayout />}>
        <Route path="/" element={<Navigate to="/jobs" replace />} />
        <Route path="/jobs" element={<JobBoardPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ApplicantProtectedRoute />}>
          <Route path="/jobs/:id/apply" element={<ApplyPage />} />
          <Route path="/my-applications" element={<MyApplicationsPage />} />
          <Route path="/applications" element={<MyApplicationsPage />} />
          <Route path="/applications/:id" element={<ApplicationDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/jobs" replace />} />
    </Routes>
  );
}

export default App;
