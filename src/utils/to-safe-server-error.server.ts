const DB_ERROR_PATTERNS = [
	/SQLITE/i,
	/D1/i,
	/database/i,
	/constraint/i,
	/no such table/i,
	/has no column/i,
]

/**
 * DB由来のエラーを安全なメッセージに変換する。
 * @param error エラー
 * @param fallback 変換後のフォールバックメッセージ
 */
export function toSafeServerError(error: unknown, fallback: string): Error {
	if (error instanceof Error) {
		const message = error.message ?? ""
		if (DB_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
			return new Error(fallback)
		}
		return error
	}
	return new Error(fallback)
}
