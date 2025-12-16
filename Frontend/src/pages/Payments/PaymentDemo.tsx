import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

// Use local demo server in dev, or fallback to regular api
const API_BASE = import.meta.env.DEV ? 'http://localhost:8000' : '/api'

// Replace with your publishable key env at runtime. For local dev you can hardcode pk_test_xxx in .env and inject via build.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

// Simple fetch wrapper
const apiCall = async (method: string, endpoint: string, body?: any) => {
    const opts: any = { method, headers: { 'Content-Type': 'application/json' } }
    if (body) opts.body = JSON.stringify(body)
    const res = await fetch(`${API_BASE}${endpoint}`, opts)
    if (!res.ok) throw new Error(await res.text())
    return res.json()
}

function StripeCheckout({ orderId }: { orderId: number }) {
    const stripe = useStripe()
    const elements = useElements()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!stripe || !elements) return
        setLoading(true)
        setMessage(null)

        try {
            // Create PaymentIntent server-side
            const resp = await apiCall('POST', '/api/payments/create-intent/', { order_id: orderId })
            const { client_secret } = resp
            if (!client_secret) throw new Error('No client_secret returned from server')

            const card = elements.getElement(CardElement)
            if (!card) throw new Error('Card element not found')

            const result = await stripe.confirmCardPayment(client_secret, {
                payment_method: { card }
            })

            if (result.error) {
                setMessage(result.error.message || 'Payment failed')
            } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
                setMessage('Payment confirmed. Waiting for webhook to finalize order...')
                // Poll order status
                setTimeout(async () => {
                    try {
                        const check = await apiCall('GET', `/api/orders/${orderId}/`)
                        setMessage(`✅ Order status: ${check.status || 'unknown'} | Paid at: ${check.paid_at || 'pending'}`)
                    } catch (e) {
                        setMessage('Payment processed (webhook pending)')
                    }
                }, 2000)
            }
        } catch (err: any) {
            console.error(err)
            setMessage(err?.message || 'Payment error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div className="p-4 border rounded">
                <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
            </div>
            <div className="flex gap-2">
                <button disabled={!stripe || loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading ? 'Processing…' : 'Pay'}</button>
            </div>
            {message && <div className="text-sm text-muted">{message}</div>}
        </form>
    )
}

export default function PaymentDemo() {
    const [orderId, setOrderId] = useState<number | null>(null)
    const [creating, setCreating] = useState(false)
    const [note, setNote] = useState<string | null>(null)
    const [checking, setChecking] = useState(false)
    const [simulating, setSimulating] = useState(false)

    const createOrder = async () => {
        setCreating(true)
        setNote(null)
        try {
            // Minimal demo: POST to orders endpoint to create an order with payment_method="online"
            const resp = await apiCall('POST', '/api/orders/', { amount_cents: 2000 })
            setOrderId(resp.id)
            setNote('Order created. Now create payment intent and confirm via card element.')
        } catch (err: any) {
            console.error(err)
            setNote(err?.message || 'Failed to create order')
        } finally {
            setCreating(false)
        }
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-3">Stripe Demo Checkout</h2>
            {!orderId ? (
                <div className="space-y-3">
                    <p className="text-sm text-muted">Create a demo order (server must accept POST /api/orders/ and return order id).</p>
                    <button onClick={createOrder} disabled={creating} className="px-4 py-2 bg-green-600 text-white rounded">{creating ? 'Creating…' : 'Create Order'}</button>
                    {note && <div className="text-sm text-muted">{note}</div>}
                </div>
            ) : (
                <Elements stripe={stripePromise}>
                    <div className="mt-4">
                        <h3 className="font-medium">Order #{orderId}</h3>
                        <StripeCheckout orderId={orderId} />

                        {/* Dev helpers: simulate payment or check status without using Stripe */}
                        {import.meta.env.DEV && (
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={async () => {
                                        if (!orderId) return
                                        setSimulating(true)
                                        setNote(null)
                                        try {
                                            // dev-only simulate endpoint; backend should finalize order same as webhook
                                            await apiCall('POST', '/api/testing/payments/simulate/', { order_id: orderId })
                                            setNote('Simulated payment: order finalized (dev only).')
                                        } catch (err: any) {
                                            console.error(err)
                                            setNote(err?.message || 'Simulate failed')
                                        } finally {
                                            setSimulating(false)
                                        }
                                    }}
                                    disabled={simulating}
                                    className="px-3 py-2 bg-yellow-500 text-white rounded"
                                >
                                    {simulating ? 'Simulating…' : 'Simulate Payment (dev)'}
                                </button>

                                <button
                                    onClick={async () => {
                                        if (!orderId) return
                                        setChecking(true)
                                        try {
                                            const check = await apiCall('GET', `/api/orders/${orderId}/`)
                                            setNote(`Order status: ${check.status || 'unknown'}${check.paid_at ? ' | Paid at: ' + check.paid_at : ''}`)
                                        } catch (err: any) {
                                            console.error(err)
                                            setNote(err?.message || 'Failed to fetch order')
                                        } finally {
                                            setChecking(false)
                                        }
                                    }}
                                    disabled={checking}
                                    className="px-3 py-2 bg-gray-200 text-gray-800 rounded"
                                >
                                    {checking ? 'Checking…' : 'Check Order Status'}
                                </button>
                            </div>
                        )}
                    </div>
                </Elements>
            )}
        </div>
    )
}
