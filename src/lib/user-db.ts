import type { D1Database } from "@/types/server"
import type { Account } from "@/types/account"
import type { Organization } from "@/types/organization"

type OrganizationRow = {
  id: string
  name: string
  join_code: string
}

type AccountRow = {
  id: string
  email: string
  name: string
  organization_id: string
}

/**
 * 参加コードから組織を取得する。
 * @param db D1データベース
 * @param joinCode 参加コード
 */
export async function findOrganizationByJoinCode(
  db: D1Database,
  joinCode: string,
): Promise<Organization | null> {
  const result = await db
    .prepare("SELECT id, name, join_code FROM organizations WHERE join_code = ?1")
    .bind(joinCode)
    .all<OrganizationRow>()
  const row = result.results[0]
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    joinCode: row.join_code,
  }
}

/**
 * 組織を新規作成する。
 * @param db D1データベース
 * @param id 組織ID
 * @param name 組織名
 * @param joinCode 参加コード
 */
export async function createOrganization(
  db: D1Database,
  id: string,
  name: string,
  joinCode: string,
): Promise<void> {
  await db
    .prepare("INSERT INTO organizations (id, name, join_code) VALUES (?1, ?2, ?3)")
    .bind(id, name, joinCode)
    .run()
}

/**
 * アカウントを新規作成する。
 * @param db D1データベース
 * @param account アカウント情報
 */
export async function createAccount(
  db: D1Database,
  account: Account,
): Promise<void> {
  await db
    .prepare(
      "INSERT INTO accounts (id, email, name, organization_id) VALUES (?1, ?2, ?3, ?4)",
    )
    .bind(account.id, account.email, account.name, account.organizationId)
    .run()
}

/**
 * 組織メンバーの一覧を取得する。
 * @param db D1データベース
 * @param organizationId 組織ID
 */
export async function listAccountsByOrganization(
  db: D1Database,
  organizationId: string,
): Promise<Account[]> {
  const result = await db
    .prepare(
      "SELECT id, email, name, organization_id FROM accounts WHERE organization_id = ?1 ORDER BY name ASC",
    )
    .bind(organizationId)
    .all<AccountRow>()
  return result.results.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    organizationId: row.organization_id,
  }))
}
