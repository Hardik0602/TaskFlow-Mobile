import { useNotifications } from '@/context/NotificationContext'
import { useTasks } from '@/context/TaskContext'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useEffect, useRef } from 'react'
import { ActivityIndicator, Animated, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
type NotificationType = 'overdue' | 'dueSoon' | 'pending'
const typeStyles: Record<NotificationType, { bg: string, border: string, text: string }> = {
  overdue: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
  dueSoon: { bg: '#fffbeb', border: '#fde68a', text: '#d97706' },
  pending: { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb' }
}
const readStyle = { bg: '#ffffff', border: '#e2e8f0', text: '#94a3b8' }
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
export default function Notifications() {
  const insets = useSafeAreaInsets()
  const { notifications, readIds, markRead, markAllRead, unread } = useNotifications()
  const { loading, loadTasks } = useTasks()
  const handlePress = (id: string, taskId?: string) => {
    markRead(id)
    taskId && router.push(`/task/${taskId}`)
  }
  const listOpacity = useRef(new Animated.Value(0)).current
  const listTranslateY = useRef(new Animated.Value(12)).current
  useEffect(() => {
    if (loading) return
    listOpacity.setValue(0)
    listTranslateY.setValue(12)
    Animated.parallel([
      Animated.timing(listOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(listTranslateY, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start()
  }, [loading])
  if (loading) {
    return (
      <View className='flex-1 bg-slate-50 justify-center'>
        <ActivityIndicator
          size={50}
          color={'#60A5FA'} />
      </View>
    )
  }
  if (notifications.length === 0) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        className='flex-1 bg-slate-50'
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingVertical: 16
        }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadTasks} />
        }>
        <View className='bg-white border border-slate-200 rounded-2xl items-center justify-center gap-5 mx-3 h-full'>
          <View className='w-20 h-20 bg-slate-100 rounded-full items-center justify-center'>
            <Ionicons name='notifications-outline' size={40} color='#94a3b8' />
          </View>
          <View className='items-center'>
            <Text className='text-lg font-semibold text-slate-900 mb-1'>No notifications</Text>
            <Text className='text-base text-slate-400'>Notifications will appear here</Text>
          </View>
        </View>
      </ScrollView>
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
      <Animated.View style={{ opacity: listOpacity, transform: [{ translateY: listTranslateY }] }}>
        <View className='flex-row items-center justify-between mx-3 my-4'>
          <View>
            <Text className='text-2xl font-bold text-slate-900'>Notifications</Text>
            <Text className='text-sm text-slate-500 mt-0.5'>
              {unread} unread of {notifications.length} total
            </Text>
          </View>
          <Pressable
            disabled={unread === 0}
            onPress={markAllRead}
            className='flex-row items-center gap-1.5 p-3 bg-blue-600 active:bg-blue-700 active:scale-[0.98] transition-all duration-150 rounded-xl disabled:opacity-50'>
            <Ionicons name='checkmark-circle-outline' size={20} color='white' />
            <Text className='text-white text-[15px] font-medium'>Mark all as read</Text>
          </Pressable>
        </View>
        <View className='mx-3 gap-3'>
          {unread === 0 && (
            <View className='flex-row items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl'>
              <View className='w-10 h-10 bg-green-100 rounded-full items-center justify-center'>
                <Ionicons name='checkmark-circle' size={20} color='#16a34a' />
              </View>
              <View>
                <Text className='text-sm font-semibold text-green-900'>All caught up!</Text>
                <Text className='text-xs text-green-700'>You've read all your notifications.</Text>
              </View>
            </View>
          )}
          {notifications.map((n) => {
            const isRead = readIds.has(n.id)
            const s = isRead ? readStyle : typeStyles[n.type]
            return (
              <Pressable
                onPress={() => handlePress(n.id)}
                key={n.id}
                style={{ backgroundColor: s.bg, borderColor: s.border }}
                className='border rounded-2xl p-4'>
                <View className='flex-row items-center gap-3'>
                  <View className='w-[85%]'>
                    <Text
                      style={{ color: s.text }}
                      className='text-sm font-semibold'>
                      {n.message}
                    </Text>
                    <View className='flex-row items-center gap-1 mt-1.5'>
                      <Ionicons name='calendar-outline' size={12} color='#94a3b8' />
                      <Text className='text-xs text-slate-400 font-medium'>Due: {formatDate(n.dueDate)}</Text>
                    </View>
                  </View>
                  <View className='flex flex-col gap-1'>
                    {/* {!isRead && (
                    <Pressable
                      onPress={() => handlePress(n.id)}
                      className='pb-2'>
                      <Ionicons name='checkmark-circle-outline' size={22} color='#94a3b8' />
                    </Pressable>
                  )} */}
                    <Pressable
                      onPress={() => handlePress(n.id, n.taskId)}>
                      <Ionicons name='arrow-forward-circle-outline' size={25} color={s.text} />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            )
          })}
        </View>
      </Animated.View>
    </ScrollView>
  )
}