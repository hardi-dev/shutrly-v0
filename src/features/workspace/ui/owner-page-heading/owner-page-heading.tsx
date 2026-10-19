import { CompactBarTitle } from "@/ui/patterns/compact-bar/compact-bar";
import { HeaderTitle } from "@/ui/patterns/page-header/page-header";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import type { OwnerPageHeadingProps } from "./owner-page-heading.types";

/**
 * The detail page heading, rendered on the server so it is in the first HTML: the desktop title block
 * (title, status chip, meta line) and the phone back link with its title. Each copy is hidden on the
 * other breakpoint, and the shell places this node in its desktop Page Header and its phone compact bar.
 * @param props - the title, status, meta, parent and phone back label
 * @returns the desktop and phone heading
 */
export function OwnerPageHeading({
  title,
  subtitle,
  meta,
  status,
  parent,
  backLabel,
}: Readonly<OwnerPageHeadingProps>) {
  const line = meta ?? subtitle;
  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col gap-(--space-1-5) max-md:hidden">
        <HeaderTitle title={title} adornment={status ? <StatusChip {...status} /> : undefined} />
        {line ? (
          <p className="text-(length:--font-size-body) text-(--component-page-header-subtitle)">
            {line}
          </p>
        ) : null}
      </div>
      <div className="contents md:hidden">
        <CompactBarTitle backLabel={backLabel} title={title} parent={parent} />
      </div>
    </>
  );
}
