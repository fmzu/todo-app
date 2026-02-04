import type { D1Database } from "@/types/server";
import type { Task } from "@/types/todo";

type TaskRow = {
	id: number;
	member_id: string;
	title: string;
	note: string | null;
	done: number;
	created_at: string;
};

/**
 * タスク内容を更新する。
 * @param db D1データベース
 * @param id タスクID
 * @param title タスク本文
 * @param note 備考
 * @param done 完了フラグ
 */
export async function updateTask(
	db: D1Database,
	id: number,
	title: string | undefined,
	note: string | null | undefined,
	done: boolean | undefined,
): Promise<void> {
	const current = await getTaskById(db, id);
	if (!current) {
		throw new Error("タスクが見つかりませんでした");
	}

	const nextTitle = title ?? current.title;
	const nextNote = note !== undefined ? note : (current.note ?? null);
	const nextDone = done ?? current.done;

	await db
		.prepare(
			"UPDATE tasks SET title = ?1, note = ?2, done = ?3, updated_at = datetime('now') WHERE id = ?4",
		)
		.bind(nextTitle, nextNote, nextDone ? 1 : 0, id)
		.run();
}

/**
 * タスクをIDで取得する。
 * @param db D1データベース
 * @param id タスクID
 */
async function getTaskById(db: D1Database, id: number): Promise<Task | null> {
	const result = await db
		.prepare(
			"SELECT id, member_id, title, note, done, created_at FROM tasks WHERE id = ?1",
		)
		.bind(id)
		.all<TaskRow>();
	const row = result.results[0];
	if (!row) return null;
	return {
		id: row.id,
		memberId: row.member_id,
		title: row.title,
		note: row.note ?? undefined,
		done: row.done === 1,
		createdAt: row.created_at,
	};
}
