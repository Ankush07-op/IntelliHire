import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

import Dashboard from "./pages/dashboard/Dashboard";
import Jobs from "./pages/jobs/Jobs";
import Applications from "./pages/applications/Applications";
import Ranking from "./pages/ranking/Ranking";

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/jobs"
          element={<Jobs />}
        />

        <Route
          path="/applications"
          element={<Applications />}
        />

        <Route
          path="/ranking"
          element={<Ranking />}
        />
      </Routes>
    </MainLayout>
  );
}

export default App;