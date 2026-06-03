import { useAuth } from '@/context/AuthContext'
import { useTasks } from '@/context/TaskContext'
import { Ionicons } from '@expo/vector-icons'
import { Redirect, router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
export default function EditTask() {
    const { user } = useAuth()
    const { tasks, loadTasks, loading } = useTasks()
    const { taskId } = useLocalSearchParams()
    const insets = useSafeAreaInsets()
    const task = tasks.find(t => t.id === taskId)
    const [flexToggle, setFlexToggle] = useState(false)
    if (!user) {
        return <Redirect href='/login' />
    }
    if (user.role !== 'admin') {
        return <Redirect href='/' />
    }
    useEffect(() => {
        const keyboardShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setFlexToggle(false)
        })
        const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setFlexToggle(true)
        })
        return () => {
            keyboardShowListener.remove()
            keyboardHideListener.remove()
        }
    }, [])
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
    if (loading) {
        return (
            <View className='flex-1 bg-slate-50 justify-center'>
                <ActivityIndicator
                    size={50}
                    color={'#60A5FA'} />
            </View>
        )
    }
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
            style={
                flexToggle
                    ? { flexGrow: 1 }
                    : { flex: 1 }
            }>
            <ScrollView
                showsVerticalScrollIndicator={false}
                className='flex-1 bg-slate-50'
                contentInsetAdjustmentBehavior='automatic'
                contentContainerStyle={{ paddingBottom: Platform.OS === 'android' ? insets.bottom + 16 : 0, paddingTop: Platform.OS === 'android' ? insets.top : 0 }}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={loadTasks}
                        progressViewOffset={Platform.OS === 'android' ? insets.top : 0} />
                }>
                <View className='flex-1 mx-3 min-h-screen justify-center'>
                    <Text className='text-lg font-semibold text-center'>
                        {task.description}
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}