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
const { OAuth2Client } = require('google-auth-library')
const googleClientId = process.env.GOOGLE_CLIENT_ID || ''
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null

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
const sellerBalances = [] // demo ledger entries for scheduled payouts
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

// Google sign-in verification (receives credential (ID token) from frontend)
app.post('/api/auth/google-login/', async (req, res) => {
    const { credential } = req.body || {}
    if (!credential) return res.status(400).json({ error: 'credential missing' })
    if (!googleClient) return res.status(500).json({ error: 'Server misconfigured: GOOGLE_CLIENT_ID missing' })

    try {
        const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: googleClientId })
        const payload = ticket.getPayload()
        // Minimal demo: return a fake token and user object
        const user = {
            id: payload.sub,
            email: payload.email,
            username: payload.name || payload.email,
            picture: payload.picture || null,
            role: 'customer'
        }
        const token = `demo-token-${Date.now()}`
        return res.json({ access: token, user })
    } catch (err) {
        console.error('Google sign-in verification failed', err)
        return res.status(401).json({ error: 'Invalid Google credential' })
    }
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

// Cancel an order (if not paid)
app.post('/api/orders/:id/cancel/', (req, res) => {
    const id = req.params.id
    const order = orders[id]
    if (!order) return res.status(404).json({ error: 'Order not found' })
    if (order.status === 'paid') return res.status(400).json({ error: 'Paid orders cannot be cancelled' })
    order.status = 'cancelled'
    order.cancelled_at = new Date().toISOString()
    return res.json({ success: true, order })
})

// Confirm received (customer) - marks order completed if it was paid
app.post('/api/orders/:id/confirm-received/', (req, res) => {
    const id = req.params.id
    const order = orders[id]
    if (!order) return res.status(404).json({ error: 'Order not found' })
    if (order.status !== 'paid') return res.status(400).json({ error: 'Only paid orders can be confirmed received' })
    order.status = 'completed'
    order.completed_at = new Date().toISOString()
    return res.json({ success: true, order })
})

// Submit feedback for an order (customer)
app.post('/api/orders/:id/feedback/', (req, res) => {
    const id = req.params.id
    const order = orders[id]
    if (!order) return res.status(404).json({ error: 'Order not found' })
    const body = req.body || {}
    order.feedback = order.feedback || []
    order.feedback.push({ message: body.message || '', created_at: new Date().toISOString() })
    return res.json({ success: true, order })
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

// Dev-only: simulate a successful payment for an order (for testing without Stripe)
app.post('/api/testing/payments/simulate/', (req, res) => {
    // Allow usage only in development or if explicitly enabled via env var
    const allowDev = process.env.NODE_ENV === 'development' || process.env.ENABLE_DEV_SIMULATE === 'true'
    const secretKey = process.env.DEV_SIMULATE_KEY || ''
    if (!allowDev) return res.status(404).json({ error: 'Not found' })

    // If a secret key is set, require the same key in the header for extra protection
    if (secretKey) {
        const provided = req.headers['x-dev-simulate-key'] || req.body?.dev_key
        if (!provided || provided !== secretKey) return res.status(403).json({ error: 'Forbidden' })
    }

    const { order_id } = req.body || {}
    if (!order_id || !orders[order_id]) return res.status(400).json({ error: 'order_id missing or invalid' })

    const order = orders[order_id]

    // Create a fake payment intent id and mark payment + order as succeeded
    const pid = `dev_pi_${Date.now()}`
    payments[pid] = { id: pid, status: 'succeeded', order_id: order.id }

    order.status = 'paid'
    order.paid_at = new Date().toISOString()

    // Create a simple seller balance ledger entry (demo): platform takes 5% fee
    const platformFee = Math.round((order.amount_cents || 0) * 0.05)
    const sellerNet = (order.amount_cents || 0) - platformFee
    const scheduled = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
    sellerBalances.push({ seller_id: 1, order_id: order.id, amount_gross: order.amount_cents || 0, platform_fee: platformFee, seller_net: sellerNet, payout_status: 'pending', scheduled_payout_date: scheduled.toISOString() })

    console.log(`Dev-simulated payment for order ${order.id} (pid=${pid}). Scheduled payout: ${scheduled.toISOString()}`)

    return res.json({ success: true, order })
})

// Seller balances listing (demo)
app.get('/api/seller/balances/', (req, res) => {
    return res.json(sellerBalances)
})

app.listen(port, () => {
    console.log(`Stripe demo server listening on http://localhost:${port}`)
    console.log('Make sure to set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in server/.env')
    const devSimEnabled = process.env.NODE_ENV === 'development' || process.env.ENABLE_DEV_SIMULATE === 'true'
    if (devSimEnabled) {
        console.log('Dev simulate endpoint enabled: POST /api/testing/payments/simulate/ (use only in development). Set DEV_SIMULATE_KEY to require a header x-dev-simulate-key for extra protection.')
    }
})
