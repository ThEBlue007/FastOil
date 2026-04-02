import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('fastoil_token')
      if (token) {
        try {
          const data = await api.getMe()
          setUser(data.user)
        } catch (err) {
          console.error('Auth initialization failed:', err)
          localStorage.removeItem('fastoil_token')
          localStorage.removeItem('fastoil_refresh')
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email, password) => {
    const data = await api.login({ email, password })
    localStorage.setItem('fastoil_token', data.accessToken)
    localStorage.setItem('fastoil_refresh', data.refreshToken)
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('fastoil_token')
    localStorage.removeItem('fastoil_refresh')
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const data = await api.getMe()
      setUser(data.user)
    } catch (err) {
      console.error('Failed to refresh user:', err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, refreshUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
