import PasswordRecovery from "@/components/PasswordRecovery";
export const metadata = { title: "Reset password | WorkflowKits", robots: { index: false, follow: false }, referrer: "no-referrer" as const };
export default function ResetPasswordPage() { return <PasswordRecovery reset />; }
