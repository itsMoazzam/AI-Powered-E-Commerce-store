import { useEffect, useState } from "react"
import api from "../lib/api"
import { Link } from "react-router-dom"
import { Trash2, Plus, Minus, ShoppingBag, Truck, ShieldCheck } from "lucide-react"
import { normalizeCartResponse } from "../lib/cart"

type CartItem = {
    id: number
    title: string
    thumbnail: string
    price: number
    qty: number
    subtotal: number
}

type CartData = {
    items: CartItem[]
    total: number
    shipping: number
    grand_total: number
}

export default function Cart() {
    const [cart, setCart] = useState<CartData | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<number | null>(null)

    async function fetchCart() {
        try {
            const { data } = await api.get("/api/cart/")
            const normalized = normalizeCartResponse(data)
            setCart(normalized)
        } catch (err) {
            console.error("Failed to fetch cart", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCart()
    }, [])

    async function updateQty(id: number, qty: number) {
        if (qty < 1) return
        setUpdating(id)
        try {
            await api.patch(`/api/cart/${id}/`, { qty })
            await fetchCart()
        } catch (err) {
            console.error('Failed to update qty:', err)
            alert(`Failed to update quantity: ${(err as any)?.response?.data?.detail || (err as any)?.message || 'Unknown error'}`)
        } finally {
            setUpdating(null)
        }
    }

    async function removeItem(id: number) {
        setUpdating(id)
        try {
            await api.delete(`/api/cart/${id}/`)
            await fetchCart()
        } catch (err) {
            console.error('Failed to remove item:', err)
            alert(`Failed to remove item: ${(err as any)?.response?.data?.detail || (err as any)?.message || 'Unknown error'}`)
        } finally {
            setUpdating(null)
        }
    }

    if (loading)
        return (
            <div className="flex items-center justify-center h-80">
                <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
            </div>
        )

    if (!cart || cart.items.length === 0)
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
        <div className="container mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
            {/* Items */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Shopping Cart</h2>
                <div className="divide-y divide-zinc-200">
                    {cart.items.map((it) => (
                        <div
                            key={it.id}
                            className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-gray-50 transition rounded-xl px-2"
                        >
                            <div className="flex items-center gap-5 w-full sm:w-auto">
                                <img
                                    src={String(it.thumbnail || '')}
                                    alt={String(it.title || '')}
                                    className="w-24 h-24 rounded-xl object-cover border border-zinc-200"
                                />
                                <div>
                                    <h3 className="font-medium text-gray-900 text-base line-clamp-2">
                                        {String(it.title ?? '')}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        ${Number(it.price ?? 0).toFixed(2)} each
                                    </p>
                                    <div className="flex items-center mt-2 gap-2">
                                        <button
                                            onClick={() => updateQty(it.id, it.qty - 1)}
                                            disabled={updating === it.id}
                                            className="p-1 rounded-full border border-zinc-300 hover:bg-zinc-100"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="px-3 text-gray-800 font-semibold text-sm">
                                            {it.qty}
                                        </span>
                                        <button
                                            onClick={() => updateQty(it.id, it.qty + 1)}
                                            disabled={updating === it.id}
                                            className="p-1 rounded-full border border-zinc-300 hover:bg-zinc-100"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right w-full sm:w-auto">
                                <div className="font-semibold text-lg text-gray-800">
                                    ${(Number(it.price ?? 0) * Number(it.qty ?? 0)).toFixed(2)}
                                </div>
                                <button
                                    onClick={() => removeItem(it.id)}
                                    disabled={updating === it.id}
                                    className="text-red-500 hover:text-red-600 text-sm mt-2 flex items-center gap-1 justify-end"
                                >
                                    <Trash2 size={14} /> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 h-fit sticky top-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Order Summary</h3>

                <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${Number(cart.total ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className={cart.shipping === 0 ? "text-green-600 font-medium" : ""}>
                            {cart.shipping === 0 ? "Free" : `$${Number(cart.shipping ?? 0).toFixed(2)}`}
                        </span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t border-zinc-200 pt-3">
                        <span>Total</span>
                        <span>${Number(cart.grand_total ?? 0).toFixed(2)}</span>
                    </div>
                </div>

                <Link
                    to="/checkout"
                    className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg mt-6 py-2.5 font-medium transition"
                >
                    Proceed to Checkout
                </Link>

                <div className="mt-6 text-sm text-gray-500 space-y-2 border-t border-zinc-200 pt-4">
                    <div className="flex items-center gap-2">
                        <Truck className="text-indigo-500 w-4 h-4" />
                        <span>Free & Fast Delivery (3–5 days)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="text-indigo-500 w-4 h-4" />
                        <span>Secure Checkout & Buyer Protection</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
