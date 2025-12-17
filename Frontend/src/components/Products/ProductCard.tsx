// src/components/ProductCard.tsx
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { useState } from 'react'
import ReportModal from '../ReportModal'

interface Product {
    id: number
    title: string
    price: number
    thumbnail: string
    has3d?: boolean
    rating?: number
    discount?: number
}

export default function ProductCard({
    product,
    index,
}: {
    product: Product
    index: number
}) {
    const [reportOpen, setReportOpen] = useState(false)

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-card"
        >
            <Link to={`/product/${product.id}`} >
                {/* Image */}
                <div className="relative">
                    <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                    />

                    {/* Report button - prevents link navigation */}
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setReportOpen(true) }}
                        title="Report product"
                        className="absolute top-2 right-2 bg-white/90 text-red-600 text-xs px-2 py-1 rounded-md border border-red-100 hover:bg-red-50"
                    >
                        Report
                    </button>

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
                <div className="p-4 space-y-1">
                    <h3 className="font-semibold text-default line-clamp-1">
                        {product.title}
                    </h3>
                    <div className="text-sm text-muted flex items-center gap-2">
                        <span className="text-primary font-medium">
                            ${Number(product.price).toFixed(2)}

                        </span>
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
                            <span className="ml-1 text-muted">{product.rating.toFixed(1)}</span>
                        </div>
                    )}

                    {/* Add to Cart Button */}
                    <button className="w-full btn-primary text-white text-sm font-medium py-2 rounded-lg mt-3 opacity-0 group-hover:opacity-100 transition-all">
                        Add to Cart
                    </button>
                </div>
            </Link>

            <ReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} targetType="product" targetId={product.id} targetName={product.title} />
        </motion.div>
    )
}