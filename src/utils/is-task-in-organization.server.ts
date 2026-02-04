import type { D1Database } from "@/types/server"

/**
 * タスクが組織に属しているか確認する。
 * @param db D1データベース
 * @param taskId タスクID
 * @param organizationId 組織ID
 */
export async function isTaskInOrganization(
	db: D1Database,
	taskId: number,
	organizationId: string,
): Promise<boolean> {
	const result = await db
		.prepare(
			"SELECT tasks.id FROM tasks INNER JOIN members ON tasks.member_id = members.id WHERE tasks.id = ?1 AND members.organization_id = ?2",
		)
		.bind(taskId, organizationId)
		.all<{ id: number }>()
	return Boolean(result.results[0])
}
