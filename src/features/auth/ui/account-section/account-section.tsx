import type { AccountSectionProps } from "./account-section.types";

/**
 * One titled section of the Profile page (auth.pen t7CXVK: Profile, Password).
 * @param props - the translated title and lead, and the section's form
 * @returns the section
 */
export function AccountSection({ title, lead, children }: Readonly<AccountSectionProps>) {
  return (
    <section className="flex flex-col gap-(--space-4) rounded-(--radius-lg) border border-(--color-semantic-border-default) bg-(--color-semantic-surface-panel) p-(--space-6)">
      <div className="flex flex-col gap-(--space-1)">
        <h2 className="text-(length:--font-size-subtitle) font-semibold text-(--color-semantic-text-primary)">
          {title}
        </h2>
        <p className="text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
          {lead}
        </p>
      </div>
      {children}
    </section>
  );
}
