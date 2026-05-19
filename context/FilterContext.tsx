import { API_URL } from '@/constants/api'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Task, useTasks } from './TaskContext'
type Filters = {
    category: string
    status: string
    priority: string
    assignedTo: string
}
type SortMode = 'due' | 'priority'
type FilterContextType = {
    filteredTasks: Task[]
    processedTasks: Record<string, Task[]>
    filters: Filters
    setFilters: React.Dispatch<React.SetStateAction<Filters>>
    sortMode: SortMode
    setSortMode: React.Dispatch<React.SetStateAction<SortMode>>
    categories: string[]
    statuses: string[]
    priorities: string[]
    assignedToList: AssignedToOption[]
    activeFiltersCount: number
    resetFilters: () => void
    users: User[]
}
type AssignedToOption = {
    label: string
    value: string
}
type User = {
    id: string
    name: string
    email: string
    role: 'admin' | 'manager'
}
const FilterContext = createContext<FilterContextType>({} as FilterContextType)
export function TaskFilterProvider({ children }: { children: React.ReactNode }) {
    const { tasks } = useTasks()
    const [users, setUsers] = useState<User[]>([])
    const today = new Date()
    const [sortMode, setSortMode] = useState<SortMode>('due')
    const [filters, setFilters] = useState<Filters>({
        category: 'all',
        status: 'all',
        priority: 'all',
        assignedTo: 'all'
    })
    const getUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/users`)
            if (!response.ok) {
                throw new Error('Failed to fetch users')
            }
            const data = await response.json()
            setUsers(data)
        } catch (error) {
            throw error
        }
    }
    useEffect(() => {
        getUsers()
    }, [tasks])
    const effectiveTasks = useMemo(() => {
        return tasks.map(task => {
            const overdue = task.status === 'pending' && new Date(task.dueDate) < today
            return {
                ...task,
                overdue,
                effectivePriority: overdue ? 'high' : task.priority
            }
        })
    }, [tasks])
    const filteredTasks = useMemo(() => {
        return effectiveTasks.filter(task => {
            if (filters.category !== 'all' && task.category !== filters.category) {
                return false
            }
            if (filters.status !== 'all' && task.status !== filters.status) {
                return false
            }
            if (filters.priority !== 'all' && task.effectivePriority !== filters.priority) {
                return false
            }
            if (filters.assignedTo !== 'all' && task.assignedTo !== filters.assignedTo) {
                return false
            }
            return true
        })
    }, [effectiveTasks, filters])
    const statusOrder = {
        overdue: 0,
        pending: 1,
        in_progress: 2,
        approved: 3,
        rejected: 3
    }
    const priorityOrder = {
        high: 0,
        medium: 1,
        low: 2
    }
    const sortedTasks = useMemo(() => {
        return [...filteredTasks].sort(
            (a, b) => {
                const aStatus = a.overdue ? 'overdue' : a.status
                const bStatus = b.overdue ? 'overdue' : b.status
                const statusCompare = statusOrder[aStatus] - statusOrder[bStatus]
                if (statusCompare !== 0) {
                    return statusCompare
                }
                return sortMode === 'due'
                    ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                    : priorityOrder[a.effectivePriority] - priorityOrder[b.effectivePriority]
            }
        )
    }, [filteredTasks, sortMode])
    const processedTasks = useMemo(() => {
        return sortedTasks.reduce((acc: Record<string, Task[]>, task) => {
            if (!acc[task.category]) {
                acc[task.category] = []
            }
            acc[task.category].push(task)
            return acc
        }, {})
    }, [sortedTasks])
    const categories = useMemo(() => {
        return [
            ...new Set(tasks.map(task => task.category))
        ]
    }, [tasks])
    const statuses = useMemo(() => {
        return [
            ...new Set(tasks.map(task => task.status))
        ]
    }, [tasks])
    const priorities = useMemo(() => {
        return [
            ...new Set(tasks.map(task => task.priority))
        ]
    }, [tasks])
    const activeFiltersCount = useMemo(() =>
        (filters.category !== 'all' ? 1 : 0) +
        (filters.status !== 'all' ? 1 : 0) +
        (filters.priority !== 'all' ? 1 : 0) +
        (filters.assignedTo !== 'all' ? 1 : 0)
        , [filters])
    const assignedToList = useMemo(() => {
        return users.filter(
            user => user.role === 'manager'
        ).map(user => ({
            label: user.name,
            value: user.email
        }))
    }, [users])
    const resetFilters = () => setFilters({ category: 'all', status: 'all', priority: 'all', assignedTo: 'all' })
    return (
        <FilterContext.Provider
            value={{ filteredTasks, processedTasks, filters, setFilters, sortMode, setSortMode, categories, statuses, priorities, assignedToList, activeFiltersCount, resetFilters, users }}>
            {children}
        </FilterContext.Provider>
    )
}
export const useTaskFilters = () => useContext(FilterContext)