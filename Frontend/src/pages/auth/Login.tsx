import React, { useState } from "react";
import api from "../../lib/api";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { setAuth } from "../../store/auth";
import { Eye, EyeOff, X } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
    const dispatch = useDispatch<AppDispatch>();
    const [username, setusername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const { data } = await api.post("/api/auth/login/", { username, password });
            const token = data?.access ?? data?.token ?? null;
            const user = data?.user ?? null;
            const role = user?.role ?? data?.role ?? null;

            if (!token || !user) {
                setError("Unexpected server response. Please try again.");
                console.error("Missing token/user:", data);
                setLoading(false);
                return;
            }

            dispatch(setAuth({ token, role, user }));

            if (user?.is_superuser) location.href = "/admin";
            else if (role === "seller") location.href = "/seller";
            else location.href = "/profile";
        } catch (err) {
            console.error("Login error:", err);
            setError("Invalid username or password. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900/10 via-gray-900/40 to-black relative overflow-hidden p-[1px]">
            {/* Decorative Glow Circles */}
            <div className="absolute w-72 h-72 bg-blue-600/30 rounded-full blur-3xl top-20 left-20 animate-pulse" />
            <div className="absolute w-72 h-72 bg-purple-600/30 rounded-full blur-3xl bottom-20 right-20 animate-pulse delay-300" />

            <div className="relative z-10 w-full max-w-md bg-gray-800/70 backdrop-blur-xl border border-gray-700 rounded-3xl shadow-2xl p-8 text-white transform transition-all duration-300 hover:scale-[1.01]">
                {/* Close Icon */}
                <button
                    onClick={() => (window.location.href = "/")}
                    className="absolute top-5 right-5 text-gray-400 hover:text-white transition"
                >
                    <X size={22} />
                </button>

                <h2 className="text-3xl font-extrabold text-center mb-2 tracking-tight">
                    Welcome Back 👋
                </h2>
                <p className="text-center text-gray-400 text-sm mb-8">
                    Sign in to access your dashboard
                </p>

                <form onSubmit={submit} className="space-y-5">
                    {/* Username */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setusername(e.target.value)}
                            placeholder="username"
                            className="w-full px-4 py-3 rounded-xl bg-gray-700/70 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl bg-gray-700/70 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3 text-gray-400 hover:text-white transition"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg ${loading
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-700/40 active:scale-[0.98]"
                            }`}
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                {/* Continue with Google */}
                <div className="mt-4 flex items-center justify-center">
                    <GoogleLogin
                        onSuccess={async (credentialResponse) => {
                            const credential = (credentialResponse as any)?.credential;
                            if (!credential) return;
                            setError("");
                            try {
                                // send credential to backend for verification / login
                                const { data } = await api.post("/api/auth/google-login/", { credential });
                                const token = data?.access ?? data?.token ?? null;
                                const user = data?.user ?? null;
                                const role = user?.role ?? data?.role ?? null;

                                if (!token || !user) {
                                    setError("Unexpected server response from Google sign-in. Please try regular login.");
                                    // no-op
                                    return;
                                }

                                dispatch(setAuth({ token, role, user }));

                                if (user?.is_superuser) location.href = "/admin";
                                else if (role === "seller") location.href = "/seller";
                                else location.href = "/profile";
                            } catch (err) {
                                console.error("Google login error:", err);
                                setError("Google sign-in failed. Please try again or use regular login.");
                            }
                        }}
                        onError={() => {
                            setError("Google sign-in failed. Please try again.");
                        }}
                    />
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-400 mt-6">
                    Don’t have an account?{" "}
                    <a
                        href="/register"
                        className="text-blue-400 hover:text-blue-300 hover:underline font-medium"
                    >
                        Create one
                    </a>
                </p>
            </div>
        </div>
    );
}
