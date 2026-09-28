import { PageHeader } from "../page-header/page-header";
import type { AppPanelProps, PageContentProps } from "./app-panel.types";

/** Renders the white working surface and page-level header (C28). */
export function AppPanel({
  title,
  parent = "Workspace",
  subtitle,
  utilities,
  actions,
  children,
}: Readonly<AppPanelProps>) {
  return (
    <main
      aria-label={title}
      className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-(--component-panel-app-radius) border border-(--component-panel-app-border) bg-(--component-panel-app-background)"
    >
      <PageHeader
        parent={parent}
        current={title}
        title={title}
        subtitle={subtitle}
        utilities={utilities}
        action={actions}
      />
      {children}
    </main>
  );
}

/** Constrains page sections inside the App Panel content region (C28). */
export function PageContent({ children }: Readonly<PageContentProps>) {
  return (
    <div className="w-full flex-1 overflow-y-auto px-(--component-panel-app-content-padding-x) py-(--component-panel-app-content-padding-y)">
      <div className="mx-auto flex w-full max-w-[1096px] flex-col gap-(--component-panel-app-content-gap)">
        {children}
      </div>
    </div>
  );
}
