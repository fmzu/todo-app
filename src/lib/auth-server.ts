import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import type { Env } from "@/types/server"
import type { Account } from "@/types/account"
import { findAccountByEmail } from "@/lib/auth-db"
import { createAccount as createAccountRow, createOrganization, findOrganizationByJoinCode } from "@/lib/user-db"
import { createMember } from "@/lib/todo-db"

const createAccountInput = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("メールアドレスの形式が正しくありません"),
  name: z
    .string()
    .min(1, "名前を入力してください")
    .max(80, "名前は80文字以内で入力してください"),
  joinCode: z.string().nullable().optional(),
})

const fetchAccountInput = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("メールアドレスの形式が正しくありません"),
})

/**
 * アカウントを作成して参加コードがあれば組織に参加する。
 * @param ctx サーバー関数コンテキスト
 */
export const createAccount = createServerFn({ method: "POST" })
  .inputValidator(createAccountInput)
  .handler(async (ctx) => {
    const database = getDatabase(ctx.context)
    const input = ctx.data
    const joinCode = normalizeJoinCode(input.joinCode)

    let organizationId = ""

    if (joinCode) {
      const organization = await findOrganizationByJoinCode(database, joinCode)
      if (!organization) {
        throw new Error("参加コードが見つかりませんでした")
      }
      organizationId = organization.id
    } else {
      const nextOrganizationId = crypto.randomUUID()
      const generatedJoinCode = generateJoinCode()
      await createOrganization(database, nextOrganizationId, `${input.name}のタスク`, generatedJoinCode)
      organizationId = nextOrganizationId
    }

    const account: Account = {
      id: crypto.randomUUID(),
      email: input.email,
      name: input.name,
      organizationId,
    }

    await createAccountRow(database, account)
    await createMember(database, account.id, account.name, organizationId)

    return account
  })

/**
 * メールアドレスでアカウントを取得する。
 * @param ctx サーバー関数コンテキスト
 */
export const fetchAccountByEmail = createServerFn({ method: "GET" })
  .inputValidator(fetchAccountInput)
  .handler(async (ctx) => {
    const database = getDatabase(ctx.context)
    return await findAccountByEmail(database, ctx.data.email)
  })

function normalizeJoinCode(joinCode: string | null | undefined): string | null {
  const normalized = joinCode?.trim().toUpperCase() ?? ""
  return normalized.length > 0 ? normalized : null
}

function generateJoinCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join("")
}

function getDatabase(context: { env?: Env } | undefined): Env["DB"] {
  const env = context?.env
  if (!env || !env.DB) {
    throw new Error("Database binding is missing")
  }
  return env.DB
}
