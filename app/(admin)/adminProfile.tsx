import { useAuth } from '@/context/AuthContext'
import { useTaskFilters } from '@/context/FilterContext'
import { useTasks } from '@/context/TaskContext'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Animated, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
type PrivilegesCardProps = {
  title: string
  desc: string
  delay: number
}
function PrivilegesCard({ title, desc, delay }: PrivilegesCardProps) {
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
      className='p-4 bg-blue-50 border border-blue-200 rounded-xl'>
      <Text className='text-sm font-bold text-blue-900 text-center mb-1'>{title}</Text>
      <Text className='text-xs font-medium text-blue-700 text-justify'>{desc}</Text>
    </Animated.View>
  )
}
export default function AdminProfile() {
  const insets = useSafeAreaInsets()
  const active = false
  const { user } = useAuth()
  const { loadTasks } = useTasks()
  const { getUsers } = useTaskFilters()
  const [loading, setLoading] = useState(false)
  const role = user && (user.role.charAt(0).toUpperCase() + user.role.slice(1))
  const initials = user?.name
    .split(' ')
    .map((n: string) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const cardOpacity = useRef(new Animated.Value(0)).current
  const cardTranslateY = useRef(new Animated.Value(16)).current
  useEffect(() => {
    if (!loading) {
      cardOpacity.setValue(0)
      cardTranslateY.setValue(16)
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(cardTranslateY, { toValue: 0, duration: 400, useNativeDriver: true })
      ]).start()
    }
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
          onRefresh={handleRefresh} />
      }>
      <Animated.View
        style={{ opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] }}
        className='bg-white border border-slate-200 rounded-2xl mx-3 mt-4 mb-4'>
        <View className='overflow-hidden rounded-t-2xl'>
          <LinearGradient
            colors={['#1D4ED8', '#60A5FA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              height: 112,
              width: '100%'
            }} />
        </View>
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
              <Text className='text-slate-900 font-medium text-sm' numberOfLines={1}>{user?.name}</Text>
            </View>
            <View className='w-1/2'>
              <Text className='text-xs font-bold text-slate-400 tracking-widest mb-1'>Email</Text>
              <Text className='text-slate-900 font-medium text-sm' numberOfLines={1}>{user?.email}</Text>
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
      <View className='bg-white border border-slate-200 rounded-2xl p-5 mx-3 mb-4'>
        <Text className='text-base font-semibold text-slate-900 mb-4'>Admin Privileges</Text>
        <View className='flex-col gap-3'>
          <PrivilegesCard
            title={'User Management'}
            desc={'Full oversight of all users across the platform, including administrators and managers. Supports creating new user accounts with assigned roles, searching and filtering user records, and accessing detailed user analytics.'}
            delay={0} />
          <PrivilegesCard
            title={'Task Management'}
            desc={'Complete visibility into all tasks within the system. Enables task creation and assignment to managers, with advanced filtering and sorting by assignee, category, status, or priority.'}
            delay={60} />
          <PrivilegesCard
            title={'Reports & Analytics'}
            desc={'Comprehensive reporting across the system, including total, completed, pending, and overdue tasks. Displays completion rates, priority distribution, and weekly performance trends.'}
            delay={120} />
        </View>
      </View>
    </ScrollView>
  )
}