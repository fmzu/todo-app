import type { KeyboardEvent } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TaskItem } from "@/routes/components/TaskItem"
import type { Member, Task } from "@/types/todo"

type Props = {
	member: Member
	tasks: Task[]
	doneCount: number
	editable: boolean
	taskErrors: Record<number, { title?: string; note?: string }>
	focusTaskId: number | null
	onFocusHandled: (id: number) => void
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
export function MemberColumn(props: Props) {
	const member = props.member
	const tasks = props.tasks
	const doneCount = props.doneCount
	const editable = props.editable
	const taskErrors = props.taskErrors
	const focusTaskId = props.focusTaskId
	const onFocusHandled = props.onFocusHandled
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
			<header className="sticky top-0 z-10 mb-3 flex items-center justify-between rounded-md bg-muted px-3 py-2">
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
						titleError={taskErrors[task.id]?.title}
						noteError={taskErrors[task.id]?.note}
						focusTaskId={focusTaskId}
						onFocusHandled={onFocusHandled}
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
						+ タスクを追加
					</Button>
				)}
			</div>
		</section>
	)
}
