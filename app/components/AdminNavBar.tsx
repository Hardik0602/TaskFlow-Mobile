import { useAuth } from '@/context/AuthContext'
import { router } from 'expo-router'
import React from 'react'
import { Pressable, Text, View } from 'react-native'
export default function AdminNavBar() {
    const { logout } = useAuth()
    const handleLogout = async () => {
        await logout()
        router.replace('/login')
    }
    return (
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
    )
}