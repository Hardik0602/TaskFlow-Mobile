import { useAuth } from '@/context/AuthContext'
import { useTaskFilters } from '@/context/FilterContext'
import { Task } from '@/context/TaskContext'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useEffect, useRef } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const priorityConfig = {
    high: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', dot: '#ef4444' },
    medium: { bg: '#fffbeb', text: '#92400e', border: '#fde68a', dot: '#f59e0b' },
    low: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', dot: '#3b82f6' }
}
const statusConfig: Record<string, { bg: string, text: string, label: string }> = {
    pending: { bg: '#f1f5f9', text: '#475569', label: 'Pending' },
    in_progress: { bg: '#dbeafe', text: '#1d4ed8', label: 'In Progress' },
    approved: { bg: '#dcfce7', text: '#15803d', label: 'Approved' },
    rejected: { bg: '#fee2e2', text: '#b91c1c', label: 'Rejected' }
}
const getDueDateDisplay = (task: Task) => {
    if (task.status != 'pending') {
        return { text: `Completed`, color: '#94a3b8', bold: false }
    }
    const today = new Date()
    const due = new Date(task.dueDate)
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (task.overdue) return { text: 'Overdue', color: '#dc2626', bold: true }
    if (diffDays === 0) return { text: 'Due Today', color: '#d97706', bold: true }
    if (diffDays === 1) return { text: 'Due Tomorrow', color: '#d97706', bold: false }
    if (diffDays <= 3) return { text: `Due in ${diffDays} days`, color: '#475569', bold: false }
    return { text: `Due ${formatDate(task.dueDate)}`, color: '#94a3b8', bold: false }
}
export default function TaskCard({ task, index }: { task: Task, index: number }) {
    const { user } = useAuth()
    const { users } = useTaskFilters()
    const opacity = useRef(new Animated.Value(0)).current
    const translateY = useRef(new Animated.Value(10)).current
    const p = priorityConfig[task.priority]
    const s = statusConfig[task.status]
    const due = getDueDateDisplay(task)
    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 300, delay: index * 50, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 300, delay: index * 50, useNativeDriver: true })
        ]).start()
    }, [])
    return (
        <Animated.View style={{ opacity, transform: [{ translateY }] }}>
            <Pressable
                onPress={() => router.push(`/task/${task.id}`)}
                className={`bg-white rounded-2xl p-4 ${!task.overdue ? 'border-slate-200 border' : 'border-red-400 border-2'}`}>
                <View className='flex-row items-center justify-between mb-2'>
                    <View className='flex-1 pr-3'>
                        <Text className='text-sm font-semibold text-slate-900 mb-1.5' numberOfLines={1}>
                            {task.title}
                        </Text>
                        <View className='flex-row items-center gap-2'>
                            <View className='px-2 py-0.5 bg-slate-100 rounded-md'>
                                <Text className='text-xs font-medium text-slate-700'>{task.category}</Text>
                            </View>
                            <View style={{ backgroundColor: s.bg }} className='px-2 py-0.5 rounded-md'>
                                <Text style={{ color: s.text }} className='text-xs font-medium'>{s.label}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ backgroundColor: p.bg, borderColor: p.border }} className='flex-row items-center gap-1.5 px-2.5 py-1 rounded-md border'>
                        <View style={{ backgroundColor: p.dot }} className='w-1.5 h-1.5 rounded-full' />
                        <Text style={{ color: p.text }} className='text-xs font-medium capitalize'>{task.priority}</Text>
                    </View>
                </View>
                <View className='gap-1.5 mt-2'>
                    <View className='flex-row gap-5'>
                        <View className='flex-row items-center gap-1.5'>
                            <Ionicons name='person-outline' size={13} color='#94a3b8' />
                            <Text className='text-xs text-slate-500' numberOfLines={1}>{task.submittedBy}</Text>
                        </View>
                        <View className='flex-row items-center gap-1.5'>
                            <Ionicons name='calendar-outline' size={13} color='#94a3b8' />
                            <Text className='text-xs text-slate-400'>{formatDate(task.submittedDate)}</Text>
                        </View>
                    </View>
                    <View className='flex-row gap-5'>
                        <View className='flex-row items-center gap-1.5'>
                            <Ionicons name='time-outline' size={13} color={due.color} />
                            <Text style={{ color: due.color, fontWeight: due.bold ? '600' : '400' }} className='text-xs'>
                                {due.text}
                            </Text>
                        </View>
                        {user?.role === 'admin' && (
                            <View className='flex-1 flex-row items-center gap-1.5'>
                                <Ionicons name='briefcase-outline' size={13} color='#94a3b8' />
                                <Text className='text-xs text-slate-500' numberOfLines={1}>{users.find(u => u.email === task.assignedTo)?.name || task.assignedTo}</Text>
                            </View>
                        )}
                    </View>
                </View>
                {task.overdue && (
                    <View className='flex-row items-center gap-2 mt-3 pt-3 border-t border-red-100'>
                        <Ionicons name='alert-circle' size={16} color='#dc2626' />
                        <Text className='text-xs font-medium text-red-600'>Action Required - This task is overdue</Text>
                    </View>
                )}
            </Pressable>
        </Animated.View>
    )
}