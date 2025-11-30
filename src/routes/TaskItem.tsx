import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import type { Task } from "./index"

type Props = {
  task: Task
  editable: boolean
  onToggle: (id: number, next: boolean) => void
  onUpdateTitle: (id: number, title: string) => void
  onUpdateNote: (id: number, note: string) => void
  onEnsureNote: (id: number) => void
  onRemoveNote: (id: number) => void
  onRemoveTask: (id: number) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>, task: Task) => void
}

/**
 * タスク1件の表示と編集を担当するコンポーネント
 */
export function TaskItem(props: Props) {
  const task = props.task
  const editable = props.editable
  const onToggle = props.onToggle
  const onUpdateTitle = props.onUpdateTitle
  const onUpdateNote = props.onUpdateNote
  const onEnsureNote = props.onEnsureNote
  const onRemoveNote = props.onRemoveNote
  const onRemoveTask = props.onRemoveTask
  const onKeyDown = props.onKeyDown

  return (
    <div className="flex flex-col gap-2 px-2">
      <div className="flex gap-4">
        <div className="pt-2">
          <Checkbox
            checked={task.done}
            onCheckedChange={(checked) => editable && onToggle(task.id, Boolean(checked))}
            aria-label="完了"
            disabled={!editable}
          />
        </div>
        <div className="flex-1">
          <Textarea
            value={task.title}
            onChange={(event) => editable && onUpdateTitle(task.id, event.target.value)}
            onKeyDown={(event) => onKeyDown(event, task)}
            readOnly={!editable}
            rows={task.title.includes("\n") ? Math.min(5, task.title.split("\n").length + 1) : 2}
            placeholder="タスクを書いてEnterで次を追加"
            className="min-h-10 resize-none border-none bg-transparent px-0 py-2 text-base shadow-none focus-visible:border-transparent focus-visible:ring-0"
          />
        </div>
        {editable && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="この行を削除"
            onClick={() => onRemoveTask(task.id)}
            className="text-muted-foreground"
          >
            ×
          </Button>
        )}
      </div>

      {task.note !== undefined ? (
        <div className="group/note ml-8 flex items-start gap-2 rounded-md bg-muted/30 px-4 py-2 text-sm">
          <Textarea
            value={task.note}
            onChange={(event) => editable && onUpdateNote(task.id, event.target.value)}
            readOnly={!editable}
            placeholder="補足やリンクなどを書く"
            rows={task.note.includes("\n") ? Math.min(5, task.note.split("\n").length + 1) : 2}
            className="min-h-20 flex-1 resize-none border-none bg-transparent px-0 shadow-none focus-visible:border-transparent focus-visible:ring-0"
          />
          {editable && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="備考を削除"
              onClick={() => onRemoveNote(task.id)}
              className="text-muted-foreground opacity-0 transition group-hover/note:opacity-100 group-focus-within/note:opacity-100"
            >
              ×
            </Button>
          )}
        </div>
      ) : (
        editable && (
          <div className="flex items-center gap-2 pl-10">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => onEnsureNote(task.id)}
            >
              備考を追加
            </Button>
          </div>
        )
      )}
    </div>
  )
}
