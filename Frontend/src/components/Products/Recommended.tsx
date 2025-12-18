import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import analytics from '../../lib/analytics'
import { demoProducts } from '../../lib/demoProducts'

interface RecItem {
    id: number
    title?: string
    price?: number | string
    thumbnail?: string
    slug?: string
    score?: number
}

export default function Recommended({ limit = 12 }: { limit?: number }) {
    const [items, setItems] = useState<RecItem[]>([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
        const fetchRecs = async () => {
            try {
                setLoading(true)
                
                // Check if user is logged in
                const token = localStorage.getItem('token')
                
                // Try collaborative filtering only if authenticated
                if (token) {
                    try {
                        const res = await fetch(`/api/recommendations/collaborative/?top_k=${limit}&min_common_purchases=2`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        })
                        if (res.ok) {
                            const data = await res.json()
                            if (data?.products && data.products.length > 0) {
                                if (mounted) {
                                    setItems(data.products.slice(0, limit))
                                    setMessage(data.message || 'Personalized recommendations based on similar users')
                                }
                                return
                            }
                        }
                    } catch (err: any) {
                        console.log('Collaborative filtering unavailable, falling back to popular')
                    }
                }

                // Fallback to popular products (no auth needed)
                try {
                    const pres = await fetch(`/api/recommendations/popular/?top_k=${limit}`)
                    if (pres.ok) {
                        const pdata = await pres.json()
                        const list = Array.isArray(pdata) ? pdata : (pdata?.results ?? [])
                        if (mounted) {
                            setItems(list.slice(0, limit))
                            setMessage('Popular picks')
                        }
                    } else {
                        throw new Error('Popular endpoint failed')
                    }
                } catch (err) {
                    // Final fallback to demo products
                    if (mounted) {
                        setItems(demoProducts.slice(0, limit) as any)
                        setMessage('Featured products')
                    }
                }
            } catch (err) {
                console.error('Failed to load recommendations', err)
                if (mounted) {
                    setItems(demoProducts.slice(0, limit) as any)
                    setMessage('Featured products')
                }
            } finally {
                if (mounted) setLoading(false)
            }
        }
        fetchRecs()
        return () => { mounted = false }
    }, [limit])

    if (loading) return <div className="py-6">Loading recommendations…</div>
    if (!items || items.length === 0) return <div className=" text-sm text-muted">{message || 'No recommendations'}</div>

    return (
        <section className="px-4 md:px-10">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Recommended for you</h3>
                    <small className="text-sm text-muted">Based on your activity</small>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {items.map((it: any) => (
                        <div key={it.id} className="bg-surface rounded-lg p-2 border shadow-sm">
                            <Link to={`/product/${it.id}`} onClick={() => analytics.recordInteraction(it.id, 'view')} className="block">
                                <img src={it.thumbnail || it.image || '/placeholder.png'} className="w-full h-32 object-cover rounded-md mb-2" />
                                <div className="text-sm font-medium line-clamp-2">{it.title || it.name}</div>
                                <div className="text-sm text-primary font-semibold mt-1">{typeof it.price === 'number' ? `$${Number(it.price).toFixed(2)}` : (it.price ?? '')}</div>
                                {typeof it.score === 'number' && (
                                    <div className="h-2 bg-black/5 rounded mt-2 overflow-hidden">
                                        <div className="h-full bg-indigo-600" style={{ width: `${Math.min(100, Math.round((it.score || 0) * 100))}%` }} />
                                    </div>
                                )}
                            </Link>
                        </div>
                    ))}
                </div>

                {message && <div className="text-xs text-muted mt-3">{message}</div>}
            </div>
        </section>
    )
}
