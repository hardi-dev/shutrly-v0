import type { PropsWithChildren } from "react";

import { AuthSplitLayout } from "@/features/auth/ui/auth-split-layout/auth-split-layout";

export default function AuthLayout({ children }: Readonly<PropsWithChildren>) {
  return <AuthSplitLayout>{children}</AuthSplitLayout>;
}
