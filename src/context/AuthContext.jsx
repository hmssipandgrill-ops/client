import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'
import api from '../services/api'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('hms_token')
    if (token) {
      api.defaults.headers.common['Authorization'] = 'Bearer ' + token
      authService.getMe()
        .then((data) => setUser(data.user))
        .catch(() => {
          localStorage.removeItem('hms_token')
          delete api.defaults.headers.common['Authorization']
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const data = await authService.login(email, password)
    localStorage.setItem('hms_token', data.token)
    api.defaults.headers.common['Authorization'] = 'Bearer ' + data.token
    setUser(data.user)
    return data.user
  }

  const register = async (name, email, password) => {
    const data = await authService.register(name, email, password)
    localStorage.setItem('hms_token', data.token)
    api.defaults.headers.common['Authorization'] = 'Bearer ' + data.token
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('hms_token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
