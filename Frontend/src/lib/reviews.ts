import api from "./api"  // your axios wrapper

export interface Review {
    id: number;
    product: number;
    user: string;
    rating?: number;
    text: string;
    media?: string;
    status: string;
    created: string;
}

export const fetchReviews = async (productId: number): Promise<Review[]> => {
    const res = await api.get(`/api/reviews/product/${productId}/`);
    return res.data;
};

export const submitReview = async (data: FormData): Promise<Review> => {
    const res = await api.post("/api/reviews/create/", data, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};
