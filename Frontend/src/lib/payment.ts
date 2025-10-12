import api from "./api"

export interface Payment {
    id: number
    user: number
    bank: string
    txn_id: string
    amount: string
    status: "pending" | "processing" | "approved" | "rejected"
    created: string
    updated: string
}

export interface AdminActionResponse {
    id: number
    status: "approved" | "rejected"
}

// Upload payment
export const uploadPayment = async (formData: FormData): Promise<{ id: number; status: string }> => {
    const res = await api.post("/api/payments/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data
}

// Get payment detail
export const getPaymentDetail = async (id: number): Promise<Payment> => {
    const res = await api.get(`/api/payments/${id}/`)
    return res.data
}

// Admin - list payments
export const listPayments = async (): Promise<Payment[]> => {
    const res = await api.get("/api/payments/admin/list/")
    return res.data
}

// Admin - approve/reject
export const adminAction = async (id: number, action: "approve" | "reject"): Promise<AdminActionResponse> => {
    const res = await api.post(`/api/payments/admin/${id}/action/`, { action })
    return res.data
}
