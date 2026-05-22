import { API_URL } from '@/constants/api'
import { useAuth } from '@/context/AuthContext'
import { useTaskFilters } from '@/context/FilterContext'
import { useTasks } from '@/context/TaskContext'
import { Ionicons } from '@expo/vector-icons'
import { Redirect, router, useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Comments from '../../components/Comments'
const priorityConfig = {
    high: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', dot: '#ef4444' },
    medium: { bg: '#fffbeb', text: '#92400e', border: '#fde68a', dot: '#f59e0b' },
    low: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', dot: '#3b82f6' }
}
const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: '#f1f5f9', text: '#475569', label: 'Pending' },
    in_progress: { bg: '#dbeafe', text: '#1d4ed8', label: 'In Progress' },
    approved: { bg: '#dcfce7', text: '#15803d', label: 'Approved' },
    rejected: { bg: '#fee2e2', text: '#b91c1c', label: 'Rejected' },
}
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
type Action = 'approved' | 'in_progress' | 'rejected' | 'delete'
const actionConfig: Record<Action, { title: string, message: string, color: string }> = {
    approved: { title: 'Approve Task', message: 'Approve this task?', color: '#16a34a' },
    in_progress: { title: 'Mark for Review', message: 'Mark this task for review?', color: '#2563eb' },
    rejected: { title: 'Reject Task', message: 'Reject this task?', color: '#dc2626' },
    delete: { title: 'Delete Task', message: 'This action cannot be undone.', color: '#dc2626' }
}
export default function TaskDetails() {
    const { user } = useAuth()
    const { users } = useTaskFilters()
    const { tasks, loadTasks, loading } = useTasks()
    const { taskId } = useLocalSearchParams()
    const insets = useSafeAreaInsets()
    const [flexToggle, setFlexToggle] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const task = tasks.find(t => t.id === taskId)
    if (!user) {
        return <Redirect href='/login' />
    }
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
    const today = new Date()
    const isOverdue = task.status === 'pending' && new Date(task.dueDate) < today
    const isDone = task.status !== 'pending'
    const p = priorityConfig[task.priority]
    const s = statusConfig[task.status]
    const updateStatus = async (newStatus: string, note?: string) => {
        setActionLoading(true)
        try {
            const response = await fetch(`${API_URL}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            if (!response.ok) {
                throw new Error('Something went wrong')
            }
            if (note?.trim()) {
                const statusMap: Record<string, string> = {
                    in_progress: 'Marked for Review',
                    approved: 'Approve',
                    rejected: 'Reject'
                }
                await fetch(`${API_URL}/comments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        taskId,
                        userEmail: task.assignedTo,
                        message: `${statusMap[newStatus]} - ${note}`,
                        createdAt: new Date().toISOString()
                    })
                })
            }
            await loadTasks()
        } catch (error) {
            console.log(error)
        } finally {
            setActionLoading(false)
        }
    }
    const deleteTask = async () => {
        setActionLoading(true)
        try {
            const response = await fetch(`${API_URL}/tasks/${taskId}`, { method: 'DELETE' })
            if (!response.ok) {
                throw new Error('Something went wrong')
            }
            loadTasks()
            router.back()
        } catch (error) {
            console.log(error)
        } finally {
            setActionLoading(false)
        }
    }
    const confirmAction = (action: Action) => {
        const cfg = actionConfig[action]
        if (action === 'delete') {
            Alert.alert(cfg.title, cfg.message, [
                { text: 'Cancel' },
                { text: 'Delete', onPress: deleteTask },
            ])
        } else {
            if (Platform.OS === 'ios') {
                Alert.prompt(
                    cfg.title,
                    'Add a note (optional)',
                    (note) => updateStatus(action, note),
                    'plain-text'
                )
            } else {
                Alert.alert(cfg.title, cfg.message, [
                    { text: 'Cancel' },
                    { text: 'Confirm', onPress: () => updateStatus(action) }
                ])
            }
        }
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
    if (loading || actionLoading) {
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
                <View className='mx-3 gap-4 pt-4'>
                    <StatusBar style='dark' />
                    {isOverdue && (
                        <View className='flex-row items-center justify-center gap-3 bg-red-600 px-5 py-3 -mb-4 rounded-t-2xl'>
                            <Ionicons name='close-circle' size={20} color='white' />
                            <Text className='text-white font-semibold text-base'>This task is overdue</Text>
                        </View>
                    )}
                    <View className={`bg-white border border-slate-200 p-5 gap-3 ${isOverdue ? 'rounded-b-2xl' : 'rounded-2xl'}`}>
                        <View className='flex-row gap-3 items-center justify-between'>
                            <Text className='text-xl font-bold text-slate-900 flex-1'>{task.title}</Text>
                            <View style={{ backgroundColor: s.bg }} className='px-2.5 py-1 rounded-md'>
                                <Text style={{ color: s.text }} className='text-xs font-semibold'>
                                    {isOverdue ? 'Overdue' : s.label}
                                </Text>
                            </View>
                        </View>
                        <Text className='text-sm text-slate-500'>{task.description}</Text>
                    </View>
                    <View className='bg-white border border-slate-200 rounded-2xl p-5 gap-8'>
                        <View className='flex-row gap-4'>
                            <View className='flex-1'>
                                <Text className='text-xs font-semibold text-slate-400 tracking-widest mb-1.5'>Category</Text>
                                <View className='flex-row items-center gap-1.5'>
                                    <Ionicons name='pricetag-outline' size={14} color='#94a3b8' />
                                    <Text className='text-sm font-medium text-slate-900'>{task.category}</Text>
                                </View>
                            </View>
                            <View className='flex-1'>
                                <Text className='text-xs font-semibold text-slate-400 tracking-widest mb-1.5'>Priority</Text>
                                <View style={{ backgroundColor: p.bg, borderColor: p.border }} className='self-start flex-row items-center gap-1.5 px-2.5 py-1 rounded-md border'>
                                    <View style={{ backgroundColor: p.dot }} className='w-2 h-2 rounded-full' />
                                    <Text style={{ color: p.text }} className='text-xs font-medium capitalize'>{task.priority}</Text>
                                </View>
                            </View>
                        </View>
                        <View className='flex-row gap-4'>
                            <View className='flex-1'>
                                <Text className='text-xs font-semibold text-slate-400 tracking-widest mb-1.5'>Due Date</Text>
                                <View className='flex-row items-center gap-1.5'>
                                    <Ionicons name='calendar-outline' size={14} color={isOverdue ? '#dc2626' : '#94a3b8'} />
                                    <Text style={{ color: isOverdue ? '#dc2626' : '#0f172a' }} className='text-sm font-medium'>{formatDate(task.dueDate)}</Text>
                                </View>
                            </View>
                            <View className='flex-1'>
                                <Text className='text-xs font-semibold text-slate-400 tracking-widest mb-1.5'>Submitted On</Text>
                                <View className='flex-row items-center gap-1.5'>
                                    <Ionicons name='time-outline' size={14} color='#94a3b8' />
                                    <Text className='text-sm text-slate-500'>{formatDate(task.submittedDate)}</Text>
                                </View>
                            </View>
                        </View>
                        <View className='flex-row gap-4'>
                            <View className='flex-1'>
                                <Text className='text-xs font-semibold text-slate-400 tracking-widest mb-1.5'>Submitted By</Text>
                                <View className='flex-row items-center gap-2'>
                                    <View className='w-8 h-8 bg-slate-200 rounded-full items-center justify-center'>
                                        <Text className='text-xs font-semibold text-slate-600'>
                                            {task.submittedBy.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text className='text-sm font-medium text-slate-900'>{task.submittedBy}</Text>
                                </View>
                            </View>
                            {user?.role === 'admin' && (
                                <View className='flex-1'>
                                    <Text className='text-xs font-semibold text-slate-400 tracking-widest mb-1.5'>Assigned To</Text>
                                    <View className='flex-row items-center gap-2'>
                                        <View className='w-8 h-8 bg-slate-200 rounded-full items-center justify-center'>
                                            <Text className='text-xs font-semibold text-slate-600'>
                                                {task.assignedTo.charAt(0).toUpperCase()}
                                            </Text>
                                        </View>
                                        <Text className='text-sm flex-1 font-medium text-slate-900' numberOfLines={1}>{users.find(u => u.email === task.assignedTo)?.name || task.assignedTo}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                    {task.details && Object.keys(task.details).length > 0 && (
                        <View className='bg-white border border-slate-200 rounded-2xl p-5 gap-4'>
                            <Text className='text-sm font-semibold text-slate-900'>Additional Details</Text>
                            <View className='gap-3'>
                                {Object.entries(task.details).map(([key, value]) => (
                                    <View key={key} className='bg-slate-50 border border-slate-200 rounded-xl p-3'>
                                        <Text className='text-xs font-medium text-slate-400 mb-1'>{key}</Text>
                                        <Text className='text-sm font-medium text-slate-900'>{value}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                    {(user?.role === 'manager' && !isDone) && (
                        <View className='gap-3'>
                            <Pressable
                                onPress={() => confirmAction('approved')}
                                className='flex-row items-center justify-center gap-2 py-3.5 bg-green-600 active:bg-green-700 rounded-2xl active:scale-[0.98] transition-all duration-150'>
                                <Ionicons name='checkmark-circle-outline' size={20} color='white' />
                                <Text className='text-white font-semibold'>Approve</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => confirmAction('in_progress')}
                                className='flex-row items-center justify-center gap-2 py-3.5 bg-blue-600 active:bg-blue-700 rounded-2xl active:scale-[0.98] transition-all duration-150'>
                                <Ionicons name='eye-outline' size={20} color='white' />
                                <Text className='text-white font-semibold'>Mark for review</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => confirmAction('rejected')}
                                className='flex-row items-center justify-center gap-2 py-3.5 bg-red-600 active:bg-red-700 rounded-2xl active:scale-[0.98] transition-all duration-150'>
                                <Ionicons name='close-circle-outline' size={20} color='white' />
                                <Text className='text-white font-semibold'>Reject</Text>
                            </Pressable>
                        </View>
                    )}
                    {user?.role === 'admin' && (
                        <View className='gap-3'>
                            {!isDone && (
                                <Pressable
                                    onPress={() => router.push(`/${task.id}/edit`)}
                                    className='flex-row items-center justify-center gap-2 py-3.5 bg-blue-600 active:bg-blue-700 rounded-2xl active:scale-[0.98] transition-all duration-150'>
                                    <Ionicons name='create-outline' size={20} color='white' />
                                    <Text className='text-white font-semibold'>Edit</Text>
                                </Pressable>
                            )}
                            <Pressable
                                onPress={() => confirmAction('delete')}
                                className='flex-row items-center justify-center gap-2 py-3.5 bg-red-600 active:bg-red-700 rounded-2xl active:scale-[0.98] transition-all duration-150'>
                                <Ionicons name='trash-outline' size={20} color='white' />
                                <Text className='text-white font-semibold'>Delete</Text>
                            </Pressable>
                        </View>
                    )}
                    <Comments />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}