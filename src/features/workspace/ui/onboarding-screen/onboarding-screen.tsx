import { useTranslations } from "next-intl";

import { SplitLayout } from "@/ui/patterns/split-layout/split-layout";
import { Icon } from "@/ui/primitives/icon/icon";
import { Input } from "@/ui/primitives/input/input";

import { ONBOARDING_COPY_NAMESPACE } from "./onboarding-screen.copy";
import type { OnboardingScreenProps } from "./onboarding-screen.types";
import { FormSubmitButton } from "./onboarding-submit-button";

/** The invoice prefix shown on the sample preview; it comes from the sample name, not from copy. */
const ONBOARDING_PREVIEW_PREFIX = "AW";

/** Renders first-workspace onboarding with a server form and editorial preview card. @param props - signed-in account and server action @returns the onboarding screen */
export function OnboardingScreen({
  accountName,
  accountEmail,
  action,
  signOutAction,
}: Readonly<OnboardingScreenProps>) {
  const t = useTranslations(ONBOARDING_COPY_NAMESPACE);
  return (
    <SplitLayout editorial={<WorkspaceEditorialPanel />}>
      <>
        <SignedInRow
          accountName={accountName}
          accountEmail={accountEmail}
          signOutAction={signOutAction}
        />
        <div className="flex flex-col gap-(--space-2)">
          <h1 className="text-(length:--font-size-display) font-bold">{t("title")}</h1>
          <p className="text-(--color-semantic-text-secondary)">{t("description")}</p>
        </div>
        <form action={action} className="flex flex-col gap-(--space-4)">
          <label className="flex flex-col gap-(--space-2) text-(length:--font-size-label) font-semibold">
            {t("nameLabel")}
            <Input name="name" placeholder={t("namePlaceholder")} />
          </label>
          <FormSubmitButton>{t("submit")}</FormSubmitButton>
        </form>
        <BenefitsList />
      </>
    </SplitLayout>
  );
}

function WorkspaceEditorialPanel() {
  const t = useTranslations(ONBOARDING_COPY_NAMESPACE);
  return (
    <aside
      aria-hidden="true"
      className="relative flex h-full min-h-dvh items-end overflow-hidden bg-(--color-semantic-surface-inverse) bg-[url('/auth/editorial/mosaic.webp')] bg-cover bg-center p-(--space-16)"
    >
      <div className="w-full max-w-(--size-editorial-card) rounded-(--radius-lg) bg-(--color-semantic-surface-muted) p-(--space-2) shadow-[0_var(--elevation-2-offset-y)_var(--elevation-2-blur)_var(--color-semantic-elevation-2-color)]">
        <div className="flex items-center gap-(--space-2) px-(--space-2)">
          <span className="size-(--size-mark-sm) rounded-(--radius-xs) bg-(--color-semantic-surface-inverse)" />
          <span className="text-(length:--font-size-title) font-bold">{t("previewBrand")}</span>
        </div>
        <div className="my-(--space-2) h-px w-full bg-(--color-semantic-border-subtle)" />
        <div className="flex items-center gap-(--space-2) rounded-(--radius-sm) bg-(--color-semantic-surface-panel) p-(--space-2) shadow-[inset_0_0_0_1px_var(--color-semantic-border-subtle)]">
          <span className="flex size-(--size-mark-md) items-center justify-center rounded-(--radius-xs) bg-(--color-semantic-accent-highlight)">
            <Icon name="camera" className="size-(--space-3) text-(--color-semantic-text-primary)" />
          </span>
          <span className="flex-1 text-(length:--font-size-body) font-medium">
            {t("previewWorkspace")}
          </span>
          <Icon
            name="chevrons-up-down"
            className="size-(--space-4) text-(--color-semantic-text-muted)"
          />
        </div>
        <div className="mt-(--space-2) rounded-(--radius-sm) bg-(--color-semantic-action-primary) px-(--space-3) py-(--space-2) text-(--color-semantic-action-on-primary) text-(length:--font-size-body) font-semibold">
          {t("previewDashboard")}
        </div>
      </div>
    </aside>
  );
}

function SignedInRow({
  accountName,
  accountEmail,
  signOutAction,
}: Readonly<{ accountName: string; accountEmail: string; signOutAction: () => Promise<void> }>) {
  const t = useTranslations(ONBOARDING_COPY_NAMESPACE);
  return (
    <div className="flex flex-col items-start gap-(--space-1)">
      <p className="text-(length:--font-size-label) text-(--color-semantic-text-muted)">
        {t("signedIn")}
      </p>
      <div className="flex flex-wrap items-center gap-(--space-1) text-(length:--font-size-body) font-semibold">
        <span>{t("account", { name: accountName, email: accountEmail })}</span>
        <span aria-hidden="true">{t("separator")}</span>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-(--radius-xs) text-(--color-semantic-status-info-fg) outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-semantic-focus-ring)"
          >
            {t("signOut")}
          </button>
        </form>
      </div>
    </div>
  );
}

function BenefitsList() {
  const t = useTranslations(ONBOARDING_COPY_NAMESPACE);
  const benefits = [
    { title: t("separationTitle"), description: t("separationBody") },
    {
      title: t("prefixTitle", { prefix: ONBOARDING_PREVIEW_PREFIX }),
      description: t("prefixBody"),
    },
    { title: t("currencyTitle"), description: t("currencyBody") },
  ];
  return (
    <ul className="flex flex-col gap-(--space-4)" aria-label={t("benefitsLabel")}>
      {benefits.map((benefit) => (
        <li key={benefit.title} className="flex gap-(--space-3)">
          <div
            data-testid="onboarding-benefit-check"
            className="flex size-(--size-mark-md) shrink-0 items-center justify-center rounded-full bg-(--color-semantic-accent-soft)"
          >
            <Icon name="check" className="size-[12px] text-(--color-semantic-accent-soft-fg)" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
            <p className="text-[13px] leading-normal font-semibold">{benefit.title}</p>
            <p className="w-full text-[13px] leading-[20px] text-(--color-semantic-text-secondary)">
              {benefit.description}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
