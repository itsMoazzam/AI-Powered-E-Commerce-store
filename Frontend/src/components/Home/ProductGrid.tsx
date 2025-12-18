// src/components/ProductGrid.tsx
import { useEffect, useState, useRef, useCallback } from "react"
import { Link } from "react-router-dom"
import ProductCard from "./ProductCard"
import AdCard from "./AdCard"
import api from "../../lib/api" // keep for product requests, but ad fetch uses public fetch
import { demoProducts } from '../../lib/demoProducts'

type Item = { type: 'product'; data: any } | { type: 'ad'; data: any }

let adFetchWarningShown = false

export default function ProductGrid() {
    const PAGE_SIZE = 25
    const [products, setProducts] = useState<any[]>([])
    const [ads, setAds] = useState<any[]>([])
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const sentinelRef = useRef<HTMLDivElement | null>(null)
    const initFetchedRef = useRef(false)

    const fetchAds = useCallback(async () => {
        try {
            // Use fetch (no auth headers) so ads are visible to guests and avoid axios auth redirect
            try {
                const res = await fetch('/api/advertisements/?limit=50')
                if (res.ok) {
                    const data = await res.json()
                    setAds(Array.isArray(data) ? data : [])
                    return
                }
            } catch (e) {
                // fallback to legacy endpoint
            }

            try {
                const res = await fetch('/api/ads/?limit=50')
                if (res.ok) {
                    const data = await res.json()
                    setAds(Array.isArray(data) ? data : [])
                    return
                }
            } catch (e) { }

            // If we reach here, no ads available
            setAds([])
        } catch (err) {
            const msg = String(err)
            const isNetworkErr = msg.includes('ECONNREFUSED') || msg.includes('NetworkError') || msg.includes('ERR_FAILED') || msg.includes('ERR_BLOCKED_BY_CLIENT')
            if (isNetworkErr && !adFetchWarningShown) {
                adFetchWarningShown = true
                console.warn('Ads fetch failed (network or proxy). Ads will be skipped for now. To enable ads, ensure backend is reachable or set VITE_API_BASE_URL in .env')
            } else if (!isNetworkErr && import.meta.env.DEV && !adFetchWarningShown) {
                adFetchWarningShown = true
                console.warn('Failed to load ads/advertisements (may be blocked by an ad blocker):', err)
            }
            setAds([])
        }
    }, [])

    const fetchPage = useCallback(async (p: number) => {
        try {
            if (p === 1) setLoading(true)
            else setLoadingMore(true)
            const res = await api.get(`/api/products/?page=${p}&page_size=${PAGE_SIZE}`)
            const results = res?.data?.results ?? []
            const formatted = results.map((r: any) => ({ ...r, has3d: Boolean(r.model_3d) }))
            setProducts((prev) => [...prev, ...formatted])
            // determine hasMore
            const next = res?.data?.next // DRF next link
            setHasMore(Boolean(next))
        } catch (err: any) {
            console.error('Failed to load products', err)
            // If unauthenticated, forbidden, not-found or client error, fall back to demo products so home remains visible
            const status = err?.response?.status
            if (status === 401 || status === 403 || status === 404 || status === 400 || !status) {
                // Use demo products for guests or when API isn't reachable or page is missing
                const demoSlice = demoProducts.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE)
                setProducts((prev) => [...prev, ...demoSlice])
                setHasMore(false)
                setError(null)
            } else {
                setError('Failed to load products')
            }
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }, [])

    useEffect(() => {
        if (initFetchedRef.current) return
        initFetchedRef.current = true
        setProducts([])
        setPage(1)
        fetchAds()
        fetchPage(1)
    }, [])

    // infinite scroll using intersection observer
    useEffect(() => {
        if (!sentinelRef.current) return
        const obs = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && hasMore && !loadingMore) {
                    setPage((p) => p + 1)
                }
            })
        }, { rootMargin: '200px' })
        obs.observe(sentinelRef.current)
        return () => obs.disconnect()
    }, [hasMore, loadingMore])

    useEffect(() => {
        if (page === 1) return
        fetchPage(page)
    }, [page, fetchPage])

    // build display items interleaving ads after every 10 products
    const buildDisplay = (): Item[] => {
        const items: Item[] = []
        const adPool = ads.length ? ads : []
        let adIndex = 0
        products.forEach((p, idx) => {
            items.push({ type: 'product', data: p })
            if ((idx + 1) % 10 === 0) {
                const ad = adPool[adIndex % adPool.length]
                if (ad) {
                    items.push({ type: 'ad', data: ad })
                    adIndex += 1
                }
            }
        })
        return items
    }

    const display = buildDisplay()

    if (loading && products.length === 0)
        return (
            <section className="px-4 md:px-10 py-16 bg-surface text-center">
                <div className="animate-pulse text-muted text-lg">Loading products...</div>
            </section>
        )

    if (error)
        return (
            <section className="px-4 md:px-10 py-16 bg-surface text-center text-red-500 font-medium">
                {error}
            </section>
        )

    return (
        <section className="px-4 md:px-10  bg-surface">
            <div className="flex justify-between items-center ">
                <h2 className="text-2xl font-bold text-default pb-9">✨ Latest Products</h2>
                <Link to="/search" className="text-primary hover:opacity-90 text-sm font-medium transition">View All →</Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {display.map((it, idx) => (
                    it.type === 'product' ? (
                        <ProductCard key={`product-${it.data.id ?? idx}-${idx}`} product={it.data} index={idx} />
                    ) : (
                        <div key={`ad-${idx}`} className="col-span-2 md:col-span-3 lg:col-span-4">
                            <AdCard ad={it.data} />
                        </div>
                    )
                ))}
            </div>

            <div className="mt-8 flex flex-col items-center">
                {loadingMore && <div className="text-sm text-muted mb-3">Loading more…</div>}
                {!loadingMore && hasMore && (
                    <button onClick={() => setPage((p) => p + 1)} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Load more</button>
                )}
                {!hasMore && <div className="text-sm text-muted">No more products</div>}
                <div ref={sentinelRef} style={{ height: 1 }} />
            </div>
        </section>
    )
}
