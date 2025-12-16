// src/pages/seller/components/SellerSidebar.tsx
import { CreditCard, Package, FileText, Server, PlusCircle, BarChart2, Menu, X, Zap } from "lucide-react"
import { useState } from "react"
import { useTheme } from "../../../theme/ThemeProvider"

interface SellerSidebarProps {
    view: string
    setView: (view: string) => void
    productCount: number
}

export default function SellerSidebar({ view, setView, productCount }: SellerSidebarProps) {
    const [open, setOpen] = useState(false)
    const { primary } = useTheme()

    const menuItems = [
        { id: "products", label: "Products", icon: <Package className="w-4 h-4 sm:w-5 sm:h-5" />, count: productCount },
        { id: "add", label: "Add Product", icon: <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" /> },
        { id: "orders", label: "Orders", icon: <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> },
        { id: "advertisements", label: "Advertisements", icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5" /> },
        { id: "balances", label: "Balances", icon: <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5" /> },
        { id: "reviews", label: "Reviews", icon: <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> },
        { id: "system", label: "System Health", icon: <Server className="w-4 h-4 sm:w-5 sm:h-5" /> },
        { id: "reports", label: "Reports", icon: <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5" /> },
    ]

    const handleMenuClick = (itemId: string) => {
        setView(itemId)
        setOpen(false)
    }

    return (
        <>
            {/* --- Mobile Header --- */}
            <div className="lg:hidden flex items-center justify-between bg-surface border-b border-card px-4 py-3 sticky top-0 z-40">
                <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-default text-sm sm:text-base">Seller Console</h2>
                </div>
                <button
                    onClick={() => setOpen(!open)}
                    className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded transition"
                >
                    {open ? <X className="w-5 h-5 text-default" /> : <Menu className="w-5 h-5 text-default" />}
                </button>
            </div>

            {/* --- Sidebar --- */}
            <aside
                className={`fixed lg:sticky top-12 left-0 h-[calc(100vh-3rem)] lg:h-[calc(100vh-5rem)] bg-surface border-r border-card flex flex-col w-72 lg:w-80 transform transition-transform duration-300 ${open ? "translate-x-0 z-40" : "-translate-x-full lg:translate-x-0"
                    } p-4 lg:p-6 overflow-y-auto-hide-scroll`}
                style={{ background: 'var(--surface)', color: 'var(--text)', zIndex: 40 }}
            >
                {/* Header - Desktop only */}
                <div className="mb-6 hidden lg:block">
                    <h2 className="text-xl font-bold text-default">Seller Console</h2>
                    <div className="text-sm text-muted mt-1">Your store manager</div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleMenuClick(item.id)}
                            className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg flex justify-between items-center transition-all duration-200 group ${view === item.id
                                ? "text-default font-semibold"
                                : "text-default hover:bg-black/5 dark:hover:bg-white/5"
                                }`}
                            style={{
                                background: view === item.id ? `${primary}15` : 'transparent',
                                borderLeft: view === item.id ? `3px solid ${primary}` : '1px solid transparent',
                                paddingLeft: view === item.id ? 'calc(1rem - 3px)' : '1rem'
                            }}
                        >
                            <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                                <span style={{ color: view === item.id ? primary : 'currentColor' }}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </div>
                            {item.count !== undefined && item.count > 0 && (
                                <span
                                    className="text-xs font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center text-white"
                                    style={{ background: primary }}
                                >
                                    {item.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Divider */}
                <div className="border-t border-card my-4 lg:my-6" />

                {/* Footer Info */}
                <div className="space-y-2 text-xs text-muted bg-black/5 dark:bg-white/5 p-3 rounded-lg">
                    <div className="font-semibold text-default text-xs mb-2">💡 Quick Tips</div>
                    <div>📦 Upload .glb models for 3D previews (max 10MB)</div>
                    <div>📧 Support: support@example.com</div>
                    <div>🔄 Changes save automatically</div>
                </div>
            </aside>

            {/* --- Overlay for Mobile --- */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden top-12"
                    onClick={() => setOpen(false)}
                />
            )}
        </>
    )
}
