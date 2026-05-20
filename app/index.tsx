import { Redirect } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Text, View } from 'react-native'
import { useAuth } from '../context/AuthContext'
export default function Index() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <StatusBar style='dark' />
        <Text>loading</Text>
      </View>
    )
  }
  if (!user) {
    return <Redirect href='/login' />
  } else if (user.role === 'admin') {
    return <Redirect href='/adminDashboard' />
  } else {
    return <Redirect href='/dashboard' />
  }
}