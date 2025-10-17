import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

interface Product {
    id: number
    title: string
    price: number
    thumbnail: string
    has3d?: boolean
    rating?: number
    discount?: number
}

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) {
            setError("Missing product id in URL")
            setLoading(false)
            return
        }

        let cancelled = false
        setLoading(true)
        setError(null)

        // Simulate fetching product data
        setTimeout(() => {
            if (cancelled) return

            // In a real app, replace this with an API call
            import("../../lib/demoProducts").then(({ demoProducts }) => {
                const foundProduct = demoProducts.find((p) => p.id === parseInt(id))
                if (foundProduct) {
                    setProduct(foundProduct)
                } else {
                    setError("Product not found")
                }
                setLoading(false)
            }).catch(() => {
                setError("Failed to load product data")
                setLoading(false)
            })
        }, 1000)
        

        return () => {
            cancelled = true
        }
    }, [id])

    if (loading) {
        return <div className="p-6 text-center">Loading product…</div>
    }

    if (error || !product) {
        return <div className="p-6 text-center text-red-600">Error: {error ?? "Product not found"}</div>
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 max-w-3xl mx-auto"
        >
            {/* Image */}
            <div className="relative">
                <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="h-80 w-full object-cover"
                    loading="lazy"
                />
                {product.discount && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md font-semibold">
                        -{product.discount}%
                    </span>
                )}
                {product.has3d && (
                    <span className="absolute bottom-2 right-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-md shadow">
                        3D
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="p-6 space-y-3">
                <h1 className="text-2xl font-semibold text-gray-900">{product.title}</h1>

                <div className="flex items-center gap-4">
                    <span className="text-2xl text-indigo-600 font-bold">${product.price.toFixed(2)}</span>
                    {product.rating !== undefined && (
                        <div className="flex items-center text-sm text-yellow-500">
                            {Array.from({ length: 5 }).map((_, idx) => (
                                <Star
                                    key={idx}
                                    size={16}
                                    fill={idx < Math.round(product.rating!) ? "currentColor" : "none"}
                                />
                            ))}
                            <span className="ml-2 text-gray-500">{product.rating!.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                <p className="text-sm text-gray-600">
                    {/* Placeholder description — replace with real description field if available */}
                    High quality product. Replace this placeholder with the product description from your API.
                </p>

                <button className="w-full sm:w-48 bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-indigo-700">
                    Add to Cart
                </button>
            </div>
        </motion.div>
    )
}
