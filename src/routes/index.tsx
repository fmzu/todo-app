import { useMemo, useState, type KeyboardEvent } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { members, currentUserId, initialTasks } from "@/data/todo"
import {
  canEditMember,
  ensureTaskNote,
  getNextTaskId,
  insertTask as insertTaskEntry,
  removeTask as removeTaskEntry,
  removeTaskNote,
  toggleTaskDone,
  updateTaskNote,
  updateTaskTitle,
} from "@/lib/tasks"
import type { Task } from "@/types/todo"
import { MemberColumn } from "@/routes/components/MemberColumn"

export const Route = createFileRoute("/")({ component: App })

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const nextId = useMemo(() => getNextTaskId(tasks), [tasks])

  const isEditable = (memberId: string) => canEditMember(memberId, currentUserId)

  /**
   * チェック状態の切り替え
   * @param id タスクID
   * @param next 次の完了状態
   */
  const toggleTask = (id: number, next: boolean) => {
    setTasks((prev) => toggleTaskDone(prev, id, next, currentUserId))
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
    setTasks((prev) => insertTaskEntry(prev, memberId, nextId, currentUserId))
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
      return
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      insertTask(task.memberId)
    }
  }

  /**
   * タスク削除（自分の列のみ）
   * @param id タスクID
   */
  const removeTask = (id: number) => {
    setTasks((prev) => removeTaskEntry(prev, id, currentUserId))
  }

  return (
    <div className="flex h-screen flex-col bg-muted/30 py-10 space-y-2">
      <div className="mx-auto w-full max-w-6xl space-y-4 px-4">
        <header className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">きょうのフォーカス</p>
              <h1 className="text-2xl font-bold leading-tight sm:text-3xl">メンバーごとのタスク</h1>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">
            自分の列だけ編集できます。他のメンバーのタスクは閲覧専用。Enterで次の行を追加、Shift+Enterで備考欄を開けます。
          </p>
        </header>
      </div>

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

