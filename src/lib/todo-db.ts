import type { D1Database } from "@/types/server"
import type { Member, Task } from "@/types/todo"

type MemberRow = {
  id: string
  name: string
  sort_order: number
}

type TaskRow = {
  id: number
  member_id: string
  title: string
  note: string | null
  done: number
}

/**
 * メンバー一覧を並び順で取得する。
 * @param db D1データベース
 */
export async function listMembers(db: D1Database): Promise<Member[]> {
  const result = await db.prepare("SELECT id, name, sort_order FROM members ORDER BY sort_order ASC, id ASC").all<MemberRow>()
  return result.results.map((row) => ({
    id: row.id,
    name: row.name,
  }))
}

/**
 * タスク一覧をID順で取得する。
 * @param db D1データベース
 */
export async function listTasks(db: D1Database): Promise<Task[]> {
  const result = await db.prepare("SELECT id, member_id, title, note, done FROM tasks ORDER BY id ASC").all<TaskRow>()
  return result.results.map((row) => ({
    id: row.id,
    memberId: row.member_id,
    title: row.title,
    note: row.note ?? undefined,
    done: row.done === 1,
  }))
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
    throw new Error("Task not found")
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
  const result = await db.prepare("SELECT id, member_id, title, note, done FROM tasks WHERE id = ?1").bind(id).all<TaskRow>()
  const row = result.results[0]
  if (!row) return null
  return {
    id: row.id,
    memberId: row.member_id,
    title: row.title,
    note: row.note ?? undefined,
    done: row.done === 1,
  }
}
