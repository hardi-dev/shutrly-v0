import { useTranslations } from "next-intl";

import { Alert } from "@/ui/patterns/alert/alert";

import { AccountSection } from "../account-section/account-section";
import { ChangePasswordForm } from "../change-password-form/change-password-form";
import { ProfileForm } from "../profile-form/profile-form";
import { ACCOUNT_SECTIONS_COPY_NAMESPACE } from "./account-sections.copy";
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
  const t = useTranslations(ACCOUNT_SECTIONS_COPY_NAMESPACE);
  return (
    <div className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-6)">
      <AccountSection title={t("profileTitle")} lead={t("profileLead")}>
        <ProfileForm email={account.email} name={account.name} action={updateName} />
      </AccountSection>
      {account.hasPassword ? (
        <AccountSection title={t("passwordTitle")} lead={t("passwordLead")}>
          <ChangePasswordForm action={changePassword} initialDone={passwordChanged} />
        </AccountSection>
      ) : (
        <Alert tone="info" title={t("googleOnlyTitle")} body={t("googleOnlyBody")} />
      )}
    </div>
  );
}
