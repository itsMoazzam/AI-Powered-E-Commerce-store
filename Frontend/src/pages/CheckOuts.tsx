import { useState, useEffect } from "react"
import api from "../lib/api"
import { savePendingOrder, confirmOrderToBackend } from '../lib/checkout'
import { Loader2, CreditCard, ShoppingBag } from "lucide-react"
import ReceiptUpload from "../components/ReceiptUpload"
import { printInvoice } from "../lib/invoice"

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
    const [coupon, setCoupon] = useState("")
    const [discount, setDiscount] = useState(0)
    const [paymentOptions, setPaymentOptions] = useState<{ id: string, label: string }[]>([])
    const [selectedPayment, setSelectedPayment] = useState<string | null>(null)

    // Items: either from query params (single product checkout) or pulled from cart
    const [items, setItems] = useState<{ id: number | string; name: string; qty: number; price: number }[]>([])
    // If no `items` are loaded we fall back to an empty list
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
    const shippingFee = deliveryMethod === "express" ? 15 : 0
    const tax = subtotal * 0.1
    const total = subtotal + shippingFee + tax - discount

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
            const orderPayload = {
                shipping_address: address,
                items,
                delivery_method: deliveryMethod,
                payment_method: selectedPayment || 'online',
                payment,
                coupon: coupon || null,
                total,
            }

            // Save order locally first (per-user localStorage)
            const localId = savePendingOrder(orderPayload as any)

            // Try to notify backend with a single confirmation call. This is allowed to fail.
            try {
                await confirmOrderToBackend(localId as number, orderPayload as any)
            } catch (err) {
                // confirmation failed - keep local copy and continue
                console.debug('Backend confirmation failed; order stored locally.', err)
            }

            // Also store in orderHistory for user's reference
            try {
                const raw = localStorage.getItem('orderHistory')
                const arr = raw ? JSON.parse(raw) : []
                arr.unshift({ id: localId || Date.now(), total: total, created_at: new Date().toISOString(), items: orderPayload.items })
                localStorage.setItem('orderHistory', JSON.stringify(arr))
            } catch { }

            alert('✅ Order saved and confirmation sent (if available).')
            if (typeof printInvoice === 'function') {
                try { printInvoice({ id: localId || 'N/A', shipping_address: address, items, total }) } catch (err) { console.warn(err) }
            }

            setStep(1)
            setAddress({})
            setPayment({ cardNumber: "", expiry: "", cvv: "" })
        } catch (err) {
            console.error("Failed to save order", err)
            alert("❌ Something went wrong while saving the order locally.")
        } finally {
            setLoading(false)
        }
    }

    async function fetchPaymentOptions() {
        try {
            const { data } = await api.get('/api/payments/options/')
            if (Array.isArray(data) && data.length) {
                setPaymentOptions(data)
                setSelectedPayment(data[0].id)
            } else {
                // fallback default
                setPaymentOptions([{ id: 'online', label: 'Online' }, { id: 'cod', label: 'Cash on Delivery' }])
                setSelectedPayment('online')
            }
        } catch (err) {
            setPaymentOptions([{ id: 'online', label: 'Online' }, { id: 'cod', label: 'Cash on Delivery' }])
            setSelectedPayment('online')
        }
    }

    async function applyCoupon() {
        if (!coupon.trim()) return alert('Enter coupon code')
        try {
            const { data } = await api.get(`/api/discounts/validate/?code=${encodeURIComponent(coupon)}`)
            if (data && data.amount) {
                setDiscount(data.amount)
                alert('Coupon applied')
            } else {
                alert('Invalid coupon')
            }
        } catch (err) {
            console.error(err)
            alert('Failed to validate coupon')
        }
    }

    // load payment options on mount
    useState(() => { fetchPaymentOptions() })

    // If a product id is provided in query params, preload that product into `items`
    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search)
            const productParam = params.get('product')
            const qtyParam = params.get('qty')
            if (productParam) {
                (async () => {
                    try {
                        const { data } = await api.get(`/api/products/${productParam}/`)
                        const price = Number(data.price) || 0
                        const qty = qtyParam ? Number(qtyParam) : 1
                        setItems([{ id: data.id || productParam, name: data.title || data.name || 'Product', qty, price }])
                    } catch (err) {
                        console.error('Failed to preload product for checkout', err)
                    }
                })()
            } else {
                // no product query — optionally load cart items from backend for checkout
                ; (async () => {
                    try {
                        const { data } = await api.get('/api/cart/')
                        const { normalizeCartResponse } = await import('../lib/cart')
                        const normalized = normalizeCartResponse(data)
                        const loaded = (normalized.items || []).map((it: any) => ({ id: it.id, name: String(it.title ?? ''), qty: Number(it.qty ?? it.quantity ?? 1), price: Number(it.price ?? 0) }))
                        setItems(loaded)
                    } catch (err) {
                        // ignore — user may proceed with manual items
                    }
                })()
            }
        } catch (e) {
            // ignore
        }
    }, [])

    return (
        <div className="container mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
            {/* LEFT SIDE: CHECKOUT STEPS */}
            <div className="md:col-span-2 bg-surface rounded-2xl shadow-lg p-6 space-y-6 border-theme border">
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
                        <button className="mt-6 w-full btn-primary py-3 rounded-lg font-medium"
                            onClick={() => setStep(2)}>Continue to Shipping</button>
                    </div>
                )}

                {/* coupon input (small) */}
                {step === 1 && (
                    <div className="mt-3">
                        <label className="text-sm font-medium">Have a coupon?</label>
                        <div className="flex gap-2 mt-2">
                            <input value={coupon} onChange={(e) => setCoupon(e.target.value)} className="input-field" placeholder="Coupon code" />
                            <button onClick={applyCoupon} className="btn-primary px-4 py-2">Apply</button>
                        </div>
                        {discount > 0 && <div className="text-sm text-green-600 mt-2">Discount applied: ${discount.toFixed(2)}</div>}
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
                            <button className="px-4 py-2 rounded-lg btn-outline" onClick={() => setStep(1)}>Back</button>
                            <button className="px-6 py-2 rounded-lg btn-primary"
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
                            <button className="px-4 py-2 rounded-lg btn-outline" onClick={() => setStep(2)}>Back</button>
                            <button className="px-6 py-2 rounded-lg btn-primary"
                                onClick={() => setStep(4)}>Continue to Payment</button>
                        </div>
                    </div>
                )}

                {/* Step 4: Payment Method */}
                {step === 4 && (
                    <div>
                        <h3 className="text-xl font-semibold mb-4">4️⃣ Payment Method</h3>
                        <div className="space-y-3">
                            <div className="text-sm text-zinc-600">Available payment options:</div>
                            <div className="flex gap-2 flex-wrap">
                                {paymentOptions.map((opt) => (
                                    <button key={opt.id} onClick={() => setSelectedPayment(opt.id)} className={`px-3 py-2 rounded-lg border ${selectedPayment === opt.id ? 'bg-indigo-50 border-indigo-600' : ''}`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>

                            {selectedPayment === 'online' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input placeholder="Card Number *" className="input border rounded-lg px-4 py-2"
                                        value={payment.cardNumber} onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })} />
                                    <input placeholder="Expiry (MM/YY) *" className="input border rounded-lg px-4 py-2"
                                        value={payment.expiry} onChange={(e) => setPayment({ ...payment, expiry: e.target.value })} />
                                    <input placeholder="CVV *" className="input border rounded-lg px-4 py-2"
                                        value={payment.cvv} onChange={(e) => setPayment({ ...payment, cvv: e.target.value })} />
                                </div>
                            )}

                            {selectedPayment === 'cod' && (
                                <div className="text-sm text-zinc-600">Cash on Delivery selected. You'll pay the courier on delivery.</div>
                            )}

                            {/* allow receipt upload for offline payment verification */}
                            {selectedPayment && selectedPayment !== 'online' && (
                                <div className="mt-2">
                                    <ReceiptUpload onVerified={(ok) => { if (ok) alert('Receipt processed') }} />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between mt-6">
                            <button className="px-4 py-2 rounded-lg btn-outline" onClick={() => setStep(3)}>Back</button>
                            <button onClick={placeOrder} disabled={loading}
                                className={`px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 justify-center ${loading ? "bg-indigo-400" : "btn-primary"}`}>
                                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Placing...</> : <><CreditCard className="w-5 h-5" /> Confirm Order</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT SIDE: ORDER SUMMARY */}
            <div className="bg-surface rounded-2xl shadow-lg p-6 h-fit sticky top-8 border-theme border">
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
                <div className="mt-6 text-sm text-muted">
                    All orders are processed securely with SSL encryption.
                </div>
            </div>
        </div>
    )
}
