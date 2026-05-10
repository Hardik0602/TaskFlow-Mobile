import { Ionicons } from '@expo/vector-icons'
import { Redirect } from 'expo-router'
import { Drawer } from 'expo-router/drawer'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useAuth } from '../../context/AuthContext'
import ManagerDrawerContent from '../components/ManagerDrawerContent'
export default function ManagerLayout() {
  const { user } = useAuth()
  if (!user) {
    return <Redirect href='/login' />
  }
  if (user.role !== 'manager') {
    return <Redirect href='/' />
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style='dark' />
      <Drawer
        drawerContent={ManagerDrawerContent}
        screenOptions={{
          drawerActiveTintColor: '#3949AB',
          drawerHideStatusBarOnOpen: false,
          headerShadowVisible: false
        }}>
        <Drawer.Screen
          name='dashboard'
          options={{
            drawerLabel: 'Dashboard',
            title: 'Manager Dashboard',
            drawerIcon: ({ color, size }) => (
              <Ionicons name='bar-chart-outline' size={size} color={color} />
            )
          }} />
        <Drawer.Screen
          name='profile'
          options={{
            drawerLabel: 'Profile',
            title: 'Manger Profile',
            drawerIcon: ({ color, size }) => (
              <Ionicons name='person-outline' size={size} color={color} />
            )
          }} />
        <Drawer.Screen
          name='inbox'
          options={{
            drawerLabel: 'Inbox',
            title: 'Manger Inbox',
            drawerIcon: ({ color, size }) => (
              <Ionicons name='mail-outline' size={size} color={color} />
            )
          }} />
        <Drawer.Screen
          name='notifications'
          options={{
            drawerLabel: 'Notifications',
            title: 'Manger Notifications',
            drawerIcon: ({ color, size }) => (
              <Ionicons name='notifications-outline' size={size} color={color} />
            )
          }} />
      </Drawer>
    </GestureHandlerRootView>
  )
}