import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

import Dashboard from "./pages/dashboard/Dashboard";
import Jobs from "./pages/jobs/Jobs";
import Applications from "./pages/applications/Applications";
import Ranking from "./pages/ranking/Ranking";

import RecruiterLogin from "./pages/auth/RecruiterLogin";
import RecruiterRegister from "./pages/auth/RecruiterRegister";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<RecruiterLogin />} />
      <Route path="/register" element={<RecruiterRegister />} />

      {/* Protected Recruiter Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="applications" element={<Applications />} />
          <Route path="ranking" element={<Ranking />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;