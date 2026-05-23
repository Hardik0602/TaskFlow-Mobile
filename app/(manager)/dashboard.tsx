import { useTasks } from '@/context/TaskContext'
import { Ionicons } from '@expo/vector-icons'
import { useEffect, useRef } from 'react'
import { ActivityIndicator, Animated, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ProgressBar from '../components/ProgressBar'
import StatCard from '../components/StatCard'
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
      <View className='flex-row gap-2 mx-3 mt-4'>
        <StatCard title='Total Tasks' value={totalTasks} icon='clipboard-outline' color='blue' delay={0} />
        <StatCard title='Completed' value={completedTasks} icon='checkmark-circle-outline' color='green' delay={60} />
      </View>
      <View className='gap-2 mx-3 mt-2 mb-4'>
        <StatCard title='Overdue' value={overdueTasks} icon='warning-outline' color='red' delay={120} subtitle='Needs attention' />
        <StatCard title='Pending' value={pendingTasks} icon='time-outline' color='amber' delay={180} subtitle='Awaiting action' />
      </View>
      <Animated.View
        style={{ opacity: sectionOpacity, transform: [{ translateY: sectionTranslateY }] }}
        className='bg-white border border-slate-200 rounded-2xl p-5 gap-4 mx-3 mb-4'>
        <Text className='text-base font-semibold text-slate-900'>Due Task Priority Breakdown</Text>
        <ProgressBar label='High Priority' value={highPriority} total={pendingTasks} color='#ef4444' delay={350} loading={loading} />
        <ProgressBar label='Medium Priority' value={mediumPriority} total={pendingTasks} color='#f59e0b' delay={420} loading={loading} />
        <ProgressBar label='Low Priority' value={lowPriority} total={pendingTasks} color='#3b82f6' delay={490} loading={loading} />
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