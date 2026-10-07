import Image from "next/image";

import { LANDING_PAGE_COPY as COPY } from "../landing-page/landing-page.copy";

/**
 * The landing header (landing.pen pZtp8 / yqOhq): the selected logo lockup and the launch status.
 * @returns the header
 */
export function LandingHeader() {
  return (
    <header className="flex h-(--space-12) w-full items-center justify-between">
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
          {COPY.wordmark}
        </span>
      </p>
      <p className="flex items-center gap-(--space-2) rounded-(--radius-full) bg-[color-mix(in_srgb,var(--color-primitive-neutral-0)_70%,transparent)] px-(--space-2-5) py-(--space-1-5) text-(length:--font-size-label) font-medium text-(--color-semantic-text-secondary) outline outline-1 -outline-offset-1 outline-(--color-semantic-border-default) md:px-(--space-3) md:py-(--space-2) md:text-(length:--font-size-body-sm)">
        <span
          aria-hidden="true"
          className="size-[7px] rounded-full bg-(--color-semantic-accent-highlight) md:size-2"
        />
        {COPY.comingSoon}
      </p>
    </header>
  );
}
