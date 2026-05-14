import { useAuth } from '@/context/AuthContext'
import { useTasks } from '@/context/TaskContext'
import { Redirect, useLocalSearchParams } from 'expo-router'
import { Text, View } from 'react-native'
export default function TaskDetails() {
    const { user } = useAuth()
    const { tasks } = useTasks()
    const { taskId } = useLocalSearchParams<{ taskId: string }>()
    if (!user) return <Redirect href='/login' />
    return (
        <View className='flex-1 items-center justify-center'>
            <Text className='text-2xl'>
                Task Details {user.role === 'admin' && <Text>Admin Mode</Text>}
            </Text>
            <Text>Task id: {taskId}</Text>
            <Text>Task: {tasks.find(task => task.id === taskId)?.title}</Text>
        </View>
    )
}