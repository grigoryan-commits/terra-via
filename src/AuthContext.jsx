import { createContext, useContext, useEffect, useState } from 'react'
import { get, post } from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [modal, setModal] = useState(null)

  useEffect(() => {
    get('me.php')
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setReady(true))
  }, [])

  const login = async (email, password) => {
    const d = await post('login.php', { email, password })
    setUser(d.user)
    return d.user
  }

  const logout = async () => {
    await post('logout.php', {})
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, modal, setModal }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
