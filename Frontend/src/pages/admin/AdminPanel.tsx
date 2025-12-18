import { useState, useEffect, useRef } from "react"
import { LayoutDashboard, CreditCard, MessageSquare, Server, Users, BarChart3, Settings, LogOut, Sun, Moon, Menu, X, Edit2, Trash2, Lock, Unlock, Eye, EyeOff, Check, XCircle, AlertCircle } from "lucide-react"
import api from "../../lib/api"
import { useTheme } from "../../theme/ThemeProvider"
import ThreeDot from "../../components/threeDot"

type Payment = { id: number; txn_id: string; amount: string; bank: string; ocr_summary: string; email_match: boolean; screenshot: string }
type Review = { id: number; text: string; toxicity: number; plagiarism: number }
type SystemStatus = { name: string; status: string }
type Report = { id: number; title?: string; type?: string; details?: string; created_at?: string; created?: string; timestamp?: string }
type User = { id: number; username: string; email: string; first_name: string; last_name: string; is_active: boolean; is_blocked: boolean; role: string; created_at: string; last_login: string }
type Seller = { id: number; username: string; email: string; first_name: string; last_name: string; business_name: string; is_active: boolean; is_blocked: boolean; approved: boolean; suspended: boolean; created_at: string; rating: number }
type SystemConfig = { maintenance_mode: boolean; max_upload_size: number; commission_rate: number; minimum_withdrawal: number; email_notifications_enabled: boolean; sms_notifications_enabled: boolean }

export default function AdminPanel() {
    const [tab, setTab] = useState<"dashboard" | "payments" | "reviews" | "system" | "users" | "sellers" | "reports" | "settings">("dashboard")
    const { theme, toggle, primary } = useTheme()
    const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' && window.innerWidth >= 768)

    const [payments, setPayments] = useState<Payment[]>([])
    const [reviews, setReviews] = useState<Review[]>([])
    const [systems, setSystems] = useState<SystemStatus[]>([])
    const [reports, setReports] = useState<Report[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [sellers, setSellers] = useState<Seller[]>([])
    const [counts, setCounts] = useState<{ payments: number; reviews: number; users: number; sellers: number }>({ payments: 0, reviews: 0, users: 0, sellers: 0 })
    const [systemConfig, setSystemConfig] = useState<SystemConfig>({
        maintenance_mode: false, max_upload_size: 5, commission_rate: 5, minimum_withdrawal: 100,
        email_notifications_enabled: true, sms_notifications_enabled: true
    })

    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [editingSeller, setEditingSeller] = useState<Seller | null>(null)
    const [editingSystemConfig, setEditingSystemConfig] = useState<SystemConfig>(systemConfig)
    const [showEditUserModal, setShowEditUserModal] = useState(false)
    const [showEditSellerModal, setShowEditSellerModal] = useState(false)
    const [showSettingsModal, setShowSettingsModal] = useState(false)
    const [blockReason, setBlockReason] = useState("")
    const [showBlockModal, setShowBlockModal] = useState(false)
    const [blockingUserId, setBlockingUserId] = useState<number | null>(null)
    const [blockingType, setBlockingType] = useState<"user" | "seller" | null>(null)

    const processingIds = useRef<Set<number>>(new Set())

    const [reportsAccessError, setReportsAccessError] = useState<string | null>(null)
    const [loadingUsers, setLoadingUsers] = useState<boolean>(false)

    useEffect(() => {
        const endpoints: Record<string, string> = { payments: "/api/admin/payments/", reviews: "/api/admin/reviews/", system: "/api/admin/system-status/", users: "/api/admin/users/", sellers: "/api/admin/sellers/", reports: "/api/admin/reports/" }
        const url = endpoints[tab]
        if (url) {
            (async () => {
                try {
                    const { data } = await api.get(url)

                    // Normalize and support many response shapes: array | { results: [] } | { reports: [] } | { data: { results: [] } }
                    let list: any[] = []
                    if (Array.isArray(data)) list = data
                    else if (Array.isArray((data as any).results)) list = (data as any).results
                    else if (Array.isArray((data as any).reports)) list = (data as any).reports
                    else if (Array.isArray((data as any).data?.results)) list = (data as any).data.results
                    else if (Array.isArray((data as any).data?.reports)) list = (data as any).data.reports
                    else if (Array.isArray((data as any).items)) list = (data as any).items
                    else list = []

                    if (import.meta.env.DEV) console.debug(`Admin fetch ${url} -> shape keys: ${Object.keys(data || {}).join(', ')} -> ${list.length} items`)

                    if (tab === "payments") setPayments(list)
                    if (tab === "reviews") setReviews(list)
                    if (tab === "system") setSystems(list)
                    if (tab === "users") setUsers(list)
                    if (tab === "sellers") setSellers(list)
                    if (tab === "reports") {
                        setReports(list)
                        setReportsAccessError(null)
                    }
                } catch (err) {
                    const status = (err as any)?.response?.status
                    const expected = [400, 401, 403, 404]
                    if (expected.includes(status)) {
                        // Treat common client errors as empty result (avoid noisy logs)
                        if (tab === "payments") setPayments([])
                        if (tab === "reviews") setReviews([])
                        if (tab === "system") setSystems([])
                        if (tab === "users") setUsers([])
                        if (tab === "sellers") setSellers([])
                        if (tab === "reports") {
                            setReports([])
                            // Provide a clearer message to the admin to check auth/permissions
                            if (status === 401) setReportsAccessError('Unauthorized (401): your session may have expired. Please sign in again.')
                            else if (status === 403) setReportsAccessError('Forbidden (403): your account lacks permission to view reports.')
                            else setReportsAccessError(`Server returned ${status}`)
                        }
                        if (import.meta.env.DEV) console.debug(`Admin fetch ${url} -> ${status} (treated as empty)`)
                    } else {
                        console.error('Fetch failed', err)
                        if (tab === 'reports') setReportsAccessError('Failed to fetch reports; check server logs or network')
                    }
                }
            })()
        }
        if (tab === "settings") {
            (async () => {
                try {
                    const { data } = await api.get("/api/admin/config/")
                    setEditingSystemConfig(data)
                    setSystemConfig(data)
                } catch (err) { console.error('Config fetch failed', err) }
            })()
        }
    }, [tab])

    // Fetch lightweight counts for the dashboard so stats show before user clicks each tab
    useEffect(() => {
        if (tab !== 'dashboard') return
        const endpoints: Record<string, string> = {
            payments: '/api/admin/payments/?page_size=1',
            reviews: '/api/admin/reviews/?page_size=1',
            users: '/api/admin/users/?page_size=1',
            sellers: '/api/admin/sellers/?page_size=1',
        }

        const entries = Object.entries(endpoints)
        Promise.allSettled(entries.map(([_, url]) => api.get(url))).then((results) => {
            const next: typeof counts = { payments: 0, reviews: 0, users: 0, sellers: 0 }
            results.forEach((r, i) => {
                const key = entries[i][0] as keyof typeof next
                if (r.status === 'fulfilled') {
                    const data = (r.value as any).data
                    const count = typeof data?.count === 'number' ? data.count : Array.isArray(data) ? data.length : (Array.isArray(data?.results) ? data.results.length : 0)
                    next[key] = count
                } else {
                    // Treat expected client errors as zero
                    const status = (r.reason as any)?.response?.status
                    if ([400, 401, 403, 404].includes(status)) next[key] = 0
                    else {
                        console.error(`Dashboard count fetch failed for ${entries[i][0]}`, r.reason)
                    }
                }
            })
            setCounts(next)
        })
    }, [tab])

    // Keep sidebar state in sync with window size so desktop always shows sidebar
    useEffect(() => {
        const handleResize = () => {
            if (typeof window === 'undefined') return
            if (window.innerWidth >= 768) {
                setSidebarOpen(true)
            } else {
                setSidebarOpen(false)
            }
        }

        // initialize
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Show a small loader for the Users tab for up to 3s before showing "No users found"
    useEffect(() => {
        let timer: number | undefined
        if (tab === 'users') {
            setLoadingUsers(true)
            timer = window.setTimeout(() => setLoadingUsers(false), 3000)
        } else {
            setLoadingUsers(false)
        }
        return () => { if (timer) window.clearTimeout(timer) }
    }, [tab])

    const blockUser = async (id: number, reason: string) => {
        if (processingIds.current.has(id)) return
        processingIds.current.add(id)
        try {
            await api.post(`/api/admin/user/${id}/block/`, { reason })
            setUsers((prev) => prev.map((u) => u.id === id ? { ...u, is_blocked: true } : u))
            alert('User blocked')
            setShowBlockModal(false)
            setBlockReason("")
        } catch (err) { alert('Failed to block user') }
        finally { processingIds.current.delete(id) }
    }

    const unblockUser = async (id: number) => {
        if (processingIds.current.has(id)) return
        processingIds.current.add(id)
        try {
            await api.post(`/api/admin/user/${id}/unblock/`)
            setUsers((prev) => prev.map((u) => u.id === id ? { ...u, is_blocked: false } : u))
        } catch (err) { alert('Failed to unblock user') }
        finally { processingIds.current.delete(id) }
    }

    const deleteUser = async (id: number) => {
        if (!window.confirm('Delete this user permanently?')) return
        if (processingIds.current.has(id)) return
        processingIds.current.add(id)
        try {
            await api.delete(`/api/admin/users/${id}/`)
            setUsers((prev) => prev.filter((u) => u.id !== id))
        } catch (err) { alert('Failed to delete user') }
        finally { processingIds.current.delete(id) }
    }

    const updateUser = async (user: User) => {
        if (processingIds.current.has(user.id)) return
        processingIds.current.add(user.id)
        try {
            const { data } = await api.put(`/api/admin/users/${user.id}/`, user)
            setUsers((prev) => prev.map((u) => u.id === user.id ? data : u))
            setShowEditUserModal(false)
            setEditingUser(null)
        } catch (err) { alert('Failed to update user') }
        finally { processingIds.current.delete(user.id) }
    }

    const blockSeller = async (id: number, reason: string) => {
        if (processingIds.current.has(id)) return
        processingIds.current.add(id)
        try {
            await api.post(`/api/admin/sellers/${id}/block/`, { reason })
            setSellers((prev) => prev.map((s) => s.id === id ? { ...s, is_blocked: true } : s))
            setShowBlockModal(false)
            setBlockReason("")
        } catch (err) { alert('Failed to block seller') }
        finally { processingIds.current.delete(id) }
    }

    const unblockSeller = async (id: number) => {
        if (processingIds.current.has(id)) return
        processingIds.current.add(id)
        try {
            await api.post(`/api/admin/sellers/${id}/unblock/`)
            setSellers((prev) => prev.map((s) => s.id === id ? { ...s, is_blocked: false } : s))
        } catch (err) { alert('Failed to unblock seller') }
        finally { processingIds.current.delete(id) }
    }

    const suspendSeller = async (id: number) => {
        if (processingIds.current.has(id)) return
        processingIds.current.add(id)
        try {
            await api.post(`/api/admin/sellers/${id}/suspend/`)
            setSellers((prev) => prev.map((s) => s.id === id ? { ...s, suspended: true } : s))
        } catch (err) { alert('Failed to suspend seller') }
        finally { processingIds.current.delete(id) }
    }

    const unsuspendSeller = async (id: number) => {
        if (processingIds.current.has(id)) return
        processingIds.current.add(id)
        try {
            await api.post(`/api/admin/sellers/${id}/unsuspend/`)
            setSellers((prev) => prev.map((s) => s.id === id ? { ...s, suspended: false } : s))
        } catch (err) { alert('Failed to unsuspend seller') }
        finally { processingIds.current.delete(id) }
    }

    const approveSeller = async (id: number) => {
        if (processingIds.current.has(id)) return
        processingIds.current.add(id)
        try {
            await api.post(`/api/admin/sellers/${id}/approve/`)
            setSellers((prev) => prev.map((s) => s.id === id ? { ...s, approved: true } : s))
        } catch (err) { alert('Failed to approve seller') }
        finally { processingIds.current.delete(id) }
    }

    const deleteSeller = async (id: number) => {
        if (!window.confirm('Delete this seller permanently?')) return
        if (processingIds.current.has(id)) return
        processingIds.current.add(id)
        try {
            await api.delete(`/api/admin/sellers/${id}/`)
            setSellers((prev) => prev.filter((s) => s.id !== id))
        } catch (err) { alert('Failed to delete seller') }
        finally { processingIds.current.delete(id) }
    }

    const updateSeller = async (seller: Seller) => {
        if (processingIds.current.has(seller.id)) return
        processingIds.current.add(seller.id)
        try {
            const { data } = await api.put(`/api/admin/sellers/${seller.id}/`, seller)
            setSellers((prev) => prev.map((s) => s.id === seller.id ? data : s))
            setShowEditSellerModal(false)
            setEditingSeller(null)
        } catch (err) { alert('Failed to update seller') }
        finally { processingIds.current.delete(seller.id) }
    }

    const updateSystemConfig = async (config: SystemConfig) => {
        try {
            const { data } = await api.put("/api/admin/config/", config)
            setSystemConfig(data)
            setEditingSystemConfig(data)
            setShowSettingsModal(false)
        } catch (err) { alert('Failed to update config') }
    }

    const tabItems = [
        { label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
        { label: "Payments", icon: CreditCard, key: "payments" },
        { label: "Reviews", icon: MessageSquare, key: "reviews" },
        { label: "System", icon: Server, key: "system" },
        { label: "Users", icon: Users, key: "users" },
        { label: "Sellers", icon: Users, key: "sellers" },
        { label: "Reports", icon: BarChart3, key: "reports" },
        { label: "Settings", icon: Settings, key: "settings" }
    ]

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-zinc-950 transition-colors">
            {/* Sidebar */}
            <aside className={`fixed md:static top-0 left-0 h-screen w-64 md:w-72 bg-surface dark:bg-zinc-900 border-r border-card flex flex-col shadow-lg transform transition-transform duration-300 z-50 md:z-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="p-4 md:p-6 border-b border-card hidden md:flex items-center justify-between">
                    <h1 className="text-lg md:text-xl font-bold text-default">Admin</h1>
                </div>
                <nav className="flex-1 px-3 md:px-4 py-6 space-y-2 overflow-y-auto">
                    {tabItems.map(({ label, icon: Icon, key }) => (
                        <button
                            key={key}
                            onClick={() => {
                                setTab(key as any)
                                // Only close sidebar on mobile (screen < 768px)
                                if (window.innerWidth < 768) setSidebarOpen(false)
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm md:text-base font-medium transition-all ${tab === key ? "text-white shadow-md" : "text-default hover:bg-black/5 dark:hover:bg-white/5"}`}
                            style={{ background: tab === key ? primary : 'transparent' }}
                        >
                            <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                            <span className="truncate">{label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-3 md:p-4 border-t border-card flex gap-2">
                    <button onClick={toggle} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 flex-1">
                        {theme === 'dark' ? <Sun className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 mx-auto" /> : <Moon className="w-4 h-4 md:w-5 md:h-5 text-gray-600 mx-auto" />}
                    </button>
                    <button className="flex-1 px-2 py-2 rounded-lg text-xs md:text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition flex items-center justify-center gap-1">
                        <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-surface border-b border-card flex items-center justify-between px-4 z-40 shadow-md">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded transition" title={sidebarOpen ? "Close menu" : "Open menu"}>
                    {sidebarOpen ? <X className="w-5 h-5 text-red-500" /> : <Menu className="w-5 h-5" />}
                </button>
                <h1 className="text-lg font-bold text-default">Admin</h1>
                <div className="w-10"></div>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && <div className="md:hidden fixed inset-0 bg-black/40 z-40 top-14" onClick={() => setSidebarOpen(false)} />}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
                <div className="p-3 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    {tab === "dashboard" && (
                        <div className="space-y-4 md:space-y-6">
                            <h2 className="text-2xl md:text-3xl font-semibold text-default">Overview</h2>
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
                                <StatCard title="Payments" value={payments.length || counts.payments} />
                                <StatCard title="Reviews" value={reviews.length || counts.reviews} />
                                <StatCard title="Users" value={users.length || counts.users} />
                                <StatCard title="Sellers" value={sellers.length || counts.sellers} />
                            </div>
                            <Section title="Recent Payments">
                                <div className="space-y-2">
                                    {payments.slice(0, 5).map((p) => (
                                        <div key={p.id} className="flex justify-between text-xs md:text-sm p-2 md:p-3 border-b border-card">
                                            <div className="min-w-0">
                                                <div className="font-medium truncate">Txn #{p.txn_id}</div>
                                                <div className="text-xs text-muted">{p.bank}</div>
                                            </div>
                                            <span className="font-semibold ml-2" style={{ color: primary }}>{p.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        </div>
                    )}

                    {tab === "payments" && (
                        <Section title="Payments">
                            <div className="space-y-2 md:space-y-3">
                                {payments.map((p) => (
                                    <div key={p.id} className="p-3 md:p-4 border border-card rounded-lg bg-surface hover:border-blue-400 transition-all">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 md:gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium text-sm md:text-base text-default">Txn #{p.txn_id} – {p.bank}</div>
                                                <div className="text-xs text-muted mt-1">OCR: {p.ocr_summary} | Email: {p.email_match ? "✅" : "❌"}</div>
                                            </div>
                                            <div className="flex gap-1 md:gap-2 flex-wrap">
                                                <a href={p.screenshot} target="_blank" rel="noreferrer" className="px-2 md:px-3 py-1 text-xs md:text-sm rounded-md font-medium text-white" style={{ background: primary }}>View</a>
                                                <button className="px-2 md:px-3 py-1 text-xs md:text-sm rounded-md font-medium text-white bg-green-600 hover:bg-green-700">Approve</button>
                                                <button className="px-2 md:px-3 py-1 text-xs md:text-sm rounded-md font-medium text-white bg-red-600 hover:bg-red-700">Reject</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {tab === "users" && (
                        <Section title="Manage Users">
                            {users.length === 0 ? (
                                loadingUsers ? (
                                    <div className="p-10 text-center"><ThreeDot /></div>
                                ) : (
                                    <div className="text-center py-8 text-muted">No users found</div>
                                )
                            ) : (
                                <div className="overflow-x-auto -mx-3 md:-mx-4 lg:-mx-0">
                                    <div className="inline-block min-w-full px-3 md:px-4 lg:px-0">
                                        <table className="w-full text-xs md:text-sm">
                                            <thead>
                                                <tr className="border-b border-card">
                                                    <th className="text-left py-2 md:py-3 px-2 md:px-3 font-semibold">User</th>
                                                    <th className="text-left py-2 md:py-3 px-2 md:px-3 font-semibold hidden sm:table-cell">Status</th>
                                                    {/* <th className="text-left py-2 md:py-3 px-2 md:px-3 font-semibold hidden md:table-cell">Joined</th> */}
                                                    <th className="text-left py-2 md:py-3 px-2 md:px-3 font-semibold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map((u) => (
                                                    <tr key={u.id} className="border-b border-card hover:bg-black/2 dark:hover:bg-white/2 transition">
                                                        <td className="py-2 md:py-3 px-2 md:px-3">
                                                            <div className="font-medium text-default truncate">{u.username}</div>
                                                            <div className="text-xs text-muted truncate">{u.email}</div>
                                                        </td>
                                                        <td className="py-2 md:py-3 px-2 md:px-3 hidden sm:table-cell">
                                                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${u.is_blocked ? 'bg-red-100 dark:bg-red-900/30 text-red-700' : u.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-700' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700'}`}>
                                                                {u.is_blocked ? <XCircle className="w-3 h-3" /> : u.is_active ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                                {u.is_blocked ? 'Blocked' : u.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        {/* <td className="py-2 md:py-3 px-2 md:px-3 hidden md:table-cell text-xs text-muted">{new Date(u.created_at).toLocaleDateString()}</td> */}
                                                        <td className="py-2 md:py-3 px-2 md:px-3">
                                                            <div className="flex gap-1">
                                                                <button onClick={() => { setEditingUser(u); setShowEditUserModal(true) }} className="p-1.5 md:p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-300" title="Edit"><Edit2 className="w-3 h-3 md:w-4 md:h-4" /></button>
                                                                {u.is_blocked ? <button onClick={() => unblockUser(u.id)} disabled={processingIds.current.has(u.id)} className="p-1.5 md:p-2 rounded hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 disabled:opacity-50" title="Unblock"><Unlock className="w-3 h-3 md:w-4 md:h-4" /></button> : <button onClick={() => { setBlockingUserId(u.id); setBlockingType("user"); setShowBlockModal(true) }} className="p-1.5 md:p-2 rounded hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-600" title="Block"><Lock className="w-3 h-3 md:w-4 md:h-4" /></button>}
                                                                <button onClick={() => deleteUser(u.id)} disabled={processingIds.current.has(u.id)} className="p-1.5 md:p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 disabled:opacity-50" title="Delete"><Trash2 className="w-3 h-3 md:w-4 md:h-4" /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </Section>
                    )}

                    {tab === "sellers" && (
                        <Section title="Manage Sellers">
                            {sellers.length === 0 ? (
                                <div className="text-center py-8 text-muted">No sellers found</div>
                            ) : (
                                <div className="overflow-x-auto -mx-3 md:-mx-4 lg:-mx-0">
                                    <div className="inline-block min-w-full px-3 md:px-4 lg:px-0">
                                        <table className="w-full text-xs md:text-sm">
                                            <thead>
                                                <tr className="border-b border-card">
                                                    <th className="text-left py-2 md:py-3 px-2 md:px-3 font-semibold">Business</th>
                                                    <th className="text-left py-2 md:py-3 px-2 md:px-3 font-semibold hidden sm:table-cell">Rating</th>
                                                    <th className="text-left py-2 md:py-3 px-2 md:px-3 font-semibold hidden md:table-cell">Status</th>
                                                    <th className="text-left py-2 md:py-3 px-2 md:px-3 font-semibold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sellers.map((s) => (
                                                    <tr key={s.id} className="border-b border-card hover:bg-black/2 dark:hover:bg-white/2 transition">
                                                        <td className="py-2 md:py-3 px-2 md:px-3">
                                                            <div className="font-medium text-default truncate">{s.business_name || s.username}</div>
                                                            <div className="text-xs text-muted truncate">{s.email}</div>
                                                        </td>
                                                        <td className="py-2 md:py-3 px-2 md:px-3 hidden sm:table-cell font-medium" style={{ color: primary }}>{s.rating?.toFixed(1) || '0.0'}⭐</td>
                                                        <td className="py-2 md:py-3 px-2 md:px-3 hidden md:table-cell">
                                                            <div className="space-y-1">
                                                                <span className={`block text-xs px-2 py-1 rounded-full font-medium w-fit ${s.is_blocked ? 'bg-red-100 dark:bg-red-900/30 text-red-700' : s.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-700' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700'}`}>{s.is_blocked ? 'Blocked' : s.is_active ? 'Active' : 'Inactive'}</span>
                                                                {!s.approved && <span className="block text-xs px-2 py-1 rounded-full font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 w-fit">Pending</span>}
                                                            </div>
                                                        </td>
                                                        <td className="py-2 md:py-3 px-2 md:px-3">
                                                            <div className="flex gap-1 flex-wrap">
                                                                <button onClick={() => { setEditingSeller(s); setShowEditSellerModal(true) }} className="p-1.5 md:p-2 rounded hover:bg-blue-100 text-blue-600" title="Edit"><Edit2 className="w-3 h-3 md:w-4 md:h-4" /></button>
                                                                {!s.approved && <button onClick={() => approveSeller(s.id)} disabled={processingIds.current.has(s.id)} className="p-1.5 md:p-2 rounded hover:bg-green-100 text-green-600 disabled:opacity-50" title="Approve"><Check className="w-3 h-3 md:w-4 md:h-4" /></button>}
                                                                {s.is_blocked ? <button onClick={() => unblockSeller(s.id)} disabled={processingIds.current.has(s.id)} className="p-1.5 md:p-2 rounded hover:bg-green-100 text-green-600 disabled:opacity-50" title="Unblock"><Unlock className="w-3 h-3 md:w-4 md:h-4" /></button> : <button onClick={() => { setBlockingUserId(s.id); setBlockingType("seller"); setShowBlockModal(true) }} className="p-1.5 md:p-2 rounded hover:bg-orange-100 text-orange-600" title="Block"><Lock className="w-3 h-3 md:w-4 md:h-4" /></button>}
                                                                {s.suspended ? <button onClick={() => unsuspendSeller(s.id)} disabled={processingIds.current.has(s.id)} className="p-1.5 md:p-2 rounded hover:bg-blue-100 text-blue-600 disabled:opacity-50" title="Unsuspend"><Eye className="w-3 h-3 md:w-4 md:h-4" /></button> : <button onClick={() => suspendSeller(s.id)} disabled={processingIds.current.has(s.id)} className="p-1.5 md:p-2 rounded hover:bg-yellow-100 text-yellow-600 disabled:opacity-50" title="Suspend"><EyeOff className="w-3 h-3 md:w-4 md:h-4" /></button>}
                                                                <button onClick={() => deleteSeller(s.id)} disabled={processingIds.current.has(s.id)} className="p-1.5 md:p-2 rounded hover:bg-red-100 text-red-600 disabled:opacity-50" title="Delete"><Trash2 className="w-3 h-3 md:w-4 md:h-4" /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </Section>
                    )}

                    {tab === "reviews" && (
                        <Section title="Reviews">
                            <div className="space-y-2 md:space-y-3">
                                {reviews.map((r) => (
                                    <div key={r.id} className="p-3 md:p-4 border border-card rounded-lg bg-surface">
                                        <div className="text-xs md:text-sm mb-2 text-default line-clamp-3">{r.text}</div>
                                        <div className="text-xs text-muted space-y-1">
                                            <div>Toxicity: <span className={`font-medium ${r.toxicity > 0.7 ? "text-red-500" : r.toxicity > 0.3 ? "text-yellow-500" : "text-green-500"}`}>{Math.round(r.toxicity * 100)}%</span></div>
                                            <div>Plagiarism: <span className="font-medium">{Math.round(r.plagiarism * 100)}%</span></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {tab === "system" && (
                        <Section title="System Status">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                {systems.map((s) => (
                                    <div key={s.name} className="p-3 md:p-4 bg-surface rounded-lg shadow-sm border border-card">
                                        <div className="font-medium text-xs md:text-sm text-default">{s.name}</div>
                                        <div className={`text-xs md:text-sm mt-2 font-semibold ${s.status === "OK" ? "text-green-500" : "text-red-500"}`}>{s.status === "OK" ? "✅" : "❌"} {s.status}</div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {tab === "settings" && (
                        <Section title="System Configuration">
                            <div className="space-y-4 md:space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                    <ConfigCard label="Maintenance" value={systemConfig.maintenance_mode ? 'On' : 'Off'} icon={systemConfig.maintenance_mode ? '🔴' : '🟢'} color={systemConfig.maintenance_mode ? 'text-red-600' : 'text-green-600'} />
                                    <ConfigCard label="Max Size" value={`${systemConfig.max_upload_size}MB`} icon="📦" />
                                    <ConfigCard label="Commission" value={`${systemConfig.commission_rate}%`} icon="💰" />
                                    <ConfigCard label="Min Withdrawal" value={`$${systemConfig.minimum_withdrawal}`} icon="💳" />
                                    <ConfigCard label="Email" value={systemConfig.email_notifications_enabled ? 'On' : 'Off'} icon="✉️" />
                                    <ConfigCard label="SMS" value={systemConfig.sms_notifications_enabled ? 'On' : 'Off'} icon="📱" />
                                </div>
                                <button onClick={() => setShowSettingsModal(true)} className="w-full md:w-auto px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium text-white transition" style={{ background: primary }}>Edit Config</button>
                            </div>
                        </Section>
                    )}

                    {tab === "reports" && (
                        <Section title="Reports">
                            <div className="mb-3 flex items-center justify-between">
                                <div />
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setTab('reports')} className="px-3 py-1 rounded border text-sm">Refresh</button>
                                </div>
                            </div>

                            {reportsAccessError && (
                                <div className="text-center py-4 text-red-600">{reportsAccessError}</div>
                            )}

                            {reports.length === 0 && !reportsAccessError ? (
                                <div className="text-center py-8 text-muted">No reports found</div>
                            ) : (
                                <div className="space-y-3">
                                    {reports.map((r) => (
                                        <div key={r.id} className="p-3 md:p-4 border border-card rounded-lg bg-surface">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="font-medium text-default truncate">{r.title || `Report #${r.id}`}</div>
                                                    <div className="text-xs text-muted mt-1 truncate">{r.type || 'General'}</div>
                                                    {r.details && <div className="text-xs text-muted mt-2 line-clamp-3">{r.details}</div>}
                                                    {/* show raw payload preview for debugging */}
                                                    {import.meta.env.DEV && <details className="mt-2 text-xs text-muted"><summary>Raw</summary><pre className="max-h-48 overflow-auto text-xs mt-2 bg-black/5 p-2 rounded">{JSON.stringify(r, null, 2)}</pre></details>}
                                                </div>
                                                <div className="text-xs text-muted text-right">{(() => { const t = r.created_at ?? r.created ?? r.timestamp; return t ? new Date(String(t)).toLocaleString() : null })()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Section>
                    )}
                </div>
            </main>

            {/* Modals */}
            {showBlockModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4">
                    <div className="bg-surface rounded-lg p-4 md:p-6 max-w-sm w-full">
                        <h3 className="text-lg md:text-xl font-semibold text-default mb-3 md:mb-4">Block Account</h3>
                        <p className="text-xs md:text-sm text-muted mb-3 md:mb-4">{blockingType === 'user' ? 'User cannot login' : 'Seller cannot access account'}</p>
                        <textarea value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Reason (optional)" className="w-full border border-card rounded-lg p-2 md:p-3 text-xs md:text-sm text-default bg-surface focus:ring-2 focus:ring-blue-500 focus:outline-none mb-3 md:mb-4 resize-none" rows={3} />
                        <div className="flex gap-2 md:gap-3">
                            <button onClick={() => { setShowBlockModal(false); setBlockReason(""); setBlockingUserId(null); setBlockingType(null) }} className="flex-1 px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-card text-default hover:bg-black/5 transition text-xs md:text-sm">Cancel</button>
                            <button onClick={() => { if (blockingUserId && blockingType) { blockingType === 'user' ? blockUser(blockingUserId, blockReason) : blockSeller(blockingUserId, blockReason) } }} className="flex-1 px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium text-xs md:text-sm">Block</button>
                        </div>
                    </div>
                </div>
            )}

            {showEditUserModal && editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4 overflow-y-auto">
                    <div className="bg-surface rounded-lg p-4 md:p-6 max-w-sm w-full my-4">
                        <h3 className="text-lg md:text-xl font-semibold text-default mb-3 md:mb-4">Edit User</h3>
                        <div className="space-y-2 md:space-y-3">
                            <div><label className="text-xs md:text-sm font-medium text-default">Username</label><input type="text" value={editingUser.username} onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })} className="w-full border border-card rounded-lg p-2 md:p-3 text-xs md:text-sm text-default bg-surface focus:ring-2 focus:ring-blue-500 focus:outline-none mt-1" /></div>
                            <div><label className="text-xs md:text-sm font-medium text-default">Email</label><input type="email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} className="w-full border border-card rounded-lg p-2 md:p-3 text-xs md:text-sm text-default bg-surface focus:ring-2 focus:ring-blue-500 focus:outline-none mt-1" /></div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-xs md:text-sm font-medium text-default">First</label><input type="text" value={editingUser.first_name} onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })} className="w-full border border-card rounded-lg p-2 text-xs md:p-3 md:text-sm text-default bg-surface focus:ring-2 focus:ring-blue-500 focus:outline-none mt-1" /></div>
                                <div><label className="text-xs md:text-sm font-medium text-default">Last</label><input type="text" value={editingUser.last_name} onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })} className="w-full border border-card rounded-lg p-2 text-xs md:p-3 md:text-sm text-default bg-surface focus:ring-2 focus:ring-blue-500 focus:outline-none mt-1" /></div>
                            </div>
                            <div className="flex items-center gap-2"><input type="checkbox" id="is_active" checked={editingUser.is_active} onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.checked })} className="w-4 h-4 rounded" /><label htmlFor="is_active" className="text-xs md:text-sm font-medium text-default">Active</label></div>
                        </div>
                        <div className="flex gap-2 md:gap-3 mt-4 md:mt-6">
                            <button onClick={() => { setShowEditUserModal(false); setEditingUser(null) }} className="flex-1 px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-card text-default hover:bg-black/5 transition text-xs md:text-sm">Cancel</button>
                            <button onClick={() => updateUser(editingUser)} disabled={processingIds.current.has(editingUser.id)} className="flex-1 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-white hover:opacity-90 transition font-medium disabled:opacity-50 text-xs md:text-sm" style={{ background: primary }}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {showEditSellerModal && editingSeller && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4 overflow-y-auto">
                    <div className="bg-surface rounded-lg p-4 md:p-6 max-w-sm w-full my-4">
                        <h3 className="text-lg md:text-xl font-semibold text-default mb-3 md:mb-4">Edit Seller</h3>
                        <div className="space-y-2 md:space-y-3">
                            <div><label className="text-xs md:text-sm font-medium text-default">Username</label><input type="text" value={editingSeller.username} onChange={(e) => setEditingSeller({ ...editingSeller, username: e.target.value })} className="w-full border border-card rounded-lg p-2 md:p-3 text-xs md:text-sm text-default bg-surface focus:ring-2 focus:ring-blue-500 focus:outline-none mt-1" /></div>
                            <div><label className="text-xs md:text-sm font-medium text-default">Business</label><input type="text" value={editingSeller.business_name} onChange={(e) => setEditingSeller({ ...editingSeller, business_name: e.target.value })} className="w-full border border-card rounded-lg p-2 md:p-3 text-xs md:text-sm text-default bg-surface focus:ring-2 focus:ring-blue-500 focus:outline-none mt-1" /></div>
                            <div><label className="text-xs md:text-sm font-medium text-default">Email</label><input type="email" value={editingSeller.email} onChange={(e) => setEditingSeller({ ...editingSeller, email: e.target.value })} className="w-full border border-card rounded-lg p-2 md:p-3 text-xs md:text-sm text-default bg-surface focus:ring-2 focus:ring-blue-500 focus:outline-none mt-1" /></div>
                            <div className="flex items-center gap-2"><input type="checkbox" id="seller_is_active" checked={editingSeller.is_active} onChange={(e) => setEditingSeller({ ...editingSeller, is_active: e.target.checked })} className="w-4 h-4 rounded" /><label htmlFor="seller_is_active" className="text-xs md:text-sm font-medium text-default">Active</label></div>
                        </div>
                        <div className="flex gap-2 md:gap-3 mt-4 md:mt-6">
                            <button onClick={() => { setShowEditSellerModal(false); setEditingSeller(null) }} className="flex-1 px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-card text-default hover:bg-black/5 transition text-xs md:text-sm">Cancel</button>
                            <button onClick={() => updateSeller(editingSeller)} disabled={processingIds.current.has(editingSeller.id)} className="flex-1 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-white hover:opacity-90 transition font-medium disabled:opacity-50 text-xs md:text-sm" style={{ background: primary }}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {showSettingsModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4 overflow-y-auto">
                    <div className="bg-surface rounded-lg p-4 md:p-6 max-w-sm w-full my-4">
                        <h3 className="text-lg md:text-xl font-semibold text-default mb-3 md:mb-4">System Config</h3>
                        <div className="space-y-2 md:space-y-3">
                            <div><label className="text-xs md:text-sm font-medium text-default">Commission (%)</label><input type="number" min="0" max="100" step="0.1" value={editingSystemConfig.commission_rate} onChange={(e) => setEditingSystemConfig({ ...editingSystemConfig, commission_rate: parseFloat(e.target.value) })} className="w-full border border-card rounded-lg p-2 md:p-3 text-xs md:text-sm text-default bg-surface focus:ring-2 focus:ring-blue-500 focus:outline-none mt-1" /></div>
                            <div><label className="text-xs md:text-sm font-medium text-default">Max Upload (MB)</label><input type="number" min="1" max="1000" value={editingSystemConfig.max_upload_size} onChange={(e) => setEditingSystemConfig({ ...editingSystemConfig, max_upload_size: parseInt(e.target.value) })} className="w-full border border-card rounded-lg p-2 md:p-3 text-xs md:text-sm text-default bg-surface focus:ring-2 focus:ring-blue-500 focus:outline-none mt-1" /></div>
                            <div><label className="text-xs md:text-sm font-medium text-default">Min Withdrawal ($)</label><input type="number" min="0" step="1" value={editingSystemConfig.minimum_withdrawal} onChange={(e) => setEditingSystemConfig({ ...editingSystemConfig, minimum_withdrawal: parseFloat(e.target.value) })} className="w-full border border-card rounded-lg p-2 md:p-3 text-xs md:text-sm text-default bg-surface focus:ring-2 focus:ring-blue-500 focus:outline-none mt-1" /></div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2"><input type="checkbox" id="maintenance_mode" checked={editingSystemConfig.maintenance_mode} onChange={(e) => setEditingSystemConfig({ ...editingSystemConfig, maintenance_mode: e.target.checked })} className="w-4 h-4 rounded" /><label htmlFor="maintenance_mode" className="text-xs md:text-sm font-medium text-default">Maintenance Mode</label></div>
                                <div className="flex items-center gap-2"><input type="checkbox" id="email_notifications" checked={editingSystemConfig.email_notifications_enabled} onChange={(e) => setEditingSystemConfig({ ...editingSystemConfig, email_notifications_enabled: e.target.checked })} className="w-4 h-4 rounded" /><label htmlFor="email_notifications" className="text-xs md:text-sm font-medium text-default">Email Notifications</label></div>
                                <div className="flex items-center gap-2"><input type="checkbox" id="sms_notifications" checked={editingSystemConfig.sms_notifications_enabled} onChange={(e) => setEditingSystemConfig({ ...editingSystemConfig, sms_notifications_enabled: e.target.checked })} className="w-4 h-4 rounded" /><label htmlFor="sms_notifications" className="text-xs md:text-sm font-medium text-default">SMS Notifications</label></div>
                            </div>
                        </div>
                        <div className="flex gap-2 md:gap-3 mt-4 md:mt-6">
                            <button onClick={() => { setShowSettingsModal(false); setEditingSystemConfig(systemConfig) }} className="flex-1 px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-card text-default hover:bg-black/5 transition text-xs md:text-sm">Cancel</button>
                            <button onClick={() => updateSystemConfig(editingSystemConfig)} className="flex-1 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-white hover:opacity-90 transition font-medium text-xs md:text-sm" style={{ background: primary }}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
    return <div className="bg-surface rounded-lg shadow-sm border border-card p-3 md:p-4 lg:p-6"><h3 className="text-base md:text-lg lg:text-xl font-semibold mb-3 md:mb-4 text-default">{title}</h3>{children}</div>
}

function StatCard({ title, value }: { title: string; value: string | number }) {
    const { primary } = useTheme()
    return <div className="p-3 md:p-4 lg:p-6 bg-surface rounded-lg shadow-sm border border-card hover:scale-105 transition-transform"><div className="text-xs md:text-sm text-muted mb-1 md:mb-2">{title}</div><div className="text-xl md:text-2xl lg:text-3xl font-semibold text-default" style={{ color: primary }}>{value}</div></div>
}

function ConfigCard({ label, value, icon, color }: { label: string; value: string; icon?: string; color?: string }) {
    return <div className="p-3 md:p-4 bg-surface border border-card rounded-lg"><div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2"><span className="text-lg md:text-2xl">{icon}</span><div className="text-xs md:text-sm font-medium text-muted truncate">{label}</div></div><div className={`text-base md:text-lg font-semibold text-default truncate ${color || ''}`}>{value}</div></div>
}
