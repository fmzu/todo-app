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
 * アカウントをメールアドレスで取得する。
 * @param db D1データベース
 * @param email メールアドレス
 */
export async function findAccountByEmail(
	db: D1Database,
	email: string,
): Promise<Account | null> {
	const result = await db
		.prepare(
			"SELECT id, email, name, organization_id, is_admin FROM accounts WHERE email = ?1",
		)
		.bind(email)
		.all<AccountRow>()
	const row = result.results[0]
	if (!row) return null
	return {
		id: row.id,
		email: row.email,
		name: row.name,
		organizationId: row.organization_id,
		isAdmin: row.is_admin === 1,
	}
}
