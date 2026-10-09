import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function ProtectedRoute() {
  const { isLoggedIn, user } = useAuth();

  // Not authenticated at all → redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but wrong role → redirect to login
  if (user?.role !== "recruiter") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;