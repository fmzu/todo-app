import type { D1Database } from "@/types/server";

/**
 * 組織を新規作成する。
 * @param db D1データベース
 * @param id 組織ID
 * @param name 組織名
 * @param joinCode 参加コード
 */
export async function createOrganization(
	db: D1Database,
	id: string,
	name: string,
	joinCode: string,
): Promise<void> {
	await db
		.prepare(
			"INSERT INTO organizations (id, name, join_code) VALUES (?1, ?2, ?3)",
		)
		.bind(id, name, joinCode)
		.run();
}
