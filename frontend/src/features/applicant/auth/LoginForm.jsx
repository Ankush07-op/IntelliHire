import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { login } from "./authApi";
import { useAuth } from "./AuthContext";

export default function LoginForm() {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.email || !form.password) {
            setError("Please fill in both fields.");
            return;
        }

        setLoading(true);
        try {
            const data = await login(form);
            signIn(data);
            const redirectTo = location.state?.from?.pathname || "/jobs";
            navigate(redirectTo, { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 bg-white border border-slate-200 rounded-xl p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h1>
            <p className="text-sm text-slate-500 mb-6">
                Try <span className="font-mono">demo@test.com</span> /{" "}
                <span className="font-mono">password123</span>
            </p>

            {error && (
                <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                </div>
            )}

            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
            />

            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
            />

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold rounded-lg py-2 hover:bg-blue-700 disabled:opacity-60"
            >
                {loading ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-sm text-slate-500 mt-4 text-center">
                No account?{" "}
                <Link to="/register" className="text-blue-700 font-medium">
                    Create one
                </Link>
            </p>
        </form>
    );
}