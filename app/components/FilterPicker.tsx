import { Picker } from '@react-native-picker/picker'
import { Platform, View } from 'react-native'
export default function FilterPicker({ label, value, items, onChange }: {
    label?: string
    value: string
    items: { label: string, value: string }[]
    onChange: (v: string) => void
}) {
    return (
        <View className='flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden'>
            <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={{ height: Platform.OS === 'ios' ? 100 : 55, color: '#334155' }}
                itemStyle={{ fontSize: 15, height: Platform.OS === 'ios' ? 100 : 40 }}>
                {label && <Picker.Item label={label} value='all' />}
                {items.map(i => <Picker.Item key={i.value} label={i.label} value={i.value} />)}
            </Picker>
        </View>
    )
}