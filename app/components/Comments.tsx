import { API_URL } from '@/constants/api'
import { useAuth } from '@/context/AuthContext'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Keyboard, Pressable, Text, TextInput, View } from 'react-native'
type Comment = {
    id: string
    taskId: string
    userName: string
    userEmail: string
    message: string
    createdAt: string
}
const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
export default function Comments() {
    const { user } = useAuth()
    const { taskId } = useLocalSearchParams()
    const [comments, setComments] = useState<Comment[]>([])
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const loadComments = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/comments?taskId=${taskId}`)
            if (!res.ok) {
                throw new Error('Something went wrong')
            }
            const data = await res.json()
            setComments(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        loadComments()
    }, [taskId])
    const addComment = async () => {
        Keyboard.dismiss()
        setSubmitting(true)
        try {
            await fetch(`${API_URL}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskId,
                    userName: user?.name,
                    userEmail: user?.email,
                    message: text.trim(),
                    createdAt: new Date().toISOString()
                })
            })
            setText('')
            loadComments()
        } catch {
            console.log('Something went wrong')
        } finally {
            setSubmitting(false)
        }
    }
    const reversed = [...comments].reverse()
    return (
        <View className='bg-white border border-slate-200 rounded-2xl'>
            <View className='flex-row items-center justify-between px-4 py-3 border-b border-slate-100'>
                <Text className='text-base font-semibold text-slate-900'>Comments</Text>
                <View className='px-2 py-0.5 bg-slate-100 rounded-full'>
                    <Text className='text-xs font-medium text-slate-500'>{comments.length}</Text>
                </View>
            </View>

            <View className='flex-row items-center gap-2 px-4 py-3 bg-slate-50 border-t border-slate-100'>
                <View className='w-8 h-8 rounded-full bg-blue-100 items-center justify-center'>
                    <Text className='text-xs font-semibold text-blue-700'>
                        {user?.name?.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <TextInput
                    value={text}
                    onChangeText={setText}
                    placeholder='Write a comment'
                    placeholderTextColor='#94a3b8'
                    multiline
                    className='flex-1 min-h-10 max-h-24 px-3 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-md text-[#0f172a]' />
                <Pressable
                    onPress={addComment}
                    disabled={!text.trim() || submitting}
                    className='w-10 h-10 bg-blue-600 active:bg-blue-700 active:scale-[0.98] transition-all duration-150 rounded-xl items-center justify-center disabled:opacity-50'>
                    {submitting
                        ? <ActivityIndicator size={18} color='white' />
                        : <Ionicons name='send' size={18} color='white' />
                    }
                </Pressable>
            </View>
            {loading
                ? (
                    <View className='items-center justify-center py-15'>
                        <ActivityIndicator size={50} color='#94a3b8' />
                    </View>
                )
                : comments.length === 0
                    ? (
                        <View className='items-center justify-center py-10 gap-2'>
                            <View className='w-12 h-12 bg-slate-100 rounded-full items-center justify-center'>
                                <Ionicons name='chatbubble-outline' size={22} color='#94a3b8' />
                            </View>
                            <Text className='text-sm font-semibold text-slate-900'>No comments yet</Text>
                        </View>
                    )
                    : (
                        <View className='p-4 gap-4'>
                            {reversed.map((c, index) => {
                                const isMe = c.userEmail === user?.email
                                return (
                                    <View key={c.id}>
                                        {index !== 0 && <View className='h-px bg-slate-100 mb-4' />}
                                        <View className='flex-row items-center gap-3'>
                                            <View className={`w-8 h-8 rounded-full items-center justify-center ${isMe ? 'bg-blue-100' : 'bg-slate-200'}`}>
                                                <Text className={`text-xs font-semibold ${isMe ? 'text-blue-700' : 'text-slate-600'}`}>
                                                    {c.userName.charAt(0).toUpperCase()}
                                                </Text>
                                            </View>
                                            <View className='flex-1'>
                                                <View className='flex-row items-center gap-1.5 mb-1'>
                                                    <Text className='text-sm font-semibold text-slate-900'>{c.userName}</Text>
                                                    {isMe && <Text className='text-xs text-slate-400'>(You)</Text>}
                                                    <Text className='text-slate-300'>·</Text>
                                                    <Text className='text-xs text-slate-400'>{formatTimestamp(c.createdAt)}</Text>
                                                </View>
                                                <Text className='text-sm text-slate-600'>{c.message}</Text>
                                            </View>
                                        </View>
                                    </View>
                                )
                            })}
                        </View>
                    )
            }
        </View>
    )
}