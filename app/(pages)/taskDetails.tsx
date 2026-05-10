import { useAuth } from '@/context/AuthContext'
import { Redirect } from 'expo-router'
import { Text, View } from 'react-native'
export default function TaskDetails() {
    const { user } = useAuth()
    if (!user) {
        return <Redirect href='/login' />
    }
    return (
        <View className='flex-1 items-center justify-center'>
            <Text className='text-2xl'>
                Task Details {user.role === 'admin' && <Text>Admin Mode</Text>}
            </Text>
        </View>
    )
}