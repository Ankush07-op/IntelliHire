import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const baseLink = "px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150";
const activeLink = "text-indigo-600 bg-indigo-50 font-semibold shadow-xs";
const inactiveLink = "text-slate-600 hover:text-indigo-600 hover:bg-slate-100";

const navClass = ({ isActive }) =>
    `${baseLink} ${isActive ? activeLink : inactiveLink}`;

const mobileNavClass = ({ isActive }) =>
    `block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive ? "text-indigo-600 bg-indigo-50 font-semibold" : "text-slate-700 hover:bg-slate-100"
    }`;

export default function Navbar() {
    const navigate = useNavigate();
    const { isAuthenticated, user, signOut } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSignOut = () => {
        signOut();
        navigate("/login");
    };

    const handleMobileSignOut = () => {
        setMobileMenuOpen(false);
        handleSignOut();
    };

    return (
        <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
                <Link to="/jobs" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
                        I
                    </div>
                    <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                        IntelliHire
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full ml-1.5 border border-indigo-100">
                            Careers
                        </span>
                    </span>
                </Link>

                {/* Desktop Navigation Links */}
                <nav className="hidden md:flex items-center gap-2">
                    <NavLink to="/jobs" className={navClass}>
                        Browse Jobs
                    </NavLink>

                    {isAuthenticated ? (
                        <>
                            {user?.role === "recruiter" ? (
                                <Link
                                    to="/dashboard"
                                    className="ml-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-700 hover:to-violet-700 shadow-sm transition-all"
                                >
                                    Recruiter Dashboard ↗
                                </Link>
                            ) : (
                                <>
                                    <NavLink to="/my-applications" className={navClass}>
                                        My Applications
                                    </NavLink>
                                    <NavLink to="/profile" className={navClass}>
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                                                {(user?.name || "C").charAt(0).toUpperCase()}
                                            </span>
                                            {user?.name || "Profile"}
                                        </span>
                                    </NavLink>
                                </>
                            )}
                            <button
                                onClick={handleSignOut}
                                className="ml-2 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
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
                                className="ml-1 px-4 py-1.5 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-xs transition-colors"
                            >
                                Create Account
                            </Link>
                            <Link
                                to="/recruiter/login"
                                className="ml-2 text-xs text-slate-500 hover:text-indigo-600 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                            >
                                Recruiter Portal &rarr;
                            </Link>
                        </>
                    )}
                </nav>

                {/* Mobile Hamburger Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    type="button"
                    className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Toggle mobile navigation menu"
                >
                    {mobileMenuOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Slide-Down Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-200/80 bg-white/98 backdrop-blur-md px-4 py-3 space-y-2 shadow-lg">
                    <NavLink
                        to="/jobs"
                        onClick={() => setMobileMenuOpen(false)}
                        className={mobileNavClass}
                    >
                        Browse Jobs
                    </NavLink>

                    {isAuthenticated ? (
                        <>
                            {user?.role === "recruiter" ? (
                                <Link
                                    to="/dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-3 py-2 text-sm font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 rounded-lg"
                                >
                                    Recruiter Dashboard ↗
                                </Link>
                            ) : (
                                <>
                                    <NavLink
                                        to="/my-applications"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={mobileNavClass}
                                    >
                                        My Applications
                                    </NavLink>
                                    <NavLink
                                        to="/profile"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={mobileNavClass}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                                                {(user?.name || "C").charAt(0).toUpperCase()}
                                            </span>
                                            {user?.name || "Profile"}
                                        </span>
                                    </NavLink>
                                </>
                            )}
                            <div className="pt-2 border-t border-slate-100">
                                <button
                                    onClick={handleMobileSignOut}
                                    className="w-full text-left px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                    Sign out
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="pt-2 border-t border-slate-100 space-y-2">
                            <NavLink
                                to="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className={mobileNavClass}
                            >
                                Sign in
                            </NavLink>
                            <Link
                                to="/register"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block w-full text-center px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-xs"
                            >
                                Create Account
                            </Link>
                            <Link
                                to="/recruiter/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-center text-xs text-slate-500 hover:text-indigo-600 font-medium py-1.5 rounded hover:bg-slate-50"
                            >
                                Recruiter Portal &rarr;
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}