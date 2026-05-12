import { API_URL } from '@/constants/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useContext, useEffect, useState } from 'react'
type User = {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager'
}
type AuthContextType = {
  user: User | null
  loading: boolean
  login: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<void>
  logout: () => Promise<void>
}
const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const restoreUser = async () => {
      setLoading(true)
      try {
        const savedUser = await AsyncStorage.getItem('user')
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser)
          setUser(parsedUser)
        }
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }
    restoreUser()
  }, [])
  const login = async (
    email: string,
    password: string,
    rememberMe: boolean
  ) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/users?email=${email}`)
      if (!response.ok) {
        throw new Error('Something went wrong')
      }
      const users = await response.json()
      if (!users.length) {
        throw new Error('User not found')
      }
      const foundUser = users[0]
      if (foundUser.password !== password) {
        throw new Error('Invalid credentials')
      }
      const loggedInUser: User = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role
      }
      setUser(loggedInUser)
      if (rememberMe) {
        await AsyncStorage.setItem(
          'user',
          JSON.stringify(loggedInUser)
        )
      }
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }
  const logout = async () => {
    await AsyncStorage.removeItem('user')
    setUser(null)
  }
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => useContext(AuthContext)