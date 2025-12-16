import axios from "axios"

const isDev = import.meta.env.DEV
// In development, prefer relative URLs so requests go through Vite's dev proxy (`/api` -> backend).
// In production/staging, use the configured VITE_API_BASE_URL or fallback to localhost:8000.
// Prefer the explicit VITE_API_BASE_URL when provided. In dev, empty string still uses Vite proxy,
// but if the proxy is not forwarding for some reason, setting VITE_API_BASE_URL helps route requests directly.
const api = axios.create({
    baseURL: isDev ? (import.meta.env.VITE_API_BASE_URL || '') : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'),
    withCredentials: false,
})

let devProxyWarningShown = false

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
        // Helpful dev-time guidance when 404s look like the dev server served the /api path
        if (isDev && error?.response?.status === 404 && !devProxyWarningShown) {
            const url = error?.config?.url ?? ''
            if (typeof url === 'string' && url.startsWith('/api')) {
                devProxyWarningShown = true
                console.warn(
                    "Dev proxy 404 for API request. If your backend is running on a separate port, either ensure Vite proxy is configured and the dev server restarted, or set VITE_API_BASE_URL to the backend URL in your .env and restart.")
            }
        }
        return Promise.reject(error)
    }
)

export default api
