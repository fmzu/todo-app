import type { D1Database } from "@/types/server";

/**
 * メンバーが組織に属しているか確認する。
 * @param db D1データベース
 * @param memberId メンバーID
 * @param organizationId 組織ID
 */
export async function isMemberInOrganization(
	db: D1Database,
	memberId: string,
	organizationId: string,
): Promise<boolean> {
	const result = await db
		.prepare("SELECT id FROM members WHERE id = ?1 AND organization_id = ?2")
		.bind(memberId, organizationId)
		.all<{ id: string }>();
	return Boolean(result.results[0]);
}
