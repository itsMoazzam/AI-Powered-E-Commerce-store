import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Star } from "lucide-react"

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
interface ProductVideo {
    id: number;
    video: string;
    preview_image?: string | null;
}


export default function ProductCard({ product, index }: { product: Product; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
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

                                    <video
                                        id={`video-${idx}`}
                                        controls
                                        poster={vid.preview_image || ""}
                                        className="w-full h-48 object-cover rounded-b-xl"
                                    >
                                        <source src={vid.video} type="video/mp4" />
                                        Your browser does not support video playback.
                                    </video>
                                </div>
                            ))}
                        </div>
                    </div>
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
        </motion.div>
    )
}
