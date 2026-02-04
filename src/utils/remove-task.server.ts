import type { D1Database } from "@/types/server"

/**
 * タスクを削除する。
 * @param db D1データベース
 * @param id タスクID
 */
export async function removeTask(db: D1Database, id: number): Promise<void> {
	await db.prepare("DELETE FROM tasks WHERE id = ?1").bind(id).run()
}
