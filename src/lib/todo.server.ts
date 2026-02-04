import type { D1Database } from "@/types/server"
import type { Member, Task } from "@/types/todo"

type MemberRow = {
  id: string
  name: string
  sort_order: number
  organization_id: string | null
}

type TaskRow = {
  id: number
  member_id: string
  title: string
  note: string | null
  done: number
  created_at: string
}

/**
 * メンバー一覧を並び順で取得する。
 * @param db D1データベース
 */
/**
 * 組織配下のメンバー一覧を並び順で取得する。
 * @param db D1データベース
 * @param organizationId 組織ID
 */
export async function listMembersByOrganization(db: D1Database, organizationId: string): Promise<Member[]> {
  const result = await db
    .prepare(
      "SELECT id, name, sort_order, organization_id FROM members WHERE organization_id = ?1 ORDER BY sort_order ASC, id ASC",
    )
    .bind(organizationId)
    .all<MemberRow>()
  return result.results.map((row) => ({
    id: row.id,
    name: row.name,
  }))
}

/**
 * タスク一覧をID順で取得する。
 * @param db D1データベース
 */
/**
 * 組織配下のタスク一覧をID順で取得する。
 * @param db D1データベース
 * @param organizationId 組織ID
 */
export async function listTasksByOrganization(db: D1Database, organizationId: string): Promise<Task[]> {
  const result = await db
    .prepare(
      "SELECT tasks.id, tasks.member_id, tasks.title, tasks.note, tasks.done, tasks.created_at FROM tasks INNER JOIN members ON tasks.member_id = members.id WHERE members.organization_id = ?1 ORDER BY tasks.id ASC",
    )
    .bind(organizationId)
    .all<TaskRow>()
  return result.results.map((row) => ({
    id: row.id,
    memberId: row.member_id,
    title: row.title,
    note: row.note ?? undefined,
    done: row.done === 1,
    createdAt: row.created_at,
  }))
} 

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
    .prepare("SELECT MAX(sort_order) as maxSort FROM members WHERE organization_id = ?1")
    .bind(organizationId)
    .all<{ maxSort: number | null }>()
  const maxSort = result.results[0]?.maxSort ?? 0
  const nextSort = maxSort + 1
  await db
    .prepare("INSERT INTO members (id, name, sort_order, organization_id) VALUES (?1, ?2, ?3, ?4)")
    .bind(id, name, nextSort, organizationId)
    .run()
}

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
    .all<{ id: string }>()
  return Boolean(result.results[0])
}

/**
 * タスクが組織に属しているか確認する。
 * @param db D1データベース
 * @param taskId タスクID
 * @param organizationId 組織ID
 */
export async function isTaskInOrganization(
  db: D1Database,
  taskId: number,
  organizationId: string,
): Promise<boolean> {
  const result = await db
    .prepare(
      "SELECT tasks.id FROM tasks INNER JOIN members ON tasks.member_id = members.id WHERE tasks.id = ?1 AND members.organization_id = ?2",
    )
    .bind(taskId, organizationId)
    .all<{ id: number }>()
  return Boolean(result.results[0])
}

/**
 * タスクを新規追加する。
 * @param db D1データベース
 * @param memberId 担当メンバーID
 * @param title タスク本文
 */
export async function addTask(db: D1Database, memberId: string, title: string): Promise<void> {
  await db.prepare("INSERT INTO tasks (member_id, title, note, done) VALUES (?1, ?2, NULL, 0)").bind(memberId, title).run()
}

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
  const current = await getTaskById(db, id)
  if (!current) {
    throw new Error("タスクが見つかりませんでした")
  }

  const nextTitle = title ?? current.title
  const nextNote = note !== undefined ? note : current.note ?? null
  const nextDone = done ?? current.done

  await db.prepare("UPDATE tasks SET title = ?1, note = ?2, done = ?3, updated_at = datetime('now') WHERE id = ?4").bind(
    nextTitle,
    nextNote,
    nextDone ? 1 : 0,
    id,
  ).run()
}

/**
 * タスクを削除する。
 * @param db D1データベース
 * @param id タスクID
 */
export async function removeTask(db: D1Database, id: number): Promise<void> {
  await db.prepare("DELETE FROM tasks WHERE id = ?1").bind(id).run()
}

/**
 * タスクをIDで取得する。
 * @param db D1データベース
 * @param id タスクID
 */
async function getTaskById(db: D1Database, id: number): Promise<Task | null> {
  const result = await db
    .prepare("SELECT id, member_id, title, note, done, created_at FROM tasks WHERE id = ?1")
    .bind(id)
    .all<TaskRow>()
  const row = result.results[0]
  if (!row) return null
  return {
    id: row.id,
    memberId: row.member_id,
    title: row.title,
    note: row.note ?? undefined,
    done: row.done === 1,
    createdAt: row.created_at,
  }
}
