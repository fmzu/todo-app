import type { D1Database } from "@/types/server"
import type { Member } from "@/types/todo"

type MemberRow = {
	id: string
	name: string
	sort_order: number
	organization_id: string | null
}

/**
 * 組織配下のメンバー一覧を並び順で取得する。
 * @param db D1データベース
 * @param organizationId 組織ID
 */
export async function listMembersByOrganization(
	db: D1Database,
	organizationId: string,
): Promise<Member[]> {
	const result = await db
		.prepare(
			"SELECT id, name, sort_order, organization_id FROM members WHERE organization_id = ?1 ORDER BY sort_order ASC, id ASC",
		)
		.bind(organizationId)
		.all<MemberRow>()
	return result.results.map((row) => ({
		id: row.id,
		name: row.name,
	}))
}
