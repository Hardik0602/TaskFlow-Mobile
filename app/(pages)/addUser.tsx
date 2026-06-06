import { API_URL } from '@/constants/api'
import { useAuth } from '@/context/AuthContext'
import { useTaskFilters } from '@/context/FilterContext'
import { Ionicons } from '@expo/vector-icons'
import { Redirect, router } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Alert, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
function FieldLabel({ label }: { label: string }) {
    return (
        <Text className='text-sm font-medium text-slate-700 mb-1.5'>
            {label}
        </Text>
    )
}
export default function AddUser() {
    const insets = useSafeAreaInsets()
    const { users, getUsers, loading } = useTaskFilters()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<'manager' | 'admin'>('manager')
    const [showPassword, setShowPassword] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const { user } = useAuth()
    if (!user) {
        return <Redirect href='/login' />
    }
    if (user.role !== 'admin') {
        return <Redirect href='/' />
    }
    const handleSubmit = async () => {
        if (!name.trim() || !email.includes('@') || !password.trim()) {
            Alert.alert('Missing Fields', 'Please fill all required fields')
            return
        }
        if (users.find(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
            Alert.alert('Email Exists', 'A user with this email already exists')
            return
        }
        const newUser = {
            email: email.trim().toLowerCase(),
            password,
            name: name.trim(),
            role
        }
        try {
            setSubmitting(true)
            const response = await fetch(`${API_URL}/users`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newUser)
                }
            )
            if (!response.ok) {
                throw new Error('Failed to add user')
            }
            getUsers()
            Alert.alert('Success', 'User added successfully')
            router.back()
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Something went wrong')
        } finally {
            setSubmitting(false)
        }
    }
    const handleRefresh = () => {
        setName('')
        setEmail('')
        setPassword('')
        setRole('manager')
        getUsers()
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
        <ScrollView
            showsVerticalScrollIndicator={false}
            className='flex-1 bg-slate-50'
            contentInsetAdjustmentBehavior='automatic'
            contentContainerStyle={{ paddingBottom: Platform.OS === 'android' ? insets.bottom + 16 : 0, paddingTop: Platform.OS === 'android' ? insets.top : 0 }}
            refreshControl={
                <RefreshControl
                    refreshing={loading}
                    onRefresh={handleRefresh}
                    progressViewOffset={Platform.OS === 'android' ? insets.top : 0} />
            }>
            <View className='bg-white border border-slate-200 rounded-2xl p-5 mx-3 mt-4 gap-4'>
                <Text className='text-base font-semibold text-slate-900'>
                    User Information
                </Text>
                <View>
                    <FieldLabel label='Full Name' />
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder='User name'
                        placeholderTextColor='#94a3b8'
                        className='border border-slate-200 rounded-xl px-3 py-3.5 bg-white text-[#0f172a]' />
                </View>
                <View>
                    <FieldLabel label='Email Address' />
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder='user@company.com'
                        placeholderTextColor='#94a3b8'
                        autoCapitalize='none'
                        autoCorrect={false}
                        keyboardType='email-address'
                        className='border border-slate-200 rounded-xl px-3 py-3.5 bg-white text-[#0f172a]' />
                </View>
                <View>
                    <FieldLabel label='Password' />
                    <View className='flex-row items-center border border-slate-200 rounded-xl px-3 bg-white'>
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder='Enter password'
                            autoCapitalize='none'
                            autoCorrect={false}
                            placeholderTextColor='#94a3b8'
                            secureTextEntry={!showPassword}
                            className='flex-1 py-3.5 text-[#0f172a]' />
                        <Pressable onPress={() => setShowPassword(!showPassword)}                        >
                            <Ionicons
                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={22}
                                color='#64748b' />
                        </Pressable>
                    </View>
                </View>
            </View>
            <View className='bg-white border border-slate-200 rounded-2xl p-5 mx-3 my-4'>
                <Text className='text-base font-semibold text-slate-900 mb-4'>
                    Role & Permissions
                </Text>
                <View className='gap-3'>
                    <Pressable
                        onPress={() => setRole('manager')}
                        className={`border-2 rounded-xl p-4 ${role === 'manager'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 bg-white'}`}>
                        <View className='flex-row items-center gap-2 mb-1'>
                            <Ionicons
                                name='briefcase-outline'
                                size={18}
                                color={role === 'manager' ? '#2563eb' : '#94a3b8'} />
                            <Text
                                className={`font-semibold ${role === 'manager' ? 'text-blue-900' : 'text-slate-900'}`}>
                                Manager
                            </Text>
                        </View>
                        <Text className={`text-xs ${role === 'manager' ? 'text-blue-700' : 'text-slate-500'}`}>
                            Can view and manage assigned tasks
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setRole('admin')}
                        className={`border-2 rounded-xl p-4 ${role === 'admin'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-slate-200 bg-white'}`}>
                        <View className='flex-row items-center gap-2 mb-1'>
                            <Ionicons
                                name='shield-checkmark-outline'
                                size={18}
                                color={role === 'admin' ? '#9333ea' : '#94a3b8'} />
                            <Text
                                className={`font-semibold ${role === 'admin' ? 'text-purple-900' : 'text-slate-900'}`}>
                                Admin
                            </Text>
                        </View>
                        <Text
                            className={`text-xs ${role === 'admin' ? 'text-purple-700' : 'text-slate-500'}`}>
                            Full system and user management access
                        </Text>
                    </Pressable>
                </View>
            </View>
            <View className='flex-row gap-2 mx-3'>
                <Pressable
                    onPress={() => router.back()}
                    className='flex-1 py-4 bg-red-600 active:bg-red-700 active:scale-[0.98] transition-all duration-150 rounded-xl disabled:opacity-50'>
                    <Text className='text-sm text-center font-medium text-white'>Cancel</Text>
                </Pressable>
                <Pressable
                    onPress={handleSubmit}
                    disabled={submitting}
                    className='flex-1 flex-row gap-1 py-4 items-center justify-center bg-blue-600 active:bg-blue-700 active:scale-[0.98] transition-all duration-150 rounded-xl disabled:opacity-50'>
                    {submitting
                        ? <ActivityIndicator size='small' color='white' />
                        : <Ionicons name='person-add-outline' size={18} color='white' />
                    }
                    <Text className='text-sm font-medium text-white'>
                        {submitting ? 'Adding...' : 'Add User'}
                    </Text>
                </Pressable>
            </View>
        </ScrollView>
    )
}