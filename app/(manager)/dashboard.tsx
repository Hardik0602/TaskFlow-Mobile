import { router } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
export default function Dashboard() {
  return (
    <View className='flex-1 items-center justify-center'>
      <Pressable
        onPress={() => router.push('/taskDetails')}>
        <Text>go to task details</Text>
      </Pressable>
    </View>
  )
}