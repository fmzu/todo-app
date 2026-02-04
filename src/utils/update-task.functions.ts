import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import type { Env } from "@/types/server"
import { isTaskInOrganization } from "@/utils/is-task-in-organization.server"
import { listTasksByOrganization } from "@/utils/list-tasks-by-organization.server"
import { updateTask as updateTaskRow } from "@/utils/update-task.server"

const updateTaskInput = z.object({
	id: z.number().int(),
	title: z.string().trim().max(80).optional(),
	note: z.string().max(500).nullable().optional(),
	done: z.boolean().optional(),
	organizationId: z.string(),
})

/**
 * タスクを更新して最新一覧を返す。
 * @param ctx サーバー関数コンテキスト
 */
export const updateTask = createServerFn({ method: "POST" })
	.inputValidator(updateTaskInput)
	.handler(async ({ data, context }) => {
		const database = getDatabase(context)
		const input = data
		const isAllowed = await isTaskInOrganization(
			database,
			input.id,
			input.organizationId,
		)
		if (!isAllowed) {
			throw new Error("タスクが見つかりませんでした")
		}
		await updateTaskRow(database, input.id, input.title, input.note, input.done)
		return await listTasksByOrganization(database, input.organizationId)
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
