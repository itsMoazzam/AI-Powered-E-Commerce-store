// src/components/ProductCard.tsx
import { Link, useNavigate } from "react-router-dom"
import React, { useEffect, useState } from 'react'
import { motion } from "framer-motion"
import { Star, Heart } from "lucide-react"
import api from "../../lib/api"
import { useDispatch } from 'react-redux'
import { fetchCart } from '../../store/Cart'
import { addToCart } from '../../lib/cart'
import { addToWishlist, removeFromWishlist } from '../../lib/wishlist'
import analytics from '../../lib/analytics'

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
    const [isWish, setIsWish] = useState(false)
    const [wishLoading, setWishLoading] = useState(false)

    useEffect(() => {
        let mounted = true
        try {
            const raw = localStorage.getItem('intelligentCommerce_wishlist')
            const arr = raw ? JSON.parse(raw) : []
            if (mounted && Array.isArray(arr)) setIsWish(arr.includes(product.id))
        } catch (e) {
            // ignore
        }

        const onUpdated = (ev: Event) => {
            try {
                const detail: any = (ev as CustomEvent).detail
                if (Array.isArray(detail)) setIsWish(detail.includes(product.id))
            } catch (e) { }
        }
        window.addEventListener('intelligentCommerce_wishlist_updated', onUpdated as EventListener)
        return () => { mounted = false; window.removeEventListener('intelligentCommerce_wishlist_updated', onUpdated as EventListener) }
    }, [product.id])
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-card "
        >
            {/* Image and link */}
            <div>
                <Link to={`/product/${product.id}`} onClick={() => { try { analytics.recordInteraction(product.id, 'view') } catch { } }}>
                    <div className="relative">
                        <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-115"
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

                        {/* Wishlist toggle */}
                        <button
                            title={isWish ? 'Remove from wishlist' : 'Add to wishlist'}
                            onClick={async (e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (wishLoading) return
                                setWishLoading(true)
                                try {
                                    if (isWish) {
                                        await removeFromWishlist(product.id)
                                        setIsWish(false)
                                        try { analytics.recordInteraction(product.id, 'wishlist', { action: 'remove' }) } catch { }
                                    } else {
                                        await addToWishlist(product.id)
                                        setIsWish(true)
                                        try { analytics.recordInteraction(product.id, 'wishlist', { action: 'add' }) } catch { }
                                    }
                                } catch (err: any) {
                                    console.error('Wishlist error', err)
                                    if (err?.message && err.message.indexOf('Only customers') >= 0) {
                                        alert('Only customers can use the wishlist. Please sign in as a customer.')
                                        navigate('/auth/login')
                                    } else {
                                        alert(err?.message || 'Failed to update wishlist')
                                    }
                                } finally {
                                    setWishLoading(false)
                                }
                            }}
                            className={`absolute top-2 right-2 p-2 rounded-full bg-white/90 shadow transition ${isWish ? 'text-red-500' : 'text-gray-600'} disabled:opacity-60`} aria-pressed={isWish} disabled={wishLoading}
                        >
                            <Heart size={16} />
                        </button>
                    </div>
                </Link>

                {/* Info */}
                <div className="p-4 space-y-1 bg-blue-50">
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
                                // redirect guests to login
                                navigate('/auth/login')
                                return
                            }
                            try {
                                // Local-first add (only customers allowed)
                                addToCart({ id: product.id, title: product.title, thumbnail: product.thumbnail, price: Number(product.price), seller: undefined })
                                try { dispatch(fetchCart() as any) } catch { }
                                try { analytics.recordInteraction(product.id, 'cart') } catch { }
                                navigate(`/cart?added=${product.id}`)
                            } catch (err: any) {
                                console.error('Add to cart failed', err)
                                if (err?.message && err.message.indexOf('logged') >= 0) {
                                    alert('You must be logged in as a customer to add items to the cart.')
                                    navigate('/auth/login')
                                } else {
                                    alert(err?.message || 'Failed to add to cart')
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