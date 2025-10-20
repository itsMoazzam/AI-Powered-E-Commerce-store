<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> ca2b3e8ceabab9e74a8d48236511903245ff924f
// src/components/ProductDetailPage.tsx
import { useParams, Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Star, Store } from "lucide-react"
import api from "../../lib/api"
import ReviewForm from "../../components/Reviews/ReviewForm"
import ReviewList from "../../components/Reviews/ReviewList"

interface ProductVideo {
    id: number
    video: string
    preview_image?: string | null
}

interface Seller {
    name: string
    logo: string
}
<<<<<<< HEAD
=======
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
>>>>>>> devMoazzam
=======
>>>>>>> ca2b3e8ceabab9e74a8d48236511903245ff924f

interface Product {
    id: number
    title: string
    price: number | string
    thumbnail: string
    images?: string[]
    has3d?: boolean
    rating?: number
    ratingCount?: number
    reviewsCount?: number
    discount?: number
    description?: string
    seller?: Seller
    videos?: ProductVideo[]
    stock?: number
    category?: string
}

<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> ca2b3e8ceabab9e74a8d48236511903245ff924f
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

        const controller = new AbortController()
        async function fetchProduct() {
            try {
                setLoading(true)
                const response = await api.get(`/api/products/${id}/`, {
                    signal: controller.signal,
                })
                setProduct(response.data)
            } catch (err: any) {
                if (err.name !== "CanceledError") {
                    console.error("Failed to load product:", err)
                    setError("Failed to load product details. Please try again later.")
                }
            } finally {
                setLoading(false)
            }
        }

        fetchProduct()
        return () => controller.abort()
    }, [id])

    if (loading)
        return (
            <div className="p-10 text-center text-gray-500 animate-pulse">
                Loading product details…
            </div>
        )

    if (error || !product)
        return (
            <div className="p-10 text-center text-red-600 font-medium">
                {error || "Product not found"}
            </div>
        )

    // 🧮 Price calculations
    const basePrice = Number(product.price)
    const hasDiscount = product.discount && product.discount > 0
    const discountedPrice = hasDiscount
        ? basePrice * (1 - (product.discount ?? 0) / 100)
        : basePrice
    const discountAmount = hasDiscount ? basePrice - discountedPrice : 0

<<<<<<< HEAD
=======
export default function ProductCard({ product, index }: { product: Product; index: number }) {
>>>>>>> devMoazzam
=======
>>>>>>> ca2b3e8ceabab9e74a8d48236511903245ff924f
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> ca2b3e8ceabab9e74a8d48236511903245ff924f
            transition={{ duration: 0.4 }}
            className="bg-white"
        >
            <div className="pt-6">
                {/* 🔹 Breadcrumb */}
                <nav
                    aria-label="Breadcrumb"
                    className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
                >
                    <ol className="flex items-center space-x-2 text-sm text-gray-600">
                        <li>
                            <Link to="/" className="hover:text-indigo-600">
                                Home
                            </Link>
                        </li>
                        <li>/</li>
                        <li>
                            <Link to="/catalog" className="hover:text-indigo-600">
                                Catalog
                            </Link>
                        </li>
                        <li>/</li>
                        <li className="text-gray-900 font-medium">{product.title}</li>
                    </ol>
                </nav>
<<<<<<< HEAD
=======
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100"
        >
            <Link to={`/product/${product.id}`}>
                {/* Image */}
                <div className="relative">
                    <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                {/* --- Product Videos --- */}
                {product?.videos && product.videos.length > 0 && (
                    <div className="mt-4 space-y-3">
                        <h3 className="text-sm font-medium text-gray-700">Product Videos</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {product.videos.map((vid, idx) => (
                                <div
                                    key={vid.id || idx}
                                    className="rounded-xl overflow-hidden shadow-sm bg-gray-100"
                                >
                                    {vid.preview_image && (
                                        <div className="relative">
                                            <img
                                                src={vid.preview_image}
                                                alt="Video preview"
                                                className="w-full h-48 object-cover"
                                            />
                                            <button
                                                onClick={() => {
                                                    const videoEl = document.getElementById(`video-${idx}`) as HTMLVideoElement
                                                    videoEl?.play()
                                                }}
                                                className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-lg font-bold rounded-xl"
                                            >
                                                ▶
                                            </button>
                                        </div>
                                    )}
>>>>>>> devMoazzam
=======
>>>>>>> ca2b3e8ceabab9e74a8d48236511903245ff924f

                {/* 🔹 Product layout */}
                <div className="mx-auto mt-6 max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-10 px-4 sm:px-6 lg:px-8">
                    {/* --- Left: Image / Video Gallery --- */}
                    <div className="lg:col-span-2 space-y-4">
                        <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="rounded-lg object-cover w-full h-[480px] shadow-sm"
                        />
                        {product.images?.length ? (
                            <div className="grid grid-cols-3 gap-3">
                                {product.images.map((img, i) => (
                                    <img
                                        key={i}
                                        src={img}
                                        alt={`${product.title}-${i}`}
                                        className="rounded-lg w-full h-32 object-cover border hover:opacity-80 transition"
                                    />
                                ))}
                            </div>
                        ) : null}

                        {product.videos?.length ? (
                            <div className="grid grid-cols-2 gap-4 mt-4">
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
                        <h1 className="text-2xl font-semibold text-gray-900">
                            {product.title}
                        </h1>

                        {/* Rating */}
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
                                <span className="text-sm text-gray-500">
                                    {product.ratingCount} ratings
                                </span>
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
                                    Save {product.discount}% (${discountAmount.toFixed(2)} OFF)
                                </div>
                            )}
                            <div className="flex items-baseline gap-3">
                                {hasDiscount && (
                                    <span className="text-gray-400 line-through text-lg">
                                        ${basePrice.toFixed(2)}
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

                        {/* Stock */}
                        {product.stock !== undefined && (
                            <p
                                className={`mt-3 text-sm ${product.stock > 0 ? "text-green-600" : "text-red-500"
                                    }`}
                            >
                                {product.stock > 0
                                    ? `In Stock (${product.stock} available)`
                                    : "Out of Stock"}
                            </p>
                        )}

                        {/* Description */}
                        <div className="mt-8 border-t pt-4 text-gray-700 text-sm leading-relaxed">
                            {product.description ||
                                "This product is crafted with premium materials and designed for lasting performance."}
                        </div>
                    </div>
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> ca2b3e8ceabab9e74a8d48236511903245ff924f
                </div>

                {/* 🔹 Reviews Section */}
                <div className="max-w-5xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">
                        Customer Feedback
                    </h2>
                    <ReviewForm productId={Number(id)} />
                    <div className="mt-8">
                        <ReviewList productId={Number(id)} />
                    </div>
                </div>
            </div>
<<<<<<< HEAD
=======
                )}


                {/* Info */}
                <div className="p-4 space-y-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{product.title}</h3>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="text-indigo-600 font-medium">${product.price.toFixed(2)}</span>
                    </div>

                    {/* Rating */}
                    {product.rating && (
                        <div className="flex items-center text-xs text-yellow-500 mt-1">
                            {Array.from({ length: 5 }).map((_, idx) => (
                                <Star
                                    key={idx}
                                    size={14}
                                    fill={idx < Math.round(product.rating!) ? "currentColor" : "none"}
                                />
                            ))}
                            <span className="ml-1 text-gray-500">{product.rating.toFixed(1)}</span>
                        </div>
                    )}

                    {/* Add to Cart Button */}
                    <button className="w-full bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg mt-3 opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-700">
                        Add to Cart
                    </button>
                </div>
            </Link>
>>>>>>> devMoazzam
=======
>>>>>>> ca2b3e8ceabab9e74a8d48236511903245ff924f
        </motion.div>
    )
}
