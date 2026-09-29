import { WorkspacePill } from "../workspace-pill/workspace-pill";
import type { MobileHeaderProps } from "./mobile-header.types";

/** Renders the phone workspace pill, utilities and page heading. */
export function MobileHeader({
  workspace,
  title,
  subtitle,
  utilities,
  onWorkspacePress,
}: Readonly<MobileHeaderProps>) {
  return (
    <header className="flex shrink-0 flex-col gap-(--space-4) pb-(--space-7) pl-(--space-4) pr-(--space-2) pt-[calc(var(--space-4)_+_env(safe-area-inset-top))]">
      <div className="flex items-center justify-between gap-(--space-2)">
        <WorkspacePill name={workspace} onPress={onWorkspacePress} />
        <div className="flex items-center gap-(--space-1)">{utilities}</div>
      </div>
      <div className="flex flex-col gap-(--space-1) pr-(--space-2)">
        <h1 className="text-(length:--font-size-heading) leading-(--font-line-height-tight) font-bold tracking-(--font-letter-spacing-heading) text-(--color-semantic-text-primary)">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-(length:--font-size-body) leading-(--font-line-height-body) text-(--color-semantic-text-secondary)">
            {subtitle}
          </p>
        ) : null}
      </div>
    </header>
  );
}
