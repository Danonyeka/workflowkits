CREATE TABLE IF NOT EXISTS workflowkits_password_resets (
  token_hash text PRIMARY KEY,
  user_id text NOT NULL REFERENCES workflowkits_resource_accounts(id),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS workflowkits_password_resets_user ON workflowkits_password_resets(user_id);
CREATE TABLE IF NOT EXISTS workflowkits_auth_limits (
  key_hash text PRIMARY KEY,
  attempts integer NOT NULL,
  expires_at timestamptz NOT NULL
);
