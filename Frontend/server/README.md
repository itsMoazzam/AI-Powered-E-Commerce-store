# Stripe Demo Server

This small Express server provides minimal endpoints to test the frontend demo at `src/pages/Payments/PaymentDemo.tsx`.

Endpoints
- POST `/api/orders/` - create a demo order. JSON body can include `amount_cents` (default 1000).
  - Returns: order JSON `{ id, status, amount_cents, created_at }`
- POST `/api/payments/create-intent/` - create a Stripe PaymentIntent for a given order.
  - Body: `{ order_id: <orderId> }`
  - Returns: `{ client_secret, payment_intent_id }`
- GET `/api/orders/:id/` - get order state
- POST `/api/webhooks/stripe/` - Stripe webhook endpoint (should be pointed to by Stripe CLI in development)

Setup
1. From `Frontend` folder install server dependencies:

```powershell
cd Frontend/server
npm install
```

2. Copy `.env.example` to `.env` and set real keys (use test keys for development):

```text
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
PORT=8000
CURRENCY=usd
```

3. Start the server:

```powershell
npm start
```

4. Forward Stripe webhooks (in a separate terminal):

```powershell
stripe login
stripe listen --forward-to http://localhost:8000/api/webhooks/stripe/
# copy the "Signing secret" (whsec_...) and put it into server/.env as STRIPE_WEBHOOK_SECRET
```

5. Run the frontend dev server and open the Payment demo page (the demo calls these endpoints):

```powershell
# from Frontend root
npm run dev
```

Security
- This server stores orders/payments in-memory for demo only. Do NOT use in production.
- Keep `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` secret; do not commit them.

Next steps
- Persist data in a DB (Postgres/SQLite)
- Integrate with your actual order model and authentication
- Implement signature verification and replay protection in production
- Implement proper error handling and logging
