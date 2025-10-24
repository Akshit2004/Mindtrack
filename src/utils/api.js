// Build API base URL by joining VITE_BACKEND_URL (host) and VITE_API_BASE_URL (path)
// so the final URL matches the backend mount (e.g. http://localhost:5000/api).
const BACKEND_HOST = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
const API_PATH = import.meta.env.VITE_API_BASE_URL || '/api'

// Ensure no duplicate slashes when joining
function joinUrl(host, path) {
  const h = host.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${h}${p}`
}

const API_BASE_URL = joinUrl(BACKEND_HOST, API_PATH)

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL
    this.token = localStorage.getItem('token')
  }

  setToken(token) {
    this.token = token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }

  getToken() {
    return this.token || localStorage.getItem('token')
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const token = this.getToken()

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    if (token && !options.skipAuth) {
      config.headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, config)

      if (response.status === 204) {
        return null
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth
  async register(email, password, displayName, timezone) {
    const data = await this.request('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName, timezone }),
      skipAuth: true,
    })
    this.setToken(data.token)
    return data
  }

  async login(email, password) {
    const data = await this.request('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    })
    this.setToken(data.token)
    return data
  }

  logout() {
    this.setToken(null)
  }

  // Habits
  async getHabits() {
    return this.request('/v1/habits')
  }

  async createHabit(habitData) {
    return this.request('/v1/habits', {
      method: 'POST',
      body: JSON.stringify(habitData),
    })
  }

  async updateHabit(id, updates) {
    return this.request(`/v1/habits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  async deleteHabit(id) {
    return this.request(`/v1/habits/${id}`, {
      method: 'DELETE',
    })
  }

  // Check-ins
  async createCheckin(habitId, checkinData) {
    return this.request(`/v1/habits/${habitId}/checkins`, {
      method: 'POST',
      body: JSON.stringify(checkinData),
    })
  }

  async getCheckins(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/v1/checkins${queryString ? `?${queryString}` : ''}`)
  }

  // Analytics
  async getCalendar(year, month) {
    return this.request(`/v1/analytics/calendar?year=${year}&month=${month}`)
  }

  async getHabitTrends(habitId, range = '30d') {
    return this.request(`/v1/analytics/habit/${habitId}/trends?range=${range}`)
  }
}

export const api = new ApiClient()
