import { useAuth } from '@/context/AuthContext'
import { useTaskFilters } from '@/context/FilterContext'
import { Redirect, useLocalSearchParams } from 'expo-router'
import { Text, View } from 'react-native'
export default function AssignTask() {
    const { user } = useAuth()
    const { userId } = useLocalSearchParams()
    const { users } = useTaskFilters()
    if (!user) {
        return <Redirect href='/login' />
    }
    if (user.role !== 'admin') {
        return <Redirect href='/' />
    }
    return (
        <View className='flex-1 items-center justify-center'>
            <Text className='text-2xl'>
                {users.find(u => u.id === userId)?.name}
            </Text>
        </View>
    )
}