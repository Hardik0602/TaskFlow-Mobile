import { useTaskFilters } from '@/context/FilterContext'
import { useTasks } from '@/context/TaskContext'
import { Ionicons } from '@expo/vector-icons'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Animated, Platform, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FilterPicker from '../components/FilterPicker'
import TaskCard from '../components/TaskCard'
export default function Tasks() {
  const insets = useSafeAreaInsets()
  const { loadTasks } = useTasks()
  const { filters, setFilters, sortMode, setSortMode, processedTasks, categories, statuses, priorities, activeFiltersCount, resetFilters, assignedToList, getUsers } = useTaskFilters()
  const [showFilter, setShowFilter] = useState(false)
  const listOpacity = useRef(new Animated.Value(0)).current
  const listTranslateY = useRef(new Animated.Value(12)).current
  const [loading, setLoading] = useState(false)
  const handleRefresh = async () => {
    setLoading(true)
    setShowFilter(false)
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
  useEffect(() => {
    if (loading) return
    listOpacity.setValue(0)
    listTranslateY.setValue(12)
    Animated.parallel([
      Animated.timing(listOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(listTranslateY, { toValue: 0, duration: 400, useNativeDriver: true })
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
      refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} />}>
      <Animated.View style={{ opacity: listOpacity, transform: [{ translateY: listTranslateY }] }}>
        <View className='flex-row items-center justify-between mx-3 pt-4 pb-3'>
          <Text className='text-2xl font-bold text-slate-900'>Task Inbox</Text>
          <Pressable
            onPress={() => setShowFilter(!showFilter)}
            className='flex-row items-center gap-1.5 p-2.5 bg-blue-500 active:bg-blue-600 active:scale-[0.98] transition-all duration-150 rounded-xl'>
            <Text className='text-white text-md font-medium'>{showFilter ? 'Hide' : 'Show'} filters</Text>
          </Pressable>
        </View>
        {showFilter && <View className='mx-3 mb-2 bg-white border border-slate-200 rounded-2xl p-3 gap-2'>
          <View className={`${Platform.OS === 'ios' ? 'flex-row' : ''}`}>
            <FilterPicker
              label='All Managers'
              value={filters.assignedTo}
              items={assignedToList.map(p => ({
                label: p.label,
                value: p.value
              }))}
              onChange={v => setFilters({ ...filters, assignedTo: v })} />
          </View>
          <View className={`gap-2 ${Platform.OS === 'ios' ? 'flex-row' : ''}`}>
            <FilterPicker
              value={sortMode}
              items={[
                { label: 'Sort: Due Date', value: 'due' },
                { label: 'Sort: Priority', value: 'priority' }
              ]}
              onChange={v => setSortMode(v as 'due' | 'priority')} />
            <FilterPicker
              label='All Categories'
              value={filters.category}
              items={categories.map(c => ({ label: c, value: c }))}
              onChange={v => setFilters({ ...filters, category: v })} />
          </View>
          <View className={`gap-2 ${Platform.OS === 'ios' ? 'flex-row' : ''}`}>
            <FilterPicker
              label='All Statuses'
              value={filters.status}
              items={statuses.map(s => ({
                label: s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' '),
                value: s
              }))}
              onChange={v => setFilters({ ...filters, status: v })} />
            <FilterPicker
              label='All Priorities'
              value={filters.priority}
              items={priorities.map(p => ({
                label: p.charAt(0).toUpperCase() + p.slice(1),
                value: p
              }))}
              onChange={v => setFilters({ ...filters, priority: v })} />
          </View>
        </View>}
        {(showFilter && activeFiltersCount > 0) && (
          <Pressable
            onPress={resetFilters}
            className='flex-row items-center mx-3 mb-4 justify-center gap-1.5 py-3 bg-slate-100 border border-slate-200 active:bg-slate-200 active:scale-[0.98] transition-all duration-150 rounded-xl'>
            <Ionicons name='close-circle-outline' size={15} color='#64748b' />
            <Text className='text-sm text-slate-600 font-medium'>Reset filters ({activeFiltersCount})</Text>
          </Pressable>
        )}
        <View className='mx-3 gap-6'>
          {Object.keys(processedTasks).length !== 0
            ? Object.entries(processedTasks).map(([category, items]) => (
              <View key={category}>
                <View className='flex-row items-center gap-2 mb-3'>
                  <Text className='text-base font-semibold text-slate-900'>{category}</Text>
                  <View className='px-2 py-0.5 bg-slate-100 rounded-full'>
                    <Text className='text-xs font-medium text-slate-500'>{items.length}</Text>
                  </View>
                </View>
                <View className='gap-3'>
                  {items.map((t, i) => <TaskCard key={t.id} task={t} index={i} />)}
                </View>
              </View>
            ))
            : (
              <View className='flex-1 bg-white border border-slate-200 rounded-2xl p-12 items-center'>
                <Ionicons name='mail-open-outline' size={60} color='#cbd5e1' />
                <Text className='text-base font-semibold text-slate-900 mt-4 mb-1'>No tasks found</Text>
                <Text className='text-sm text-slate-400 text-center mb-4'>
                  {activeFiltersCount > 0
                    ? 'Try adjusting your filters to see more tasks'
                    : 'Your inbox is empty. New tasks will appear here'}
                </Text>
                {activeFiltersCount > 0 && (
                  <Pressable
                    onPress={resetFilters}
                    className='px-4 py-2 bg-blue-600 active:bg-blue-700 active:scale-[0.98] transition-all duration-150 rounded-lg'>
                    <Text className='text-white text-sm font-medium'>Clear filters</Text>
                  </Pressable>
                )}
              </View>
            )
          }
        </View>
      </Animated.View>
    </ScrollView>
  )
}