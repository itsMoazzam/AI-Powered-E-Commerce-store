// Cart utility - uses localStorage for local state, only syncs to backend on checkout

export interface CartItem {
    id: number
    productId: number
    title: string
    thumbnail: string
    price: number
    qty: number
    subtotal: number
    seller?: {
        id: number
        name: string
    }
}

export interface CartState {
    items: CartItem[]
    total: number
    shipping: number
    grand_total: number
}

const CART_STORAGE_KEY = 'intelligentCommerce_cart'

/**
 * Determine the storage key to use for the cart. If a user is logged in (stored in
 * localStorage under `user`), use a per-user key (intelligentCommerce_cart_<id|username>),
 * otherwise fall back to a guest key `intelligentCommerce_cart_guest`.
 */
export function getCartStorageKey(): string {
    try {
        const raw = localStorage.getItem('user')
        if (raw) {
            const parsed = JSON.parse(raw)
            const id = parsed?.id ?? parsed?.user_id ?? parsed?.pk ?? null
            const uname = parsed?.username ?? parsed?.email ?? null
            if (id) return `${CART_STORAGE_KEY}_${String(id)}`
            if (uname) return `${CART_STORAGE_KEY}_${String(uname).replace(/[^a-z0-9_\-]/gi, '')}`
        }
    } catch (e) {
        // ignore
    }
    // Backwards compatibility: if old key exists, use it
    try {
        if (localStorage.getItem(CART_STORAGE_KEY)) return CART_STORAGE_KEY
    } catch (e) { }
    return `${CART_STORAGE_KEY}_guest`
}
const SHIPPING_COST = 0 // Free shipping

/**
 * Load cart from localStorage
 */
export function loadCartFromStorage(): CartState {
    try {
        const key = getCartStorageKey()
        const stored = localStorage.getItem(key)
        if (stored) {
            return JSON.parse(stored)
        }
    } catch (e) {
        console.warn('Failed to load cart from localStorage:', e)
    }
    return { items: [], total: 0, shipping: SHIPPING_COST, grand_total: 0 }
}

/**
 * Save cart to localStorage
 */
export function saveCartToStorage(cart: CartState) {
    try {
        const key = getCartStorageKey()
        localStorage.setItem(key, JSON.stringify(cart))
        // notify other parts of the app (same-tab and other tabs) that cart changed
        try {
            window.dispatchEvent(new CustomEvent('intelligentCommerce_cart_updated', { detail: cart }))
            // Also write a short marker to the canonical cart key for compatibility
            try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)) } catch (e) { }
        } catch (e) {
            // ignore in non-browser or restricted environments
        }
    } catch (e) {
        console.error('Failed to save cart to localStorage:', e)
    }
}

/**
 * Calculate cart totals
 */
function calculateTotals(items: CartItem[]): { total: number; shipping: number; grand_total: number } {
    const total = items.reduce((sum, item) => sum + item.subtotal, 0)
    const shipping = SHIPPING_COST
    const grand_total = total + shipping
    return { total, shipping, grand_total }
}

/**
 * Add item to cart (or increase quantity if exists)
 */
export function addToCart(product: any): CartState {
    try {
        const raw = localStorage.getItem('user')
        if (!raw) throw new Error('User not logged in')
        const parsed = JSON.parse(raw)
        const role = parsed?.role || localStorage.getItem('role')
        if (role !== 'customer') throw new Error('Only customers may add items to cart')
    } catch (err) {
        throw err
    }

    const cart = loadCartFromStorage()

    const existingIndex = cart.items.findIndex(item => item.productId === product.id)

    if (existingIndex >= 0) {
        // Increase quantity
        cart.items[existingIndex].qty += 1
        cart.items[existingIndex].subtotal = cart.items[existingIndex].price * cart.items[existingIndex].qty
    } else {
        // Add new item
        const newItem: CartItem = {
            id: Date.now(), // local cart id
            productId: product.id,
            title: product.title || 'Product',
            thumbnail: product.thumbnail || product.image || '',
            price: Number(product.price) || 0,
            qty: 1,
            subtotal: Number(product.price) || 0,
            seller: product.seller || { id: 0, name: 'Unknown' }
        }
        cart.items.push(newItem)
    }

    const totals = calculateTotals(cart.items)
    cart.total = totals.total
    cart.shipping = totals.shipping
    cart.grand_total = totals.grand_total

    saveCartToStorage(cart)
    return cart
}

/**
 * Update item quantity (local only, no API call)
 */
export function updateCartItemQty(cartItemId: number, qty: number): CartState {
    if (qty < 1) return removeFromCart(cartItemId)

    const cart = loadCartFromStorage()
    const item = cart.items.find(i => i.id === cartItemId)

    if (item) {
        item.qty = qty
        item.subtotal = item.price * qty
    }

    const totals = calculateTotals(cart.items)
    cart.total = totals.total
    cart.shipping = totals.shipping
    cart.grand_total = totals.grand_total

    saveCartToStorage(cart)
    return cart
}

/**
 * Remove item from cart (local only, no API call)
 */
export function removeFromCart(cartItemId: number): CartState {
    const cart = loadCartFromStorage()
    cart.items = cart.items.filter(item => item.id !== cartItemId)

    const totals = calculateTotals(cart.items)
    cart.total = totals.total
    cart.shipping = totals.shipping
    cart.grand_total = totals.grand_total

    saveCartToStorage(cart)
    return cart
}

/**
 * Clear entire cart (local only)
 */
export function clearCart(): CartState {
    const emptyCart: CartState = { items: [], total: 0, shipping: SHIPPING_COST, grand_total: 0 }
    saveCartToStorage(emptyCart)
    return emptyCart
}

/**
 * Normalize backend cart response (for syncing on checkout)
 */
export function normalizeCartResponse(data: any) {
    const items = Array.isArray(data?.items) ? data.items.map((it: any) => {
        const qty = it.qty ?? it.quantity ?? it.cart_qty ?? 1
        const price = it.price ?? it.unit_price ?? (it.product?.price ?? 0)
        const title = it.product?.name || it.product?.title || it.title || 'Product'
        const thumbnail = it.product?.image || it.product?.thumbnail || it.thumbnail || ''

        return {
            id: it.id,
            title: String(title),
            thumbnail: String(thumbnail),
            price: Number(price) || 0,
            qty: Number(qty) || 1,
            subtotal: (Number(price) || 0) * (Number(qty) || 1),
            raw: it,
        }
    }) : []

    const subtotal = items.reduce((s: number, i: any) => s + i.subtotal, 0)
    const shippingCost = Number(data?.shipping ?? data?.shipping_cost ?? 0) || 0
    const total = Number(data?.total ?? subtotal) || subtotal
    const grandTotal = Number(data?.grand_total ?? data?.grandTotal ?? (total + shippingCost)) || (total + shippingCost)

    return {
        items,
        total,
        shipping: shippingCost,
        grand_total: grandTotal,
        raw: data,
    }
}

export default { loadCartFromStorage, addToCart, updateCartItemQty, removeFromCart, clearCart, normalizeCartResponse }
