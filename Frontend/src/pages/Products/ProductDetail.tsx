// src/pages/Products/ProductDetailPage.tsx
import { useParams, Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Star,
    Store,
    ChevronLeft,
    ChevronRight,
    Box,
    Tag,
    Package,
    Layers,
    Ruler,
} from "lucide-react"
import api from "../../lib/api"
import { useDispatch } from 'react-redux'
import { fetchCart } from '../../store/Cart'
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import ReviewForm from "../../components/Reviews/ReviewForm"
import ReviewList from "../../components/Reviews/ReviewList"
import Product3DPreview from "../seller/components/Product3DPreview"

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
    price: number | string
    thumbnail: string
    images?: Array<string | { image: string }>
    model_3d?: string
    has3d?: boolean
    rating?: number
    ratingCount?: number
    reviewsCount?: number
    discount?: number
    description?: string
    seller?: Seller
    videos?: ProductVideo[]
    stock?: number
    sku?: string
    brand?: string
    dimensions?: string
    weight?: string
    warranty?: string
    category?: string
    attributes?: { key: string; value: string }[]
}

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentImage, setCurrentImage] = useState(0)
    const [show3D, setShow3D] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const detect3DModel = (data: any): string | null => {
        const allUrls: string[] = []
        if (data.model_3d) allUrls.push(data.model_3d)
        if (data.model3d) allUrls.push(data.model3d)
        if (data.three_d_model) allUrls.push(data.three_d_model)
        if (Array.isArray(data.images)) allUrls.push(...data.images)
        if (Array.isArray(data.videos)) allUrls.push(...data.videos.map((v: any) => v.video))
        const match = allUrls.find((url) => typeof url === "string" && url.match(/\.(glb|gltf)$/i))
        return match || null
    }

    useEffect(() => {
        if (!id) {
            setError("Missing product ID in URL");
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        const fetchProduct = async () => {
            setLoading(true);
            setError(null);

            try {
                const { data } = await api.get(`/api/products/${id}/`, {
                    signal: controller.signal,
                });

                const detectedModel = detect3DModel(data);
                const enrichedData = {
                    ...data,
                    model_3d: detectedModel,
                    has3d: Boolean(detectedModel),
                };

                setProduct(enrichedData);
                setLoading(false);
            } catch (err: any) {
                if (axios.isCancel(err)) return;

                console.error("❌ Failed to load product:", err);

                // ⏳ Force show loading first, then "Product not found" after 3s
                setLoading(true);
                setTimeout(() => {
                    setLoading(false);
                    setError("Product not found");
                }, 3000);
            }
        };

        fetchProduct();
        return () => controller.abort();
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

    const basePrice = Number(product.price)
    const hasDiscount = product.discount && Number(product.discount) > 0
    const discountedPrice = hasDiscount
        ? basePrice * (1 - Number(product.discount) / 100)
        : basePrice
    const discountAmount = hasDiscount ? basePrice - discountedPrice : 0

    const images = [
        product.thumbnail,
        ...(Array.isArray(product.images) ? product.images : []).map(img => typeof img === 'string' ? img : img.image) || []
    ].filter(Boolean)

    const normalizeAttributes = (attrs: any): { key: string; value: string }[] => {
        if (!attrs) return []
        try {
            let data = attrs
            if (typeof attrs === 'string') {
                // sometimes API returns JSON-stringified attributes
                data = JSON.parse(attrs)
            }

            if (Array.isArray(data)) {
                return data
                    .map((item) => {
                        if (typeof item === 'string') {
                            const [k, v] = item.split(":").map((s) => s.trim())
                            return { key: k || item, value: v || "" }
                        }
                        if (typeof item === 'object' && item !== null) {
                            const key = item.key ?? item.name ?? item.label ?? Object.keys(item)[0]
                            const value = item.value ?? item.val ?? item.v ?? item[key] ?? ""
                            return { key: String(key), value: String(value ?? "") }
                        }
                        return { key: String(item), value: "" }
                    })
                    .filter(Boolean)
            }

            if (typeof data === 'object' && data !== null) {
                return Object.entries(data).map(([k, v]) => ({ key: k, value: v === null || v === undefined ? "" : String(v) }))
            }
        } catch (err) {
            console.warn("Failed to normalize product.attributes:", err)
        }
        return []
    }

    const attrs = normalizeAttributes(product.attributes)
    console.log('attrs', attrs)


    const handlePrev = () =>
        setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
    const handleNext = () =>
        setCurrentImage((prev) => (prev + 1) % images.length)

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gray-50 min-h-screen pb-24"
        >
            {/* 🔹 Breadcrumb */}
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
                <ol className="flex flex-wrap items-center space-x-2 text-sm text-gray-600">
                    <li><Link to="/" className="hover:text-indigo-600">Home</Link></li>
                    <li>/</li>
                    <li><Link to="/catalog" className="hover:text-indigo-600">Catalog</Link></li>
                    <li>/</li>
                    <li className="text-gray-900 font-medium truncate">{product.title}</li>
                </ol>
            </nav>

            <div>
                {/* 🔹 Product Section */}
                <div className="mx-auto mt-8 max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-10 px-4 sm:px-6 lg:px-8">
                    {/* --- Left: Media --- */}
                    <div className="lg:col-span-2 space-y-5 relative bg-white rounded-xl p-4 shadow-sm border">
                        <AnimatePresence mode="wait">
                            {!show3D ? (
                                <div>
                                    <motion.div
                                        key="images"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <div className="relative">
                                            <img
                                                src={images[currentImage]}
                                                alt={product.title}
                                                className="rounded-lg object-cover w-full max-h-[480px] shadow-md"
                                            />
                                            {images.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={handlePrev}
                                                        className="absolute top-1/2 left-3 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white shadow"
                                                    >
                                                        <ChevronLeft size={20} />
                                                    </button>
                                                    <button
                                                        onClick={handleNext}
                                                        className="absolute top-1/2 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white shadow"
                                                    >
                                                        <ChevronRight size={20} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                    <div>
                                        <div className="flex flex-row items-center ml-6 md:ml-0">
                                            <ul
                                                id="thumbnail-container"
                                                className="flex flex-nowrap h-full w-full items-center justify-start overflow-x-auto pt-6 md:ml-0 md:mr-6"
                                                aria-label={`Open image`}
                                                data-product-title={product.title}
                                            >
                                                {images.map((src, index) => (
                                                    <li key={index} className="mr-6">
                                                        <button
                                                            className={`product-thumbnail ${index === 2 ? "border" : "" // Example: mark one as active
                                                                }`}
                                                            onClick={() => setCurrentImage(index)}
                                                            aria-current={index === 2 ? "true" : "false"}
                                                            aria-label={`Open image ${index + 1} (${product.title})`}
                                                        >
                                                            <figure
                                                                className="pointer-events-none thumbnail-image"
                                                                role="presentation"
                                                                aria-hidden="true"
                                                            >
                                                                <picture>
                                                                    <img
                                                                        src={src}
                                                                        alt={`${product.title} Image ${index + 1}`}
                                                                        loading="lazy"
                                                                        width="100"
                                                                        height="100"
                                                                        className="max-w-none cursor-pointer object-cover mx-auto"
                                                                        decoding="auto"
                                                                        fetchPriority="auto"
                                                                    />
                                                                </picture>
                                                            </figure>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <motion.div
                                    key="3dview"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="h-[480px] border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center"
                                >
                                    <Product3DPreview url={product.model_3d!} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {product.has3d && (
                            <div className="flex justify-center">
                                <button
                                    onClick={() => setShow3D((p) => !p)}
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm"
                                >
                                    <Box size={18} />
                                    {show3D ? "Hide 3D View" : "View in 3D"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* --- Right: Info --- */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                        {product.seller && (
                            <div className="flex items-center gap-2 mb-3">
                                <img src={product.seller.logo} alt={product.seller.name} className="w-8 h-8 rounded-full border" />
                                <span className="text-sm text-gray-700 flex items-center gap-1">
                                    <Store size={14} /> {product.seller.name}
                                </span>
                            </div>
                        )}

                        <h1 className="text-3xl font-semibold text-gray-900 leading-snug mb-2">{product.title}</h1>

                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex text-yellow-500">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} size={16} fill={i < Math.round(product.rating || 0) ? "currentColor" : "none"} />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500">
                                {product.ratingCount ? `${product.ratingCount} ratings` : "No ratings yet"}
                            </span>
                        </div>

                        <div className="space-y-1 mb-4">
                            {hasDiscount && (
                                <div className="text-sm text-green-600 font-medium">
                                    Save {product.discount}% (${discountAmount.toFixed(2)} OFF)
                                </div>
                            )}
                            <div className="flex items-baseline gap-3">
                                {hasDiscount && (
                                    <span className="text-gray-400 line-through text-lg">${basePrice.toFixed(2)}</span>
                                )}
                                <span className="text-3xl font-bold text-indigo-600">
                                    ${discountedPrice.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {product.stock !== undefined && (
                            <p className={`mt-2 text-sm ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                                {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                            </p>
                        )}

                        <div className="mt-6 border-t pt-3 text-sm text-default space-y-1">
                            {product.brand && (
                                <p><Tag className="inline mr-2 text-muted" size={14} /> <strong>Brand:</strong> {product.brand}</p>
                            )}
                            {product.sku && (
                                <p><Package className="inline mr-2 text-muted" size={14} /> <strong>SKU:</strong> {product.sku}</p>
                            )}
                            {product.dimensions && (
                                <p><Ruler className="inline mr-2 text-muted" size={14} /> <strong>Dimensions:</strong> {product.dimensions}</p>
                            )}
                            {product.weight && (
                                <p><Layers className="inline mr-2 text-muted" size={14} /> <strong>Weight:</strong> {product.weight}</p>
                            )}
                        </div>

                        {/*   Custom Attributes */}

                        {attrs.length > 0 && (
                            <div className="mt-6 pt-4 border-t space-y-2">
                                <h3 className="font-semibold text-default text-sm uppercase tracking-wide">Specifications</h3>
                                <div className="grid gap-2">
                                    {attrs.map((attr, idx) => (
                                        <div key={idx} className="flex justify-between items-start p-2 rounded bg-black/5 dark:bg-white/5">
                                            <span className="font-medium text-sm text-muted">{attr.key}</span>
                                            <span className="text-sm text-default">{attr.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={async () => {
                                    const role = localStorage.getItem('role')
                                    if (role !== 'customer') {
                                        alert('Only customers can add items to cart. Please log in as a customer.')
                                        return
                                    }
                                    try {
                                        await api.post('/api/cart/', { product: product.id, qty: 1 })
                                        try { dispatch(fetchCart() as any) } catch { }
                                        // navigate to cart page so user can review the added product
                                        navigate(`/cart?added=${product.id}`)
                                    } catch (err) {
                                        console.error('Add to cart failed', err)
                                        alert('Failed to add to cart')
                                    }
                                }}
                                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition"
                            >
                                Add to Cart
                            </button>

                            <button
                                onClick={async () => {
                                    const role = localStorage.getItem('role')
                                    if (role !== 'customer') {
                                        alert('Only customers can purchase. Please log in as a customer.')
                                        return
                                    }
                                    try {
                                        // don't necessarily add to persistent cart; navigate to checkout with product prefilled
                                        navigate(`/checkout?product=${product.id}&qty=1`)
                                    } catch (err) {
                                        console.error('Buy now failed', err)
                                        alert('Failed to proceed to checkout')
                                    }
                                }}
                                className="flex-1 bg-gray-100 text-gray-900 py-2 rounded-lg border hover:bg-gray-200 font-medium transition"
                            >
                                Buy Now
                            </button>
                        </div>

                        <p className="mt-6 text-gray-700 text-sm leading-relaxed border-t pt-4 whitespace-pre-line break-words">
                            {product.description || "This product is crafted with premium materials and designed for lasting performance."}
                        </p>
                    </div>
                </div>

                {/* Reviews */}
                <div className="max-w-7xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Customer Feedback</h2>
                    <ReviewForm productId={Number(id)} />
                    <div className="mt-8">
                        <ReviewList productId={Number(id)} />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
