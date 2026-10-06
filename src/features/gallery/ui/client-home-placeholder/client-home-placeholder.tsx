import type { ClientGateView } from "@/features/gallery/application/use-cases/resolve-client-access/resolve-client-access.types";

import { ClientHeader } from "../client-header/client-header";
import { CLIENT_HOME_PLACEHOLDER_COPY as COPY } from "./client-home-placeholder.copy";

/** A signed-in placeholder until Beranda lands (plan Slice 2). @param gate - the gate view @returns the page */
export function ClientHomePlaceholder({ gate }: Readonly<{ gate: ClientGateView }>) {
  return (
    <div className="flex min-h-dvh flex-col bg-(--color-semantic-surface-canvas)">
      <ClientHeader studioName={gate.studioName} projectTitle={gate.projectTitle} />
      <main className="mx-auto w-full max-w-(--size-content-max) p-(--space-4)">
        <h1 className="text-(length:--font-size-heading) font-bold text-(--color-semantic-text-primary)">
          {COPY.title(gate.clientFirstName)}
        </h1>
      </main>
    </div>
  );
}
