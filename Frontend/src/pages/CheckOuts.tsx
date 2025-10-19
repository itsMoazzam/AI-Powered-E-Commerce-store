import { useState } from "react"
import api from "../lib/api"
import { Loader2, CreditCard, MapPin, Truck, CheckCircle2, ShoppingBag } from "lucide-react"

type Address = {
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    line1?: string
    line2?: string
    city?: string
    postal_code?: string
    country?: string
}

export default function Checkout() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [address, setAddress] = useState<Address>({})
    const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">("standard")
    const [payment, setPayment] = useState({ cardNumber: "", expiry: "", cvv: "" })

    // Dummy cart items
    const items = [
        { id: 1, name: "Men’s T-Shirt", qty: 2, price: 100 },
        { id: 2, name: "Wireless Headphones", qty: 1, price: 150 },
    ]
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
    const shippingFee = deliveryMethod === "express" ? 15 : 0
    const tax = subtotal * 0.1
    const total = subtotal + shippingFee + tax

    async function placeOrder() {
        if (!address.first_name || !address.last_name || !address.line1 || !address.city || !address.postal_code) {
            alert("Please complete all required fields.")
            return
        }

        if (!payment.cardNumber || !payment.expiry || !payment.cvv) {
            alert("Please enter valid payment details.")
            return
        }

        setLoading(true)
        try {
            const order = {
                shipping_address: address,
                items,
                delivery_method: deliveryMethod,
                payment,
            }
            const { data } = await api.post("/api/orders/", order)
            console.log("Order placed:", data)
            alert("✅ Order placed successfully!")
            setStep(1)
            setAddress({})
            setPayment({ cardNumber: "", expiry: "", cvv: "" })
        } catch (err) {
            console.error("Failed to place order", err)
            alert("❌ Something went wrong.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
            {/* LEFT SIDE: CHECKOUT STEPS */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6 space-y-6">
                {/* Step Indicator */}
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-2xl font-semibold text-indigo-700 flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6" /> Checkout
                    </h2>
                    <span className="text-sm text-zinc-500">Step {step} of 4</span>
                </div>

                {/* Step 1: Contact Info */}
                {step === 1 && (
                    <div>
                        <h3 className="text-xl font-semibold mb-4">1️⃣ Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input placeholder="First Name *" className="input border rounded-lg px-4 py-2"
                                value={address.first_name || ""} onChange={(e) => setAddress({ ...address, first_name: e.target.value })} />
                            <input placeholder="Last Name *" className="input border rounded-lg px-4 py-2"
                                value={address.last_name || ""} onChange={(e) => setAddress({ ...address, last_name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <input placeholder="Email *" type="email" className="input border rounded-lg px-4 py-2"
                                value={address.email || ""} onChange={(e) => setAddress({ ...address, email: e.target.value })} />
                            <input placeholder="Phone (optional)" className="input border rounded-lg px-4 py-2"
                                value={address.phone || ""} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
                        </div>
                        <button className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700"
                            onClick={() => setStep(2)}>Continue to Shipping</button>
                    </div>
                )}

                {/* Step 2: Shipping Info */}
                {step === 2 && (
                    <div>
                        <h3 className="text-xl font-semibold mb-4">2️⃣ Shipping Address</h3>
                        <input placeholder="Address Line 1 *" className="input border rounded-lg px-4 py-2 w-full"
                            value={address.line1 || ""} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
                        <input placeholder="Address Line 2 (optional)" className="input border rounded-lg px-4 py-2 w-full mt-3"
                            value={address.line2 || ""} onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <input placeholder="City *" className="input border rounded-lg px-4 py-2"
                                value={address.city || ""} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                            <input placeholder="Postal Code *" className="input border rounded-lg px-4 py-2"
                                value={address.postal_code || ""} onChange={(e) => setAddress({ ...address, postal_code: e.target.value })} />
                            <input placeholder="Country *" className="input border rounded-lg px-4 py-2"
                                value={address.country || ""} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
                        </div>
                        <div className="flex justify-between mt-6">
                            <button className="px-4 py-2 rounded-lg border" onClick={() => setStep(1)}>Back</button>
                            <button className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                                onClick={() => setStep(3)}>Continue to Delivery</button>
                        </div>
                    </div>
                )}

                {/* Step 3: Delivery Method */}
                {step === 3 && (
                    <div>
                        <h3 className="text-xl font-semibold mb-4">3️⃣ Delivery Method</h3>
                        <div className="space-y-3">
                            <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${deliveryMethod === "standard" ? "border-indigo-600 bg-indigo-50" : "border-zinc-300"}`}>
                                <div>
                                    <p className="font-medium">Standard Delivery (4–10 days)</p>
                                    <p className="text-sm text-zinc-500">Free shipping</p>
                                </div>
                                <input type="radio" checked={deliveryMethod === "standard"} onChange={() => setDeliveryMethod("standard")} />
                            </label>

                            <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${deliveryMethod === "express" ? "border-indigo-600 bg-indigo-50" : "border-zinc-300"}`}>
                                <div>
                                    <p className="font-medium">Express Delivery (2–5 days)</p>
                                    <p className="text-sm text-zinc-500">$15.00 shipping fee</p>
                                </div>
                                <input type="radio" checked={deliveryMethod === "express"} onChange={() => setDeliveryMethod("express")} />
                            </label>
                        </div>

                        <div className="flex justify-between mt-6">
                            <button className="px-4 py-2 rounded-lg border" onClick={() => setStep(2)}>Back</button>
                            <button className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                                onClick={() => setStep(4)}>Continue to Payment</button>
                        </div>
                    </div>
                )}

                {/* Step 4: Payment Method */}
                {step === 4 && (
                    <div>
                        <h3 className="text-xl font-semibold mb-4">4️⃣ Payment Method</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input placeholder="Card Number *" className="input border rounded-lg px-4 py-2"
                                value={payment.cardNumber} onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })} />
                            <input placeholder="Expiry (MM/YY) *" className="input border rounded-lg px-4 py-2"
                                value={payment.expiry} onChange={(e) => setPayment({ ...payment, expiry: e.target.value })} />
                            <input placeholder="CVV *" className="input border rounded-lg px-4 py-2"
                                value={payment.cvv} onChange={(e) => setPayment({ ...payment, cvv: e.target.value })} />
                        </div>
                        <div className="flex justify-between mt-6">
                            <button className="px-4 py-2 rounded-lg border" onClick={() => setStep(3)}>Back</button>
                            <button onClick={placeOrder} disabled={loading}
                                className={`px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 justify-center ${loading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"}`}>
                                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Placing...</> : <><CreditCard className="w-5 h-5" /> Confirm Order</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT SIDE: ORDER SUMMARY */}
            <div className="bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-8">
                <h3 className="text-xl font-semibold mb-4 text-zinc-800 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-indigo-600" /> Order Summary
                </h3>

                <div className="space-y-3">
                    {items.map((item) => (
                        <div key={item.id} className="flex justify-between border-b pb-2">
                            <span>{item.name} × {item.qty}</span>
                            <span>${(item.price * item.qty).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-4 space-y-1 text-zinc-700">
                    <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Shipping</span><span>${shippingFee.toFixed(2)}</span></div>
                    <div className="flex justify-between font-semibold border-t pt-3 text-lg">
                        <span>Total</span><span>${total.toFixed(2)}</span>
                    </div>
                </div>
                <div className="mt-6 text-sm text-zinc-500">
                    All orders are processed securely with SSL encryption.
                </div>
            </div>
        </div>
    )
}
