import { useAuth } from '@/context/AuthContext'
import { Redirect } from 'expo-router'
import { Text, View } from 'react-native'
export default function AssignTask() {
    const { user } = useAuth()
    if (!user) {
        return <Redirect href='/login' />
    }
    if (user.role !== 'admin') {
        return <Redirect href='/' />
    }
    return (
        <View className='flex-1 items-center justify-center'>
            <Text className='text-2xl'>
                Assign Task
            </Text>
        </View>
    )
}