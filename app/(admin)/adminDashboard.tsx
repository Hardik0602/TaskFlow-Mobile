import { useTaskFilters } from '@/context/FilterContext'
import { useTasks } from '@/context/TaskContext'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Animated, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import StatCard from '../components/StatCard'
export default function AdminDashboard() {
  const insets = useSafeAreaInsets()
  const { loadTasks, overdueTasks, pendingTasks } = useTasks()
  const { users, getUsers } = useTaskFilters()
  const [loading, setLoading] = useState(false)
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
  const handleRefresh = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadTasks(),
        getUsers()
      ])
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'Something went wrong',
        [{ text: 'Ok' }]
      )
    } finally {
      setLoading(false)
    }
  }
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
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={handleRefresh} />
      }>
      <View className='gap-3 mx-3 mt-4'>
        <StatCard
          title='Total Users'
          value={users.length}
          icon='people-outline'
          color='purple'
          subtitle={`Managers: ${users.filter(user => user.role === 'manager').length} | Admins: ${users.filter(user => user.role === 'admin').length}`}
          delay={0} />
        <StatCard
          title='Pending Tasks'
          value={pendingTasks}
          icon='time-outline'
          color='amber'
          subtitle='Awaiting action'
          delay={60} />
        <StatCard
          title='Overdue Tasks'
          value={overdueTasks}
          icon='warning-outline'
          color='red'
          subtitle='Needs attention'
          delay={120} />
      </View>
      <Animated.View
        style={{ opacity: sectionOpacity, transform: [{ translateY: sectionTranslateY }] }}
        className='bg-white border border-slate-200 rounded-2xl p-5 mx-3 mt-4'>
        <Text className='text-base font-semibold text-slate-900 mb-4'>Quick Actions</Text>
        <View className='gap-3'>
          <Pressable
            onPress={() => router.push('/userManagement')}
            className='flex-row items-center justify-between px-4 py-3 bg-purple-50 active:bg-purple-100 rounded-xl'>
            <Text className='text-sm font-medium text-purple-900'>Assign Task{' '}</Text>
            <Ionicons name='arrow-forward-circle-outline' size={20} color='#7c3aed' />
          </Pressable>
          <Pressable
            onPress={() => router.push('/report')}
            className='flex-row items-center justify-between px-4 py-3 bg-blue-50 active:bg-blue-100 rounded-xl'>
            <Text className='text-sm font-medium text-blue-900'>View Report{' '}</Text>
            <Ionicons name='arrow-forward-circle-outline' size={20} color='#2563eb' />
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>
  )
}