import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import type { Env } from "@/types/server"
import type { Organization } from "@/types/organization"
import {
  findOrganizationById,
  isAdminInOrganization,
  updateOrganizationJoinCode as updateOrganizationJoinCodeRow,
} from "@/lib/user.server"
import { generateJoinCode } from "@/lib/join-code.server"

const fetchOrganizationInput = z.object({
  organizationId: z.string(),
})

const updateJoinCodeInput = z.object({
  organizationId: z.string(),
  accountId: z.string(),
})

/**
 * 組織情報を取得する。
 * @param ctx サーバー関数コンテキスト
 */
export const fetchOrganization = createServerFn({ method: "GET" })
  .inputValidator(fetchOrganizationInput)
  .handler(async ({ data, context }) => {
    const database = getDatabase(context)
    const organization = await findOrganizationById(database, data.organizationId)
    if (!organization) {
      throw new Error("組織が見つかりませんでした")
    }
    return organization satisfies Organization
  })

/**
 * 参加コードを再発行する（管理者のみ）。
 * @param ctx サーバー関数コンテキスト
 */
export const updateOrganizationJoinCode = createServerFn({ method: "POST" })
  .inputValidator(updateJoinCodeInput)
  .handler(async ({ data, context }) => {
    const database = getDatabase(context)
    const isAdmin = await isAdminInOrganization(database, data.accountId, data.organizationId)
    if (!isAdmin) {
      throw new Error("権限がありません")
    }
    const nextJoinCode = generateJoinCode()
    await updateOrganizationJoinCodeRow(database, data.organizationId, nextJoinCode)
    const organization = await findOrganizationById(database, data.organizationId)
    if (!organization) {
      throw new Error("組織が見つかりませんでした")
    }
    return organization satisfies Organization
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
