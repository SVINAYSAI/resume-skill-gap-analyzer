import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.request && !error.response) {
      error.isNetworkError = true
    }
    return Promise.reject(error)
  }
)

export default client
