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
import api from "../../lib/api"

type View = "products" | "add" | "edit" | "payments" | "reviews" | "system" | "reports" | "bulk"

type Product = {
    id: number | string
    title: string
    price: number
    thumbnail: string
    model_3d: string
}

export default function SellerDashboard() {
    const [view, setView] = useState<View>("products")
    const [products, setProducts] = useState<Product[]>([])
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

    // load products (and other panels data if you want)
    useEffect(() => {
        let mounted = true;
        (async () => {

            try {
                console.log("token(localStorage) =>", localStorage.getItem("token"))
                console.log("role(localStorage) =>", localStorage.getItem("role"))
                // uncomment when backend exists:
                const { data } = await api.get("/api/seller/products/")
                if (mounted) setProducts(data)


            } catch (err) {
                console.error("Failed to load seller products", err.response ?? err)
            }
        })()
        return () => {
            mounted = false
        }
    }, [])

    // basic handlers used by child components
    function handleCreated(product: Product) {
        setProducts((s) => [product, ...s])
        setView("products")
    }
    function handleUpdated(updated: Product) {
        setProducts((s) => s.map((p) => (p.id === updated.id ? updated : p)))
        setSelectedProduct(null)
        setView("products")
    }
    function handleDeleted(id: number | string) {
        setProducts((s) => s.filter((p) => p.id !== id))
    }

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-900">
            <SellerSidebar view={view} setView={setView} productCount={products.length} />

            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <header className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Seller Dashboard</h1>
                            <p className="text-sm text-zinc-500">Manage products, upload 3D models, bulk import CSV and monitor system status</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setView("bulk")} className="btn-outline">Bulk Upload</button>
                            <button onClick={() => setView("add")} className="btn-primary">Add Product</button>
                        </div>
                    </header>

                    {/* Views */}
                    {view === "products" && (
                        <ProductList
                            products={products}
                            onEdit={(p) => {
                                setSelectedProduct(p)
                                setView("edit")
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
                        <ProductForm product={selectedProduct} onUpdated={handleUpdated} onCancel={() => setView("products")} />
                    )}

                    {view === "bulk" && <CSVUpload onImported={(items) => setProducts((s) => [...items, ...s])} />}

                    {view === "payments" && <PaymentsPanel />}
                    {view === "reviews" && <ReviewsPanel />}
                    {view === "system" && <SystemPanel />}
                    {view === "reports" && <ReportsPanel payments={[]} reviews={[]} products={products} systems={[]} />}
                </div>
            </main>
        </div>
    )
}
