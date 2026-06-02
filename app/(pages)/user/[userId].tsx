import FilterPicker from '@/app/components/FilterPicker'
import { API_URL } from '@/constants/api'
import { useAuth } from '@/context/AuthContext'
import { useTaskFilters } from '@/context/FilterContext'
import { useTasks } from '@/context/TaskContext'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Redirect, router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
const CATEGORY_OPTIONS = [
    'Expense Approval',
    'Document Review',
    'Leave Request',
    'Finance',
    'Access Request',
    'IT Support'
]
const PRIORITY_OPTIONS = ['low', 'medium', 'high']
const formatDate = (date: Date) => date.toISOString().split('T')[0]
function FieldLabel({ label, optional }: { label: string; optional?: boolean }) {
    return (
        <View className='flex-row items-center gap-1 mb-1.5'>
            <Text className='text-sm font-medium text-slate-700'>{label}</Text>
            {optional && <Text className='text-xs text-slate-400'>(optional)</Text>}
        </View>
    )
}
function StyledInput({ value, onChangeText, placeholder, multiline }: { value: string, onChangeText: (v: string) => void, placeholder: string, multiline?: boolean }) {
    return (
        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor='#94a3b8'
            multiline={multiline}
            className='border border-slate-200 rounded-xl p-3.5 text-sm text-[#0f172a] bg-white'
            style={{
                minHeight: multiline ? 100 : 55,
                textAlignVertical: multiline ? 'top' : 'center'
            }} />
    )
}
function DateField({ label, value, onChange, minDate, maxDate }: { label: string, value: Date | null, onChange: (d: Date) => void, minDate?: Date, maxDate?: Date }) {
    const [show, setShow] = useState(false)
    return (
        <View>
            <FieldLabel label={label} />
            <Pressable
                onPress={() => setShow(true)}
                className='border border-slate-200 rounded-xl p-3.5 bg-white flex-row items-center gap-2'>
                <Ionicons name='calendar-outline' size={16} color='#94a3b8' />
                <Text style={{ fontSize: 14, color: value ? '#0f172a' : '#94a3b8' }}>
                    {value ? formatDate(value) : 'Select date'}
                </Text>
            </Pressable>
            {show && (
                <DateTimePicker
                    value={value ?? new Date()}
                    mode='date'
                    minimumDate={minDate}
                    maximumDate={maxDate}
                    onChange={(_, date) => {
                        setShow(Platform.OS === 'ios')
                        if (date) onChange(date)
                    }} />
            )}
        </View>
    )
}
export default function TaskAssign() {
    const insets = useSafeAreaInsets()
    const { userId } = useLocalSearchParams()
    const { users } = useTaskFilters()
    const { user } = useAuth()
    const { loadTasks } = useTasks()
    if (!user) {
        return <Redirect href='/login' />
    }
    if (user.role !== 'admin') {
        return <Redirect href='/' />
    }
    const assigneeName = users.find(u => u.id === userId)?.name
    const email = users.find(u => u.id === userId)?.email
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState(CATEGORY_OPTIONS[0])
    const [priority, setPriority] = useState('low')
    const [submittedBy, setSubmittedBy] = useState(user?.name)
    const [submittedDate, setSubmittedDate] = useState<Date | null>(null)
    const [dueDate, setDueDate] = useState<Date | null>(null)
    const [detailsRows, setDetailsRows] = useState([{ key: '', value: '' }])
    const [submitting, setSubmitting] = useState(false)
    const [loading, setLoading] = useState(false)
    const [flexToggle, setFlexToggle] = useState(false)
    const addDetailRow = () => setDetailsRows(prev => [...prev, { key: '', value: '' }])
    const removeDetailRow = (i: number) => setDetailsRows(prev => prev.filter((_, idx) => idx !== i))
    const updateDetailRow = (i: number, field: 'key' | 'value', val: string) => setDetailsRows(prev => {
        const next = [...prev]
        next[i] = { ...next[i], [field]: val }
        return next
    })
    const handleSubmit = async () => {
        if (!title.trim() || !description.trim() || !dueDate || !submittedDate) {
            Alert.alert('Missing Fields', 'Please fill all required fields')
            return
        }
        let valid = true
        const detailsObject: Record<string, string> = {}
        detailsRows.forEach(row => {
            const k = row.key.trim()
            const v = row.value.trim()
            if ((k && !v) || (!k && v)) valid = false
            if (k && v) detailsObject[k] = v
        })
        if (!valid) {
            Alert.alert('Invalid Details', 'Each detail field must have both a name and value')
            return
        }
        const newTask = {
            title: `${category} - ${title.trim()}`,
            description: description.trim(),
            category,
            status: 'pending',
            priority,
            assignedTo: email,
            submittedBy,
            submittedDate: formatDate(submittedDate),
            dueDate: formatDate(dueDate),
            details: Object.keys(detailsObject).length ? detailsObject : {},
        }
        try {
            setSubmitting(true)
            const res = await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask),
            })
            if (!res.ok) throw new Error()
            await loadTasks()
            Alert.alert('Success', 'Task assigned successfully')
            router.replace('/userManagement')
        } catch {
            Alert.alert('Error', 'Something went wrong')
        } finally {
            setSubmitting(false)
        }
    }
    const handleRefresh = () => {
        setLoading(true)
        setTimeout(() => {
            setTitle('')
            setDescription('')
            setCategory(CATEGORY_OPTIONS[0])
            setPriority('low')
            setSubmittedBy(user?.name)
            setSubmittedDate(null)
            setDueDate(null)
            setDetailsRows([{ key: '', value: '' }])
            setLoading(false)
        }, 1000)
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
                        onRefresh={handleRefresh}
                        progressViewOffset={Platform.OS === 'android' ? insets.top : 0} />
                }>
                <View className='flex-row items-center gap-3 mx-3 mt-4 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl'>
                    <View className='w-12 h-12 bg-blue-100 rounded-full items-center justify-center'>
                        <Text className='text-lg font-semibold text-blue-700'>
                            {assigneeName?.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View>
                        <Text className='text-sm font-semibold text-blue-900'>Assigning to: {assigneeName}</Text>
                        <Text className='text-xs text-blue-700'>{email}</Text>
                    </View>
                </View>
                <View className='bg-white border border-slate-200 rounded-2xl p-5 mx-3 mb-4 gap-4'>
                    <Text className='text-base font-semibold text-slate-900'>Task Information</Text>
                    <View>
                        <FieldLabel label='Task Title' />
                        <StyledInput value={title} onChangeText={setTitle} placeholder='e.g. Mumbai Trip' />
                    </View>
                    <View>
                        <FieldLabel label='Description' />
                        <StyledInput value={description} onChangeText={setDescription} placeholder='Additional details...' multiline />
                    </View>
                    <View>
                        <FieldLabel label='Category' />
                        <FilterPicker value={category} onChange={setCategory} items={CATEGORY_OPTIONS.map(c => ({ label: c, value: c }))} />
                    </View>
                    <View>
                        <FieldLabel label='Priority' />
                        <FilterPicker value={priority} onChange={setPriority} items={PRIORITY_OPTIONS.map(c => ({ label: c.charAt(0).toUpperCase() + c.slice(1), value: c }))} />
                    </View>
                </View>
                <View className='bg-white border border-slate-200 rounded-2xl p-5 mx-3 mb-4 gap-4'>
                    <Text className='text-base font-semibold text-slate-900'>Timeline & Assignment</Text>
                    <View>
                        <FieldLabel label='Submitted By' />
                        <StyledInput value={submittedBy} onChangeText={setSubmittedBy} placeholder='Name of owner' />
                    </View>
                    <DateField
                        label='Submitted Date'
                        value={submittedDate}
                        onChange={setSubmittedDate}
                        maxDate={new Date()} />
                    <DateField
                        label='Due Date'
                        value={dueDate}
                        onChange={setDueDate}
                        minDate={new Date()} />
                </View>
                <View className='bg-white border border-slate-200 rounded-2xl p-5 mx-3 mb-4'>
                    <View className='flex-row items-center justify-between mb-1'>
                        <Text className='text-base font-semibold text-slate-900'>Additional Details</Text>
                        <Text className='text-xs text-slate-400'>Optional</Text>
                    </View>
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
                        disabled={submitting}
                        className='flex-1 flex-row gap-1 py-4 items-center justify-center bg-blue-600 active:bg-blue-700 active:scale-[0.98] transition-all duration-150 rounded-xl disabled:opacity-50'>
                        {submitting
                            ? <ActivityIndicator size='small' color='white' />
                            : <Ionicons name='checkmark-circle-outline' size={18} color='white' />
                        }
                        <Text className='text-sm font-medium text-white'>
                            {submitting ? 'Assigning...' : 'Assign Task '}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}