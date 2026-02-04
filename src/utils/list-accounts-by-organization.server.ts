import type { Account } from "@/types/account"
import type { D1Database } from "@/types/server"

type AccountRow = {
	id: string
	email: string
	name: string
	organization_id: string
	is_admin: number
}

/**
 * 組織配下のアカウント一覧を取得する。
 * @param db D1データベース
 * @param organizationId 組織ID
 */
export async function listAccountsByOrganization(
	db: D1Database,
	organizationId: string,
): Promise<Account[]> {
	const result = await db
		.prepare(
			"SELECT id, email, name, organization_id, is_admin FROM accounts WHERE organization_id = ?1 ORDER BY name ASC",
		)
		.bind(organizationId)
		.all<AccountRow>()
	return result.results.map((row) => ({
		id: row.id,
		email: row.email,
		name: row.name,
		organizationId: row.organization_id,
		isAdmin: row.is_admin === 1,
	}))
}
