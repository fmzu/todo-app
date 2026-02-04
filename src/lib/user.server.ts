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
  is_admin: number
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
      "INSERT INTO accounts (id, email, name, organization_id, is_admin) VALUES (?1, ?2, ?3, ?4, ?5)",
    )
    .bind(account.id, account.email, account.name, account.organizationId, account.isAdmin ? 1 : 0)
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
      "SELECT id, email, name, organization_id, is_admin FROM accounts WHERE organization_id = ?1 ORDER BY name ASC",
    )
    .bind(organizationId)
    .all<AccountRow>()
  return result.results.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    organizationId: row.organization_id,
    isAdmin: row.is_admin === 1,
  }))
}

/**
 * 組織IDで組織情報を取得する。
 * @param db D1データベース
 * @param organizationId 組織ID
 */
export async function findOrganizationById(
  db: D1Database,
  organizationId: string,
): Promise<Organization | null> {
  const result = await db
    .prepare("SELECT id, name, join_code FROM organizations WHERE id = ?1")
    .bind(organizationId)
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
 * 参加コードを更新する。
 * @param db D1データベース
 * @param organizationId 組織ID
 * @param joinCode 参加コード
 */
export async function updateOrganizationJoinCode(
  db: D1Database,
  organizationId: string,
  joinCode: string,
): Promise<void> {
  await db
    .prepare("UPDATE organizations SET join_code = ?1 WHERE id = ?2")
    .bind(joinCode, organizationId)
    .run()
}

/**
 * 管理者アカウントか確認する。
 * @param db D1データベース
 * @param accountId アカウントID
 * @param organizationId 組織ID
 */
export async function isAdminInOrganization(
  db: D1Database,
  accountId: string,
  organizationId: string,
): Promise<boolean> {
  const result = await db
    .prepare("SELECT id FROM accounts WHERE id = ?1 AND organization_id = ?2 AND is_admin = 1")
    .bind(accountId, organizationId)
    .all<{ id: string }>()
  return Boolean(result.results[0])
}
