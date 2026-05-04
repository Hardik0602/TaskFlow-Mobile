import { Redirect } from 'expo-router'
import { useAuth } from '../context/AuthContext'
export default function Index() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) {
    return <Redirect href='/login' />
  } else if (user.role === 'admin') {
    return <Redirect href='/adminDashboard' />
  } else {
    return <Redirect href='/dashboard' />
  }
}