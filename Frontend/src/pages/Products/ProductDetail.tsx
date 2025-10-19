import { useParams, Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Star, Store } from "lucide-react"

interface ProductVideo {
    id: number
    video: string
    preview_image?: string | null
}

interface Seller {
    name: string
    logo: string
}

interface Product {
    id: number
    title: string
    price: number
    thumbnail: string
    has3d?: boolean
    rating?: number
    ratingCount?: number
    reviewsCount?: number
    discount?: number
    description?: string
    seller?: Seller
    videos?: ProductVideo[]
}

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) {
            setError("Missing product ID in URL")
            setLoading(false)
            return
        }

        let cancelled = false
        setLoading(true)

        setTimeout(() => {
            if (cancelled) return

            import("../../lib/demoProducts")
                .then(({ demoProducts }) => {
                    const foundProduct = demoProducts.find((p: Product) => p.id === parseInt(id))
                    if (foundProduct) setProduct(foundProduct)
                    else setError("Product not found")
                })
                .catch(() => setError("Failed to load product"))
                .finally(() => setLoading(false))
        }, 1000)

        return () => {
            cancelled = true
        }
    }, [id])

    if (loading) return <div className="p-6 text-center">Loading product…</div>
    if (error || !product)
        return <div className="p-6 text-center text-red-600">Error: {error ?? "Product not found"}</div>

    // Discount calculations
    const hasDiscount = product.discount && product.discount > 0
    const originalPrice = hasDiscount
        ? product.price
        : product.price * (1 + Math.random() * 0.3)
    const discountedPrice = hasDiscount
        ? product.price * (1 - (product.discount ?? 0) / 100)
        : product.price

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white"
        >
            <div className="pt-6">
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <ol className="flex items-center space-x-2 text-sm text-gray-600">
                        <li><Link to="/" className="hover:text-indigo-600">Home</Link></li>
                        <li>/</li>
                        <li><Link to="/catalog" className="hover:text-indigo-600">Catalog</Link></li>
                        <li>/</li>
                        <li className="text-gray-900 font-medium">{product.title}</li>
                    </ol>
                </nav>

                {/* Product layout */}
                <div className="mx-auto mt-6 max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-10 px-4 sm:px-6 lg:px-8">
                    {/* --- Left: Image Gallery --- */}
                    <div className="lg:col-span-2 space-y-4">
                        <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="rounded-lg object-cover w-full h-[500px] shadow-sm"
                        />
                        {product.videos?.length ? (
                            <div className="grid grid-cols-2 gap-4">
                                {product.videos.map((vid) => (
                                    <video
                                        key={vid.id}
                                        controls
                                        poster={vid.preview_image || ""}
                                        className="rounded-lg shadow-sm object-cover w-full h-48"
                                    >
                                        <source src={vid.video} type="video/mp4" />
                                    </video>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    {/* --- Right: Info Panel --- */}
                    <div>
                        {/* Seller Info */}
                        {product.seller && (
                            <div className="flex items-center gap-2 mb-3">
                                <img
                                    src={product.seller.logo}
                                    alt={product.seller.name}
                                    className="w-8 h-8 rounded-full border"
                                />
                                <span className="text-sm text-gray-700 flex items-center gap-1">
                                    <Store size={14} /> {product.seller.name}
                                </span>
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-2xl font-semibold text-gray-900">{product.title}</h1>

                        {/* Rating & Reviews */}
                        <div className="flex items-center gap-2 mt-2">
                            {product.rating !== undefined && (
                                <div className="flex items-center text-yellow-500">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            fill={i < Math.round(product.rating!) ? "currentColor" : "none"}
                                        />
                                    ))}
                                </div>
                            )}
                            {product.ratingCount && (
                                <span className="text-sm text-gray-500">{product.ratingCount} ratings</span>
                            )}
                            {product.reviewsCount && (
                                <span className="text-sm text-indigo-600 hover:underline cursor-pointer">
                                    ({product.reviewsCount} reviews)
                                </span>
                            )}
                        </div>

                        {/* Pricing */}
                        <div className="mt-4 space-y-1">
                            {hasDiscount && (
                                <div className="text-sm text-green-600 font-medium">
                                    Save {product.discount}% (${(originalPrice - discountedPrice).toFixed(2)} OFF)
                                </div>
                            )}
                            <div className="flex items-baseline gap-3">
                                {hasDiscount && (
                                    <span className="text-gray-400 line-through text-lg">
                                        ${originalPrice.toFixed(2)}
                                    </span>
                                )}
                                <span className="text-3xl font-bold text-indigo-600">
                                    ${discountedPrice.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="mt-6 flex gap-3">
                            <button className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium transition">
                                Add to Cart
                            </button>
                            <button className="flex-1 bg-gray-100 text-gray-900 py-2 rounded-lg border hover:bg-gray-200 font-medium transition">
                                Buy Now
                            </button>
                        </div>

                        {/* Description */}
                        <div className="mt-8 border-t pt-4 text-gray-700 text-sm leading-relaxed">
                            {product.description ||
                                "This is a high-quality product designed for performance and comfort. Replace this with the product’s actual description from your API."}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
