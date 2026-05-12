import { useAuth } from '@/context/AuthContext'
import { useTasks } from '@/context/TaskContext'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useRef } from 'react'
import { ActivityIndicator, Animated, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
type StatCardProps = {
  value: number
  label: string
  bgClass: string
  textClass: string
  labelClass: string
  delay: number
}
function StatCard({ value, label, bgClass, textClass, labelClass, delay }: StatCardProps) {
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
      style={{ opacity, transform: [{ translateY }] }}
      className={`flex-1 items-center p-4 rounded-xl border ${bgClass}`}>
      <Text className={`text-2xl font-bold mb-0.5 ${textClass}`}>{value}</Text>
      <Text className={`text-xs ${labelClass}`}>{label}</Text>
    </Animated.View>
  )
}
export default function Profile() {
  const insets = useSafeAreaInsets()
  const active = true
  const avgResTime: number = 2
  const { user } = useAuth()
  const { totalTasks, pendingTasks, completionRate, completedTasks, overdueTasks, loading, loadTasks } = useTasks()
  const role = user && (user.role.charAt(0).toUpperCase() + user.role.slice(1))
  const initials = user?.name
    .split(' ')
    .map((n: string) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const progressAnim = useRef(new Animated.Value(0)).current
  const cardOpacity = useRef(new Animated.Value(0)).current
  const cardTranslateY = useRef(new Animated.Value(16)).current
  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(cardTranslateY, { toValue: 0, duration: 400, useNativeDriver: true })
    ]).start()
  }, [])
  useEffect(() => {
    if (!loading) {
      progressAnim.setValue(0)
      Animated.timing(progressAnim, {
        toValue: completionRate,
        duration: 700,
        delay: 300,
        useNativeDriver: false
      }).start()
    }
  }, [loading])
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  })
  return (
    <ScrollView
      className='flex-1 bg-slate-50'
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={loadTasks} />
      }>
      <Animated.View
        style={{ opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] }}
        className='bg-white border border-slate-200 rounded-2xl overflow-hidden mx-3 mt-4 mb-4'>
        <LinearGradient
          colors={['#60A5FA', '#1D4ED8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className='h-28' />
        <View className='px-5 pb-5'>
          <View className='-mt-14 mb-4'>
            <View className='w-28 h-28 rounded-full bg-white border-4 border-white shadow-md items-center justify-center'>
              <View className='w-24 h-24 rounded-full bg-blue-100 items-center justify-center'>
                <Text className='text-3xl font-bold text-blue-600'>{initials}</Text>
              </View>
            </View>
          </View>
          <View className='flex-row flex-wrap gap-y-4'>
            <View className='w-1/2 pr-3'>
              <Text className='text-xs font-bold text-slate-400 tracking-widest mb-1'>Full Name</Text>
              <Text className='text-slate-900 font-medium text-sm'>{user?.name}</Text>
            </View>
            <View className='w-1/2'>
              <Text className='text-xs font-bold text-slate-400 tracking-widest mb-1'>Email</Text>
              <Text className='text-slate-900 font-medium text-sm'>{user?.email}</Text>
            </View>
            <View className='w-1/2 pr-3'>
              <Text className='text-xs font-bold text-slate-400 tracking-widest mb-1'>Role</Text>
              <Text className='text-slate-900 font-medium text-sm'>{role}</Text>
            </View>
            <View className='w-1/2'>
              <Text className='text-xs font-bold text-slate-400 tracking-widest mb-1'>Status</Text>
              <View className={`self-start flex-row items-center gap-1.5 px-2.5 py-1 rounded-md ${active ? 'bg-green-100' : 'bg-red-100'}`}>
                <View className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-red-500'}`} />
                <Text className={`text-xs font-medium ${active ? 'text-green-700' : 'text-red-700'}`}>
                  {active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
      {loading
        ? <ActivityIndicator
          size={50}
          color={'#60A5FA'}
          className='mt-20' />
        : <>
          <View className='bg-white border border-slate-200 rounded-2xl p-5 mx-3 mb-4'>
            <Text className='text-base font-semibold text-slate-900 mb-4'>Activity Overview</Text>
            <View className='flex-row gap-2 mb-2'>
              <StatCard value={totalTasks} label='Total' bgClass='bg-slate-50 border-slate-200' textClass='text-slate-900' labelClass='text-slate-500' delay={0} />
              <StatCard value={completedTasks} label='Completed' bgClass='bg-green-50 border-green-200' textClass='text-green-600' labelClass='text-green-600' delay={60} />
            </View>
            <View className='flex-row gap-2'>
              <StatCard value={pendingTasks} label='Pending' bgClass='bg-amber-50 border-amber-200' textClass='text-amber-600' labelClass='text-amber-600' delay={120} />
              <StatCard value={overdueTasks} label='Overdue' bgClass='bg-red-50 border-red-200' textClass='text-red-600' labelClass='text-red-500' delay={180} />
            </View>
          </View>
          <View className='gap-4 mx-3'>
            <View className='flex-1 bg-white border border-slate-200 rounded-2xl p-5'>
              <View className='flex-row items-center justify-between mb-3'>
                <Text className='text-sm font-semibold text-slate-900'>Completion</Text>
                <Text className='text-xl font-bold text-blue-600'>{completionRate}%</Text>
              </View>
              <View className='h-2 bg-slate-200 rounded-full overflow-hidden'>
                <Animated.View
                  style={{ width: progressWidth }}
                  className='h-2 bg-blue-600 rounded-full' />
              </View>
              <Text className='text-xs text-slate-400 mt-2'>
                {completedTasks} of {totalTasks} tasks
              </Text>
            </View>
            <View className='flex-1 bg-white border border-slate-200 rounded-2xl p-5'>
              <Text className='text-sm font-semibold text-slate-900 mb-3'>Performance</Text>
              <View className='gap-2.5'>
                <View className='flex-row items-center justify-between'>
                  <Text className='text-xs text-slate-500'>Avg response time</Text>
                  <Text className='text-xs font-semibold text-slate-900'>{avgResTime} Day{avgResTime !== 1 ? 's' : null}</Text>
                </View>
                {/* <View className='flex-row items-center justify-between'>
              <Text className='text-xs text-slate-500'>Tasks this month</Text>
              <Text className='text-xs font-semibold text-slate-900'>{totalTasks}</Text>
            </View> */}
              </View>
            </View>
          </View>
        </>}
    </ScrollView>
  )
}