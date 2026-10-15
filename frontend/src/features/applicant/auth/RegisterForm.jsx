import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "./authApi";
import { useAuth } from "./AuthContext";

export default function RegisterForm() {
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.name || !form.email || !form.password) {
            setError("Please fill in all fields.");
            return;
        }
        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            const data = await register(form);
            signIn(data);
            navigate("/jobs", { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 bg-white border border-slate-200 rounded-xl p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Create account</h1>

            {error && (
                <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                </div>
            )}

            <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
            <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jane Doe"
            />

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
                placeholder="At least 6 characters"
            />

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold rounded-lg py-2 hover:bg-blue-700 disabled:opacity-60"
            >
                {loading ? "Creating account..." : "Create account"}
            </button>

            <p className="text-sm text-slate-500 mt-4 text-center">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-700 font-medium">
                    Sign in
                </Link>
            </p>
        </form>
    );
}