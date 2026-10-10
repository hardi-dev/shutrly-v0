import { Icon } from "@/ui/primitives/icon/icon";

import { ClientHeader } from "../client-header/client-header";
import { ClientPasswordForm } from "../client-password-form/client-password-form";
import { CLIENT_GATE_SCREEN_COPY as COPY } from "./client-gate-screen.copy";
import type { ClientGateScreenProps } from "./client-gate-screen.types";

/** The gallery password page (gerbang A3bQ0 / XIUZy, AC-ACC-001…003, -007). @param props - the gate view and the sign-in action @returns the page */
export function ClientGateScreen({ gate, action }: Readonly<ClientGateScreenProps>) {
  return (
    <div className="flex min-h-dvh flex-col bg-(--color-semantic-surface-canvas)">
      <ClientHeader studioName={gate.studioName} projectTitle={gate.projectTitle} />
      <main className="flex flex-1 flex-col items-center px-(--space-4) py-(--space-6) md:justify-center md:p-(--space-10)">
        <section
          aria-labelledby="client-gate-title"
          className="flex w-full max-w-(--size-auth-form) flex-col gap-(--space-6) rounded-(--radius-lg) border border-(--color-semantic-border-subtle) bg-(--color-semantic-surface-panel) p-(--space-5) md:p-(--space-8)"
        >
          <div className="flex flex-col gap-(--space-3)">
            <span className="flex size-(--space-12) items-center justify-center rounded-(--radius-full) bg-(--color-semantic-surface-subtle) text-(--color-semantic-text-primary)">
              <Icon name="lock" size="lg" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-(--space-1)">
              <h1
                id="client-gate-title"
                className="text-(length:--font-size-title) font-bold text-(--color-semantic-text-primary)"
              >
                {COPY.title}
              </h1>
              <p className="text-(length:--font-size-body) text-(--color-semantic-text-secondary)">
                {COPY.description(gate.projectTitle, gate.studioName)}
              </p>
            </div>
          </div>
          <ClientPasswordForm action={action} />
        </section>
      </main>
    </div>
  );
}
