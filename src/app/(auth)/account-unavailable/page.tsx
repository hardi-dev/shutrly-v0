import { logoutAction } from "@/app/actions/auth/login";
import { AccountUnavailableScreen } from "@/features/auth/ui/account-unavailable-screen/account-unavailable-screen";

// kXr5x. Static: no owner data (BR-AUTH-005).
export default function AccountUnavailablePage() {
  return <AccountUnavailableScreen signOutAction={logoutAction} />;
}
