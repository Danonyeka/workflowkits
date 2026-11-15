# Website account setup

This applies to workflowkits.com resource accounts only. Do not change the POS database or its Google configuration.

## Before publishing

1. Connect the owner’s Vercel account for the existing workflowkits project.
2. Use the private PostgreSQL database already attached to the workflowkits Vercel project. Its connection string is configured as the sensitive production `ACCOUNT_DATABASE_URL`. Never commit the connection string. `migrations/001-resource-accounts.sql` defines the separate website-account table. `scripts/migrate-resource-accounts.cjs` backs up and imports the active file accounts and non-overlapping previous website database accounts, without changing the original tables. The migration was rehearsed with rollback and then applied; the active account ID, email and password hash were verified unchanged. Private backups are under the ignored `.vercel/private-backups` directory.
3. In Google Cloud, create an OAuth **Web application** client, with the consent screen configured for WorkflowKits. Add `https://workflowkits.com` as an authorised JavaScript origin. Add any other production origin only if it is actually used. Set its public client ID as `GOOGLE_CLIENT_ID` in Vercel. This Google Identity Services integration does not need a client secret. Complete any Google consent-screen publishing or verification requirements shown in that project.
4. Replace the previously exposed session signing secret with a strong private `JWT_SECRET` in Vercel. Coordinate this rotation: old website sessions and signed download links will stop working. Review and rotate the previously committed email-provider credential separately. Do not copy real credentials into Git or chat.
5. Deploy and verify the consent checkbox, Google popup, a new consenting test account, existing-account password linking and repeat sign-in using owner-controlled test accounts. Database connectivity and migration were verified; real Google sign-in and live consenting registration still require owner-controlled test accounts.

## Security follow-up

The current source no longer tracks `.env.local` or actual account records. Production `JWT_SECRET` was replaced privately. Old Git history may still contain previously committed credentials and account hashes; history cleanup and email-provider credential rotation remain separate owner actions. Do not restore private backups to the repository.

## Behaviour

- Without private database configuration, production registration is unavailable; existing legacy accounts can still use email/password sign-in.
- Without the Google client ID, Google access is disabled with an explanatory message.
- Google ID tokens are verified server-side by Google's official library and bound to a short-lived browser challenge.
- New Google registration supports Gmail and verified Google Workspace identities. Other Google email addresses need a separate ownership-verification flow and cannot register through Google yet.
- New registrations record the accepted terms version and server time. Existing users are not assigned fabricated acceptance records.
- Matching email addresses are never silently linked to existing password accounts.

Local tests use mocked Google identities and rejected registration requests; no real account acceptance is performed on behalf of the owner.
