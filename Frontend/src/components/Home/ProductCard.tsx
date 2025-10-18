// src/components/ProductCard.tsx
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { FaCubes } from "react-icons/fa6";

interface ProductVideo {
    id: number
    video: string
    preview_image?: string | null
}

interface Product {
    id: number
    title: string
    price: number
    thumbnail: string
    has3d?: boolean
    rating?: number
    discount?: number
    videos?: ProductVideo[]
}

export default function ProductCard({
    product,
    index,
}: {
    product: Product
    index: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100"
        >
            <Link to={`/product/${product.id}`}>
                {/* --- Product Image --- */}
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
                        <span className="absolute bottom-2 right-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                            <FaCubes size={12} /> 3D
                        </span>
                    )}
                </div>

                {/* --- Product Info --- */}
                <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{product.title}</h3>

                    {/* --- Price --- */}
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-indigo-600 font-semibold text-base">
                            ${product.price.toFixed(2)}
                        </span>
                        {product.discount && (
                            <span className="text-gray-400 line-through text-xs">
                                ${(product.price / (1 - product.discount / 100)).toFixed(2)}
                            </span>
                        )}
                    </div>

                    {/* --- Rating --- */}
                    {product.rating && (
                        <div className="flex items-center text-xs text-yellow-500">
                            {Array.from({ length: 5 }).map((_, idx) => (
                                <Star
                                    key={idx}
                                    size={14}
                                    fill={idx < Math.round(product.rating) ? "currentColor" : "none"}
                                />
                            ))}
                            <span className="ml-1 text-gray-500">{product.rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                {/* --- Product Videos (if available) --- */}
                {product.videos && product.videos.length > 0 && (
                    <div className="p-4 border-t border-gray-100 space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">Product Videos</h4>
                        <div className="grid md:grid-cols-2 gap-3">
                            {product.videos.map((vid, idx) => (
                                <div
                                    key={vid.id || idx}
                                    className="rounded-xl overflow-hidden shadow-sm bg-gray-100 relative group/video"
                                >
                                    {vid.preview_image && (
                                        <div className="relative">
                                            <img
                                                src={vid.preview_image}
                                                alt="Video preview"
                                                className="w-full h-40 object-cover"
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    const videoEl = document.getElementById(
                                                        `video-${product.id}-${idx}`
                                                    ) as HTMLVideoElement
                                                    videoEl?.play()
                                                }}
                                                className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-lg font-bold rounded-xl opacity-0 group-hover/video:opacity-100 transition"
                                            >
                                                ▶
                                            </button>
                                        </div>
                                    )}

                                    <video
                                        id={`video-${product.id}-${idx}`}
                                        controls
                                        poster={vid.preview_image || ""}
                                        className="w-full h-40 object-cover rounded-b-xl"
                                    >
                                        <source src={vid.video} type="video/mp4" />
                                        Your browser does not support video playback.
                                    </video>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- Add to Cart --- */}
                <div className="p-4 pt-0">
                    <button className="w-full bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg mt-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-700">
                        Add to Cart
                    </button>
                </div>
            </Link>
        </motion.div>
    )
}
