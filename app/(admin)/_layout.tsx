import { Redirect, Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../context/AuthContext'
import AdminNavBar from '../components/AdminNavBar'
export default function AdminLayout() {
  const { user } = useAuth()
  if (!user) {
    return <Redirect href='/login' />
  }
  if (user.role !== 'admin') {
    return <Redirect href='/' />
  }
  return (
    <SafeAreaView mode='margin' edges={['top']} style={{ flex: 1 }}>
      <StatusBar style='dark' />
      <AdminNavBar />
      <Slot />
    </SafeAreaView>
  )
}