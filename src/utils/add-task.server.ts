import type { D1Database } from "@/types/server";

/**
 * タスクを新規追加する。
 * @param db D1データベース
 * @param memberId 担当メンバーID
 * @param title タスク本文
 */
export async function addTask(
	db: D1Database,
	memberId: string,
	title: string,
): Promise<void> {
	await db
		.prepare(
			"INSERT INTO tasks (member_id, title, note, done) VALUES (?1, ?2, NULL, 0)",
		)
		.bind(memberId, title)
		.run();
}
