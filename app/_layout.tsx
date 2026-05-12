import { TaskProvider } from '@/context/TaskContext'
import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '../context/AuthContext'
import '../global.css'
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TaskProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </TaskProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}