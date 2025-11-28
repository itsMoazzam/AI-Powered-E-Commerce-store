// src/pages/seller/SellerDashboard.tsx
import { useEffect, useState } from "react"
import SellerSidebar from "./components/SellerSidebar"
import ProductForm from "./components/ProductForm"
import ProductList from "./components/ProductList"
import PaymentsPanel from "./components/PaymentsPanel"
import ReviewsPanel from "./components/ReviewsPanel"
import SystemPanel from "./components/SystemPanel"
import ReportsPanel from "./components/ReportsPanel"
import CSVUpload from "./components/CSVUpload"
import OrdersPanel from "./components/OrdersPanel"
import api from "../../lib/api"

type View = "products" | "add" | "edit" | "payments" | "reviews" | "system" | "reports" | "bulk"
// include orders view
type ExtendedView = View | 'orders'

type Product = {
    id: number | string
    title: string
    price: number
    thumbnail: string
    model_3d: string
}

export default function SellerDashboard() {
    const [view, setViewState] = useState<ExtendedView>("products")
    const [products, setProducts] = useState<Product[]>([])
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [sellerName, setSellerName] = useState<string | null>(null)
    // cast helpers to avoid cross-file prop type mismatches in this isolated edit
    const ProductListAny = ProductList as unknown as any

    // load products (and other panels data if you want)
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const { data } = await api.get("/api/seller/products/")
                if (mounted) setProducts(data)
            } catch (err) {
                // avoid assuming error shape
                console.error("Failed to load seller products", (err as any)?.response ?? err)
            }
        })()

        // read seller name from localStorage (if available) to show a welcome message
        try {
            const raw = localStorage.getItem('user')
            if (raw) {
                const parsed = JSON.parse(raw)
                const name = parsed.first_name && parsed.last_name
                    ? `${parsed.first_name} ${parsed.last_name}`
                    : parsed.username || parsed.email || null
                if (mounted) setSellerName(name)
            }
        } catch {
            // ignore parse errors
        }

        return () => {
            mounted = false
        }
    }, [])

    // basic handlers used by child components
    function handleCreated(product: Product) {
        setProducts((s) => [product, ...s])
        setViewState("products")
    }
    function handleUpdated(updated: Product) {
        setProducts((s) => s.map((p) => (p.id === updated.id ? updated : p)))
        setSelectedProduct(null)
        setViewState("products")
    }
    function handleDeleted(id: number | string) {
        setProducts((s) => s.filter((p) => p.id !== id))
    }

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-900">
            <SellerSidebar view={view} setView={(v: string) => setViewState(v as View)} productCount={products.length} />

            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <header className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{sellerName ? `Welcome, ${sellerName}` : 'Manage products, upload 3D models, bulk import CSV and monitor system status'}</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setViewState("bulk")} className="btn-outline">Bulk Upload</button>
                            <button onClick={() => setViewState("add")} className="btn-primary">Add Product</button>
                        </div>
                    </header>

                    {/* Views */}
                    {view === "products" && (
                        <ProductListAny
                            products={products}
                            onEdit={(p: any) => {
                                setSelectedProduct(p)
                                setViewState("edit")
                            }}
                            onDelete={handleDeleted}
                            refresh={async () => {
                                const { data } = await api.get("/api/seller/products/")
                                setProducts(data)
                            }}
                        />
                    )}


                    {view === "add" && <ProductForm onCreated={handleCreated} />}

                    {view === "edit" && selectedProduct && (
                        // @ts-ignore - ProductForm props are validated in its module; using as-is here
                        <ProductForm product={selectedProduct} onUpdated={handleUpdated} onCancel={() => setViewState("products")} />
                    )}

                    {view === "bulk" && <CSVUpload onImported={(items: any) => setProducts((s) => [...(items as Product[]), ...s])} />}

                    {view === "payments" && <PaymentsPanel payments={[]} onAction={(id, action) => { console.log('payments action', id, action) }} />}
                                        {view === "orders" && <OrdersPanel />}
                    {view === "reviews" && <ReviewsPanel onModerate={(id, action, reason) => { console.log('moderate', id, action, reason) }} />}
                    {view === "system" && <SystemPanel />}
                    {view === "reports" && <ReportsPanel payments={[]} reviews={[]} products={products as any} systems={[]} />}
                </div>
            </main>
        </div>
    )
}
