import FilterPicker from '@/app/components/FilterPicker'
import { API_URL } from '@/constants/api'
import { useAuth } from '@/context/AuthContext'
import { useTaskFilters } from '@/context/FilterContext'
import { useTasks } from '@/context/TaskContext'
import { Ionicons } from '@expo/vector-icons'
import { Redirect, router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
const formatDate = (date: Date) => date.toISOString().split('T')[0]
function FieldLabel({ label }: { label: string }) {
    return <Text className='text-sm font-medium text-slate-700 mb-1.5'>{label}</Text>
}
export default function EditTask() {
    const { user } = useAuth()
    const { tasks, loadTasks, loading, PRIORITY_OPTIONS } = useTasks()
    const { assignedToList } = useTaskFilters()
    const { taskId } = useLocalSearchParams()
    const insets = useSafeAreaInsets()
    const task = tasks.find(t => t.id === taskId)
    const [flexToggle, setFlexToggle] = useState(false)
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState('low')
    const [assignedTo, setAssignedTo] = useState('')
    const [dueDate, setDueDate] = useState<Date | null>(null)
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [detailsRows, setDetailsRows] = useState([{ key: '', value: '' }])
    const [submitting, setSubmitting] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
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
    useEffect(() => {
        if (!task) return
        setDescription(task.description)
        setPriority(task.priority)
        setAssignedTo(task.assignedTo)
        setDueDate(new Date(task.dueDate))
        const entries = Object.entries(task.details)
        entries.length > 0 ? setDetailsRows(entries.map(([key, value]) => ({ key, value: String(value) }))) : setDetailsRows([{ key: '', value: '' }])
    }, [task])
    useEffect(() => {
        if (!task) return
        const currentDetails: Record<string, string> = {}
        detailsRows.forEach(r => {
            if (r.key.trim() && r.value.trim()) currentDetails[r.key.trim()] = r.value.trim()
        })
        setHasChanges(
            description !== task.description ||
            priority !== task.priority ||
            assignedTo !== task.assignedTo ||
            (dueDate ? formatDate(dueDate) : '') !== task.dueDate ||
            JSON.stringify(currentDetails) !== JSON.stringify(task.details)
        )
    }, [description, priority, assignedTo, dueDate, detailsRows, task])
    const addDetailRow = () => setDetailsRows(prev => [...prev, { key: '', value: '' }])
    const removeDetailRow = (i: number) => setDetailsRows(prev => prev.filter((_, idx) => idx !== i))
    const updateDetailRow = (i: number, field: 'key' | 'value', val: string) => setDetailsRows(prev => {
        const next = [...prev]
        next[i] = { ...next[i], [field]: val }
        return next
    })
    const handleSubmit = async () => {
        if (!description.trim() || !dueDate) {
            Alert.alert('Missing Fields', 'Please fill all required fields')
            return
        }
        let valid = true
        const detailsObject: Record<string, string> = {}
        detailsRows.forEach(row => {
            const k = row.key.trim(), v = row.value.trim()
            if ((k && !v) || (!k && v)) valid = false
            if (k && v) detailsObject[k] = v
        })
        if (!valid) {
            Alert.alert('Invalid Details', 'Each detail field must have both a name and value')
            return
        }
        try {
            setSubmitting(true)
            const res = await fetch(`${API_URL}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: description.trim(),
                    priority,
                    assignedTo,
                    dueDate: formatDate(dueDate),
                    details: Object.keys(detailsObject).length ? detailsObject : {}
                })
            })
            if (!res.ok) throw new Error()
            await loadTasks()
            Alert.alert('Success', 'Task updated')
            router.back()
        } catch {
            Alert.alert('Error', 'Something went wrong')
        } finally {
            setSubmitting(false)
        }
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
                <View className='bg-white border border-slate-200 rounded-2xl p-5 mx-3 my-4 gap-4'>
                    <Text className='text-base font-semibold text-slate-900'>Task Information</Text>
                    <View>
                        <FieldLabel label='Task Title' />
                        <View className='px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl'>
                            <Text className='text-sm text-slate-400' numberOfLines={1}>{task.title}</Text>
                        </View>
                    </View>
                    <View>
                        <FieldLabel label='Description' />
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder='Provide context...'
                            placeholderTextColor='#94a3b8'
                            multiline
                            className='border border-slate-200 rounded-xl p-3.5 text-sm text-[#0f172a] bg-white min-h-24'
                            style={{ textAlignVertical: 'top' }} />
                    </View>
                    <View>
                        <FieldLabel label='Assigned To' />
                        <FilterPicker value={assignedTo} items={assignedToList} onChange={setAssignedTo} />
                    </View>
                    <View>
                        <FieldLabel label='Due Date' />
                        <Pressable
                            onPress={() => setShowDatePicker(true)}
                            className='border border-slate-200 rounded-xl p-3.5 bg-white flex-row items-center gap-2'>
                            <Ionicons name='calendar-outline' size={16} color='#94a3b8' />
                            <Text style={{ fontSize: 14, color: dueDate ? '#0f172a' : '#94a3b8' }}>
                                {dueDate ? formatDate(dueDate) : 'Select date'}
                            </Text>
                        </Pressable>
                        {showDatePicker && (
                            <DateTimePickerModal
                                isVisible={showDatePicker}
                                mode='date'
                                minimumDate={new Date()}
                                date={dueDate ?? new Date()}
                                onConfirm={(date) => {
                                    const selected = date < new Date() ? new Date() : date
                                    setDueDate(selected)
                                    setShowDatePicker(false)
                                }}
                                modalStyleIOS={{ marginBottom: 35 }}
                                onCancel={() => setShowDatePicker(false)} />
                        )}
                    </View>
                    <View>
                        <FieldLabel label='Priority' />
                        <FilterPicker value={priority} items={PRIORITY_OPTIONS.map(c => ({ label: c.charAt(0).toUpperCase() + c.slice(1), value: c }))} onChange={setPriority} />
                    </View>
                </View>
                <View className='bg-white border border-slate-200 rounded-2xl p-5 mx-3 mb-4'>
                    <Text className='text-base font-semibold text-slate-900 mb-1'>Additional Details</Text>
                    <Text className='text-xs text-slate-500 mb-4'>Add custom fields specific to this task (e.g., Amount, Location)</Text>
                    <View className='gap-5'>
                        {detailsRows.map((row, i) => (
                            <View key={i} className='gap-3'>
                                <View className='flex-1 gap-3'>
                                    <View className='flex-row gap-2'>
                                        <TextInput
                                            value={row.key}
                                            onChangeText={v => updateDetailRow(i, 'key', v)}
                                            placeholder='Field name'
                                            placeholderTextColor='#94a3b8'
                                            className='flex-1 border border-slate-200 rounded-xl py-3 px-2.5 text-sm bg-white text-[#0f172a]'
                                            multiline />
                                        <TextInput
                                            value={row.value}
                                            onChangeText={v => updateDetailRow(i, 'value', v)}
                                            placeholder='Value'
                                            placeholderTextColor='#94a3b8'
                                            className='flex-1 border border-slate-200 rounded-xl py-3 px-2.5 text-sm bg-white text-[#0f172a]'
                                            multiline />
                                    </View>
                                    {detailsRows.length > 1 && (
                                        <Pressable onPress={() => removeDetailRow(i)} className='flex-row items-center justify-center gap-1 py-2.5 bg-red-50 active:bg-red-100 active:scale-[0.98] transition-all duration-150 border border-red-200 rounded-lg'>
                                            <Ionicons name='close-circle-outline' size={17} color='#ef4444' />
                                            <Text className='text-sm font-medium text-red-500'>Discard</Text>
                                        </Pressable>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                    <Pressable onPress={addDetailRow} className='mt-5 self-start'>
                        <Text className='text-sm font-medium text-blue-600'>+ Add Another Field</Text>
                    </Pressable>
                </View>
                <View className='flex-row gap-2 mx-3'>
                    <Pressable
                        onPress={() => router.back()}
                        className='flex-1 py-4 bg-red-600 active:bg-red-700 active:scale-[0.98] transition-all duration-150 rounded-xl disabled:opacity-50'>
                        <Text className='text-sm text-center font-medium text-white'>Cancel</Text>
                    </Pressable>
                    <Pressable
                        onPress={handleSubmit}
                        disabled={submitting || !hasChanges}
                        className='flex-1 flex-row gap-1 py-4 items-center justify-center bg-blue-600 active:bg-blue-700 active:scale-[0.98] transition-all duration-150 rounded-xl disabled:opacity-50'>
                        {submitting
                            ? <ActivityIndicator size='small' color='white' />
                            : <Ionicons name='checkmark-circle-outline' size={18} color='white' />
                        }
                        <Text className='text-sm font-medium text-white'>
                            {submitting ? 'Updating...' : 'Update Task'}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}