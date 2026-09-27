import { forgotPasswordAction } from "@/app/actions/auth/recovery";
import { redirectIfSignedIn } from "@/composition/auth/owner-guard/owner-guard";
import { ForgotPasswordScreen } from "@/features/auth/ui/forgot-password-screen/forgot-password-screen";
import { ResetSentScreen } from "@/features/auth/ui/reset-sent-screen/reset-sent-screen";

// o9WtCo (entry) and DccPx (?state=sent).
export default async function ForgotPasswordPage({
  searchParams,
}: Readonly<PageProps<"/forgot-password">>) {
  await redirectIfSignedIn();
  const { state } = await searchParams;
  if (state === "sent") return <ResetSentScreen />;
  return <ForgotPasswordScreen action={forgotPasswordAction} />;
}
