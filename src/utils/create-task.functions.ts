import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import type { Env } from "@/types/server"
import { addTask } from "@/utils/add-task.server"
import { isMemberInOrganization } from "@/utils/is-member-in-organization.server"
import { listTasksByOrganization } from "@/utils/list-tasks-by-organization.server"

const createTaskInput = z.object({
	memberId: z.string(),
	title: z.string().trim().max(80),
	organizationId: z.string(),
})

/**
 * タスクを追加して最新一覧を返す。
 * @param ctx サーバー関数コンテキスト
 */
export const createTask = createServerFn({ method: "POST" })
	.inputValidator(createTaskInput)
	.handler(async ({ data, context }) => {
		const database = getDatabase(context)
		const input = data
		const isAllowed = await isMemberInOrganization(
			database,
			input.memberId,
			input.organizationId,
		)
		if (!isAllowed) {
			throw new Error("メンバーが見つかりませんでした")
		}
		await addTask(database, input.memberId, input.title)
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
