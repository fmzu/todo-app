import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Env } from "@/types/server";
import { isTaskInOrganization } from "@/utils/is-task-in-organization.server";
import { listTasksByOrganization } from "@/utils/list-tasks-by-organization.server";
import { removeTask } from "@/utils/remove-task.server";

const removeTaskInput = z.object({
	id: z.number().int(),
	organizationId: z.string(),
});

/**
 * タスクを削除して最新一覧を返す。
 * @param ctx サーバー関数コンテキスト
 */
export const deleteTask = createServerFn({ method: "POST" })
	.inputValidator(removeTaskInput)
	.handler(async ({ data, context }) => {
		const database = getDatabase(context);
		const input = data;
		const isAllowed = await isTaskInOrganization(
			database,
			input.id,
			input.organizationId,
		);
		if (!isAllowed) {
			throw new Error("タスクが見つかりませんでした");
		}
		await removeTask(database, input.id);
		return await listTasksByOrganization(database, input.organizationId);
	});

/**
 * D1バインディングを取得する。
 * @param context リクエストコンテキスト
 */
function getDatabase(context: { env?: Env } | undefined): Env["DB"] {
	const env = context?.env;
	if (!env || !env.DB) {
		throw new Error("データベース設定が見つかりません");
	}
	return env.DB;
}
