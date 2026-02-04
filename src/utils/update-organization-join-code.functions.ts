import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import type { Organization } from "@/types/organization"
import type { Env } from "@/types/server"
import { findOrganizationById } from "@/utils/find-organization-by-id.server"
import { generateJoinCode } from "@/utils/generate-join-code.server"
import { isAdminInOrganization } from "@/utils/is-admin-in-organization.server"
import { updateOrganizationJoinCode as updateOrganizationJoinCodeRow } from "@/utils/update-organization-join-code.server"

const updateJoinCodeInput = z.object({
	organizationId: z.string(),
	accountId: z.string(),
})

/**
 * 参加コードを再発行する。
 * @param ctx サーバー関数コンテキスト
 */
export const updateOrganizationJoinCode = createServerFn({ method: "POST" })
	.inputValidator(updateJoinCodeInput)
	.handler(async ({ data, context }) => {
		const database = getDatabase(context)
		const isAdmin = await isAdminInOrganization(
			database,
			data.accountId,
			data.organizationId,
		)
		if (!isAdmin) {
			throw new Error("管理者ではありません")
		}
		const nextJoinCode = generateJoinCode()
		await updateOrganizationJoinCodeRow(
			database,
			data.organizationId,
			nextJoinCode,
		)
		const organization = await findOrganizationById(
			database,
			data.organizationId,
		)
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
