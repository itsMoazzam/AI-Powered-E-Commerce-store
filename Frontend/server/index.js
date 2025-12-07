require('dotenv').config()
const express = require('express')
const Stripe = require('stripe')
const app = express()
const port = process.env.PORT || 8000

const stripeKey = process.env.STRIPE_SECRET_KEY || ''
if (!stripeKey) {
    console.warn('Warning: STRIPE_SECRET_KEY not set. PaymentIntent creation will fail until you set STRIPE_SECRET_KEY in .env')
}
const stripe = Stripe(stripeKey)

// CORS middleware for frontend dev server
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if (req.method === 'OPTIONS') return res.sendStatus(200)
    next()
})

// Need raw body for webhook signature verification
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf } }))

// Simple in-memory storage (demo only)
const orders = {} // orderId -> { id, status, amount_cents, paid_at }
const payments = {} // paymentIntentId -> { id, status, order_id }
let nextOrderId = 1000

// Create a demo order
app.post('/api/orders/', (req, res) => {
    const body = req.body || {}
    // For demo purposes, allow supplying amount_cents
    const amount_cents = body.amount_cents ? parseInt(body.amount_cents, 10) : 1000
    const id = ++nextOrderId
    const order = { id, status: 'pending', amount_cents, created_at: new Date().toISOString() }
    orders[id] = order
    console.log('Created order', order)
    return res.json(order)
})

// Create PaymentIntent for an order
app.post('/api/payments/create-intent/', async (req, res) => {
    const { order_id } = req.body || {}
    if (!order_id || !orders[order_id]) return res.status(400).json({ error: 'order_id missing or invalid' })
    const order = orders[order_id]

    if (!stripeKey) return res.status(500).json({ error: 'Server misconfigured: STRIPE_SECRET_KEY not set' })

    try {
        const intent = await stripe.paymentIntents.create({
            amount: order.amount_cents,
            currency: process.env.CURRENCY || 'usd',
            metadata: { order_id: String(order.id) }
        })

        payments[intent.id] = { id: intent.id, status: 'pending', order_id: order.id }
        console.log('Created PaymentIntent', intent.id, 'for order', order.id)

        return res.json({ client_secret: intent.client_secret, payment_intent_id: intent.id })
    } catch (err) {
        console.error('Error creating PaymentIntent', err)
        return res.status(500).json({ error: 'Failed to create PaymentIntent', details: String(err) })
    }
})

// Get order by id
app.get('/api/orders/:id/', (req, res) => {
    const id = req.params.id
    const order = orders[id]
    if (!order) return res.status(404).json({ error: 'Order not found' })
    return res.json(order)
})

// Get notifications endpoint (returns mock data for now)
app.get('/api/notifications/', (req, res) => {
    const limit = parseInt(req.query.limit || 5, 10)
    const notifications = [
        { id: 1, message: 'Order #1001 has been shipped', type: 'order', created_at: new Date().toISOString() },
        { id: 2, message: 'Your payment was successful', type: 'payment', created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 3, message: 'New seller review received', type: 'review', created_at: new Date(Date.now() - 7200000).toISOString() },
    ].slice(0, limit)
    return res.json(notifications)
})

// Webhook endpoint
app.post('/api/webhooks/stripe/', (req, res) => {
    const sig = req.headers['stripe-signature']
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
        console.warn('No STRIPE_WEBHOOK_SECRET set; cannot verify webhook signature. Processing without verification (DEVELOPMENT ONLY).')
    }

    let event
    try {
        if (webhookSecret) {
            event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret)
        } else {
            // If no webhook secret provided, accept the payload (only for quick local testing)
            event = req.body
        }
    } catch (err) {
        console.error('⚠️  Webhook signature verification failed.', err.message)
        return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded': {
            const pi = event.data.object
            const pid = pi.id
            console.log('Webhook: payment_intent.succeeded', pid)
            const payment = payments[pid]
            if (payment) {
                payment.status = 'succeeded'
                const order = orders[payment.order_id]
                if (order) {
                    order.status = 'paid'
                    order.paid_at = new Date().toISOString()
                    console.log(`Order ${order.id} marked as paid`)
                }
            } else {
                console.warn('PaymentIntent not found in memory:', pid)
            }
            break
        }
        case 'payment_intent.payment_failed': {
            const pi = event.data.object
            const pid = pi.id
            console.log('Webhook: payment_intent.payment_failed', pid)
            const payment = payments[pid]
            if (payment) payment.status = 'failed'
            break
        }
        default:
            console.log(`Unhandled event type ${event.type}`)
    }

    res.json({ received: true })
})

app.listen(port, () => {
    console.log(`Stripe demo server listening on http://localhost:${port}`)
    console.log('Make sure to set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in server/.env')
})
