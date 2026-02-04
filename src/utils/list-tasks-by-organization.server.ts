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
 * 組織配下のタスク一覧をID順で取得する。
 * @param db D1データベース
 * @param organizationId 組織ID
 */
export async function listTasksByOrganization(
	db: D1Database,
	organizationId: string,
): Promise<Task[]> {
	const result = await db
		.prepare(
			"SELECT tasks.id, tasks.member_id, tasks.title, tasks.note, tasks.done, tasks.created_at FROM tasks INNER JOIN members ON tasks.member_id = members.id WHERE members.organization_id = ?1 ORDER BY tasks.id ASC",
		)
		.bind(organizationId)
		.all<TaskRow>();
	return result.results.map((row) => ({
		id: row.id,
		memberId: row.member_id,
		title: row.title,
		note: row.note ?? undefined,
		done: row.done === 1,
		createdAt: row.created_at,
	}));
}
