/**
 * 参加コードを生成する。
 */
export function generateJoinCode(): string {
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	const bytes = new Uint8Array(6)
	crypto.getRandomValues(bytes)
	return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join(
		"",
	)
}
