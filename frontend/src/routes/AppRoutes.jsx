import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import JobBoardPage from "../pages/JobBoardPage";
import JobDetailPage from "../pages/JobDetailPage";
import ApplyPage from "../pages/ApplyPage";
import MyApplicationsPage from "../pages/MyApplicationsPage";
import ApplicationDetailPage from "../pages/ApplicationDetailPage";
import ProfilePage from "../pages/ProfilePage";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/jobs" replace />} />

            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/jobs" element={<JobBoardPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />

            {/* Applicant only */}
            <Route element={<ProtectedRoute />}>
                <Route path="/jobs/:id/apply" element={<ApplyPage />} />
                <Route path="/applications" element={<MyApplicationsPage />} />
                <Route path="/applications/:id" element={<ApplicationDetailPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<h1 className="text-2xl font-bold">Page not found</h1>} />
        </Routes>
    );
}