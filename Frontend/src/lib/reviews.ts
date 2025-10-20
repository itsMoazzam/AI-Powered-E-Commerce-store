import api from "./api"

export interface Review {
    id: number
    user: string
    text: string
    rating?: number
    media?: string
    created: string
}

export async function fetchReviews(productId: number): Promise<Review[]> {
    const res = await api.get(`/api/products/${productId}/reviews/`)
    return res.data
}

export async function submitReview(formData: FormData) {
    await api.post(`/api/reviews/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    })
}
