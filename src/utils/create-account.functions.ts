import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Account } from "@/types/account";
import type { Env } from "@/types/server";
import { createAccount as createAccountRow } from "@/utils/create-account.server";
import { createMember } from "@/utils/create-member.server";
import { createOrganization } from "@/utils/create-organization.server";
import { findOrganizationByJoinCode } from "@/utils/find-organization-by-join-code.server";
import { generateJoinCode } from "@/utils/generate-join-code.server";
import { normalizeJoinCode } from "@/utils/normalize-join-code.server";

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
});

/**
 * アカウントを作成する。
 * @param ctx サーバー関数コンテキスト
 */
export const createAccount = createServerFn({ method: "POST" })
	.inputValidator(createAccountInput)
	.handler(async ({ data, context }) => {
		const database = getDatabase(context);
		const input = data;
		const joinCode = normalizeJoinCode(input.joinCode);

		let organizationId = "";
		let isAdmin = false;

		if (joinCode) {
			const organization = await findOrganizationByJoinCode(database, joinCode);
			if (!organization) {
				throw new Error("参加コードが見つかりませんでした");
			}
			organizationId = organization.id;
		} else {
			const nextOrganizationId = crypto.randomUUID();
			const generatedJoinCode = generateJoinCode();
			await createOrganization(
				database,
				nextOrganizationId,
				`${input.name}のタスク`,
				generatedJoinCode,
			);
			organizationId = nextOrganizationId;
			isAdmin = true;
		}

		const account: Account = {
			id: crypto.randomUUID(),
			email: input.email,
			name: input.name,
			organizationId,
			isAdmin,
		};

		await createAccountRow(database, account);
		await createMember(database, account.id, account.name, organizationId);

		return account;
	});

/**
 * D1バインディングを取得する。
 * @param context リクエストコンテキスト
 */
function getDatabase(context: { env?: Env } | undefined): Env["DB"] {
	const env = context?.env;
	if (!env || !env.DB) {
		throw new Error("データベース設定が見つかりません");
	}
	return env.DB;
}
