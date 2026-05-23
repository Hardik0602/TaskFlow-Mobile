import { Ionicons } from '@expo/vector-icons'
import { useEffect, useRef } from 'react'
import { Animated, Text, View } from 'react-native'
type Color = 'purple' | 'amber' | 'red' | 'blue' | 'green'
const colorMap: Record<Color, { bg: string; icon: string; text: string; border: string }> = {
    purple: { bg: '#faf5ff', icon: '#7c3aed', text: '#6d28d9', border: '#e9d5ff' },
    amber: { bg: '#fffbeb', icon: '#d97706', text: '#b45309', border: '#fde68a' },
    red: { bg: '#fef2f2', icon: '#dc2626', text: '#b91c1c', border: '#fecaca' },
    blue: { bg: '#eff6ff', icon: '#2563eb', text: '#1d4ed8', border: '#bfdbfe' },
    green: { bg: '#f0fdf4', icon: '#16a34a', text: '#15803d', border: '#bbf7d0' }
}
type StatCardProps = {
    title: string
    value: number
    icon: keyof typeof Ionicons.glyphMap
    color: Color
    subtitle?: string
    delay: number
}
export default function StatCard({ title, value, icon, color, subtitle, delay }: StatCardProps) {
    const c = colorMap[color]
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
            style={{ opacity, transform: [{ translateY }], backgroundColor: c.bg, borderColor: c.border }}
            className='flex-1 flex-row items-center justify-between p-4 rounded-2xl border'>
            <View className='flex-1 gap-3'>
                <Text className='text-md font-semibold text-slate-500'>{title}</Text>
                <View>
                    <Text style={{ color: c.text }} className='text-2xl font-bold'>{value}</Text>
                    {subtitle && <Text className='text-sm text-slate-400 mt-1' numberOfLines={1}>{subtitle}</Text>}
                </View>
            </View>
            <Ionicons name={icon} size={35} color={c.icon} />
        </Animated.View>
    )
}