import { useState, type KeyboardEvent } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { currentUserId } from "@/data/todo"
import { formatJapanDate } from "@/lib/date"
import {
  canEditMember,
  ensureTaskNote,
  removeTaskNote,
  toggleTaskDone,
  updateTaskNote,
  updateTaskTitle,
} from "@/lib/tasks"
import { createTask, deleteTask, fetchTodoState, updateTask } from "@/lib/todo-server"
import type { Task } from "@/types/todo"
import { MemberColumn } from "@/routes/components/MemberColumn"

const TITLE_LIMIT = 80
const NOTE_LIMIT = 500

type TaskErrors = {
  title?: string
  note?: string
}

export const Route = createFileRoute("/")({
  component: App,
  loader: async () => await fetchTodoState(),
})

function App() {
  const initialData = Route.useLoaderData()
  const [tasks, setTasks] = useState<Task[]>(initialData.tasks)
  const [taskErrors, setTaskErrors] = useState<Record<number, TaskErrors>>({})
  const members = initialData.members
  const todayLabel = formatJapanDate(new Date())

  const isEditable = (memberId: string) => canEditMember(memberId, currentUserId)

  /**
   * チェック状態の切り替え
   * @param id タスクID
   * @param next 次の完了状態
   */
  const toggleTask = (id: number, next: boolean) => {
    setTasks((prev) => toggleTaskDone(prev, id, next, currentUserId))
    void updateTask({ data: { id, done: next } }).then((updatedTasks) => setTasks(updatedTasks))
  }

  const getTitleError = (title: string) =>
    title.length > TITLE_LIMIT ? `タイトルは${TITLE_LIMIT}文字以内で入力してください` : undefined
  const getNoteError = (note: string) =>
    note.length > NOTE_LIMIT ? `内容は${NOTE_LIMIT}文字以内で入力してください` : undefined

  const updateTaskErrors = (taskId: number, title: string, note: string | null | undefined) => {
    const nextErrors = {
      title: getTitleError(title),
      note: getNoteError(note ?? ""),
    }
    setTaskErrors((prev) => ({ ...prev, [taskId]: nextErrors }))
    return nextErrors
  }

  const commitTask = (task: Task, noteOverride?: string | null) => {
    const note = noteOverride ?? task.note ?? null
    const nextErrors = updateTaskErrors(task.id, task.title, note)
    if (nextErrors.title || nextErrors.note) {
      return Promise.resolve(null)
    }
    return updateTask({ data: { id: task.id, title: task.title, note } }).then((updatedTasks) => {
      setTasks(updatedTasks)
      setTaskErrors((prev) => ({ ...prev, [task.id]: {} }))
      return updatedTasks
    })
  }

  /**
   * タスク本文の更新
   * @param id タスクID
   * @param title 本文
   */
  const updateTitle = (id: number, title: string) => {
    setTasks((prev) => updateTaskTitle(prev, id, title, currentUserId))
    const existingNote = tasks.find((task) => task.id === id)?.note ?? null
    updateTaskErrors(id, title, existingNote)
  }

  /**
   * 備考の更新
   * @param id タスクID
   * @param note 備考
   */
  const updateNote = (id: number, note: string) => {
    setTasks((prev) => updateTaskNote(prev, id, note, currentUserId))
    const existingTitle = tasks.find((task) => task.id === id)?.title ?? ""
    updateTaskErrors(id, existingTitle, note)
  }

  /**
   * 備考欄を新規で確保
   * @param id タスクID
   */
  const ensureNote = (id: number) => {
    setTasks((prev) => ensureTaskNote(prev, id, currentUserId))
    const existingTitle = tasks.find((task) => task.id === id)?.title ?? ""
    updateTaskErrors(id, existingTitle, "")
  }

  /**
   * 備考欄の削除
   * @param id タスクID
   */
  const removeNote = (id: number) => {
    setTasks((prev) => removeTaskNote(prev, id, currentUserId))
    const existingTitle = tasks.find((task) => task.id === id)?.title ?? ""
    updateTaskErrors(id, existingTitle, null)
  }

  /**
   * 新しい行を挿入（自分の列のみ）
   * @param memberId メンバーID
   */
  const insertTask = (memberId: string) => {
    if (!isEditable(memberId)) return
    void createTask({ data: { memberId } }).then((updatedTasks) => setTasks(updatedTasks))
  }

  /**
   * Enterで保存、Shift+Enterで備考欄を追加（自分の列のみ）
   * @param event キーイベント
   * @param task 対象タスク
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>, task: Task) => {
    if (!isEditable(task.memberId)) return

    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault()
      ensureNote(task.id)
      void commitTask(task, task.note ?? "")
      return
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      void commitTask(task)
    }
  }

  /**
   * タスク削除（自分の列のみ）
   * @param id タスクID
   */
  const removeTask = (id: number) => {
    if (tasks.length <= 1) return
    void deleteTask({ data: { id } }).then((updatedTasks) => setTasks(updatedTasks))
  }

  return (
    <div className="flex h-screen flex-col bg-muted/30 py-10">
      <div className="pl-8">
        <p className="text-lg font-semibold text-muted-foreground">{todayLabel}</p>
      </div>
      <div className="flex-1 flex overflow-x-auto px-4 pb-4 pt-2">
        <div className="flex w-max gap-4">
          {members.map((member) => {
            const memberTasks = tasks.filter((task) => task.memberId === member.id)
            const doneCount = memberTasks.filter((task) => task.done).length
            const editable = isEditable(member.id)

            return (
              <MemberColumn
                key={member.id}
                member={member}
                tasks={memberTasks}
                doneCount={doneCount}
                editable={editable}
                taskErrors={taskErrors}
                onInsertTask={insertTask}
                onToggle={toggleTask}
                onUpdateTitle={updateTitle}
                onUpdateNote={updateNote}
                onEnsureNote={ensureNote}
                onRemoveNote={removeNote}
                onRemoveTask={removeTask}
                onKeyDown={handleKeyDown}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
