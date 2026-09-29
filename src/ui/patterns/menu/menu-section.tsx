import type { ReactNode } from "react";
import { MenuSection as AriaMenuSection } from "react-aria-components";

import { cn } from "@/ui/cn/cn";

/** Groups menu rows under an optional overline label (C10). */
export function MenuSection({
  className,
  children,
}: Readonly<{ className?: string; children: ReactNode }>) {
  return <AriaMenuSection className={cn("flex flex-col", className)}>{children}</AriaMenuSection>;
}
