import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    withCredentials: false,
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (r) => r,
    (error) => {
        if (error?.response?.status === 401) {
            localStorage.removeItem('token')
            if (!location.pathname.startsWith('/auth')) {
                location.href = '/auth/login'
            }
        }
        return Promise.reject(error)
    }
)

export default api
