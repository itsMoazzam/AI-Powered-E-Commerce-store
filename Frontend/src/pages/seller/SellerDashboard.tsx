// FILE: src/pages/seller/SellerDashboard.tsx
import { useEffect, useState } from "react"
import SellerSidebar from "./components/SellerSidebar"
import ProductForm from "./components/ProductForm"
import ProductList from "./components/ProductList"
import PaymentsPanel from "./components/PaymentsPanel"
import ReviewsPanel from "./components/ReviewsPanel"
import SystemPanel from "./components/SystemPanel"
import ReportsPanel from "./components/ReportsPanel"
import api from "../../lib/api"

const SellerDashboard = () => {
    const [view, setView] = useState<
        | "products"
        | "add"
        | "payments"
        | "reviews"
        | "system"
        | "reports"
    >("products")

    // global mock / quick state (so panels can fallback while backend is not ready)
    type Product = {
        id: number
        title: string
        price: number
        thumbnail?: string
        image?: string
        model_3d?: string
    }
    type SystemStatus = {
        name: string
        status: string
        details: string
        last_checked: string
    }
    type Payment = {
        id: string
        amount: number
        date: string
        // The following fields are for other panels, not ReportsPanel
        txn_id: string | number
        bank?: string
        ocr_summary?: string
        email_match?: boolean
        screenshot?: string
        uploaded_at?: string
        status?: string
    }
    type Review = {
        id: number
        user: string
        product: string
        text: string
        toxicity: number
        confidence: number
        flag: string
        moderated?: string
        moderator_note?: string
    }
    const [products, setProducts] = useState<Product[]>([])

    const [payments, setPayments] = useState<Payment[]>([])

    const [reviews, setReviews] = useState<Review[]>([])

    const [systems, setSystems] = useState<SystemStatus[]>([])

    useEffect(() => {
        // initial load (backend-ready calls are commented; demo fallbacks used)
        ; (async () => {
            try {
                // Uncomment when backend available
                const { data: p } = await api.get('/api/seller/products/')
                setProducts(p)

                const { data: pay } = await api.get('/api/admin/payments/')
                setPayments(pay)

                const { data: rev } = await api.get('/api/admin/reviews/')
                setReviews(rev)

                const { data: sys } = await api.get('/api/admin/system-status/')
                setSystems(sys)

                // Demo data for frontend-only testing
                setProducts([
                    { id: 1, title: "Men's Running Shoes", price: 79.99, thumbnail: "/images/men-shoes.jpg", model_3d: "/models/shoe.glb" },
                    { id: 2, title: "Smart Watch", price: 199.99, thumbnail: "/images/watch.jpg" },
                ]);

                setPayments([
                    { id: "101", amount: 1500, date: "2025-09-01", txn_id: "TXN-AB123", bank: "ACME Bank", ocr_summary: "Paid 1500 TXN AB123", email_match: true, screenshot: "/mock/payments/pay1.jpg", uploaded_at: "2025-09-01T11:22:33Z", status: "pending" },
                    { id: "102", amount: 249.5, date: "2025-09-02", txn_id: "TXN-XY987", bank: "Global Bank", ocr_summary: "Paid 249.50 Ref XY987", email_match: false, screenshot: "/mock/payments/pay2.jpg", uploaded_at: "2025-09-02T09:10:11Z", status: "pending" },
                ]);

                setReviews([
                    { id: 201, user: "ali@example.com", product: "Men's Running Shoes", text: "Terrible quality", toxicity: 0.82, confidence: 0.92, flag: "hate" },
                    { id: 202, user: "sana@example.com", product: "Smart Watch", text: "Love it!", toxicity: 0.05, confidence: 0.12, flag: "none" },
                ])

                setSystems([
                    { name: "OCR Service", status: "OK", details: "Healthy, avg latency 200ms", last_checked: "2025-10-08T10:00:00Z" },
                    { name: "IMAP Poller", status: "Warning", details: "Mailbox queue rising", last_checked: "2025-10-08T09:58:00Z" },
                ])
            } catch (e) {
                console.error(e)
            }
        })()
    }, [])

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-zinc-900">
            <SellerSidebar view={view} setView={setView} productCount={products.length} />

            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Seller Dashboard</h1>
                            <p className="text-sm text-zinc-500">Manage products, payments, reviews and system health</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="btn-outline">Help</button>
                            <button className="btn-primary">Notifications</button>
                        </div>
                    </div>

                    {/* Views */}
                    {view === "products" && <ProductList products={products} />}
                    {view === "add" && <ProductForm onCreated={(p: Product) => setProducts((s) => [p, ...s])} />}
                    {view === "payments" && (
                        <PaymentsPanel
                            payments={payments}
                            onAction={(
                                id: string | number,
                                action: "approve" | "reject"
                            ) => {
                                setPayments((s) =>
                                    s.map((p) =>
                                        p.id === id
                                            ? {
                                                ...p,
                                                status: action === "approve" ? "approved" : "rejected",
                                            }
                                            : p
                                    )
                                )
                            }}
                        />
                    )}
                    {view === "reviews" && (
                        <ReviewsPanel
                            reviews={reviews}
                            onModerate={(
                                id: Review["id"],
                                action: string,
                                note: string
                            ) => {
                                setReviews((s) =>
                                    s.map((r: Review) =>
                                        r.id === id
                                            ? ({
                                                ...r,
                                                moderated: action,
                                                moderator_note: note,
                                            } as Review)
                                            : r
                                    )
                                )
                            }}
                        />
                    )}
                    {view === "system" && <SystemPanel systems={systems} />}
                    {view === "reports" && <ReportsPanel payments={payments} reviews={reviews} systems={systems} products={products} />}
                </div>
            </main>
        </div>
    )
}



export default SellerDashboard