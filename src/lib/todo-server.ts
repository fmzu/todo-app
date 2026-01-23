import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import type { Env } from "@/types/server"
import type { Member, Task } from "@/types/todo"
import { addTask, listMembers, listTasks, removeTask, updateTask as updateTaskRow } from "@/lib/todo-db"

type TodoState = {
  members: Member[]
  tasks: Task[]
}

const createTaskInput = z.object({
  memberId: z.string(),
  title: z.string().optional(),
})

const updateTaskInput = z.object({
  id: z.number().int(),
  title: z.string().optional(),
  note: z.string().nullable().optional(),
  done: z.boolean().optional(),
})

const removeTaskInput = z.object({
  id: z.number().int(),
})

/**
 * メンバー一覧とタスク一覧をまとめて取得する。
 * @param ctx サーバー関数コンテキスト
 */
export const fetchTodoState = createServerFn({ method: "GET" }).handler(async (ctx) => {
  const database = getDatabase(ctx.context)
  const members = await listMembers(database)
  const tasks = await listTasks(database)
  return { members, tasks } satisfies TodoState
})

/**
 * タスクを追加して最新一覧を返す。
 * @param ctx サーバー関数コンテキスト
 */
export const createTask = createServerFn({ method: "POST" })
  .inputValidator(createTaskInput)
  .handler(async (ctx) => {
    const database = getDatabase(ctx.context)
    const input = ctx.data
    await addTask(database, input.memberId, input.title ?? "")
    return await listTasks(database)
  })

/**
 * タスクを更新して最新一覧を返す。
 * @param ctx サーバー関数コンテキスト
 */
export const updateTask = createServerFn({ method: "POST" })
  .inputValidator(updateTaskInput)
  .handler(async (ctx) => {
    const database = getDatabase(ctx.context)
    const input = ctx.data
    await updateTaskRow(database, input.id, input.title, input.note, input.done)
    return await listTasks(database)
  })

/**
 * タスクを削除して最新一覧を返す。
 * @param ctx サーバー関数コンテキスト
 */
export const deleteTask = createServerFn({ method: "POST" })
  .inputValidator(removeTaskInput)
  .handler(async (ctx) => {
    const database = getDatabase(ctx.context)
    const input = ctx.data
    await removeTask(database, input.id)
    return await listTasks(database)
  })

/**
 * D1バインディングを取得する。
 * @param context リクエストコンテキスト
 */
function getDatabase(context: { env?: Env } | undefined): Env["DB"] {
  const env = context?.env
  if (!env || !env.DB) {
    throw new Error("Database binding is missing")
  }
  return env.DB
}
