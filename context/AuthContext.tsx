import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useContext, useEffect, useState } from 'react'
type User = {
  id: number
  name: string
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
    let foundUser: User
    if (email === 'admin' || email === 'Admin') {
      foundUser = {
        id: 1,
        name: 'Admin',
        role: 'admin',
      }
    } else {
      foundUser = {
        id: 2,
        name: 'Manager',
        role: 'manager',
      }
    }
    setUser(foundUser)
    if (rememberMe) {
      await AsyncStorage.setItem(
        'user',
        JSON.stringify(foundUser)
      )
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