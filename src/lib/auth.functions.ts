import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import type { Env } from "@/types/server"
import type { Account } from "@/types/account"
import { findAccountByEmail } from "@/lib/auth.server"
import { createAccount as createAccountRow, createOrganization, findOrganizationByJoinCode } from "@/lib/user.server"
import { createMember } from "@/lib/todo.server"
import { generateJoinCode, normalizeJoinCode } from "@/lib/join-code.server"

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
  .handler(async ({ data, context }) => {
    const database = getDatabase(context)
    const input = data
    const joinCode = normalizeJoinCode(input.joinCode)

    let organizationId = ""
    let isAdmin = false

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
      isAdmin = true
    }

    const account: Account = {
      id: crypto.randomUUID(),
      email: input.email,
      name: input.name,
      organizationId,
      isAdmin,
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
  .handler(async ({ data, context }) => {
    const database = getDatabase(context)
    return await findAccountByEmail(database, data.email)
  })

function getDatabase(context: { env?: Env } | undefined): Env["DB"] {
  const env = context?.env
  if (!env || !env.DB) {
    throw new Error("データベース設定が見つかりません")
  }
  return env.DB
}
