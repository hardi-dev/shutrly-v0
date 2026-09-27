import { changePasswordAction, updateDisplayNameAction } from "@/app/actions/auth/profile";
import { loadProfile } from "@/composition/auth/profile-flow/profile-flow";
import { AccountSections } from "@/features/auth/ui/account-sections/account-sections";

// t7CXVK / TInkk. The (owner) layout from F-02 supplies the App Shell (R-6).
export default async function ProfilePage() {
  const account = await loadProfile();
  return (
    <AccountSections
      account={account}
      updateName={updateDisplayNameAction}
      changePassword={changePasswordAction}
    />
  );
}
