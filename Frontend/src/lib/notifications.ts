import api from "./api"

export async function getNotifications() {
    const { data } = await api.get("/api/notifications/")
    return data
}

export async function markNotificationRead(id: number) {
    await api.post(`/api/notifications/${id}/read/`)
}
