import { useState, useEffect } from "react"
import { LayoutDashboard, CreditCard, MessageSquare, Server, Users, BarChart3, Settings, LogOut, Sun, Moon } from "lucide-react"
import api from "../../lib/api"

export default function AdminPanel() {
    const [tab, setTab] = useState<"dashboard" | "payments" | "reviews" | "system" | "users" | "reports" | "settings">("dashboard")
    const [darkMode, setDarkMode] = useState(false)

    type Payment = {
        id: number
        txn_id: string
        amount: string
        bank: string
        ocr_summary: string
        email_match: boolean
        screenshot: string
    }
    const [payments, setPayments] = useState<Payment[]>([])
    type Review = {
        id: number
        text: string
        toxicity: number
        plagiarism: number
    }
    const [reviews, setReviews] = useState<Review[]>([])
    type SystemStatus = {
        name: string
        status: string
    }
    const [systems, setSystems] = useState<SystemStatus[]>([])
    const [users, setUsers] = useState([])

    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkMode)
    }, [darkMode])

    useEffect(() => {
        ; (async () => {
            const endpoints: Record<string, string> = {
                payments: "/api/admin/payments/",
                reviews: "/api/admin/reviews/",
                system: "/api/admin/system-status/",
                users: "/api/admin/users/"
            }
            const url = endpoints[tab]
            if (url) {
                const { data } = await api.get(url)
                if (tab === "payments") setPayments(data)
                if (tab === "reviews") setReviews(data)
                if (tab === "system") setSystems(data)
                if (tab === "users") setUsers(data)
            }
        })()
    }, [tab])

    async function act(id: number, action: "approve" | "reject") {
        await api.post(`/api/admin/payments/${id}/${action}/`)
        setPayments((prev) => prev.filter((p) => p.id !== id))
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-zinc-950 transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col shadow-md">
                <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-indigo-600">Admin Portal</h1>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {[
                        { label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
                        { label: "Payments", icon: CreditCard, key: "payments" },
                        { label: "Reviews", icon: MessageSquare, key: "reviews" },
                        { label: "System", icon: Server, key: "system" },
                        { label: "Users", icon: Users, key: "users" },
                        { label: "Reports", icon: BarChart3, key: "reports" },
                        { label: "Settings", icon: Settings, key: "settings" }
                    ].map(({ label, icon: Icon, key }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key as "dashboard" | "payments" | "reviews" | "system" | "users" | "reports" | "settings")}
                            className={`flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${tab === key
                                ? "bg-indigo-600 text-white shadow-md"
                                : "text-gray-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                }`}
                        >
                            <Icon className="w-4 h-4 mr-2" /> {label}
                        </button>
                    ))}
                </nav>

                <div className="px-4 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
                    </button>
                    <button className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900">
                        <LogOut className="w-4 h-4 mr-2" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {tab === "dashboard" && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-6">Overview</h2>
                        <div className="grid md:grid-cols-4 gap-6 mb-8">
                            {payments.slice(0, 5).map((p: Payment) => (
                                <div key={p.id} className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                                    <span className="text-sm">Txn #{p.txn_id}</span>
                                    <span className="text-sm font-medium text-indigo-600">{p.amount}</span>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-md">
                            <h3 className="font-medium mb-4">Recent Payments</h3>
                            <div className="space-y-3">
                                {payments.slice(0, 5).map((p: Payment) => (
                                    <div key={p.id} className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                                        <span className="text-sm">Txn #{p.txn_id}</span>
                                        <span className="text-sm font-medium text-indigo-600">{p.amount}</span>
                                    </div>
                                ))}
                            </div>
                            <ul>
                                {systems.map((s: SystemStatus) => (
                                    <li key={s.name} className="flex justify-between">
                                        <span>{s.name}</span>
                                        <span className={`${s.status === "OK" ? "text-green-500" : "text-red-500"}`}>{s.status}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {tab === "payments" && (
                    <Section title="Screenshot Verification (OCR Preview)">
                        {payments.map((p: Payment) => (
                            <div key={p.id} className="p-4 border dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 mb-3 flex justify-between items-center">
                                <div>
                                    <div className="font-medium">Txn #{p.txn_id} – {p.bank}</div>
                                    <div className="text-sm text-zinc-500">OCR: {p.ocr_summary} | Email: {p.email_match ? "✅ Matched" : "❌ Mismatch"}</div>
                                </div>
                                <div className="flex gap-2">
                                    <a href={p.screenshot} target="_blank" className="text-indigo-600 underline text-sm">View</a>
                                    <button onClick={() => act(p.id, "approve")} className="bg-green-600 text-white px-3 py-1 rounded-md">Approve</button>
                                    <button onClick={() => act(p.id, "reject")} className="bg-red-600 text-white px-3 py-1 rounded-md">Reject</button>
                                </div>
                            </div>
                        ))}
                    </Section>
                )}

                {tab === "reviews" && (
                    <Section title="Reviews">
                        {reviews.map((r: Review) => (
                            <div key={r.id} className="p-4 border rounded-lg bg-white dark:bg-zinc-900 mb-3">
                                <div className="text-sm mb-2">{r.text}</div>
                                <div className="text-xs text-zinc-500">
                                    Toxicity:{" "}
                                    <span className={`${r.toxicity > 0.7 ? "text-red-500" : r.toxicity > 0.3 ? "text-yellow-500" : "text-green-500"}`}>
                                        {Math.round(r.toxicity * 100)}%
                                    </span>{" "}
                                    • Plagiarism: {Math.round(r.plagiarism * 100)}%
                                </div>
                            </div>
                        ))}
                    </Section>
                )}

                {
                    tab === "system" && (
                        <Section title="System Status">
                            <div className="grid md:grid-cols-2 gap-6">
                                {systems.map((s: SystemStatus) => (
                                    <div key={s.name} className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-md border dark:border-zinc-800">
                                        <div className="font-medium mb-1">{s.name}</div>
                                        <div className={`text-sm ${s.status === "OK" ? "text-green-500" : "text-red-500"}`}>{s.status}</div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )
                }
            </main >
        </div >
    )
}

function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
    return (
        <div className="card p-6 bg-white dark:bg-zinc-950 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4">{title}</h3>
            {children}
        </div>
    )
}

function StatCard({ title, value }: { title: string; value: string | number }) {
    return (
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-md hover:scale-[1.02] transition-transform">
            <div className="text-sm text-zinc-500 mb-2">{title}</div>
            <div className="text-2xl font-semibold text-indigo-600">{value}</div>
        </div>
    )
}
