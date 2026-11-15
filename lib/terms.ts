export const TERMS_VERSION = "2026-11-15";
export const TERMS_EFFECTIVE_DATE = "15 November 2026";

export function termsAcceptanceError(accepted: unknown, version: unknown): string | null {
  if (accepted !== true) return "Please accept the Terms and Conditions before creating an account.";
  if (version !== TERMS_VERSION) return "The Terms and Conditions have changed. Refresh this page, review the current terms and accept them to continue.";
  return null;
}
