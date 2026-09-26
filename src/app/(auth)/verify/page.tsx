import { redirect } from "next/navigation";

import { resendVerificationAction } from "@/app/actions/auth/register";
import { loadVerifyPage } from "@/composition/auth/verify-flow/verify-flow";
import { InvalidVerifyLinkScreen } from "@/features/auth/ui/invalid-verify-link-screen/invalid-verify-link-screen";
import { VerifyPendingScreen } from "@/features/auth/ui/verify-pending-screen/verify-pending-screen";

// p3NbDB (pending) and TIvfA (invalid link, ?state=invalid).
export default async function VerifyPage({ searchParams }: Readonly<PageProps<"/verify">>) {
  const [{ state }, page] = await Promise.all([searchParams, loadVerifyPage()]);
  if (page.kind === "REDIRECT") redirect(page.path);
  if (state === "invalid") {
    return (
      <InvalidVerifyLinkScreen canResend={page.canResend} resendAction={resendVerificationAction} />
    );
  }
  if (!page.canResend) redirect("/login");
  return <VerifyPendingScreen canResend resendAction={resendVerificationAction} />;
}
