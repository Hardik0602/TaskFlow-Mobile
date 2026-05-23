import { useEffect, useRef } from "react"
import { Animated, Text, View } from "react-native"
type ProgressBarProps = {
    label: string
    value: number
    total: number
    color: string
    delay: number
    loading: boolean
}
export default function ProgressBar({ label, value, total, color, delay, loading }: ProgressBarProps) {
    const progressAnim = useRef(new Animated.Value(0)).current
    useEffect(() => {
        if (loading) return
        progressAnim.setValue(0)
        Animated.timing(progressAnim, {
            toValue: total > 0 ? (value / total) * 100 : 0,
            duration: 600,
            delay,
            useNativeDriver: false
        }).start()
    }, [loading])
    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%']
    })
    return (
        <View>
            <View className='flex-row items-center justify-between mb-1.5'>
                <Text className='text-sm font-medium text-slate-700'>{label}</Text>
                <Text className='text-sm font-semibold text-slate-900'>{value}</Text>
            </View>
            <View className='h-2 bg-slate-100 rounded-full overflow-hidden'>
                <Animated.View style={{ width: progressWidth, backgroundColor: color }} className='h-2 rounded-full' />
            </View>
        </View>
    )
}