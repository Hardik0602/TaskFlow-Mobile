import { API_URL } from '@/constants/api'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
type Task = {
    id: string
    title: string
    description: string
    category: string
    status: 'pending' | 'in_progress' | 'approved' | 'rejected'
    priority: 'low' | 'medium' | 'high'
    assignedTo: string
    submittedBy: string
    submittedDate: string
    dueDate: string
    details: Record<string, string>
}
type TaskContextType = {
    tasks: Task[]
    loading: boolean
    loadTasks: () => Promise<void>
    totalTasks: number
    completedTasks: number
    overdueTasks: number
    pendingTasks: number
    completionRate: number
}
const TaskContext = createContext<TaskContextType>(
    {} as TaskContextType
)
export function TaskProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const today = new Date()
    const loadTasks = async () => {
        if (!user) return
        setLoading(true)
        try {
            let url = `${API_URL}/tasks`
            if (user.role === 'manager') {
                url += `?assignedTo=${user.email}`
            }
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error('Failed to fetch tasks')
            }
            const data = await response.json()
            setTasks(data)
        } catch (error) {
            throw error
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        loadTasks()
    }, [user])
    const totalTasks = useMemo(() => {
        return tasks.length
    }, [tasks])
    const completedTasks = useMemo(() => {
        return tasks.filter(
            task => task.status !== 'pending'
        ).length
    }, [tasks])
    const pendingTasks = useMemo(() => {
        return tasks.filter(
            task => task.status === 'pending' && new Date(task.dueDate) >= today
        ).length
    }, [tasks])
    const overdueTasks = useMemo(() => {
        return tasks.filter(
            task => task.status === 'pending' && new Date(task.dueDate) < today
        ).length
    }, [tasks])
    const completionRate = useMemo(() => {
        if (totalTasks === 0) return 0
        return Math.round(
            (completedTasks / totalTasks) * 100
        )
    }, [completedTasks, totalTasks])
    return (
        <TaskContext.Provider
            value={{ tasks, loading, loadTasks, totalTasks, completedTasks, completionRate, overdueTasks, pendingTasks }}>
            {children}
        </TaskContext.Provider>
    )
}
export const useTasks = () => useContext(TaskContext)