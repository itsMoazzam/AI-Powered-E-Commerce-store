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
    anchorRect?: { top: number; left: number; bottom: number; right: number; width: number; height: number } | null;
}

export default function LoginModal({ isOpen, onClose, anchorRect }: LoginModalProps) {
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

    // lock body scroll while modal is open
    React.useEffect(() => {
        const prev = document.body.style.overflow
        if (isOpen) document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = prev }
    }, [isOpen])

    if (!isOpen) return null;

    const isAnchored = Boolean((anchorRect) && (window.innerWidth >= 768))
    const anchoredStyle: React.CSSProperties | undefined = isAnchored && anchorRect ? {
        position: 'fixed',
        top: anchorRect.bottom + window.scrollY + 8,
        left: anchorRect.left + window.scrollX,
        zIndex: 99999,
        width: Math.min(360, anchorRect.width || 320)
    } : undefined

    return (
        <div>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Modal or anchored popover */}
            <div className="fixed inset-0 z-50 p-4 pointer-events-none">
                <div style={anchoredStyle} className={`${isAnchored ? 'pointer-events-auto' : 'mx-auto pointer-events-auto'} relative ${isAnchored ? '' : 'w-full max-w-md'}`}>
                    <div className="relative bg-white rounded-lg shadow-md p-6 text-gray-900 border border-zinc-200 transition" style={{ pointerEvents: 'auto' }}>
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition"
                            title="Close"
                        >
                            <X size={18} />
                        </button>

                        {/* Header */}
                        <h2 className="text-xl font-semibold text-center mb-1">
                            Sign in to your account
                        </h2>
                        <p className="text-center text-zinc-500 text-sm mb-6">
                            Enter your credentials to continue
                        </p>

                        {/* Login Form */}
                        {!forgotOpen ? (
                            <form onSubmit={submit} className="space-y-5">
                                {/* Username */}
                                <div>
                                    <label htmlFor="login-username" className="block text-sm text-gray-300 mb-1">Username</label>
                                    <input
                                        id="login-username"
                                        name="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="username"
                                        autoComplete="username"
                                        className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        required
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label htmlFor="login-password" className="block text-sm text-gray-300 mb-1">Password</label>
                                    <div className="relative">
                                        <input
                                            id="login-password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                            className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-3 text-gray-400 hover:text-gray-800 transition"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                                        className="text-sm text-indigo-600 hover:underline"
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
                                        className="text-indigo-600 hover:underline"
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
                                    <label htmlFor="fp-email" className="block text-xs text-gray-300 mb-1">Email</label>
                                    <input
                                        id="fp-email"
                                        name="fpEmail"
                                        value={fpEmail}
                                        onChange={(e) => setFpEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        className="w-full px-3 py-2 rounded bg-white border border-zinc-200 text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="fp-phone" className="block text-xs text-gray-300 mb-1">Mobile (optional)</label>
                                    <input
                                        id="fp-phone"
                                        name="fpPhone"
                                        value={fpPhone}
                                        onChange={(e) => setFpPhone(e.target.value)}
                                        placeholder="+1234567890"
                                        autoComplete="tel"
                                        className="w-full px-3 py-2 rounded bg-white border border-zinc-200 text-gray-900"
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
            </div>
        </div>
    )
}

