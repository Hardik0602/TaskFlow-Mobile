import { useAuth } from '@/context/AuthContext'
import { Ionicons } from '@expo/vector-icons'
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'
import { router } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
export default function AdminDrawerContent(props: DrawerContentComponentProps) {
    const insets = useSafeAreaInsets()
    const { logout } = useAuth()
    const handleLogout = async () => {
        await logout()
        router.replace('/login')
    }
    return (
        <View className='flex-1'>
            <View
                style={{ paddingTop: insets.top + 20 }}
                className='px-5 pb-4 border-b border-slate-100'>
                <Text className='text-xl font-bold text-indigo-600'>TaskFlow</Text>
                <Text className='text-md font-semibold text-slate-400 mt-0.5'>Admin</Text>
            </View>
            <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 20 }}>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>
            <View
                style={{ paddingBottom: insets.bottom + 20 }}
                className='px-3 pt-3 border-t border-slate-100'>
                <Pressable
                    onPress={handleLogout}
                    style={({ pressed }) => ({ backgroundColor: pressed ? '#fef2f2' : 'transparent' })}
                    className='flex-row items-center gap-3 px-4 py-3 rounded-lg'>
                    <Ionicons name='log-out-outline' size={20} color='#dc2626' />
                    <Text className='text-sm font-medium text-red-600'>Sign Out</Text>
                </Pressable>
            </View>
        </View>
    )
}