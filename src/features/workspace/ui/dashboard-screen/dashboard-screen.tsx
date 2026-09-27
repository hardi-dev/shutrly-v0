import Link from "next/link";

import { Button } from "@/ui/primitives/button/button";

import { DASHBOARD_COPY } from "./dashboard-screen.copy";
import type { DashboardScreenProps } from "./dashboard-screen.types";

/** Renders the empty workspace dashboard. @param props - workspace identity @returns the dashboard content */
export function DashboardScreen({ workspaceId, workspaceName }: Readonly<DashboardScreenProps>) {
  return (
    <div className="flex min-h-[480px] flex-col items-center justify-center gap-(--space-4) text-center">
      <p className="text-(--color-semantic-text-secondary)">{DASHBOARD_COPY.greeting}</p>
      <h1 className="text-(length:--font-size-display) font-bold">{workspaceName}</h1>
      <div className="max-w-(--size-content-narrow) rounded-(--radius-md) border border-(--color-semantic-border-default) bg-(--color-semantic-surface-panel) p-(--space-6)">
        <h2 className="text-(length:--font-size-title) font-bold">{DASHBOARD_COPY.emptyTitle}</h2>
        <p className="mt-(--space-2) text-(--color-semantic-text-secondary)">
          {DASHBOARD_COPY.emptyBody}
        </p>
        <Link href={`/w/${workspaceId}/settings`} className="mt-(--space-4) inline-block">
          <Button>{DASHBOARD_COPY.settings}</Button>
        </Link>
      </div>
    </div>
  );
}
