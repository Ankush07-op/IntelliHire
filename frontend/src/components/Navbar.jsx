import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/applicant/auth/AuthContext";

export default function Navbar() {
    const navigate = useNavigate();
    const { isAuthenticated, user, signOut } = useAuth();

    const handleSignOut = () => {
        signOut();
        navigate("/login");
    };

    return (
        <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-2">
                <Link to="/jobs" className="text-blue-700 font-bold text-lg mr-auto">
                    Careers
                </Link>

                <Link to="/jobs" className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-blue-700">
                    Jobs
                </Link>

                {isAuthenticated ? (
                    <>
                        <Link
                            to="/applications"
                            className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-blue-700"
                        >
                            My applications
                        </Link>
                        <Link
                            to="/profile"
                            className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-blue-700"
                        >
                            {user?.name || "Profile"}
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="px-3 py-1.5 text-sm font-semibold border border-slate-300 rounded-lg hover:bg-slate-50"
                        >
                            Sign out
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-blue-700">
                            Sign in
                        </Link>
                        <Link
                            to="/register"
                            className="px-3 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Create account
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}