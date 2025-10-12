import { useEffect, useState } from "react"
import api from "../lib/api"
import { Link } from "react-router-dom"
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react"

type CartItem = {
    id: number | string
    title: string
    thumbnail: string
    price: number
    qty: number
}

export default function Cart() {
    const [items, setItems] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        ; (async () => {
            try {
                const { data } = await api.get("/api/cart/")
                setItems(data.items || [])
            } catch (err) {
                console.error("Failed to load cart", err)
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)

    async function removeItem(id: number | string) {
        await api.delete(`/api/cart/${id}/`)
        setItems((s) => s.filter((x) => x.id !== id))
    }

    async function updateQty(id: number | string, newQty: number) {
        if (newQty < 1) return
        await api.patch(`/api/cart/${id}/`, { qty: newQty })
        setItems((s) =>
            s.map((x) => (x.id === id ? { ...x, qty: newQty } : x))
        )
    }

    if (loading)
        return (
            <div className="flex items-center justify-center h-80">
                <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
            </div>
        )

    if (items.length === 0)
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                <ShoppingBag className="w-16 h-16 text-zinc-400 mb-4" />
                <h2 className="text-2xl font-semibold text-zinc-700">Your cart is empty</h2>
                <p className="text-zinc-500 mt-1 mb-6">
                    Looks like you haven’t added anything yet.
                </p>
                <Link
                    to="/"
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    Continue Shopping
                </Link>
            </div>
        )

    return (
        <div className="container mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow p-6">
                <h2 className="text-2xl font-semibold mb-4 text-zinc-800">Shopping Cart</h2>
                <div className="divide-y divide-zinc-200">
                    {items.map((it) => (
                        <div key={it.id} className="py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img
                                    src={it.thumbnail}
                                    alt={it.title}
                                    className="w-20 h-20 rounded-xl object-cover shadow-sm border border-zinc-100"
                                />
                                <div>
                                    <div className="font-medium text-zinc-800">{it.title}</div>
                                    <div className="text-sm text-zinc-500 mt-1">
                                        ${it.price.toFixed(2)} each
                                    </div>

                                    <div className="flex items-center mt-2 gap-2">
                                        <button
                                            onClick={() => updateQty(it.id, it.qty - 1)}
                                            className="p-1 rounded-full border border-zinc-300 hover:bg-zinc-100"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="px-3 text-zinc-700 font-medium">{it.qty}</span>
                                        <button
                                            onClick={() => updateQty(it.id, it.qty + 1)}
                                            className="p-1 rounded-full border border-zinc-300 hover:bg-zinc-100"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="font-semibold text-zinc-800">
                                    ${(it.price * it.qty).toFixed(2)}
                                </div>
                                <button
                                    onClick={() => removeItem(it.id)}
                                    className="text-red-500 hover:text-red-600 text-sm mt-2 flex items-center gap-1"
                                >
                                    <Trash2 size={14} /> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl shadow p-6 h-fit sticky top-8">
                <h3 className="text-xl font-semibold mb-4 text-zinc-800">Order Summary</h3>
                <div className="space-y-2 text-zinc-700">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t border-zinc-200 pt-3">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
                <Link
                    to="/checkout"
                    className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg mt-6 py-2.5 font-medium transition"
                >
                    Proceed to Checkout
                </Link>
            </div>
        </div>
    )
}
