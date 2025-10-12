
// FILE: src/pages/seller/components/SellerSidebar.tsx
import { CreditCard, Package, FileText, Server, PlusCircle, BarChart2 } from "lucide-react"

interface SellerSidebarProps {
    view: string;
    setView: (view: string) => void;
    productCount: number;
}

export default function SellerSidebar({ view, setView, productCount }: SellerSidebarProps) {
    return (
        <aside className="w-80 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-indigo-600">Seller Console</h2>
                <div className="text-sm text-zinc-500">Your store manager</div>
            </div>

            <nav className="flex-1 space-y-2">
                <button onClick={() => setView('products')} className={`w-full text-left px-3 py-2 rounded-lg ${view === 'products' ? 'bg-indigo-50 dark:bg-indigo-700/20' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3"><Package className="w-4 h-4" /> Products</div>
                        <div className="text-xs text-zinc-500">{productCount}</div>
                    </div>
                </button>

                <button onClick={() => setView('add')} className={`w-full text-left px-3 py-2 rounded-lg ${view === 'add' ? 'bg-indigo-50 dark:bg-indigo-700/20' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                    <div className="flex items-center gap-3"><PlusCircle className="w-4 h-4" /> Add Product</div>
                </button>

                <button onClick={() => setView('payments')} className={`w-full text-left px-3 py-2 rounded-lg ${view === 'payments' ? 'bg-indigo-50 dark:bg-indigo-700/20' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                    <div className="flex items-center gap-3"><CreditCard className="w-4 h-4" /> Payments</div>
                </button>

                <button onClick={() => setView('reviews')} className={`w-full text-left px-3 py-2 rounded-lg ${view === 'reviews' ? 'bg-indigo-50 dark:bg-indigo-700/20' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                    <div className="flex items-center gap-3"><FileText className="w-4 h-4" /> Reviews</div>
                </button>

                <button onClick={() => setView('system')} className={`w-full text-left px-3 py-2 rounded-lg ${view === 'system' ? 'bg-indigo-50 dark:bg-indigo-700/20' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                    <div className="flex items-center gap-3"><Server className="w-4 h-4" /> System Health</div>
                </button>

                <button onClick={() => setView('reports')} className={`w-full text-left px-3 py-2 rounded-lg ${view === 'reports' ? 'bg-indigo-50 dark:bg-indigo-700/20' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                    <div className="flex items-center gap-3"><BarChart2 className="w-4 h-4" /> Reports</div>
                </button>
            </nav>

            <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500 space-y-2">
                <div>Pro Tip: Upload .glb models under 10MB for 3D preview.</div>
                <div>Support: support@example.com</div>
            </div>
        </aside>
    )
}


