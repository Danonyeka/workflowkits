CREATE TABLE IF NOT EXISTS workflowkits_resource_accounts (
  id text PRIMARY KEY,
  email text UNIQUE NOT NULL,
  google_subject text UNIQUE,
  record jsonb NOT NULL
);
