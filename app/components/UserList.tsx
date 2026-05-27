import { User } from '@/context/FilterContext'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useEffect, useRef } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'
function RoleBadge({ role }: { role: User['role'] }) {
    if (role === 'admin') {
        return (
            <View className='flex-row items-center gap-1 p-1 bg-purple-100 rounded-md'>
                <Ionicons name='shield-outline' size={13} color='#7c3aed' />
                <Text className='text-xs font-medium text-purple-700'>Admin</Text>
            </View>
        )
    }
    return (
        <View className='flex-row items-center gap-1 p-1 bg-blue-100 rounded-md'>
            <Ionicons name='briefcase-outline' size={13} color='#2563eb' />
            <Text className='text-xs font-medium text-blue-700'>Manager</Text>
        </View>
    )
}
export default function UserList({ user, index }: { user: User, index: number }) {
    const opacity = useRef(new Animated.Value(0)).current
    const translateY = useRef(new Animated.Value(8)).current
    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 300, delay: index * 40, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 300, delay: index * 40, useNativeDriver: true })
        ]).start()
    }, [])
    return (
        <Animated.View
            style={{ opacity, transform: [{ translateY }] }}
            className='flex-1 p-4 border-b border-slate-100'>
            <View className='flex-row justify-between items-center gap-5'>
                <View className='flex-1 flex-row gap-2 items-center'>
                    <View className='w-10 h-10 bg-slate-200 rounded-full items-center justify-center'>
                        <Text className='text-sm font-semibold text-slate-600'>
                            {user.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View className='flex-1 gap-0.5'>
                        <Text className='text-sm font-semibold text-slate-900' numberOfLines={1}>{user.name}</Text>
                        <Text className='text-xs text-slate-400' numberOfLines={1}>{user.email}</Text>
                    </View>
                </View>
                <RoleBadge role={user.role} />
            </View>
            {user.role === 'manager' && <View className='mt-5'>
                <Pressable
                    onPress={() => router.push(`/user/${user.id}`)}
                    className='flex-row items-center justify-center gap-1 py-2.5 bg-blue-50 active:bg-blue-100 active:scale-[0.98] transition-all duration-150 border border-blue-200 rounded-lg'>
                    <Ionicons name='clipboard-outline' size={15} color='#3b82f6' />
                    <Text className='text-sm font-medium text-blue-500'>Assign new task</Text>
                </Pressable>
            </View>}
        </Animated.View>
    )
}