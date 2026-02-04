-- Add admin flag for accounts
ALTER TABLE accounts ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0;

-- Backfill the earliest account per organization as admin
UPDATE accounts
SET is_admin = 1
WHERE id IN (
  SELECT a.id
  FROM accounts a
  JOIN (
    SELECT organization_id, MIN(created_at) AS first_created
    FROM accounts
    GROUP BY organization_id
  ) f ON a.organization_id = f.organization_id AND a.created_at = f.first_created
);
