import { useState } from "react"
import api from "../lib/api"
import { Loader2, CreditCard, MapPin } from "lucide-react"

type Address = {
    full_name?: string
    line1: string
    line2?: string
    city: string
    state?: string
    postal_code: string
    country: string
    phone?: string
}

export default function Checkout() {
    const [address, setAddress] = useState<Address>({
        full_name: "",
        line1: "",
        city: "",
        postal_code: "",
        country: "",
    })
    const [loading, setLoading] = useState(false)

    async function placeOrder() {
        if (!address.full_name || !address.line1 || !address.city || !address.postal_code) {
            alert("Please fill in all required fields.")
            return
        }

        setLoading(true)
        try {
            const order = {
                shipping_address: address,
                billing_address: address,
                items: [
                    { product_id: 1, qty: 2, price: 100 },
                    { product_id: 2, qty: 1, price: 50 },
                ],
            }
            const { data } = await api.post("/api/orders/", order)
            console.log("Order placed:", data)
            alert("✅ Order placed successfully!")
            setAddress({
                full_name: "",
                line1: "",
                city: "",
                postal_code: "",
                country: "",
            })
        } catch (err) {
            console.error("Failed to place order", err)
            alert("❌ Something went wrong while placing your order.")
        } finally {
            setLoading(false)
        }
    }

    const subtotal = 250
    const shipping = 0
    const total = subtotal + shipping

    return (
        <div className="container mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
            {/* Address Section */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow p-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-zinc-800">
                    <MapPin className="w-6 h-6 text-indigo-600" />
                    Shipping Address
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        placeholder="Full Name *"
                        className="input border border-zinc-300 rounded-lg px-4 py-2"
                        value={address.full_name}
                        onChange={(e) => setAddress({ ...address, full_name: e.target.value })}
                    />
                    <input
                        placeholder="Phone (optional)"
                        className="input border border-zinc-300 rounded-lg px-4 py-2"
                        value={address.phone || ""}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    />
                </div>

                <input
                    placeholder="Address line 1 *"
                    className="input border border-zinc-300 rounded-lg px-4 py-2 w-full mt-4"
                    value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                />
                <input
                    placeholder="Address line 2 (optional)"
                    className="input border border-zinc-300 rounded-lg px-4 py-2 w-full mt-3"
                    value={address.line2 || ""}
                    onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <input
                        placeholder="City *"
                        className="input border border-zinc-300 rounded-lg px-4 py-2"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    />
                    <input
                        placeholder="Postal Code *"
                        className="input border border-zinc-300 rounded-lg px-4 py-2"
                        value={address.postal_code}
                        onChange={(e) => setAddress({ ...address, postal_code: e.target.value })}
                    />
                    <input
                        placeholder="Country *"
                        className="input border border-zinc-300 rounded-lg px-4 py-2"
                        value={address.country}
                        onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    />
                </div>

                <button
                    onClick={placeOrder}
                    disabled={loading}
                    className={`mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white font-medium transition ${loading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
                        }`}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" /> Placing Order...
                        </>
                    ) : (
                        <>
                            <CreditCard className="w-5 h-5" /> Place Order
                        </>
                    )}
                </button>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow p-6 h-fit sticky top-8">
                <h3 className="text-xl font-semibold mb-4 text-zinc-800">Order Summary</h3>
                <div className="space-y-2 text-zinc-700">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
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
                <div className="mt-6 text-sm text-zinc-500">
                    All orders are processed securely and include free delivery.
                </div>
            </div>
        </div>
    )
}
