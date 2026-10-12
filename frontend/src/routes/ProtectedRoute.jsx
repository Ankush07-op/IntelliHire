import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function ProtectedRoute() {
  const { isLoggedIn, user } = useAuth();

  // Not authenticated at all → redirect to recruiter login
  if (!isLoggedIn) {
    return <Navigate to="/recruiter/login" replace />;
  }

  // Authenticated but not a recruiter → redirect to recruiter login
  if (user?.role !== "recruiter") {
    return <Navigate to="/recruiter/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;