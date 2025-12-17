// src/lib/analytics.ts
// Simple client-side batching helper to record recommendation/interaction events
const QUEUE_KEY = '__reco_event_queue'
let queue: any[] = []
let flushing = false

function enqueue(evt: any) {
    queue.push(evt)
    if (queue.length >= 10) flush().catch(() => { })
}

export async function flush() {
    if (flushing || queue.length === 0) return
    flushing = true
    const toSend = queue.slice()
    queue = []
    try {
        await fetch('/api/recommendations/interactions/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events: toSend }),
        })
    } catch (err) {
        // if network fails, append back to queue and retry later
        queue = toSend.concat(queue)
        console.debug('Analytics flush failed', err)
    } finally {
        flushing = false
    }
}

// record an interaction
export function recordInteraction(productId: number, event: 'view' | 'cart' | 'wishlist' | 'purchase', extra?: Record<string, any>) {
    try {
        const evt = { product: productId, event, extra: extra || {}, ts: new Date().toISOString() }
        enqueue(evt)
        // best-effort flush after short delay
        setTimeout(() => { flush().catch(() => { }) }, 2000)
    } catch (err) {
        // ignore
    }
}

export default { recordInteraction, flush }
