import { useTasks } from '@/context/TaskContext'
import { Ionicons } from '@expo/vector-icons'
import { useEffect, useRef } from 'react'
import { ActivityIndicator, Animated, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
type Color = 'blue' | 'red' | 'amber' | 'green'
const colorMap: Record<Color, { bg: string; icon: string; text: string; border: string }> = {
  blue: { bg: '#eff6ff', icon: '#2563eb', text: '#1d4ed8', border: '#bfdbfe' },
  red: { bg: '#fef2f2', icon: '#dc2626', text: '#b91c1c', border: '#fecaca' },
  amber: { bg: '#fffbeb', icon: '#d97706', text: '#b45309', border: '#fde68a' },
  green: { bg: '#f0fdf4', icon: '#16a34a', text: '#15803d', border: '#bbf7d0' }
}
type StatCardProps = {
  title: string
  value: number
  icon: keyof typeof Ionicons.glyphMap
  color: Color
  subtitle?: string
  delay: number
}
function StatCard({ title, value, icon, color, subtitle, delay }: StatCardProps) {
  const c = colorMap[color]
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(12)).current
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay, useNativeDriver: true })
    ]).start()
  }, [])
  return (
    <Animated.View
      style={{ opacity, transform: [{ translateY }], backgroundColor: c.bg, borderColor: c.border }}
      className='flex-1 p-4 rounded-2xl border'>
      <Text className='text-xs font-semibold text-slate-500 mb-3'>{title}</Text>
      <View className='flex-1 flex-row justify-between items-center'>
        <View>
          <Text style={{ color: c.text }} className='text-2xl font-bold'>{value}</Text>
          {subtitle && <Text className='text-xs text-slate-400 mt-1'>{subtitle}</Text>}
        </View>
        <Ionicons name={icon} size={35} color={c.icon} />
      </View>
    </Animated.View>
  )
}
type ProgressRowProps = {
  label: string
  value: number
  total: number
  color: string
  loading: boolean
}
function ProgressRow({ label, value, total, color, loading }: ProgressRowProps) {
  const progressAnim = useRef(new Animated.Value(0)).current
  const pct = total > 0 ? (value / total) * 100 : 0
  useEffect(() => {
    if (loading) return progressAnim.setValue(0)
    Animated.timing(progressAnim, {
      toValue: pct,
      duration: 700,
      delay: 300,
      useNativeDriver: false
    }).start()
  }, [loading])
  const width = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  })
  return (
    <View>
      <View className='flex-row items-center justify-between mb-1.5'>
        <Text className='text-sm font-medium text-slate-700'>{label}</Text>
        <Text className='text-sm font-semibold text-slate-900'>{value}</Text>
      </View>
      <View className='h-2 bg-slate-100 rounded-full overflow-hidden'>
        <Animated.View style={{ width, backgroundColor: color }} className='h-2 rounded-full' />
      </View>
    </View>
  )
}
export default function Dashboard() {
  const insets = useSafeAreaInsets()
  const { totalTasks, overdueTasks, pendingTasks, completedTasks, highPriority, mediumPriority, lowPriority, dueSoon, completionRate, loadTasks, loading } = useTasks()
  const sectionOpacity = useRef(new Animated.Value(0)).current
  const sectionTranslateY = useRef(new Animated.Value(16)).current
  useEffect(() => {
    Animated.parallel([
      Animated.timing(sectionOpacity, { toValue: 1, duration: 400, delay: 300, useNativeDriver: true }),
      Animated.timing(sectionTranslateY, { toValue: 0, duration: 400, delay: 300, useNativeDriver: true })
    ]).start()
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
    <ScrollView
      showsVerticalScrollIndicator={false}
      className='flex-1 bg-slate-50'
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={loadTasks} />
      }>
      <View className='flex-row gap-2 mx-3 my-4'>
        <StatCard title='Total Tasks' value={totalTasks} icon='clipboard-outline' color='blue' delay={0} />
        <StatCard title='Overdue' value={overdueTasks} icon='warning-outline' color='red' delay={60} subtitle='Needs attention' />
      </View>
      <View className='flex-row gap-2 mx-3 mb-4'>
        <StatCard title='Pending' value={pendingTasks} icon='time-outline' color='amber' delay={120} subtitle='Awaiting action' />
        <StatCard title='Completed' value={completedTasks} icon='checkmark-circle-outline' color='green' delay={180} />
      </View>
      <Animated.View
        style={{ opacity: sectionOpacity, transform: [{ translateY: sectionTranslateY }] }}
        className='bg-white border border-slate-200 rounded-2xl p-5 gap-4 mx-3 mb-4'>
        <Text className='text-base font-semibold text-slate-900'>Due Task Priority Breakdown</Text>
        <ProgressRow label='High Priority' value={highPriority} total={pendingTasks} color='#ef4444' loading={loading} />
        <ProgressRow label='Medium Priority' value={mediumPriority} total={pendingTasks} color='#f59e0b' loading={loading} />
        <ProgressRow label='Low Priority' value={lowPriority} total={pendingTasks} color='#3b82f6' loading={loading} />
      </Animated.View>
      <Animated.View
        style={{ opacity: sectionOpacity, transform: [{ translateY: sectionTranslateY }] }}
        className='bg-white border border-slate-200 rounded-2xl p-5 gap-3 mx-3'>
        <Text className='text-base font-semibold text-slate-900'>Quick Insights</Text>
        <View className='flex-row items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl'>
          <Ionicons name='warning-outline' size={28} color='#d97706' />
          <View>
            <Text className='text-sm font-semibold text-amber-900'>Due Soon</Text>
            <Text className='text-xs text-amber-700 mt-0.5'>{dueSoon} task{dueSoon !== 1 && 's'} due within the next 3 days</Text>
          </View>
        </View>
        <View className='flex-row items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl'>
          <Ionicons name='calendar-outline' size={28} color='#2563eb' />
          <View>
            <Text className='text-sm font-semibold text-blue-900'>Completion Rate</Text>
            <Text className='text-xs text-blue-700 mt-0.5'>{completionRate}% of all tasks completed</Text>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  )
}