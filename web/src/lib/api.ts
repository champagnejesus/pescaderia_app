import axios from "axios"
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1", headers: { "Content-Type": "application/json" } })
api.interceptors.request.use((config) => { const token = localStorage.getItem("abyssal-token"); if (token) config.headers.Authorization = `Bearer ${token}`; return config })
api.interceptors.response.use((r) => r, (err) => { if (err.response?.status === 401) { localStorage.removeItem("abyssal-token"); window.location.href = "/login" }; return Promise.reject(err) })
export default api
