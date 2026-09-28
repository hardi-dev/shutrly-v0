import { logoutAction } from "@/app/actions/auth/login";
import { createFirstWorkspaceAction } from "@/app/actions/workspace/onboarding";
import { loadOnboardingAccount } from "@/composition/workspace/owner-workspace/owner-workspace";
import { OnboardingScreen } from "@/features/workspace/ui/onboarding-screen/onboarding-screen";

export default async function OnboardingPage() {
  const account = await loadOnboardingAccount();
  return (
    <OnboardingScreen
      accountName={account.name}
      accountEmail={account.email}
      action={createFirstWorkspaceAction}
      signOutAction={logoutAction}
    />
  );
}
