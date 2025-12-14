// src/lib/wishlist.ts
import api from "./api"

const LOCAL_KEY = 'intelligentCommerce_wishlist'

function getUserRole(): string | null {
    try {
        const raw = localStorage.getItem('user')
        if (!raw) return null
        const parsed = JSON.parse(raw)
        return parsed?.role || null
    } catch {
        return null
    }
}

export async function addToWishlist(productId: number) {
    const role = getUserRole()
    if (!role) {
        // not logged in: store locally so user keeps wishlist while unauthenticated
        try {
            const raw = localStorage.getItem(LOCAL_KEY)
            const arr = raw ? JSON.parse(raw) : []
            if (!arr.includes(productId)) {
                arr.push(productId)
                localStorage.setItem(LOCAL_KEY, JSON.stringify(arr))
                try {
                    window.dispatchEvent(new CustomEvent('intelligentCommerce_wishlist_updated', { detail: arr }))
                } catch (e) {
                    // ignore
                }
            }
            return { local: true }
        } catch (err) {
            throw err
        }
    }

    if (role !== 'customer') {
        // only customers may add to server-side wishlist
        return Promise.reject(new Error('Only customers can add products to wishlist'))
    }

    // customer -> send to backend
    return api.post("/api/wishlist/add/", { product: productId })
}

export async function removeFromWishlist(productId: number) {
    const role = getUserRole()
    if (!role) {
        // remove from local fallback
        try {
            const raw = localStorage.getItem(LOCAL_KEY)
            const arr = raw ? JSON.parse(raw) : []
            const next = arr.filter((id: number) => id !== productId)
            localStorage.setItem(LOCAL_KEY, JSON.stringify(next))
            try {
                window.dispatchEvent(new CustomEvent('intelligentCommerce_wishlist_updated', { detail: next }))
            } catch (e) {
                // ignore
            }
            return { local: true }
        } catch (err) {
            throw err
        }
    }

    if (role !== 'customer') return Promise.reject(new Error('Only customers can remove wishlist items'))

    return api.post("/api/wishlist/remove/", { product: productId })
}

export async function getWishlist() {
    const role = getUserRole()
    if (!role) {
        const raw = localStorage.getItem(LOCAL_KEY)
        const arr = raw ? JSON.parse(raw) : []
        // Map ids to minimal product placeholders; frontend can enrich if needed
        return arr.map((id: number) => ({ id, product: { id, title: 'Unknown', price: 0 } }))
    }

    if (role !== 'customer') return []

    const { data } = await api.get("/api/wishlist/list/")
    return data
}

export default { addToWishlist, removeFromWishlist, getWishlist }
