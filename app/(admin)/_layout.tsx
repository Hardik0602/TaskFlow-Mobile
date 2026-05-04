import { Redirect, Slot, router } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { useAuth } from '../../context/AuthContext'
export default function AdminLayout() {
  const { user, logout } = useAuth()
  if (!user) {
    return <Redirect href='/login' />
  }
  if (user.role !== 'admin') {
    return <Redirect href='/' />
  }
  const handleLogout = async () => {
    await logout()
    router.replace('/login')
  }
  return (
    <View className='flex-1'>
      <View className='h-16 bg-black flex-row items-center justify-between px-4'>
        <Text className='text-white text-xl font-bold'>
          Admin Panel
        </Text>
        <View className='flex-row gap-4'>
          <Pressable
            onPress={() =>
              router.push('/adminDashboard')
            }>
            <Text className='text-white'>
              Dashboard
            </Text>
          </Pressable>
          <Pressable
            onPress={() =>
              router.push('/adminProfile')
            }>
            <Text className='text-white'>
              Profile
            </Text>
          </Pressable>
          <Pressable onPress={handleLogout}>
            <Text className='text-red-300'>
              Logout
            </Text>
          </Pressable>
        </View>
      </View>
      <View className='flex-1'>
        <Slot />
      </View>
    </View>
  )
}