import { cn } from "@/ui/cn/cn";
import { MobileHeader } from "@/ui/patterns/mobile-header/mobile-header";
import { PageHeader } from "@/ui/patterns/page-header/page-header";
import { Button } from "@/ui/primitives/button/button";

import { ClientHeader } from "../client-header/client-header";
import type { ClientShellProps } from "./client-shell.types";

/** The client page frame: brand bar, the Page Header with breadcrumb on desktop or the Mobile Header with a back button on phones, and the content column (local *Client Shell* a7uMtC / BhBua, D-21, A-26). @param props - gate names, header and content @returns the page */
export function ClientShell({ gate, header, width, children }: Readonly<ClientShellProps>) {
  const current = header.breadcrumbs.at(-1)?.label ?? header.title;
  return (
    <div className="flex min-h-dvh flex-col bg-(--color-semantic-surface-canvas)">
      <ClientHeader studioName={gate.studioName} projectTitle={gate.projectTitle} />
      <div className="hidden border-b border-(--color-semantic-border-subtle) bg-(--color-semantic-surface-panel) md:block">
        <div className="mx-auto w-full max-w-(--size-content-max)">
          <PageHeader
            parent={header.breadcrumbs.at(0)?.label ?? current}
            current={current}
            breadcrumbs={header.breadcrumbs}
            title={header.title}
            subtitle={header.subtitle}
            action={header.action}
          />
        </div>
      </div>
      <div className="bg-(--color-semantic-surface-panel) md:hidden">
        <MobileHeader title={header.title} subtitle={header.subtitle} />
      </div>
      <main className="flex flex-1 flex-col items-center p-(--space-4) md:px-(--space-10) md:py-(--space-7)">
        <div
          className={cn(
            "flex w-full flex-col gap-(--space-4) md:gap-(--space-7)",
            width === "narrow" ? "max-w-(--size-content-narrow)" : "max-w-(--size-content-max)",
          )}
        >
          {header.back ? (
            <Button
              variant="secondary"
              href={header.back.href}
              iconLeading="arrow-left"
              className="w-full md:hidden"
            >
              {header.back.label}
            </Button>
          ) : null}
          {children}
        </div>
      </main>
    </div>
  );
}
