import React, { useState } from "react";
import api from "../lib/api";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { setAuth } from "../store/auth";
import { Eye, EyeOff, X } from "lucide-react";
import { Link } from "react-router-dom";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [forgotOpen, setForgotOpen] = useState(false);
    const [fpEmail, setFpEmail] = useState("");
    const [fpPhone, setFpPhone] = useState("");
    const [fpLoading, setFpLoading] = useState(false);
    const [fpMessage, setFpMessage] = useState<string | null>(null);
    const [fpError, setFpError] = useState<string | null>(null);

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

            onClose();

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

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="relative w-full max-w-md bg-gray-800/90 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl p-8 text-white transform transition-all">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 text-gray-400 hover:text-white transition"
                        title="Close"
                    >
                        <X size={22} />
                    </button>

                    {/* Header */}
                    <h2 className="text-3xl font-extrabold text-center mb-2 tracking-tight">
                        Welcome Back 👋
                    </h2>
                    <p className="text-center text-gray-400 text-sm mb-8">
                        Sign in to access your dashboard
                    </p>

                    {/* Login Form */}
                    {!forgotOpen ? (
                        <form onSubmit={submit} className="space-y-5">
                            {/* Username */}
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
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

                            <div className="text-right mt-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setForgotOpen(true);
                                        setFpMessage(null);
                                        setFpError(null);
                                    }}
                                    className="text-sm text-blue-300 hover:underline"
                                >
                                    Forgot password?
                                </button>
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

                            {/* Sign Up Link */}
                            <p className="text-center text-sm text-gray-400">
                                Don't have an account?{" "}
                                <Link
                                    to="/auth/register"
                                    className="text-blue-400 hover:underline"
                                    onClick={onClose}
                                >
                                    Sign Up
                                </Link>
                            </p>
                        </form>
                    ) : (
                        /* Forgot Password Form */
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-300 mb-1">Email</label>
                                <input
                                    value={fpEmail}
                                    onChange={(e) => setFpEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full px-3 py-2 rounded bg-gray-700/60 border border-gray-600 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-300 mb-1">Mobile (optional)</label>
                                <input
                                    value={fpPhone}
                                    onChange={(e) => setFpPhone(e.target.value)}
                                    placeholder="+1234567890"
                                    className="w-full px-3 py-2 rounded bg-gray-700/60 border border-gray-600 text-white"
                                />
                            </div>

                            {fpMessage && <div className="text-sm text-green-400">{fpMessage}</div>}
                            {fpError && <div className="text-sm text-red-400">{fpError}</div>}

                            <div className="flex items-center gap-2 mt-4">
                                <button
                                    onClick={async () => {
                                        setFpLoading(true);
                                        setFpMessage(null);
                                        setFpError(null);
                                        try {
                                            let anySent = false;
                                            if (fpEmail && fpEmail.trim()) {
                                                try {
                                                    await api.post("/api/auth/password-reset/", { email: fpEmail.trim() });
                                                    anySent = true;
                                                } catch (e) {
                                                    console.warn("email reset failed", e);
                                                }
                                            }

                                            if (fpPhone && fpPhone.trim()) {
                                                try {
                                                    await api.post("/api/auth/password-reset-sms/", { phone: fpPhone.trim() });
                                                    anySent = true;
                                                } catch (e) {
                                                    console.warn("sms reset failed", e);
                                                }
                                            }

                                            if (!anySent) {
                                                setFpError("Could not send reset. Please check your details or try again later.");
                                            } else {
                                                setFpMessage("If an account exists we sent reset instructions. Check your email and SMS.");
                                            }
                                        } catch (err) {
                                            console.error("Forgot password error", err);
                                            setFpError("Unexpected error. Please try again later.");
                                        } finally {
                                            setFpLoading(false);
                                        }
                                    }}
                                    disabled={fpLoading}
                                    className={`px-4 py-2 rounded font-medium text-sm ${fpLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                >
                                    {fpLoading ? "Sending..." : "Send Reset"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForgotOpen(false)}
                                    className="px-4 py-2 rounded font-medium text-sm border border-gray-600 hover:bg-gray-700/50"
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
