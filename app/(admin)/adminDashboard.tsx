import { router } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
export default function AdminDashboard() {
  return (
    <View className='flex-1 items-center justify-center gap-5'>
      <Pressable
        onPress={() => router.push('/addUser')}>
        <Text>go to add user</Text>
      </Pressable>
      <Pressable
        onPress={() => router.push('/assignTask')}>
        <Text>go to assign task</Text>
      </Pressable>
      <Pressable
        onPress={() => router.push('/editTask')}>
        <Text>go to edit task</Text>
      </Pressable>
      <Pressable
        onPress={() => router.push('/taskDetails')}>
        <Text>go to task details</Text>
      </Pressable>
    </View>
  )
}