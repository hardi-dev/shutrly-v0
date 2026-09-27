import { Alert } from "@/ui/patterns/alert/alert";

import { AccountSection } from "../account-section/account-section";
import { ChangePasswordForm } from "../change-password-form/change-password-form";
import { ProfileForm } from "../profile-form/profile-form";
import { ACCOUNT_SECTIONS_COPY as COPY } from "./account-sections.copy";
import type { AccountSectionsProps } from "./account-sections.types";

/**
 * The Profile page content (auth.pen t7CXVK; Google-only TInkk) in the 720 px centred column
 * (`size.content-narrow`). The password section exists only for password accounts (BR-AUTH-008).
 * @param props - the owner's view and the two server actions
 * @returns the sections
 */
export function AccountSections({
  account,
  updateName,
  changePassword,
  passwordChanged = false,
}: Readonly<AccountSectionsProps>) {
  return (
    <div className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-6)">
      <AccountSection title={COPY.profileTitle} lead={COPY.profileLead}>
        <ProfileForm email={account.email} name={account.name} action={updateName} />
      </AccountSection>
      {account.hasPassword ? (
        <AccountSection title={COPY.passwordTitle} lead={COPY.passwordLead}>
          <ChangePasswordForm action={changePassword} initialDone={passwordChanged} />
        </AccountSection>
      ) : (
        <Alert tone="info" title={COPY.googleOnlyTitle} body={COPY.googleOnlyBody} />
      )}
    </div>
  );
}
