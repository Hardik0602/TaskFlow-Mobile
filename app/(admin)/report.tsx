import { useTasks } from '@/context/TaskContext'
import { useEffect, useRef } from 'react'
import { ActivityIndicator, Animated, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ProgressBar from '../components/ProgressBar'
import StatCard from '../components/StatCard'
export default function Report() {
  const insets = useSafeAreaInsets()
  const { totalTasks, completedTasks, pendingTasks, overdueTasks, highPriority, mediumPriority, lowPriority, completionRate, loading, loadTasks } = useTasks()
  const sectionOpacity = useRef(new Animated.Value(0)).current
  const sectionTranslateY = useRef(new Animated.Value(16)).current
  useEffect(() => {
    if (loading) return
    sectionOpacity.setValue(0)
    sectionTranslateY.setValue(16)
    Animated.parallel([
      Animated.timing(sectionOpacity, { toValue: 1, duration: 400, delay: 300, useNativeDriver: true }),
      Animated.timing(sectionTranslateY, { toValue: 0, duration: 400, delay: 300, useNativeDriver: true })
    ]).start()
  }, [loading])
  if (loading) {
    return (
      <View className='flex-1 bg-slate-50 justify-center'>
        <ActivityIndicator size={50} color='#60A5FA' />
      </View>
    )
  }
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className='flex-1 bg-slate-50'
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      refreshControl={<RefreshControl
        refreshing={loading}
        onRefresh={loadTasks} />
      }>
      <View className='gap-2 mx-3 mt-4'>
        <StatCard title='Total Tasks' value={totalTasks} icon='clipboard-outline' color='blue' subtitle='All tasks in the system' delay={0} />
        <StatCard title='Pending' value={pendingTasks} icon='time-outline' color='amber' subtitle='Awaiting action' delay={60} />
      </View>
      <View className='flex-row gap-2 mx-3 mt-2 mb-4'>
        <StatCard title='Overdue' value={overdueTasks} icon='warning-outline' color='red' subtitle='Past due date' delay={60} />
        <StatCard title='Completed' value={completedTasks} icon='checkmark-circle-outline' color='green' subtitle={`Rate: ${completionRate}%`} delay={180} />
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
        className='bg-white border border-slate-200 rounded-2xl p-5 mx-3'>
        <Text className='text-base font-semibold text-slate-900 mb-4'>Performance</Text>
        <View className='flex-row items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl'>
          <View className='gap-1'>
            <Text className='text-md font-semibold text-blue-900'>Completion Rate</Text>
            <Text className='text-xs text-blue-700'>Overall system performance</Text>
          </View>
          <Text className='text-3xl font-bold text-blue-600'>{completionRate}%</Text>
        </View>
      </Animated.View>
    </ScrollView>
  )
}