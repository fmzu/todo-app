import type { Account } from "@/types/account"
import type { D1Database } from "@/types/server"

/**
 * アカウントを新規作成する。
 * @param db D1データベース
 * @param account アカウント情報
 */
export async function createAccount(
	db: D1Database,
	account: Account,
): Promise<void> {
	await db
		.prepare(
			"INSERT INTO accounts (id, email, name, organization_id, is_admin) VALUES (?1, ?2, ?3, ?4, ?5)",
		)
		.bind(
			account.id,
			account.email,
			account.name,
			account.organizationId,
			account.isAdmin ? 1 : 0,
		)
		.run()
}
