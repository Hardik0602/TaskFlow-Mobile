import { Redirect, Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../context/AuthContext'
import ManagerNavBar from '../components/ManagerNavBar'
export default function ManagerLayout() {
  const { user } = useAuth()
  if (!user) {
    return <Redirect href='/login' />
  }
  if (user.role !== 'manager') {
    return <Redirect href='/' />
  }
  return (
    <SafeAreaView mode='margin' edges={['top']} style={{ flex: 1 }}>
      <StatusBar style='dark' />
      <ManagerNavBar />
      <Slot />
    </SafeAreaView>
  )
}