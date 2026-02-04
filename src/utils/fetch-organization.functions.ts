import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import type { Organization } from "@/types/organization"
import type { Env } from "@/types/server"
import { findOrganizationById } from "@/utils/find-organization-by-id.server"

const fetchOrganizationInput = z.object({
	organizationId: z.string(),
})

/**
 * 組織を取得する。
 * @param ctx サーバー関数コンテキスト
 */
export const fetchOrganization = createServerFn({ method: "GET" })
	.inputValidator(fetchOrganizationInput)
	.handler(async ({ data, context }) => {
		const database = getDatabase(context)
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
