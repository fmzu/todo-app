import type { Task } from "@/types/todo"

export function getNextTaskId(tasks: Task[]): number {
  return Math.max(0, ...tasks.map((task) => task.id)) + 1
}

export function canEditMember(memberId: string, currentUserId: string): boolean {
  return memberId === currentUserId
}

export function canEditTask(task: Task, currentUserId: string): boolean {
  return canEditMember(task.memberId, currentUserId)
}

export function toggleTaskDone(tasks: Task[], id: number, next: boolean, currentUserId: string): Task[] {
  return tasks.map((task) => (task.id === id && canEditTask(task, currentUserId) ? { ...task, done: next } : task))
}

export function updateTaskTitle(tasks: Task[], id: number, title: string, currentUserId: string): Task[] {
  return tasks.map((task) => (task.id === id && canEditTask(task, currentUserId) ? { ...task, title } : task))
}

export function updateTaskNote(tasks: Task[], id: number, note: string, currentUserId: string): Task[] {
  return tasks.map((task) => (task.id === id && canEditTask(task, currentUserId) ? { ...task, note } : task))
}

export function ensureTaskNote(tasks: Task[], id: number, currentUserId: string): Task[] {
  return tasks.map((task) =>
    task.id === id && canEditTask(task, currentUserId) ? { ...task, note: task.note ?? "" } : task,
  )
}

export function removeTaskNote(tasks: Task[], id: number, currentUserId: string): Task[] {
  return tasks.map((task) => (task.id === id && canEditTask(task, currentUserId) ? { ...task, note: undefined } : task))
}

export function insertTask(tasks: Task[], memberId: string, nextId: number, currentUserId: string): Task[] {
  if (!canEditMember(memberId, currentUserId)) return tasks
  return [...tasks, { id: nextId, memberId, title: "", done: false, createdAt: new Date().toISOString() }]
}

export function removeTask(tasks: Task[], id: number, currentUserId: string): Task[] {
  if (tasks.length <= 1) return tasks
  return tasks.filter((task) => task.id !== id || !canEditTask(task, currentUserId))
}
