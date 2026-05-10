import Checkbox from 'expo-checkbox'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { useAuth } from '../../context/AuthContext'
export default function LoginScreen() {
    const { login, loading } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const handleLogin = async () => {
        try {
            await login(email, password, rememberMe)
            router.replace('/')
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <View className='flex-1 justify-center px-6'>
            <StatusBar style='dark' />
            <TextInput
                placeholder='Email'
                value={email}
                onChangeText={setEmail}
                className='border p-4 rounded-xl mb-4' />
            <TextInput
                placeholder='Password'
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                className='border p-4 rounded-xl mb-4' />
            <View className='flex-row items-center mb-4'>
                <Checkbox
                    value={rememberMe}
                    onValueChange={setRememberMe} />
                <Text className='ml-2'>
                    Remember Me
                </Text>
            </View>
            <Pressable
                disabled={loading}
                onPress={handleLogin}
                className='bg-blue-500 p-4 rounded-xl disabled:bg-gray-500'>
                <Text className='text-white text-center'>
                    Login
                </Text>
            </Pressable>
        </View>
    )
}