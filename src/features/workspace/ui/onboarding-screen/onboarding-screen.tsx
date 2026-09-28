import { Button } from "@/ui/primitives/button/button";
import { Icon } from "@/ui/primitives/icon/icon";
import { Input } from "@/ui/primitives/input/input";

import { ONBOARDING_COPY } from "./onboarding-screen.copy";
import type { OnboardingScreenProps } from "./onboarding-screen.types";

/** Renders first-workspace onboarding with a server form and editorial preview card. @param props - signed-in account and server action @returns the onboarding screen */
export function OnboardingScreen({
  accountName,
  accountEmail,
  action,
  signOutAction,
}: Readonly<OnboardingScreenProps>) {
  return (
    <main className="grid min-h-dvh bg-(--color-semantic-surface-panel) lg:grid-cols-[minmax(0,1fr)_var(--size-editorial-card)]">
      <section className="flex flex-col justify-center p-(--space-6) lg:p-(--space-12)">
        <div className="mx-auto flex w-full max-w-(--size-auth-form) flex-col gap-(--space-6)">
          <SignedInRow
            accountName={accountName}
            accountEmail={accountEmail}
            signOutAction={signOutAction}
          />
          <div className="flex flex-col gap-(--space-2)">
            <h1 className="text-(length:--font-size-display) font-bold">{ONBOARDING_COPY.title}</h1>
            <p className="text-(--color-semantic-text-secondary)">{ONBOARDING_COPY.description}</p>
          </div>
          <form action={action} className="flex flex-col gap-(--space-4)">
            <label className="flex flex-col gap-(--space-2) text-(length:--font-size-label) font-semibold">
              {ONBOARDING_COPY.nameLabel}
              <Input name="name" placeholder={ONBOARDING_COPY.namePlaceholder} />
            </label>
            <Button type="submit">{ONBOARDING_COPY.submit}</Button>
          </form>
          <BenefitsList />
        </div>
      </section>
      <aside className="hidden items-center justify-center bg-(--color-semantic-surface-inverse) p-(--space-6) lg:flex">
        <div className="w-full max-w-(--size-editorial-card) rounded-(--radius-lg) bg-(--color-semantic-surface-panel) p-(--space-6) shadow-[0_var(--elevation-2-offset-y)_var(--elevation-2-blur)_var(--color-semantic-elevation-2-color)]">
          <p className="text-(length:--font-size-label) text-(--color-semantic-text-muted)">
            {ONBOARDING_COPY.preview}
          </p>
          <p className="mt-(--space-2) text-(length:--font-size-title) font-bold">
            {ONBOARDING_COPY.title}
          </p>
        </div>
      </aside>
    </main>
  );
}

function SignedInRow({
  accountName,
  accountEmail,
  signOutAction,
}: Readonly<{ accountName: string; accountEmail: string; signOutAction: () => Promise<void> }>) {
  return (
    <div className="flex flex-col items-start gap-(--space-1)">
      <p className="text-(length:--font-size-label) text-(--color-semantic-text-muted)">
        {ONBOARDING_COPY.signedIn}
      </p>
      <div className="flex flex-wrap items-center gap-(--space-1) text-(length:--font-size-body) font-semibold">
        <span>{ONBOARDING_COPY.account(accountName, accountEmail)}</span>
        <span aria-hidden="true">{ONBOARDING_COPY.separator}</span>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-(--radius-xs) text-(--color-semantic-status-info-fg) outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-semantic-focus-ring)"
          >
            {ONBOARDING_COPY.signOut}
          </button>
        </form>
      </div>
    </div>
  );
}

function BenefitsList() {
  return (
    <ul className="flex flex-col gap-(--space-4)" aria-label={ONBOARDING_COPY.benefitsLabel}>
      {ONBOARDING_COPY.benefits.map((benefit) => (
        <li key={benefit.title} className="flex gap-(--space-3)">
          <Icon name="check" className="mt-(--space-1) text-(--color-semantic-accent-soft-fg)" />
          <div>
            <p className="font-semibold">{benefit.title}</p>
            <p className="text-(--color-semantic-text-secondary)">{benefit.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
