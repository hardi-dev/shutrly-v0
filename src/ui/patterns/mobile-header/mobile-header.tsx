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
    <header className="flex shrink-0 flex-col gap-(--space-3) border-b border-(--color-semantic-border-subtle) bg-(--color-semantic-surface-panel) px-(--space-4) pb-(--space-4) pt-(--space-3)">
      <div className="flex items-center justify-between gap-(--space-2)">
        <WorkspacePill name={workspace} onPress={onWorkspacePress} />
        <div className="flex items-center gap-(--space-1)">{utilities}</div>
      </div>
      <div>
        <h1 className="text-(--color-semantic-text-primary) text-(length:--font-size-heading) font-bold">
          {title}
        </h1>
        {subtitle ? <p className="text-(--color-semantic-text-secondary)">{subtitle}</p> : null}
      </div>
    </header>
  );
}
