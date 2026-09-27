import { resetPasswordAction } from "@/app/actions/auth/recovery";
import { isResetLinkUsable } from "@/composition/auth/recovery-flow/recovery-flow";
import { InvalidResetLinkScreen } from "@/features/auth/ui/invalid-reset-link-screen/invalid-reset-link-screen";
import { ResetPasswordScreen } from "@/features/auth/ui/reset-password-screen/reset-password-screen";

// RFaNT (form) and x5ds7 (invalid). Checking on open answers AC-AUTH-018 "opened".
export default async function ResetPasswordPage({
  searchParams,
}: Readonly<PageProps<"/reset-password">>) {
  const { token, state } = await searchParams;
  const linkToken = typeof token === "string" && state !== "invalid" ? token : "";
  if (!(await isResetLinkUsable(linkToken))) return <InvalidResetLinkScreen />;
  return <ResetPasswordScreen token={linkToken} action={resetPasswordAction} />;
}
