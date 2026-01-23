-- Add organization_id to members for scoping
ALTER TABLE members ADD COLUMN organization_id TEXT;

CREATE INDEX IF NOT EXISTS idx_members_org_id ON members(organization_id);
