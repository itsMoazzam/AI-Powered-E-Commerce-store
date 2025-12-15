import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Trash2, Plus, Minus, ShoppingBag, Truck, ShieldCheck } from "lucide-react"
import { loadCartFromStorage, updateCartItemQty, removeFromCart, type CartState } from "../lib/cart"

export default function Cart() {
    const [cart, setCart] = useState<CartState | null>(null)
    const [loading, setLoading] = useState(true)
    const [ownerLabel, setOwnerLabel] = useState<string | null>(null)

    // Load cart from localStorage on mount
    useEffect(() => {
        // Only load a per-user cart for authenticated customers. Guests see empty cart.
        try {
            const raw = localStorage.getItem('user')
            const parsed = raw ? JSON.parse(raw) : null
            const role = parsed?.role || localStorage.getItem('role')
            if (parsed && role === 'customer') {
                const savedCart = loadCartFromStorage()
                setCart(savedCart)
                setOwnerLabel(parsed?.username ?? parsed?.email ?? `user:${parsed?.id ?? 'unknown'}`)
            } else {
                setCart({ items: [], total: 0, shipping: 0, grand_total: 0 })
                setOwnerLabel('guest')
            }
        } catch (e) {
            setCart({ items: [], total: 0, shipping: 0, grand_total: 0 })
            setOwnerLabel('guest')
        }
        setLoading(false)
    }, [])

    // Update quantity (local only, no API call)
    function handleUpdateQty(cartItemId: number, newQty: number) {
        if (newQty < 1) return
        const updated = updateCartItemQty(cartItemId, newQty)
        setCart(updated)
    }

    // Remove item (local only, no API call)
    function handleRemoveItem(cartItemId: number) {
        const updated = removeFromCart(cartItemId)
        setCart(updated)
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
                {ownerLabel && <div className="text-xs text-muted mb-4">Viewing cart for: <strong>{ownerLabel}</strong></div>}
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
                    {cart.items.map((item) => (
                        <div
                            key={item.id}
                            className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-gray-50 transition rounded-xl px-2"
                        >
                            <div className="flex items-center gap-5 w-full sm:w-auto">
                                <img
                                    src={String(item.thumbnail || '')}
                                    alt={String(item.title || '')}
                                    className="w-24 h-24 rounded-xl object-cover border border-zinc-200"
                                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/96?text=No+Image')}
                                />
                                <div>
                                    <h3 className="font-medium text-gray-900 text-base line-clamp-2">
                                        {String(item.title ?? '')}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        ${Number(item.price ?? 0).toFixed(2)} each
                                    </p>
                                    <div className="flex items-center mt-2 gap-2">
                                        <button
                                            onClick={() => handleUpdateQty(item.id, item.qty - 1)}
                                            className="p-1 rounded-full border border-zinc-300 hover:bg-zinc-100 transition"
                                            title="Decrease quantity"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="px-3 text-gray-800 font-semibold text-sm">
                                            {item.qty}
                                        </span>
                                        <button
                                            onClick={() => handleUpdateQty(item.id, item.qty + 1)}
                                            className="p-1 rounded-full border border-zinc-300 hover:bg-zinc-100 transition"
                                            title="Increase quantity"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right w-full sm:w-auto">
                                <div className="font-semibold text-lg text-gray-800">
                                    ${(Number(item.price ?? 0) * Number(item.qty ?? 0)).toFixed(2)}
                                </div>
                                <button
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="text-red-500 hover:text-red-600 text-sm mt-2 flex items-center gap-1 justify-end transition"
                                    title="Remove item"
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
                    title="Proceed to checkout (cart will sync to backend)"
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
