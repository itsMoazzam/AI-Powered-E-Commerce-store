// src/pages/Wishlist.tsx
import { useEffect, useState } from "react"
import { Link } from 'react-router-dom'
import { getWishlist, removeFromWishlist } from "../lib/wishlist"

type Product = {
    id: number
    title: string
    price: number
    image?: string
    slug?: string
}

export default function Wishlist() {
    const [items, setItems] = useState<{ id: number; product: Product }[]>([])

    useEffect(() => {
        (async () => {
            const data = await getWishlist()
            // Enrich items with product thumbnail/link by fetching product details where available
            const enriched = await Promise.all((data as any[]).map(async (it: { id: number; product: any }) => {
                try {
                    const res = await fetch(`/api/products/${it.product.id}/`)
                    if (res.ok) {
                        const pd = await res.json()
                        return { ...it, product: { ...it.product, title: pd.title || it.product.title, price: pd.price ?? it.product.price, image: pd.thumbnail || (Array.isArray(pd.images) ? (pd.images[0]?.image || pd.images[0]) : pd.image || it.product.image), slug: pd.slug ?? pd.id } }
                    }
                } catch (e) { }
                return it
            }))
            setItems(enriched)
        })()
    }, [])

    async function remove(id: number) {
        await removeFromWishlist(id)
        try { (await import('../lib/analytics')).recordInteraction(id, 'wishlist', { action: 'remove' }) } catch { }
        setItems(items.filter((i) => i.product.id !== id))
    }

    return (
        <div className="card p-4">
            <h2 className="text-xl font-semibold mb-4">My Wishlist</h2>
            <div className="space-y-3">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <Link to={`/product/${(item.product as any).slug ?? item.product.id}`} className="flex items-center gap-3">
                                <img
                                    src={item.product.image || '/placeholder.png'}
                                    className="w-14 h-14 rounded-lg object-cover"
                                />
                                <div>
                                    <div className="font-medium">{item.product.title}</div>
                                    <div className="text-sm text-zinc-500">${item.product.price}</div>
                                </div>
                            </Link>
                        </div>
                        <button
                            className="btn-outline text-xs"
                            onClick={() => remove(item.product.id)}
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
