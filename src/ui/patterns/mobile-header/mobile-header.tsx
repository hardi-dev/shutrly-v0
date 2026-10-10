import { WorkspacePill } from "../workspace-pill/workspace-pill";
import type { MobileHeaderProps } from "./mobile-header.types";

/** Renders the phone workspace pill (or a leading control), utilities and page heading. */
export function MobileHeader({
  workspace,
  title,
  subtitle,
  utilities,
  leading,
  onWorkspacePress,
}: Readonly<MobileHeaderProps>) {
  const start =
    leading ??
    (workspace === undefined ? null : (
      <WorkspacePill name={workspace} onPress={onWorkspacePress} />
    ));
  return (
    <header className="flex shrink-0 flex-col gap-(--space-4) pb-(--space-7) pl-(--space-4) pr-(--space-2) pt-[calc(var(--space-4)_+_env(safe-area-inset-top))]">
      {start || utilities ? (
        <div className="flex items-center justify-between gap-(--space-2)">
          {start}
          {utilities ? <div className="flex items-center gap-(--space-1)">{utilities}</div> : null}
        </div>
      ) : null}
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
