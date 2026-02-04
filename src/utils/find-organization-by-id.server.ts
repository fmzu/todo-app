import type { Organization } from "@/types/organization"
import type { D1Database } from "@/types/server"

type OrganizationRow = {
	id: string
	name: string
	join_code: string
}

/**
 * 組織IDで組織を取得する。
 * @param db D1データベース
 * @param organizationId 組織ID
 */
export async function findOrganizationById(
	db: D1Database,
	organizationId: string,
): Promise<Organization | null> {
	const result = await db
		.prepare("SELECT id, name, join_code FROM organizations WHERE id = ?1")
		.bind(organizationId)
		.all<OrganizationRow>()
	const row = result.results[0]
	if (!row) return null
	return {
		id: row.id,
		name: row.name,
		joinCode: row.join_code,
	}
}
