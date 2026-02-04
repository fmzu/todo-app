import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import type { Env } from "@/types/server"
import type { Member, Task } from "@/types/todo"
import {
  addTask,
  isMemberInOrganization,
  isTaskInOrganization,
  listMembersByOrganization,
  listTasksByOrganization,
  removeTask,
  updateTask as updateTaskRow,
} from "@/lib/todo.server"

type TodoState = {
  members: Member[]
  tasks: Task[]
}

const createTaskInput = z.object({
  memberId: z.string(),
  title: z.string().trim().max(80),
  organizationId: z.string(),
})

const updateTaskInput = z.object({
  id: z.number().int(),
  title: z.string().trim().max(80).optional(),
  note: z.string().max(500).nullable().optional(),
  done: z.boolean().optional(),
  organizationId: z.string(),
})

const removeTaskInput = z.object({
  id: z.number().int(),
  organizationId: z.string(),
})

const fetchTodoStateInput = z.object({
  organizationId: z.string(),
})

/**
 * メンバー一覧とタスク一覧をまとめて取得する。
 * @param ctx サーバー関数コンテキスト
 */
export const fetchTodoState = createServerFn({ method: "GET" })
  .inputValidator(fetchTodoStateInput)
  .handler(async ({ data, context }) => {
    const database = getDatabase(context)
    const members = await listMembersByOrganization(database, data.organizationId)
    const tasks = await listTasksByOrganization(database, data.organizationId)
    return { members, tasks } satisfies TodoState
  })

/**
 * タスクを追加して最新一覧を返す。
 * @param ctx サーバー関数コンテキスト
 */
export const createTask = createServerFn({ method: "POST" })
  .inputValidator(createTaskInput)
  .handler(async ({ data, context }) => {
    const database = getDatabase(context)
    const input = data
    const isAllowed = await isMemberInOrganization(database, input.memberId, input.organizationId)
    if (!isAllowed) {
      throw new Error("メンバーが見つかりませんでした")
    }
    await addTask(database, input.memberId, input.title)
    return await listTasksByOrganization(database, input.organizationId)
  })

/**
 * タスクを更新して最新一覧を返す。
 * @param ctx サーバー関数コンテキスト
 */
export const updateTask = createServerFn({ method: "POST" })
  .inputValidator(updateTaskInput)
  .handler(async ({ data, context }) => {
    const database = getDatabase(context)
    const input = data
    const isAllowed = await isTaskInOrganization(database, input.id, input.organizationId)
    if (!isAllowed) {
      throw new Error("タスクが見つかりませんでした")
    }
    await updateTaskRow(database, input.id, input.title, input.note, input.done)
    return await listTasksByOrganization(database, input.organizationId)
  })

/**
 * タスクを削除して最新一覧を返す。
 * @param ctx サーバー関数コンテキスト
 */
export const deleteTask = createServerFn({ method: "POST" })
  .inputValidator(removeTaskInput)
  .handler(async ({ data, context }) => {
    const database = getDatabase(context)
    const input = data
    const isAllowed = await isTaskInOrganization(database, input.id, input.organizationId)
    if (!isAllowed) {
      throw new Error("タスクが見つかりませんでした")
    }
    await removeTask(database, input.id)
    return await listTasksByOrganization(database, input.organizationId)
  })

/**
 * D1バインディングを取得する。
 * @param context リクエストコンテキスト
 */
function getDatabase(context: { env?: Env } | undefined): Env["DB"] {
  const env = context?.env
  if (!env || !env.DB) {
    throw new Error("データベース設定が見つかりません")
  }
  return env.DB
}
