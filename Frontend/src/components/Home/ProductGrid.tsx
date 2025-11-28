// src/components/ProductGrid.tsx
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import ProductCard from "./ProductCard"
import api from "../../lib/api" // ✅ your Axios wrapper

interface Product {
    id: number
    title: string
    price: number | string
    thumbnail: string
    has3d?: boolean
    rating?: number
    discount?: number
}

export default function ProductGrid() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true)
                const response = await api.get("/api/products/?page=1&page_size=4") // ✅ Django REST endpoint with pagination
                console.log(response.data)
                const formattedProducts = response.data.results.map((p: any) => ({
                    ...p,
                    has3d: Boolean(p.model_3d), // 👈 derive has3d flag from model_3d
                }))

                setProducts(formattedProducts)
            } catch (err) {
                console.error("Error fetching products:", err)
                setError("Failed to load products. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    if (loading)
        return (
            <section className="px-4 md:px-10 py-16 bg-surface text-center">
                <div className="animate-pulse text-muted text-lg">Loading products...</div>
            </section>
        )

    if (error)
        return (
            <section className="px-4 md:px-10 py-16 bg-surface text-center text-red-500 font-medium">
                {error}
            </section>
        )

    if (!products.length)
        return (
            <section className="px-4 md:px-10 py-16 bg-surface text-center text-muted">
                No products found.
            </section>
        )

    return (
        <section className="px-4 md:px-10 py-10 bg-surface">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-default">✨ Featured Products</h2>
                <Link
                    to="/search"
                    className="text-primary hover:opacity-90 text-sm font-medium transition"
                >
                    View All →
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product, index) => (
                    <ProductCard key={product.id || index} product={product as any} index={index} />
                ))}
            </div>
        </section>
    )
}
