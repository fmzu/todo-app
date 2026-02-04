/**
 * 参加コードを正規化する。
 * @param joinCode 参加コード
 */
export function normalizeJoinCode(
	joinCode: string | null | undefined,
): string | null {
	const normalized = joinCode?.trim().toUpperCase() ?? "";
	return normalized.length > 0 ? normalized : null;
}
