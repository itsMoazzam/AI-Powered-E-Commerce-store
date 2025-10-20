import React, { useState } from "react"
import api from "../../lib/api"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "../../store"
import { setAuth } from "../../store/auth"
// import { User } from "lucide-react"

export default function Login() {
    const dispatch = useDispatch<AppDispatch>()
    const [username, setusername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // inside Login component
    async function submit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            const { data } = await api.post("/api/auth/login/", { username, password })
            console.log("LOGIN RESPONSE:", data)

            // Defensive reads
            const token = data?.access ?? data?.token ?? null
            const user = data?.user ?? null
            const role = user?.role ?? data?.role ?? null

            if (!token || !user) {
                // Something returned but required fields missing
                setError("Login succeeded but server response was unexpected. Please try again.")
                // helpful debug line
                console.error("Login response missing token or user:", data)
                setLoading(false)
                return
            }

            // Save in Redux and localStorage using the robust setAuth reducer
            dispatch(setAuth({
                token,
                role,
                user,
            }))

            // Redirect immediately based on role/superuser (use user.is_superuser first)
            if (user?.is_superuser) {
                location.href = "/admin"
            } else if (role === "seller") {
                location.href = "/seller"
            } else {
                location.href = "/profile"
            }
        } catch (err) {
            console.error("Login error:", err)
            setError("Invalid username or password. Please try again.")
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 dark:from-zinc-900 dark:via-zinc-950 dark:to-black px-4">
            <div className="relative w-full max-w-md p-8 bg-white/10 dark:bg-zinc-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
                <h2 className="text-3xl font-bold text-center text-white mb-6 tracking-tight">
                    Welcome Back 👋
                </h2>
                <p className="text-center text-zinc-300 mb-8 text-sm">
                    Sign in to continue to your dashboard
                </p>

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label className="block text-sm text-zinc-200 mb-1">username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setusername(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-zinc-400 transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-200 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-zinc-400 transition-all"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm text-center">{error}</div>
                    )}

                    <button
                        className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 transform ${loading
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
                            }`}
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="text-center text-sm text-zinc-300 mt-6">
                    Don’t have an account?{" "}
                    <a
                        href="/register"
                        className="text-blue-400 hover:underline hover:text-blue-300 font-medium"
                    >
                        Create one
                    </a>
                </p>

                <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
        </div>
    )
}
