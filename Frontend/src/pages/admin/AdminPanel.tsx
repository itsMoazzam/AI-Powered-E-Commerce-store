import { useState, useEffect, useRef } from "react"
import { LayoutDashboard, CreditCard, MessageSquare, Server, Users, BarChart3, Settings, LogOut, Sun, Moon } from "lucide-react"
import api from "../../lib/api"
import { useTheme } from "../../theme/ThemeProvider"

export default function AdminPanel() {
    const [tab, setTab] = useState<"dashboard" | "payments" | "reviews" | "system" | "users" | "sellers" | "reports" | "settings">("dashboard")
    const { theme, toggle } = useTheme()

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
    const [sellers, setSellers] = useState<any[]>([])
    const processingIds = useRef<Set<number>>(new Set())

    useEffect(() => {
        ; (async () => {
            const endpoints: Record<string, string> = {
                payments: "/api/admin/payments/",
                reviews: "/api/admin/reviews/",
                system: "/api/admin/system-status/",
                users: "/api/admin/users/",
                sellers: "/api/admin/sellers/"
            }
            const url = endpoints[tab]
            if (url) {
                try {
                    const { data } = await api.get(url)
                    if (tab === "payments") setPayments(data)
                    if (tab === "reviews") setReviews(data)
                    if (tab === "system") setSystems(data)
                    if (tab === "users") setUsers(data)
                    if (tab === "sellers") setSellers(data)
                } catch (err) {
                    console.error('Admin fetch failed', err)
                }
            }
        })()
    }, [tab])

    async function act(id: number, action: "approve" | "reject") {
        if (processingIds.current.has(id)) return
        processingIds.current.add(id)
        try {
            await api.post(`/api/admin/payments/${id}/${action}/`)
            setPayments((prev) => prev.filter((p) => p.id !== id))
        } catch (err) {
            console.error('Payment action failed', err)
            alert('Action failed')
        } finally {
            processingIds.current.delete(id)
        }
    }

    async function toggleSeller(id: number, action: 'approve' | 'suspend') {
        if (processingIds.current.has(id)) return
        processingIds.current.add(id)
        try {
            const { data } = await api.post(`/api/admin/sellers/${id}/${action}/`)
            // update local sellers list
            setSellers((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)))
        } catch (err) {
            console.error('Seller action failed', err)
            alert('Seller action failed')
        } finally {
            processingIds.current.delete(id)
        }
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-zinc-950 transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-72 bg-surface dark:bg-zinc-900 border-r border-card flex flex-col shadow-md">
                <div className="px-6 py-5 border-b border-card flex items-center justify-between">
                    <h1 className="text-xl font-bold text-default">Admin Portal</h1>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {[
                        { label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
                        { label: "Payments", icon: CreditCard, key: "payments" },
                        { label: "Reviews", icon: MessageSquare, key: "reviews" },
                        { label: "System", icon: Server, key: "system" },
                        { label: "Users", icon: Users, key: "users" },
                        { label: "Sellers", icon: Users, key: "sellers" },
                        { label: "Reports", icon: BarChart3, key: "reports" },
                        { label: "Settings", icon: Settings, key: "settings" }
                    ].map(({ label, icon: Icon, key }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key as any)}
                            className={`flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${tab === key
                                ? "btn-primary shadow-md"
                                : "text-default hover:bg-gray-100 dark:hover:bg-zinc-800"
                                }`}
                        >
                            <Icon className="w-4 h-4 mr-2" /> {label}
                        </button>
                    ))}
                </nav>

                <div className="px-4 py-4 border-t border-card flex justify-between items-center">
                    <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800">
                        {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
                    </button>
                    <button className="flex items-center px-3 py-2 rounded-lg text-sm font-medium btn-danger hover:opacity-90">
                        <LogOut className="w-4 h-4 mr-2" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {tab === "dashboard" && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-6 text-default">Overview</h2>
                        <div className="grid md:grid-cols-4 gap-6 mb-8">
                            {payments.slice(0, 5).map((p: Payment) => (
                                <div key={p.id} className="flex justify-between border-b border-card pb-2">
                                    <span className="text-sm text-default">Txn #{p.txn_id}</span>
                                    <span className="text-sm font-medium text-primary">{p.amount}</span>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-surface border-card rounded-xl shadow-md">
                            <h3 className="font-medium mb-4 text-default">Recent Payments</h3>
                            <div className="space-y-3">
                                {payments.slice(0, 5).map((p: Payment) => (
                                    <div key={p.id} className="flex justify-between border-b border-card pb-2">
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
                                    <button onClick={() => act(p.id, "approve")} disabled={processingIds.current.has(p.id)} className="bg-green-600 text-white px-3 py-1 rounded-md disabled:opacity-60">{processingIds.current.has(p.id) ? 'Processing' : 'Approve'}</button>
                                    <button onClick={() => act(p.id, "reject")} disabled={processingIds.current.has(p.id)} className="bg-red-600 text-white px-3 py-1 rounded-md disabled:opacity-60">{processingIds.current.has(p.id) ? 'Processing' : 'Reject'}</button>
                                </div>
                            </div>
                        ))}
                    </Section>
                )}

                {tab === 'sellers' && (
                    <Section title="Manage Sellers">
                        {sellers.length === 0 && <div className="text-sm text-muted">No sellers found.</div>}
                        <div className="space-y-3">
                            {sellers.map((s) => (
                                <div key={s.id} className="p-3 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-md flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{s.name || s.username}</div>
                                        <div className="text-xs text-muted">{s.email}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => toggleSeller(s.id, 'approve')} disabled={processingIds.current.has(s.id)} className="px-3 py-1 rounded bg-green-600 text-white disabled:opacity-60">{processingIds.current.has(s.id) ? '...' : (s.approved ? 'Approved' : 'Approve')}</button>
                                        <button onClick={() => toggleSeller(s.id, 'suspend')} disabled={processingIds.current.has(s.id)} className="px-3 py-1 rounded bg-red-600 text-white disabled:opacity-60">{processingIds.current.has(s.id) ? '...' : (s.suspended ? 'Suspended' : 'Suspend')}</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {tab === "reviews" && (
                    <Section title="Reviews">
                        {reviews.map((r: Review) => (
                            <div key={r.id} className="p-4 border-card rounded-lg bg-surface mb-3">
                                <div className="text-sm mb-2 text-default">{r.text}</div>
                                <div className="text-xs text-muted">
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
        <div className="card p-6 bg-surface rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-default">{title}</h3>
            {children}
        </div>
    )
}

function StatCard({ title, value }: { title: string; value: string | number }) {
    return (
        <div className="p-6 bg-surface rounded-xl shadow-md hover:scale-[1.02] transition-transform">
            <div className="text-sm text-muted mb-2">{title}</div>
            <div className="text-2xl font-semibold text-primary">{value}</div>
        </div>
    )
}
