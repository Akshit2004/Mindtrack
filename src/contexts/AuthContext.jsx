import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = api.getToken()
    if (token) {
      // In a real app, you might want to validate the token with the backend
      // For now, we'll just check if it exists
      setUser({ token })
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password)
      setUser(data.user)
      return { success: true, user: data.user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const register = async (email, password, displayName, timezone) => {
    try {
      const data = await api.register(email, password, displayName, timezone)
      setUser(data.user)
      return { success: true, user: data.user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    api.logout()
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
