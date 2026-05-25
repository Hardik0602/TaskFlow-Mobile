import { Feather } from '@expo/vector-icons'
import Checkbox from 'expo-checkbox'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { ActivityIndicator, Alert, Keyboard, Pressable, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native'
import { useAuth } from '../../context/AuthContext'
export default function LoginScreen() {
    const { login, loading } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const handleLogin = async () => {
        if (email.trim() === '' || password.trim() === '' || !email.includes('@')) {
            Alert.alert(
                'Error',
                'Fill all necessary fields',
                [{ text: 'Ok' }]
            )
            return
        }
        try {
            await login(email, password, rememberMe)
            router.replace('/')
        } catch (error) {
            Alert.alert(
                'Error',
                error instanceof Error
                    ? error.message
                    : 'Something went wrong',
                [{ text: 'Ok' }]
            )
        }
    }
    return (
        <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}>
            <View className='flex-1 justify-center px-6'>
                <StatusBar style='dark' />
                <View>
                    <Text className='font-medium text-slate-700 mb-2'>
                        Email Address
                    </Text>
                    <TextInput
                        placeholder='name@company.com'
                        keyboardType='email-address'
                        autoCorrect={false}
                        autoCapitalize='none'
                        value={email}
                        onChangeText={setEmail}
                        className='border p-4 rounded-md mb-4' />
                </View>
                <View>
                    <Text className='font-medium text-slate-700 mb-2'>
                        Pssword
                    </Text>
                    <View className='relative'>
                        <TextInput
                            placeholder='Enter your password'
                            autoCapitalize='none'
                            autoCorrect={false}
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                            className='border p-4 pr-12 rounded-md mb-4' />
                        <Pressable
                            className='absolute right-4 top-4'
                            onPress={() => setShowPassword(!showPassword)}>
                            {showPassword
                                ? <Feather name='eye-off' size={20} color='black' />
                                : <Feather name='eye' size={20} color='black' />}
                        </Pressable>
                    </View>
                </View>
                <View className='flex-row items-center mb-4'>
                    <Checkbox
                        value={rememberMe}
                        onValueChange={setRememberMe} />
                    <Text className='ml-2 text-slate-700'>
                        Keep me signed in
                    </Text>
                </View>
                <Pressable
                    disabled={loading}
                    onPress={handleLogin}
                    className='p-4 bg-blue-600 active:bg-blue-700 active:scale-[0.98] transition-all duration-150 text-white rounded-xl font-medium disabled:opacity-50'>
                    {loading
                        ? <View className='flex flex-row items-center justify-center'>
                            <ActivityIndicator
                                color={'white'}
                                size={15}
                                className='-ml-1 mr-2' />
                            <Text className='text-white text-[15px]'>
                                Logging in...
                            </Text>
                        </View>
                        : <Text className='text-white text-center text-[15px]'>
                            Login
                        </Text>}
                </Pressable>
            </View>
        </TouchableWithoutFeedback>
    )
}