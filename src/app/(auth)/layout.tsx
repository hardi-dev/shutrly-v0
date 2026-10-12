import type { PropsWithChildren } from "react";

import { setDeviceLocaleAction } from "@/app/actions/locale/device";
import { AuthLanguageSwitch } from "@/features/auth/ui/auth-language-switch/auth-language-switch";
import { SplitLayout } from "@/ui/patterns/split-layout/split-layout";

export default function AuthLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <SplitLayout headerAction={<AuthLanguageSwitch action={setDeviceLocaleAction} />}>
      {children}
    </SplitLayout>
  );
}
