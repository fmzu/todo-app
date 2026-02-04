/**
 * 参加コードを正規化する。
 * @param joinCode 参加コード
 */
export function normalizeJoinCode(joinCode: string | null | undefined): string | null {
  const normalized = joinCode?.trim().toUpperCase() ?? ""
  return normalized.length > 0 ? normalized : null
}

/**
 * 参加コードを生成する。
 */
export function generateJoinCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join("")
}
