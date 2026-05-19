import { AuthProvider } from '@/context/AuthContext'
import { TaskFilterProvider } from '@/context/FilterContext'
import { NotificationProvider } from '@/context/NotificationContext'
import { TaskProvider } from '@/context/TaskContext'
import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import '../global.css'
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TaskProvider>
          <NotificationProvider>
            <TaskFilterProvider>
              <Stack screenOptions={{ headerShown: false }} />
            </TaskFilterProvider>
          </NotificationProvider>
        </TaskProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}