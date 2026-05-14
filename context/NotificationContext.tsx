import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useTasks } from './TaskContext'
export type Notification = {
    id: string
    type: 'overdue' | 'dueSoon' | 'pending'
    taskId: string
    dueDate: string
    message: string
}
type NotificationContextType = {
    notifications: Notification[]
    unread: number
    readIds: Set<string>
    markRead: (id: string) => void
    markAllRead: () => void
    clearRead: () => void
}
const NotificationContext = createContext<NotificationContextType>(
    {} as NotificationContextType
)
export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { tasks } = useTasks()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [readIds, setReadIds] = useState(new Set<string>())
    useEffect(() => {
        const today = new Date()
        const threeDays = 3 * 24 * 60 * 60 * 1000
        const list: Notification[] = []
        tasks.forEach(task => {
            if (task.status !== 'pending') return
            const due = new Date(task.dueDate)
            const diff = due.getTime() - today.getTime()
            if (diff < 0) {
                list.push({
                    id: `${task.id}-overdue`,
                    type: 'overdue',
                    taskId: task.id,
                    dueDate: task.dueDate,
                    message: `${task.title} is overdue`
                })
            } else if (diff <= threeDays) {
                list.push({
                    id: `${task.id}-dueSoon`,
                    type: 'dueSoon',
                    taskId: task.id,
                    dueDate: task.dueDate,
                    message: `${task.title} is due soon`
                })
            } else {
                list.push({
                    id: `${task.id}-pending`,
                    type: 'pending',
                    taskId: task.id,
                    dueDate: task.dueDate,
                    message: `${task.title} is pending review`
                })
            }
        })
        const order = {
            overdue: 0,
            dueSoon: 1,
            pending: 2
        }
        const sorted = list.sort(
            (a, b) => order[a.type] - order[b.type]
        )
        setNotifications(sorted)
        setReadIds(prev => new Set(
            [...prev].filter(id => sorted.some(s => s.id === id))
        ))
    }, [tasks])
    const markRead = (id: string) => {
        setReadIds(
            prev => new Set([...prev, id])
        )
    }
    const markAllRead = () => {
        setReadIds(
            new Set(
                notifications.map(
                    notification => notification.id
                )
            )
        )
    }
    const clearRead = () => {
        console.log('re-enable if needed for testing in @/context/NotificationContext')
        // setReadIds(new Set())
    }
    const unread = useMemo(() => {
        return notifications.filter(
            notification => !readIds.has(notification.id)
        ).length
    }, [notifications, readIds])
    return (
        <NotificationContext.Provider
            value={{ notifications, readIds, markRead, markAllRead, clearRead, unread }}>
            {children}
        </NotificationContext.Provider>
    )
}
export const useNotifications = () => useContext(NotificationContext)