import axios from "axios"

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1", headers: { "Content-Type": "application/json" }, timeout: 15000 })

api.interceptors.request.use((config) => { const token = localStorage.getItem("abyssal-token"); if (token) config.headers.Authorization = `Bearer ${token}`; return config })

const retryCounts = new Map<string, number>()
api.interceptors.response.use((r) => {
  const key = `${r.config?.method}:${r.config?.url}`
  retryCounts.delete(key)
  return r
}, async (err) => {
  if (err.response?.status === 401) {
    const refreshToken = localStorage.getItem("abyssal-refresh-token")
    const originalRequest = err.config
    if (refreshToken && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refresh_token: refreshToken })
        localStorage.setItem("abyssal-token", data.access_token)
        localStorage.setItem("abyssal-refresh-token", data.refresh_token)
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`
        return api(originalRequest)
      } catch {
        localStorage.removeItem("abyssal-token")
        localStorage.removeItem("abyssal-refresh-token")
        window.location.href = "/login"
        return Promise.reject(err)
      }
    }
    localStorage.removeItem("abyssal-token")
    localStorage.removeItem("abyssal-refresh-token")
    window.location.href = "/login"
    return Promise.reject(err)
  }
  const isNetworkError = !err.response && err.code !== "ERR_CANCELED"
  const isServerError = err.response?.status >= 500
  const method = err.config?.method?.toLowerCase()
  const isIdempotent = method === "get" || method === "head" || method === "options"
  const key = `${err.config?.method}:${err.config?.url}`
  const retryCount = retryCounts.get(key) || 0
  if ((isNetworkError || isServerError) && isIdempotent && retryCount < 3) {
    retryCounts.set(key, retryCount + 1)
    await new Promise((r) => setTimeout(r, Math.min(1000 * Math.pow(2, retryCount + 1), 8000)))
    return api(err.config)
  }
  retryCounts.delete(key)
  return Promise.reject(err)
})

export default api
