import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Env } from "@/types/server";
import { findAccountByEmail } from "@/utils/find-account-by-email.server";

const fetchAccountInput = z.object({
	email: z
		.string()
		.min(1, "メールアドレスを入力してください")
		.email("メールアドレスの形式が正しくありません"),
});

/**
 * メールアドレスでアカウントを取得する。
 * @param ctx サーバー関数コンテキスト
 */
export const fetchAccountByEmail = createServerFn({ method: "GET" })
	.inputValidator(fetchAccountInput)
	.handler(async ({ data, context }) => {
		const database = getDatabase(context);
		return await findAccountByEmail(database, data.email);
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
