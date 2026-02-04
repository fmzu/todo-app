import type { D1Database } from "@/types/server";

/**
 * 組織配下のメンバーを新規作成する。
 * @param db D1データベース
 * @param id メンバーID
 * @param name 表示名
 * @param organizationId 組織ID
 */
export async function createMember(
	db: D1Database,
	id: string,
	name: string,
	organizationId: string,
): Promise<void> {
	const result = await db
		.prepare(
			"SELECT MAX(sort_order) as maxSort FROM members WHERE organization_id = ?1",
		)
		.bind(organizationId)
		.all<{ maxSort: number | null }>();
	const maxSort = result.results[0]?.maxSort ?? 0;
	const nextSort = maxSort + 1;
	await db
		.prepare(
			"INSERT INTO members (id, name, sort_order, organization_id) VALUES (?1, ?2, ?3, ?4)",
		)
		.bind(id, name, nextSort, organizationId)
		.run();
}
