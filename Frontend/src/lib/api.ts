import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
    withCredentials: false,
})

api.interceptors.request.use((config) => {
    try {
        const token = localStorage.getItem("token")
        // guard against "null" or "undefined" strings
        if (token && token !== "null" && token !== "undefined" && token.trim() !== "") {
            config.headers = config.headers || {}
            config.headers.Authorization = `Bearer ${token}`
        } else {
            // ensure no stale header
            if (config.headers) delete (config.headers as any).Authorization
        }
    } catch (e) {
        // noop
    }
    return config
}, (err) => Promise.reject(err))

api.interceptors.response.use(
    (r) => r,
    (error) => {
        if (error?.response?.status === 401) {
            localStorage.removeItem("token")
            localStorage.removeItem("role")
            localStorage.removeItem("user")
            if (!location.pathname.startsWith("/auth")) {
                location.href = "/auth/login"
            }
        }
        return Promise.reject(error)
    }
)

export default api
