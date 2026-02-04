import type { D1Database } from "@/types/server";

/**
 * 管理者かどうか判定する。
 * @param db D1データベース
 * @param accountId アカウントID
 * @param organizationId 組織ID
 */
export async function isAdminInOrganization(
	db: D1Database,
	accountId: string,
	organizationId: string,
): Promise<boolean> {
	const result = await db
		.prepare(
			"SELECT id FROM accounts WHERE id = ?1 AND organization_id = ?2 AND is_admin = 1",
		)
		.bind(accountId, organizationId)
		.all<{ id: string }>();
	return Boolean(result.results[0]);
}
