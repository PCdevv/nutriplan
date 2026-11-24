import axios from 'axios'

// ---------------------------------------------------------------------------
// API Client Configuration
// ---------------------------------------------------------------------------
// In production on Vercel, the Express API lives at /api/* (same origin).
// In local dev, Vite proxies /api/* → http://localhost:5000 (see vite.config.js).
// So the base URL is always '' (relative) — no need for Supabase URL or keys
// on the client side anymore.
// ---------------------------------------------------------------------------

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
})

// ---------------------------------------------------------------------------
// Response interceptor — unwrap response and normalise errors
// ---------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'An unexpected error occurred'
    let status = null

    if (error.response) {
      status = error.response.status
      message =
        error.response.data?.message ||
        error.response.data?.msg ||
        error.response.data?.error ||
        `Server error (${status})`
    } else if (error.request) {
      message =
        'Unable to reach the server. Check your connection and try again.'
    } else {
      message = error.message || message
    }

    return Promise.reject({
      message,
      status,
      raw: error.response?.data,
    })
  },
)

export { apiClient, API_BASE }
