import { useState, type KeyboardEvent } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { currentUserId } from "@/data/todo"
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

export const Route = createFileRoute("/")({
  component: App,
  loader: async () => await fetchTodoState(),
})

function App() {
  const initialData = Route.useLoaderData()
  const [tasks, setTasks] = useState<Task[]>(initialData.tasks)
  const members = initialData.members

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

  const commitTask = (task: Task, noteOverride?: string | null) => {
    const note = noteOverride ?? task.note ?? null
    return updateTask({ data: { id: task.id, title: task.title, note } }).then((updatedTasks) => {
      setTasks(updatedTasks)
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
  }

  /**
   * 備考の更新
   * @param id タスクID
   * @param note 備考
   */
  const updateNote = (id: number, note: string) => {
    setTasks((prev) => updateTaskNote(prev, id, note, currentUserId))
  }

  /**
   * 備考欄を新規で確保
   * @param id タスクID
   */
  const ensureNote = (id: number) => {
    setTasks((prev) => ensureTaskNote(prev, id, currentUserId))
  }

  /**
   * 備考欄の削除
   * @param id タスクID
   */
  const removeNote = (id: number) => {
    setTasks((prev) => removeTaskNote(prev, id, currentUserId))
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
   * Enterで次の行を追加、Shift+Enterで備考欄を追加（自分の列のみ）
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
    <div className="flex h-screen flex-col bg-muted/30 py-10 space-y-2">
      <div className="flex-1 flex overflow-x-auto px-4 pb-4">
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
