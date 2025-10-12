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
}

export default function ProductCard({ product, index }: { product: Product; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card overflow-hidden hover:shadow-lg transition-shadow group"
        >
            <Link to={`/product/${product.id}`}>
                <div className="relative">
                    <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="h-44 w-full object-cover"
                        loading="lazy"
                    />
                    {product.discount && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg">
                            -{product.discount}%
                        </span>
                    )}
                </div>
                <div className="p-3 space-y-1">
                    <div className="font-medium line-clamp-1">{product.title}</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                        <span>${product.price.toFixed(2)}</span>
                        {product.has3d && (
                            <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-800 px-2 py-0.5 rounded-lg">
                                3D
                            </span>
                        )}
                    </div>
                    {/* Rating */}
                    {product.rating && (
                        <div className="flex items-center text-xs text-yellow-500">
                            {Array.from({ length: 5 }).map((_, idx) => (
                                <Star key={idx} size={14} fill={idx < product.rating! ? "currentColor" : "none"} />
                            ))}
                            <span className="ml-1 text-zinc-500">{product.rating.toFixed(1)}</span>
                        </div>
                    )}
                    {/* CTA */}
                    <button className="btn-secondary w-full mt-2 opacity-0 group-hover:opacity-100 transition">
                        Add to Cart
                    </button>
                </div>
            </Link>
        </motion.div>
    )
}
