import type { Organization } from "@/types/organization"
import type { D1Database } from "@/types/server"

type OrganizationRow = {
	id: string
	name: string
	join_code: string
}

/**
 * 組織を参加コードで取得する。
 * @param db D1データベース
 * @param joinCode 参加コード
 */
export async function findOrganizationByJoinCode(
	db: D1Database,
	joinCode: string,
): Promise<Organization | null> {
	const result = await db
		.prepare(
			"SELECT id, name, join_code FROM organizations WHERE join_code = ?1",
		)
		.bind(joinCode)
		.all<OrganizationRow>()
	const row = result.results[0]
	if (!row) return null
	return {
		id: row.id,
		name: row.name,
		joinCode: row.join_code,
	}
}
