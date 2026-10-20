import Image from "next/image";
import Link from "next/link";

import type { AppLocale } from "@/shared/locale/locale.types";
import { cn } from "@/ui/cn/cn";

import { PRIVACY_POLICY_COPY, type PrivacyPolicyCopy } from "./privacy-policy.copy";

const LINK = "text-(--color-semantic-text-secondary) hover:text-(--color-semantic-text-primary)";

function PolicyHeader({ copy }: Readonly<{ copy: PrivacyPolicyCopy }>) {
  return (
    <header className="flex h-(--space-12) w-full items-center justify-between pt-(--space-4)">
      <p className="flex items-center gap-(--space-2) md:gap-(--space-2-5)">
        <Image
          src="/landing/logo-symbol.webp"
          alt=""
          width={40}
          height={40}
          unoptimized
          className="size-[30px] md:size-10"
        />
        <span className="text-[20px] font-extrabold tracking-[-0.97px] text-(--color-semantic-text-primary) md:text-[26px] md:tracking-[-1.26px]">
          {copy.wordmark}
        </span>
      </p>
      <Link href="/" className={cn("text-(length:--font-size-label) font-medium", LINK)}>
        {copy.backLabel}
      </Link>
    </header>
  );
}

function PolicyFooter({ copy }: Readonly<{ copy: PrivacyPolicyCopy }>) {
  return (
    <footer className="mx-auto flex h-[72px] w-full max-w-[1408px] items-center justify-between px-(--space-5) text-(length:--font-size-label) md:h-[104px] md:px-14">
      <p className="text-(--color-semantic-text-muted)">{copy.copyright}</p>
      <nav className="flex items-center gap-(--space-5) md:gap-(--space-6)">
        <a href={`mailto:${copy.contactEmail}`} className={LINK}>
          {copy.contactLabel}
        </a>
      </nav>
    </footer>
  );
}

/**
 * The privacy policy in the same shell as the landing page: panel surface, tinted top band with the
 * logo lockup and a way back, the policy text, and the landing-style footer.
 * @param props - the active language
 * @returns the policy page
 */
export function PrivacyPolicy({ locale }: Readonly<{ locale: AppLocale }>) {
  const copy = PRIVACY_POLICY_COPY[locale];
  return (
    <div
      lang={locale}
      className="min-h-dvh bg-(--color-semantic-surface-panel) px-(--space-2) md:px-(--space-4)"
    >
      <div className="mx-auto flex w-full max-w-[1296px] flex-col rounded-b-[28px] bg-[color-mix(in_srgb,var(--color-primitive-blue-50)_40%,var(--color-primitive-neutral-0))] px-(--space-5) md:rounded-b-[32px] md:px-14">
        <PolicyHeader copy={copy} />
        <article className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-(--space-8) text-(--color-semantic-text-primary)">
          <h1 className="text-2xl font-semibold">{copy.title}</h1>
          <p className="text-(--color-semantic-text-secondary)">{copy.intro}</p>
          {copy.sections.map((section) => (
            <section key={section.heading} className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-(--color-semantic-text-secondary)">
                  {paragraph}
                </p>
              ))}
              {section.items ? (
                <ul className="list-disc pl-5 text-(--color-semantic-text-secondary)">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>
      </div>
      <PolicyFooter copy={copy} />
    </div>
  );
}
