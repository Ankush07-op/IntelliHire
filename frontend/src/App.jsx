import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

import Dashboard from "./pages/dashboard/Dashboard";
import Jobs from "./pages/jobs/Jobs";
import Applications from "./pages/applications/Applications";
import Ranking from "./pages/ranking/Ranking";

import RecruiterLogin from "./pages/auth/RecruiterLogin";
import RecruiterRegister from "./pages/auth/RecruiterRegister";

function App() {
  return (
    <Routes>
      {/* Authentication Routes */}
      <Route path="/login" element={<RecruiterLogin />} />
      <Route path="/register" element={<RecruiterRegister />} />

      {/* Recruiter Portal */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="dashboard" element={<Dashboard />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="applications" element={<Applications />} />
        <Route path="ranking" element={<Ranking />} />
      </Route>
    </Routes>
  );
}

export default App;