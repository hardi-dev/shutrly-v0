import Link from "next/link";

import { Button } from "@/ui/primitives/button/button";

import { WORKSPACE_NOT_FOUND_COPY } from "./workspace-not-found-screen.copy";

/** Renders the workspace-scoped not-found state. @returns the not-found content */
export function WorkspaceNotFoundScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-(--space-4) p-(--space-6) text-center">
      <h1 className="text-(length:--font-size-display) font-bold">
        {WORKSPACE_NOT_FOUND_COPY.title}
      </h1>
      <p className="text-(--color-semantic-text-secondary)">{WORKSPACE_NOT_FOUND_COPY.body}</p>
      <Link href="/workspace">
        <Button variant="secondary">{WORKSPACE_NOT_FOUND_COPY.back}</Button>
      </Link>
    </div>
  );
}
