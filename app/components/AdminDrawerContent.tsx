import { useAuth } from '@/context/AuthContext'
import { Ionicons } from '@expo/vector-icons'
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'
import { router } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
export default function AdminDrawerContent(props: DrawerContentComponentProps) {
    const insets = useSafeAreaInsets()
    const { logout, user } = useAuth()
    const handleLogout = async () => {
        await logout()
        router.replace('/login')
    }
    return (
        <View className='flex-1'>
            <View
                style={{ paddingTop: insets.top + 16 }}
                className='px-5 pb-4 border-b border-slate-100'>
                <Text className='text-xl font-bold text-indigo-600'>TaskFlow</Text>
                <Text className='text-md font-semibold text-slate-400 mt-0.5'>Admin</Text>
            </View>
            <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 20 }}>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>
            <View
                style={{ paddingBottom: insets.bottom + 16 }}
                className='flex-row items-center justify-between px-5 pt-4 border-t border-slate-100 gap-2'>
                <View className='flex-1 flex-row items-center gap-2'>
                    <View className='w-8 h-8 bg-slate-200 rounded-full items-center justify-center'>
                        <Text className='text-xs font-semibold text-slate-600'>
                            {user?.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <Text className='flex-1 text-sm font-medium text-slate-900' numberOfLines={1}>{user?.name}</Text>
                </View>
                <Pressable
                    onPress={handleLogout}
                    className='flex-row items-center gap-3 px-4 py-3 rounded-lg active:bg-red-50 active:scale-[0.98] transition-all duration-150'>
                    <Ionicons name='log-out-outline' size={20} color='#dc2626' />
                    <Text className='text-sm font-medium text-red-600'>Sign Out</Text>
                </Pressable>
            </View>
        </View>
    )
}