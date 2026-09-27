import type { PropsWithChildren } from "react";

import { SplitLayout } from "@/ui/patterns/split-layout/split-layout";

export default function AuthLayout({ children }: Readonly<PropsWithChildren>) {
  return <SplitLayout>{children}</SplitLayout>;
}
