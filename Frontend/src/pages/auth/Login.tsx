import React, { useState } from "react";
import api from "../../lib/api";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { setAuth } from "../../store/auth";
import { Eye, EyeOff, X } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_PROVIDER_PRESENT = typeof window !== 'undefined' && !!(window as any).__GOOGLE_OAUTH_PROVIDER__;

export default function Login() {
    const dispatch = useDispatch<AppDispatch>();
    const [username, setusername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [forgotOpen, setForgotOpen] = useState(false)
    const [fpEmail, setFpEmail] = useState("")
    const [fpPhone, setFpPhone] = useState("")
    const [fpLoading, setFpLoading] = useState(false)
    const [fpMessage, setFpMessage] = useState<string | null>(null)
    const [fpError, setFpError] = useState<string | null>(null)


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

                    <div className="text-right mt-1">
                        <button type="button" onClick={() => { setForgotOpen(true); setFpMessage(null); setFpError(null) }} className="text-sm text-blue-300 hover:underline">Forgot password?</button>
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

                {/* Forgot password modal */}
                {forgotOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setForgotOpen(false)} />
                        <div className="relative z-10 w-full max-w-md bg-gray-800/90 border border-gray-700 rounded-2xl p-6 text-white">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-lg font-semibold">Reset Password</h3>
                                <button onClick={() => setForgotOpen(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
                            </div>

                            <p className="text-sm text-gray-300 mb-4">Enter your email and/or mobile number. We'll send a password reset link to your email and an SMS with a reset link/code to your phone if available.</p>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs text-gray-300 mb-1">Email</label>
                                    <input value={fpEmail} onChange={(e) => setFpEmail(e.target.value)} placeholder="you@example.com" className="w-full px-3 py-2 rounded bg-gray-700/60 border border-gray-600 text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-300 mb-1">Mobile (optional)</label>
                                    <input value={fpPhone} onChange={(e) => setFpPhone(e.target.value)} placeholder="+1234567890" className="w-full px-3 py-2 rounded bg-gray-700/60 border border-gray-600 text-white" />
                                </div>

                                {fpMessage && <div className="text-sm text-green-400">{fpMessage}</div>}
                                {fpError && <div className="text-sm text-red-400">{fpError}</div>}

                                <div className="flex items-center gap-2 mt-2">
                                    <button
                                        onClick={async () => {
                                            setFpLoading(true)
                                            setFpMessage(null)
                                            setFpError(null)
                                            try {
                                                let anySent = false
                                                if (fpEmail && fpEmail.trim()) {
                                                    try {
                                                        await api.post('/api/auth/password-reset/', { email: fpEmail.trim() })
                                                        anySent = true
                                                    } catch (e) {
                                                        // capture but continue to try sms
                                                        console.warn('email reset failed', e)
                                                    }
                                                }

                                                if (fpPhone && fpPhone.trim()) {
                                                    try {
                                                        await api.post('/api/auth/password-reset-sms/', { phone: fpPhone.trim() })
                                                        anySent = true
                                                    } catch (e) {
                                                        console.warn('sms reset failed', e)
                                                    }
                                                }

                                                if (!anySent) {
                                                    setFpError('Could not send reset. Please check your details or try again later.')
                                                } else {
                                                    setFpMessage('If an account exists we sent reset instructions. Check your email and SMS.')
                                                }
                                            } catch (err) {
                                                console.error('Forgot password error', err)
                                                setFpError('Unexpected error. Please try again later.')
                                            } finally {
                                                setFpLoading(false)
                                            }
                                        }}
                                        disabled={fpLoading}
                                        className={`px-4 py-2 rounded font-medium ${fpLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                                    >
                                        {fpLoading ? 'Sending...' : 'Send Reset'}
                                    </button>
                                    <button onClick={() => setForgotOpen(false)} className="px-3 py-2 rounded border border-gray-600">Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Continue with Google */}
                <div className="mt-4 flex items-center justify-center">
                    {GOOGLE_CLIENT_ID && GOOGLE_PROVIDER_PRESENT ? (
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
                                const origin = typeof window !== 'undefined' ? window.location.origin : 'unknown'
                                console.error('[GoogleLogin] onError - current origin:', origin)
                                setError("Google sign-in failed. Possible cause: 'The given origin is not allowed for the given client ID'.\nPlease add your app origin (for example, http://localhost:5173) to the OAuth client's 'Authorized JavaScript origins' in Google Cloud Console. See project docs: GOOGLE_OAUTH_FIX.md")
                            }}
                        />
                    ) : (
                        <div className="text-xs text-muted">Google sign-in currently unavailable (provider not enabled).</div>
                    )}
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
