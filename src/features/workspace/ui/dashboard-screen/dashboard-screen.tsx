import Link from "next/link";

import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { ToastOnMount } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";

import { DASHBOARD_COPY } from "./dashboard-screen.copy";
import type { DashboardScreenProps } from "./dashboard-screen.types";

/** Renders the empty workspace dashboard. @param props - workspace identity @returns the dashboard content */
export function DashboardScreen({
  workspaceId,
  workspaceName,
  created = false,
}: Readonly<DashboardScreenProps>) {
  return (
    <>
      {created ? (
        <ToastOnMount
          tone="success"
          title={DASHBOARD_COPY.created}
          dedupeKey={`workspace-created:${workspaceId}`}
        />
      ) : null}
      <div className="flex min-h-[480px] flex-col items-start gap-(--space-7)">
        <div className="flex w-full flex-col gap-(--space-1)">
          <h2 className="text-(length:--font-size-subtitle) font-semibold text-(--color-semantic-text-primary)">
            {DASHBOARD_COPY.greeting} {workspaceName}
          </h2>
          <p className="text-(length:--font-size-body) leading-(--font-line-height-body) text-(--color-semantic-text-secondary)">
            {DASHBOARD_COPY.subtitle}
          </p>
        </div>
        <EmptyState
          icon="camera"
          title={DASHBOARD_COPY.emptyTitle}
          body={DASHBOARD_COPY.emptyBody}
          action={
            <Link href={`/w/${workspaceId}/settings`}>
              <Button variant="secondary">{DASHBOARD_COPY.settings}</Button>
            </Link>
          }
        />
      </div>
    </>
  );
}
