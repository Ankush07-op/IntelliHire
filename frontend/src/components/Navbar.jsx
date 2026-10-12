import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const baseLink = "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors";
const activeLink = "text-blue-700 bg-blue-50";
const inactiveLink = "text-slate-700 hover:text-blue-700 hover:bg-slate-50";

// NavLink calls this with { isActive } and uses the returned string as className
const navClass = ({ isActive }) =>
    `${baseLink} ${isActive ? activeLink : inactiveLink}`;

export default function Navbar() {
    const navigate = useNavigate();
    const { isAuthenticated, user, signOut } = useAuth();

    const handleSignOut = () => {
        signOut();
        navigate("/login");
    };

    return (
        <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-1">
                <Link to="/jobs" className="text-blue-700 font-bold text-lg mr-auto">
                    IntelliHire <span className="text-xs font-normal text-slate-500 ml-1">Careers</span>
                </Link>

                <NavLink to="/jobs" className={navClass}>
                    Jobs
                </NavLink>

                {isAuthenticated ? (
                    <>
                        {user?.role === "recruiter" ? (
                            <Link
                                to="/dashboard"
                                className="ml-1 px-3 py-1.5 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Recruiter Portal
                            </Link>
                        ) : (
                            <>
                                <NavLink to="/my-applications" className={navClass}>
                                    My applications
                                </NavLink>
                                <NavLink to="/profile" className={navClass}>
                                    {user?.name || "Profile"}
                                </NavLink>
                            </>
                        )}
                        <button
                            onClick={handleSignOut}
                            className="ml-1 px-3 py-1.5 text-sm font-semibold border border-slate-300 rounded-lg hover:bg-slate-50"
                        >
                            Sign out
                        </button>
                    </>
                ) : (
                    <>
                        <NavLink to="/login" className={navClass}>
                            Sign in
                        </NavLink>
                        <Link
                            to="/register"
                            className="ml-1 px-3 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Create account
                        </Link>
                        <Link
                            to="/recruiter/login"
                            className="ml-2 text-xs text-slate-500 hover:text-indigo-600 font-medium"
                        >
                            Recruiter Portal &rarr;
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}