// src/pages/seller/components/SellerSidebar.tsx
import { CreditCard, Package, FileText, Server, PlusCircle, BarChart2, Menu, X } from "lucide-react"
import { useState } from "react"

interface SellerSidebarProps {
    view: string
    setView: (view: string) => void
    productCount: number
}

export default function SellerSidebar({ view, setView, productCount }: SellerSidebarProps) {
    const [open, setOpen] = useState(false)

    const menuItems = [
        { id: "products", label: "Products", icon: <Package className="w-4 h-4" />, count: productCount },
        { id: "add", label: "Add Product", icon: <PlusCircle className="w-4 h-4" /> },
        { id: "orders", label: "Orders", icon: <FileText className="w-4 h-4" /> },
        { id: "payments", label: "Payments", icon: <CreditCard className="w-4 h-4" /> },
        { id: "reviews", label: "Reviews", icon: <FileText className="w-4 h-4" /> },
        { id: "system", label: "System Health", icon: <Server className="w-4 h-4" /> },
        { id: "reports", label: "Reports", icon: <BarChart2 className="w-4 h-4" /> },
    ]

    return (
        <>
            {/* --- Mobile Header --- */}
            <div className="lg:hidden flex items-center justify-between bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 sticky top-0 z-40">
                <h2 className="font-semibold text-indigo-600">Seller Console</h2>
                <button onClick={() => setOpen(!open)}>
                    {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* --- Sidebar --- */}
            <aside
                className={`fixed lg:static top-0 left-0 h-full lg:h-auto bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col w-72 lg:w-80  transform transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
            >
                <div className="mb-6 hidden lg:block">
                    <h2 className="text-xl font-bold text-indigo-600">Seller Console</h2>
                    <div className="text-sm text-zinc-500">Your store manager</div>
                </div>

                <nav className="flex-1 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setView(item.id)
                                setOpen(false)
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg flex justify-between items-center ${view === item.id
                                ? "bg-indigo-50 dark:bg-indigo-700/20"
                                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                }`}
                        >
                            <div className="flex items-center gap-3 text-sm">
                                {item.icon}
                                {item.label}
                            </div>
                            {item.count !== undefined && (
                                <span className="text-xs text-zinc-500">{item.count}</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 space-y-1">
                    <div>💡 Upload .glb models under 10MB for 3D preview.</div>
                    <div>📧 Support: support@example.com</div>
                </div>
            </aside>

            {/* --- Overlay for Mobile --- */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}
        </>
    )
}
