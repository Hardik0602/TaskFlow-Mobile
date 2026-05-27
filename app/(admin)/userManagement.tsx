import { useTaskFilters } from '@/context/FilterContext'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import UserList from '../components/UserList'
function StatCard({ label, value, icon, bg, iconColor, textColor, delay }: {
  label: string
  value: number
  icon: keyof typeof Ionicons.glyphMap
  bg: string
  iconColor: string
  textColor: string
  delay: number
}) {
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(10)).current
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay, useNativeDriver: true })
    ]).start()
  }, [])
  return (
    <Animated.View
      style={{ opacity, transform: [{ translateY }], backgroundColor: bg }}
      className='flex-1 flex-row p-4 rounded-2xl border border-slate-200 items-center justify-between'>
      <View className='gap-2'>
        <Text style={{ color: iconColor }} className='text-md font-semibold'>{label}</Text>
        <Text style={{ color: textColor }} className='text-2xl font-bold'>{value}</Text>
      </View>
      <Ionicons name={icon} size={30} color={iconColor} />
    </Animated.View>
  )
}
export default function UserManagement() {
  const insets = useSafeAreaInsets()
  const [searchTerm, setSearchTerm] = useState('')
  const { users, getUsers, loading } = useTaskFilters()
  const totalUsers = users.length
  const managers = users.filter(u => u.role === 'manager').length
  const admins = users.filter(u => u.role === 'admin').length
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  const adminUsers = filteredUsers.filter(u => u.role === 'admin')
  const managerUsers = filteredUsers.filter(u => u.role === 'manager')
  const isEmpty = filteredUsers.length === 0
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
          onRefresh={getUsers} />
      }>
      <View className='flex-row items-center justify-between mx-3 mt-4 mb-3'>
        <Text className='text-2xl font-bold text-slate-900'>User Management</Text>
        <Pressable
          onPress={() => router.push('/addUser')}
          className='flex-row items-center gap-1.5 px-3 py-2.5 bg-blue-500 active:bg-blue-600 active:scale-[0.98] transition-all duration-150 rounded-lg'>
          <Ionicons name='person-add-outline' size={16} color='white' />
          <Text className='text-white text-sm font-medium'>Add User</Text>
        </Pressable>
      </View>
      <View className='flex-row items-center gap-2 mx-3 mb-3 px-3 bg-white border border-slate-200 rounded-xl'>
        <Ionicons name='search-outline' size={18} color='#94a3b8' />
        <TextInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder='Search by name or email'
          placeholderTextColor='#94a3b8'
          className='flex-1 py-3 text-sm text-slate-900' />
        {searchTerm.length > 0 && (
          <Pressable onPress={() => setSearchTerm('')}>
            <Ionicons name='close-circle' size={18} color='#94a3b8' />
          </Pressable>
        )}
      </View>
      <View className='bg-white border border-slate-200 rounded-2xl overflow-hidden mx-3 mb-4'>
        {isEmpty
          ? (
            <View className='items-center justify-center py-12 gap-3'>
              <View className='w-16 h-16 bg-slate-100 rounded-full items-center justify-center'>
                <Ionicons name='people-outline' size={30} color='#94a3b8' />
              </View>
              <Text className='text-sm font-semibold text-slate-400'>No user found</Text>
            </View>
          )
          : (
            <>
              {adminUsers.map((u, i) => <UserList key={u.id} user={u} index={i} />)}
              {managerUsers.map((u, i) => <UserList key={u.id} user={u} index={adminUsers.length + i} />)}
            </>
          )
        }
      </View>
      <View className='mx-3'>
        <Text className='text-base font-semibold text-slate-900 mb-3'>User Statistics</Text>
        <View className='gap-3'>
          <StatCard label='Total Users' value={totalUsers} icon='people-outline' bg='#f8fafc' iconColor='#64748b' textColor='#94a3b8' delay={0} />
          <View className='gap-3 flex-row'>
            <StatCard label='Managers' value={managers} icon='briefcase-outline' bg='#eff6ff' iconColor='#3b82f6' textColor='#93c5fd' delay={60} />
            <StatCard label='Admins' value={admins} icon='shield-outline' bg='#faf5ff' iconColor='#8b5cf6' textColor='#a78bfa' delay={120} />
          </View>
        </View>
      </View>
    </ScrollView>
  )
}