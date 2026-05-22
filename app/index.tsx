import { Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { useAuth } from '../context/AuthContext'
export default function Index() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <View className='flex-1 bg-slate-50 justify-center'>
        <ActivityIndicator
          size={50}
          color={'#60A5FA'} />
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