import api from './api'

export type CheckoutPayload = {
    coupon: string | null
    delivery_method: string
    items: Array<{ id: number | string; name: string; qty: number; price: number }>
    payment: { cardNumber?: string; expiry?: string; cvv?: string } | null
    payment_method: string
    shipping_address: Record<string, any>
    total: number
}

const PENDING_KEY = 'intelligentCommerce_pending_orders'
const ORDER_HISTORY_KEY = 'intelligentCommerce_orderHistory'

function getUserIdOrGuest(): string {
    try {
        const raw = localStorage.getItem('user')
        if (raw) {
            const parsed = JSON.parse(raw)
            const id = parsed?.id ?? parsed?.user_id ?? parsed?.pk ?? null
            const uname = parsed?.username ?? parsed?.email ?? null
            if (id) return String(id)
            if (uname) return String(uname).replace(/[^a-z0-9_\-]/gi, '')
        }
    } catch (e) { }
    return 'guest'
}

function pendingKeyForUser() {
    return `${PENDING_KEY}_${getUserIdOrGuest()}`
}

function orderHistoryKeyForUser() {
    return `${ORDER_HISTORY_KEY}_${getUserIdOrGuest()}`
}

export function savePendingOrder(payload: CheckoutPayload) {
    try {
        const key = pendingKeyForUser()
        const raw = localStorage.getItem(key)
        const arr = raw ? JSON.parse(raw) : []
        const localId = Date.now()
        arr.push({ id: localId, created_at: new Date().toISOString(), payload })
        localStorage.setItem(key, JSON.stringify(arr))
        return localId
    } catch (err) {
        console.error('Failed to save pending order', err)
        return null
    }
}

export function loadPendingOrders() {
    try {
        const key = pendingKeyForUser()
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : []
    } catch (err) {
        console.error('Failed to load pending orders', err)
        return []
    }
}

export function removePendingOrder(localId: number) {
    try {
        const key = pendingKeyForUser()
        const raw = localStorage.getItem(key)
        const arr = raw ? JSON.parse(raw) : []
        const filtered = arr.filter((o: any) => o.id !== localId)
        localStorage.setItem(key, JSON.stringify(filtered))
    } catch (err) {
        console.error('Failed to remove pending order', err)
    }
}

export async function confirmOrderToBackend(localOrderId: number, payload: CheckoutPayload) {
    // This sends a single confirmation to the backend. Backend may choose to create order
    // or just log confirmation. Keep call lightweight and tolerate missing endpoint.
    try {
        const { data } = await api.post('/api/orders/confirm/', { local_id: localOrderId, ...payload })
        return data
    } catch (err) {
        // If backend doesn't have endpoint, return error up the chain but keep local copy
        console.debug('confirmOrderToBackend failed', err)
        throw err
    }
}

export function saveOrderHistoryEntry(entry: any) {
    try {
        const key = orderHistoryKeyForUser()
        const raw = localStorage.getItem(key)
        const arr = raw ? JSON.parse(raw) : []
        arr.unshift(entry)
        localStorage.setItem(key, JSON.stringify(arr))
    } catch (err) {
        console.error('Failed to save order history entry', err)
    }
}

export function loadOrderHistory() {
    try {
        const key = orderHistoryKeyForUser()
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : []
    } catch (err) {
        console.error('Failed to load order history', err)
        return []
    }
}

export default { savePendingOrder, loadPendingOrders, confirmOrderToBackend }
