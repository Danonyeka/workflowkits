# Website account setup

This applies to workflowkits.com resource accounts only. Do not change the POS database or its Google configuration.

## Before publishing

1. Connect the owner’s Vercel account for the existing workflowkits project.
2. Create a private PostgreSQL database dedicated to this website. Set its TLS-enabled connection string as `ACCOUNT_DATABASE_URL` in Vercel. Never commit the connection string. The application creates `workflowkits_resource_accounts` and imports legacy accounts without replacing existing records. Take a private backup and verify the preserved account IDs and password hashes before removing any legacy records.
3. In Google Cloud, create an OAuth **Web application** client, with the consent screen configured for WorkflowKits. Add `https://workflowkits.com` as an authorised JavaScript origin. Add any other production origin only if it is actually used. Set its public client ID as `GOOGLE_CLIENT_ID` in Vercel. This Google Identity Services integration does not need a client secret. Complete any Google consent-screen publishing or verification requirements shown in that project.
4. Replace the previously exposed session signing secret with a strong private `JWT_SECRET` in Vercel. Coordinate this rotation: old website sessions and signed download links will stop working. Review and rotate the previously committed email-provider credential separately. Do not copy real credentials into Git or chat.
5. Deploy and verify the consent checkbox, Google popup, a new consenting test account, existing-account password linking and repeat sign-in using owner-controlled test accounts. Verify records persist across deployments. These real-provider and database checks have not been performed locally.

## Behaviour

- Without private database configuration, production registration is unavailable; existing legacy accounts can still use email/password sign-in.
- Without the Google client ID, Google access is disabled with an explanatory message.
- Google ID tokens are verified server-side by Google's official library and bound to a short-lived browser challenge.
- New Google registration supports Gmail and verified Google Workspace identities. Other Google email addresses need a separate ownership-verification flow and cannot register through Google yet.
- New registrations record the accepted terms version and server time. Existing users are not assigned fabricated acceptance records.
- Matching email addresses are never silently linked to existing password accounts.

Local tests use mocked Google identities and rejected registration requests; no real account acceptance is performed on behalf of the owner.
