import type { AppPanelProps, PageContentProps } from "./app-panel.types";

/** Renders the white working surface and page-level header (C28). */
export function AppPanel({ title, actions, children }: Readonly<AppPanelProps>) {
  const titleId = `app-panel-title-${title.toLowerCase().replaceAll(" ", "-")}`;

  return (
    <main
      aria-labelledby={titleId}
      className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-(--component-panel-app-radius) border border-(--component-panel-app-border) bg-(--component-panel-background)"
    >
      <header className="flex h-[72px] shrink-0 items-center justify-between gap-(--component-panel-app-header-gap) border-b border-(--component-panel-app-border) px-(--component-panel-app-header-padding-x)">
        <h1
          id={titleId}
          className="text-(--component-panel-app-title) text-[18px] font-bold tracking-[-0.4px]"
        >
          {title}
        </h1>
        {actions ? (
          <div className="flex items-center gap-(--component-panel-app-header-gap)">{actions}</div>
        ) : null}
      </header>
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
