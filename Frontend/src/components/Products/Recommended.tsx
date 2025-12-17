import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import analytics from '../../lib/analytics'

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
                // ask for user recommendations first
                const res = await fetch(`/api/recommendations/products/?top_k=${limit}`)
                if (!res.ok) throw res
                const data = await res.json()
                const list = Array.isArray(data) ? data : (data?.results ?? [])
                if (list.length === 0) {
                    // fallback to popular
                    const pres = await fetch(`/api/recommendations/popular/?top_k=${limit}`)
                    if (pres.ok) {
                        const pdata = await pres.json()
                        setItems(Array.isArray(pdata) ? pdata : (pdata?.results ?? []))
                        setMessage('Try browsing products to get personalized picks')
                    } else {
                        setItems([])
                        setMessage('No recommendations available')
                    }
                } else {
                    setItems(list.slice(0, limit))
                    setMessage(null)
                }
            } catch (err) {
                console.error('Failed to load recommendations', err)
                setMessage('Recommendations unavailable')
                try {
                    // attempt popular as fallback
                    const pres = await fetch(`/api/recommendations/popular/?top_k=${limit}`)
                    if (pres.ok) {
                        const pdata = await pres.json()
                        setItems(Array.isArray(pdata) ? pdata : (pdata?.results ?? []))
                    } else setItems([])
                } catch (e) { setItems([]) }
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
