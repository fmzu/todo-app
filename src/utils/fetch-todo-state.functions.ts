import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import type { Env } from "@/types/server"
import type { Member, Task } from "@/types/todo"
import { listMembersByOrganization } from "@/utils/list-members-by-organization.server"
import { listTasksByOrganization } from "@/utils/list-tasks-by-organization.server"

type TodoState = {
	members: Member[]
	tasks: Task[]
}

const fetchTodoStateInput = z.object({
	organizationId: z.string(),
})

/**
 * メンバー一覧とタスク一覧をまとめて取得する。
 * @param ctx サーバー関数コンテキスト
 */
export const fetchTodoState = createServerFn({ method: "GET" })
	.inputValidator(fetchTodoStateInput)
	.handler(async ({ data, context }) => {
		const database = getDatabase(context)
		const members = await listMembersByOrganization(
			database,
			data.organizationId,
		)
		const tasks = await listTasksByOrganization(database, data.organizationId)
		return { members, tasks } satisfies TodoState
	})

/**
 * D1バインディングを取得する。
 * @param context リクエストコンテキスト
 */
function getDatabase(context: { env?: Env } | undefined): Env["DB"] {
	const env = context?.env
	if (!env || !env.DB) {
		throw new Error("データベース設定が見つかりません")
	}
	return env.DB
}
