import { useMemo, useState, type KeyboardEvent } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { MemberColumn } from "./MemberColumn"

export const Route = createFileRoute("/")({ component: App })

export type Member = {
  id: string
  name: string
}

export type Task = {
  id: number
  memberId: string
  title: string
  note?: string
  done: boolean
}

const members: Member[] = [
  { id: "me", name: "自分" },
  { id: "alice", name: "アリス" },
  { id: "bob", name: "ボブ" },
]

const currentUserId = "me"

function App() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, memberId: "me", title: "今日の最優先タスク", note: "ゴールと期限を先に決める", done: false },
    { id: 2, memberId: "me", title: "ミーティングで聞きたいことを1つ", done: false },
    { id: 3, memberId: "me", title: "Enterで次の項目を追加できます", note: "Shift+Enterで備考を開いて補足を書く", done: false },
    { id: 4, memberId: "alice", title: "デザインレビューの準備", note: "最新のモックを共有", done: false },
    { id: 5, memberId: "alice", title: "バグ再現動画を撮る", done: true },
    { id: 6, memberId: "bob", title: "APIレスポンスの確認", done: false },
  ])

  const nextId = useMemo(() => Math.max(0, ...tasks.map((task) => task.id)) + 1, [tasks])

  const isEditable = (memberId: string) => memberId === currentUserId

  /**
   * チェック状態の切り替え
   * @param id タスクID
   * @param next 次の完了状態
   */
  const toggleTask = (id: number, next: boolean) => {
    setTasks((prev) => prev.map((task) => (task.id === id && isEditable(task.memberId) ? { ...task, done: next } : task)))
  }

  /**
   * タスク本文の更新
   * @param id タスクID
   * @param title 本文
   */
  const updateTitle = (id: number, title: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id && isEditable(task.memberId) ? { ...task, title } : task)))
  }

  /**
   * 備考の更新
   * @param id タスクID
   * @param note 備考
   */
  const updateNote = (id: number, note: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id && isEditable(task.memberId) ? { ...task, note } : task)))
  }

  /**
   * 備考欄を新規で確保
   * @param id タスクID
   */
  const ensureNote = (id: number) => {
    setTasks((prev) => prev.map((task) => (task.id === id && isEditable(task.memberId) ? { ...task, note: task.note ?? "" } : task)))
  }

  /**
   * 備考欄の削除
   * @param id タスクID
   */
  const removeNote = (id: number) => {
    setTasks((prev) => prev.map((task) => (task.id === id && isEditable(task.memberId) ? { ...task, note: undefined } : task)))
  }

  /**
   * 新しい行を挿入（自分の列のみ）
   * @param memberId メンバーID
   */
  const insertTask = (memberId: string) => {
    if (!isEditable(memberId)) return
    setTasks((prev) => [...prev, { id: nextId, memberId, title: "", done: false }])
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
    setTasks((prev) => (prev.length > 1 ? prev.filter((task) => task.id !== id || !isEditable(task.memberId)) : prev))
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
