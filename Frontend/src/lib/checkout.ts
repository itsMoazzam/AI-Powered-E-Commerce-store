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

export function savePendingOrder(payload: CheckoutPayload) {
    try {
        const raw = localStorage.getItem(PENDING_KEY)
        const arr = raw ? JSON.parse(raw) : []
        const localId = Date.now()
        arr.push({ id: localId, created_at: new Date().toISOString(), payload })
        localStorage.setItem(PENDING_KEY, JSON.stringify(arr))
        return localId
    } catch (err) {
        console.error('Failed to save pending order', err)
        return null
    }
}

export function loadPendingOrders() {
    try {
        const raw = localStorage.getItem(PENDING_KEY)
        return raw ? JSON.parse(raw) : []
    } catch (err) {
        console.error('Failed to load pending orders', err)
        return []
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

export default { savePendingOrder, loadPendingOrders, confirmOrderToBackend }
