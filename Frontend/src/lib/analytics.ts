// src/lib/analytics.ts
// Simple client-side batching helper to record recommendation/interaction events
// Enhanced: include anon_id and user_id so backend validation succeeds
const QUEUE_KEY = '__reco_event_queue'
const ANON_KEY = '__reco_anon_id'
let queue: any[] = []
let flushing = false

function genAnonId() {
    // simple stable pseudo-uuid: timestamp + random
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function getAnonId() {
    try {
        let id = localStorage.getItem(ANON_KEY)
        if (!id) {
            id = genAnonId()
            localStorage.setItem(ANON_KEY, id)
        }
        return id
    } catch (err) {
        return genAnonId()
    }
}

function getUserId() {
    try {
        const raw = localStorage.getItem('user')
        if (!raw) return null
        const obj = JSON.parse(raw)
        return obj?.id ?? null
    } catch (err) {
        return null
    }
}

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
        const res = await fetch('/api/recommendations/interactions/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events: toSend }),
        })

        if (!res.ok) {
            // read server message for diagnostics
            let body: any = null
            try { body = await res.json() } catch (e) { body = await res.text().catch(() => null) }
            console.warn('Analytics flush returned non-ok:', res.status, body)

            // Requeue only for server errors (>=500). For 4xx, drop after logging because payload likely invalid.
            if (res.status >= 500) {
                queue = toSend.concat(queue)
            }
        }
    } catch (err) {
        // network failure -> requeue
        queue = toSend.concat(queue)
        console.debug('Analytics flush failed', err)
    } finally {
        flushing = false
    }
}

// record an interaction
export function recordInteraction(productId: number, event: 'view' | 'cart' | 'wishlist' | 'purchase', extra?: Record<string, any>) {
    try {
        const evt = {
            product: productId,
            event,
            extra: extra || {},
            ts: new Date().toISOString(),
            anon_id: getAnonId(),
            user_id: getUserId(),
        }
        enqueue(evt)
        // best-effort flush after short delay
        setTimeout(() => { flush().catch(() => { }) }, 2000)
    } catch (err) {
        // ignore
    }
}

export default { recordInteraction, flush }
