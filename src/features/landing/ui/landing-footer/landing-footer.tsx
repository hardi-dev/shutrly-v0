import { cn } from "@/ui/cn/cn";

import { LANDING_PAGE_COPY as COPY } from "../landing-page/landing-page.copy";

const LINK = "text-(--color-semantic-text-secondary)";

/**
 * The landing footer (landing.pen bcn90 / LXKAW). *Contact* writes to the removal and contact
 * address (AC-LND-011); *Privacy* jumps to the privacy note under the form.
 * @returns the footer
 */
export function LandingFooter() {
  return (
    <footer className="mx-auto flex h-[72px] w-full max-w-[1408px] items-center justify-between px-(--space-5) text-(length:--font-size-label) md:h-[104px] md:px-14">
      <p className="text-(--color-semantic-text-muted)">{COPY.copyright}</p>
      <nav
        aria-label={COPY.footerLabel}
        className="flex items-center gap-(--space-5) md:gap-(--space-6)"
      >
        <a
          href={`mailto:${COPY.contactEmail}`}
          className={cn(LINK, "hover:text-(--color-semantic-text-primary)")}
        >
          {COPY.contact}
        </a>
        <a href="#privacy" className={cn(LINK, "hover:text-(--color-semantic-text-primary)")}>
          {COPY.privacy}
        </a>
      </nav>
    </footer>
  );
}
