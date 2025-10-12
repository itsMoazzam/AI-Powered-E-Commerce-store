// src/lib/wishlist.ts
import api from "./api"

export async function addToWishlist(productId: number) {
    return api.post("/api/wishlist/add/", { product: productId })
}

export async function removeFromWishlist(productId: number) {
    return api.post("/api/wishlist/remove/", { product: productId })
}

export async function getWishlist() {
    const { data } = await api.get("/api/wishlist/list/")
    return data
}
