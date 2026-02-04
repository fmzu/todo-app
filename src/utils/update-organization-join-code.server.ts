import type { D1Database } from "@/types/server"

/**
 * 組織の参加コードを更新する。
 * @param db D1データベース
 * @param organizationId 組織ID
 * @param joinCode 参加コード
 */
export async function updateOrganizationJoinCode(
	db: D1Database,
	organizationId: string,
	joinCode: string,
): Promise<void> {
	await db
		.prepare("UPDATE organizations SET join_code = ?1 WHERE id = ?2")
		.bind(joinCode, organizationId)
		.run()
}
