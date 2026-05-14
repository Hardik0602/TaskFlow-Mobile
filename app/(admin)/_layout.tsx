import { Ionicons } from '@expo/vector-icons'
import { Redirect } from 'expo-router'
import { Drawer } from 'expo-router/drawer'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useAuth } from '../../context/AuthContext'
import AdminDrawerContent from '../components/AdminDrawerContent'
export default function AdminLayout() {
  const { user } = useAuth()
  if (!user) {
    return <Redirect href='/login' />
  }
  if (user.role !== 'admin') {
    return <Redirect href='/' />
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style='dark' />
      <Drawer
        drawerContent={AdminDrawerContent}
        screenOptions={{
          drawerActiveTintColor: '#3949AB',
          drawerHideStatusBarOnOpen: false,
          headerShadowVisible: false
        }}>
        <Drawer.Screen
          name='adminDashboard'
          options={{
            drawerLabel: 'Dashboard',
            title: 'Admin Dashboard',
            headerTitleAlign: 'center',
            drawerIcon: ({ color, size }) => (
              <Ionicons name='bar-chart-outline' size={size} color={color} />
            )
          }} />
        <Drawer.Screen
          name='report'
          options={{
            drawerLabel: 'Report',
            title: 'System Report',
            headerTitleAlign: 'center',
            drawerIcon: ({ color, size }) => (
              <Ionicons name='document-outline' size={size} color={color} />
            )
          }} />
        <Drawer.Screen
          name='userManagement'
          options={{
            drawerLabel: 'User Management',
            title: 'User Management',
            headerTitleAlign: 'center',
            drawerIcon: ({ color, size }) => (
              <Ionicons name='people-outline' size={size} color={color} />
            )
          }} />
        <Drawer.Screen
          name='tasks'
          options={{
            drawerLabel: 'Tasks',
            title: 'System Tasks',
            headerTitleAlign: 'center',
            drawerIcon: ({ color, size }) => (
              <Ionicons name='clipboard-outline' size={size} color={color} />
            )
          }} />
        <Drawer.Screen
          name='adminProfile'
          options={{
            drawerLabel: 'Profile',
            title: 'Admin Profile',
            headerTitleAlign: 'center',
            drawerIcon: ({ color, size }) => (
              <Ionicons name='person-outline' size={size} color={color} />
            )
          }} />
      </Drawer>
    </GestureHandlerRootView>
  )
}