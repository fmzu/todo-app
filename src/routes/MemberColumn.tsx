import { type KeyboardEvent } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Task, Member } from "./index"
import { TaskItem } from "./TaskItem"

type MemberColumnProps = {
  member: Member
  tasks: Task[]
  doneCount: number
  editable: boolean
  onInsertTask: (memberId: string) => void
  onToggle: (id: number, next: boolean) => void
  onUpdateTitle: (id: number, title: string) => void
  onUpdateNote: (id: number, note: string) => void
  onEnsureNote: (id: number) => void
  onRemoveNote: (id: number) => void
  onRemoveTask: (id: number) => void
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>, task: Task) => void
}

/**
 * メンバー1列分のタスクをまとめて表示するコンポーネント
 */
export function MemberColumn(props: MemberColumnProps) {
  const member = props.member
  const tasks = props.tasks
  const doneCount = props.doneCount
  const editable = props.editable
  const onInsertTask = props.onInsertTask
  const onToggle = props.onToggle
  const onUpdateTitle = props.onUpdateTitle
  const onUpdateNote = props.onUpdateNote
  const onEnsureNote = props.onEnsureNote
  const onRemoveNote = props.onRemoveNote
  const onRemoveTask = props.onRemoveTask
  const onKeyDown = props.onKeyDown

  return (
    <section className="relative w-[340px] shrink-0 p-4">
      <header className="sticky top-0 z-10 mb-3 flex items-center justify-between bg-transparent px-1 py-2">
        <div className="space-y-1">
          <p className="text-lg font-semibold">{member.name}</p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {doneCount} / {tasks.length} 完了
        </Badge>
      </header>

      <div className="space-y-4 pb-4">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            editable={editable}
            onToggle={onToggle}
            onUpdateTitle={onUpdateTitle}
            onUpdateNote={onUpdateNote}
            onEnsureNote={onEnsureNote}
            onRemoveNote={onRemoveNote}
            onRemoveTask={onRemoveTask}
            onKeyDown={onKeyDown}
          />
        ))}

        {editable && (
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={() => onInsertTask(member.id)}
          >
            + 行を追加
          </Button>
        )}
      </div>
    </section>
  )
}
