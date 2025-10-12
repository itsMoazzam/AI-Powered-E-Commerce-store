// src/pages/Wishlist.tsx
import { useEffect, useState } from "react"
import { getWishlist, removeFromWishlist } from "../lib/wishlist"

type Product = {
    id: number
    title: string
    price: number
    image?: string
}

export default function Wishlist() {
    const [items, setItems] = useState<{ id: number; product: Product }[]>([])

    useEffect(() => {
        (async () => {
            const data = await getWishlist()
            setItems(data)
        })()
    }, [])

    async function remove(id: number) {
        await removeFromWishlist(id)
        setItems(items.filter((i) => i.product.id !== id))
    }

    return (
        <div className="card p-4">
            <h2 className="text-xl font-semibold mb-4">My Wishlist</h2>
            <div className="space-y-3">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <img
                                src={item.product.image}
                                className="w-14 h-14 rounded-lg object-cover"
                            />
                            <div>
                                <div className="font-medium">{item.product.title}</div>
                                <div className="text-sm text-zinc-500">${item.product.price}</div>
                            </div>
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
