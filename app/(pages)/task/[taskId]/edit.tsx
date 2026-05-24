import { useAuth } from '@/context/AuthContext'
import { useTasks } from '@/context/TaskContext'
import { Ionicons } from '@expo/vector-icons'
import { Redirect, router, useLocalSearchParams } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
export default function EditTask() {
    const { user } = useAuth()
    const { tasks } = useTasks()
    const { taskId } = useLocalSearchParams()
    const insets = useSafeAreaInsets()
    const task = tasks.find(t => t.id === taskId)
    if (!user) {
        return <Redirect href='/login' />
    }
    // if (user.role !== 'admin') {
    //     return <Redirect href='/' />
    // }
    if (!task) {
        return (
            <View className='flex-1 bg-slate-50 items-center justify-center gap-4 px-8'>
                <Ionicons name='document-text-outline' size={60} color='#cbd5e1' />
                <Text className='text-lg font-semibold text-slate-900'>Task not found</Text>
                {/* <Text className='text-sm text-slate-400 text-center'>The task you're looking for doesn't exist.</Text> */}
                <Pressable
                    onPress={() => router.back()}
                    className='px-5 py-2.5 bg-blue-600 rounded-lg'>
                    <Text className='text-white font-medium'>Go Back</Text>
                </Pressable>
            </View>
        )
    }
    return (
        <View className='flex-1 items-center justify-center'>
            <Text className='text-2xl'>
                {task.title}
            </Text>
        </View>
    )
}