// src/components/ProductCard.tsx
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import api from "../../lib/api"
import { useDispatch } from 'react-redux'
import { fetchCart } from '../../store/Cart'

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
    const dispatch = useDispatch()
    const navigate = useNavigate()
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-card"
        >
            {/* Image and link */}
            <div>
                <Link to={`/product/${product.id}`}>
                    <div className="relative">
                        <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                        />
                        {product.discount && (
                            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md font-semibold">
                                {product.discount}%
                            </span>
                        )}
                        {product.has3d && (
                            <span className="absolute bottom-2 right-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-md shadow">
                                3D
                            </span>
                        )}
                    </div>
                </Link>

                {/* Info */}
                <div className="p-4 space-y-1">
                    <Link to={`/product/${product.id}`} className="block">
                        <h3 className="font-semibold text-default line-clamp-1">
                            {product.title}
                        </h3>
                        <div className="text-sm text-muted flex items-center gap-2">
                            <span className="text-primary font-medium">${Number(product.price).toFixed(2)}</span>
                        </div>
                    </Link>

                    {/* Rating */}
                    {product.rating && (
                        <div className="flex items-center text-xs text-yellow-500 mt-1">
                            {Array.from({ length: 5 }).map((_, idx) => (
                                <Star key={`star-${product.id}-${idx}`} size={14} fill={idx < Math.round(product.rating!) ? "currentColor" : "none"} />
                            ))}
                            <span className="ml-1 text-muted">{product.rating.toFixed(1)}</span>
                        </div>
                    )}

                    {/* Add to Cart Button */}
                    <button
                        onClick={async (e) => {
                            e.preventDefault()
                            const role = localStorage.getItem('role')
                            if (role !== 'customer') {
                                alert('Only customers can add items to cart. Please log in as a customer.')
                                return
                            }
                            try {
                                await api.post('/api/cart/', { product: product.id, qty: 1 })
                                try { dispatch(fetchCart() as any) } catch { }
                                navigate(`/cart?added=${product.id}`)
                            } catch (err: any) {
                                console.error('Add to cart failed', err)
                                const status = err?.response?.status
                                const data = err?.response?.data
                                if (status === 401) {
                                    alert('You must be logged in to add items to the cart.')
                                    window.location.href = '/auth/login'
                                } else if (status === 403) {
                                    alert('You do not have permission to add items to the cart.')
                                } else if (status === 404) {
                                    alert('Cart service not available (404). Make sure backend is running and the /api/cart/ endpoint exists.')
                                } else {
                                    const msg = data?.error || data?.detail || data || err.message || 'Failed to add to cart'
                                    alert(`Add to cart failed: ${msg}`)
                                }
                            }
                        }}
                        className="w-full btn-primary text-white text-sm font-medium py-2 rounded-lg mt-3 opacity-0 group-hover:opacity-100 transition-all"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </motion.div>
    )
}