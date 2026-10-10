import Image from "next/image";

import { LandingBackdrop } from "../landing-backdrop/landing-backdrop";
import { LandingFooter } from "../landing-footer/landing-footer";
import { LandingHeader } from "../landing-header/landing-header";
import { RotatingHeadline } from "../rotating-headline/rotating-headline";
import { WaitlistForm } from "../waitlist-form/waitlist-form";
import { LANDING_PAGE_COPY as COPY } from "./landing-page.copy";

// Hero size, radii and the mockup boxes are a DESIGN TOKEN GAP (plan.md › Token mapping).
function ProductMockup() {
  return (
    <div className="relative -mt-(--space-5) flex min-h-0 w-full flex-1 items-start justify-center overflow-hidden md:mt-0">
      <Image
        src="/landing/phone-projects.webp"
        alt={COPY.phoneAlt}
        width={941}
        height={1671}
        unoptimized
        loading="eager"
        className="h-[775px] w-[334px] max-w-none object-cover md:hidden"
      />
      <Image
        src="/landing/laptop-projects.webp"
        alt={COPY.laptopAlt}
        width={1536}
        height={1024}
        unoptimized
        loading="eager"
        fetchPriority="high"
        className="hidden h-auto w-full max-w-[1217px] md:block"
      />
    </div>
  );
}

/**
 * The landing page (landing.pen sW37g desktop, kE8Eu phone): an inset hero with the header, the
 * rotating headline, the waitlist form and the product mockup masked by the hero's edge, then the
 * footer.
 * @returns the page
 */
export function LandingPage() {
  return (
    <div
      lang="en"
      className="min-h-dvh bg-(--color-semantic-surface-panel) px-(--space-2) md:px-(--space-4)"
    >
      <div className="relative isolate flex h-[807px] flex-col overflow-hidden rounded-b-[28px] bg-[color-mix(in_srgb,var(--color-primitive-blue-50)_40%,var(--color-primitive-neutral-0))] px-(--space-5) pt-(--space-4) md:h-[996px] md:rounded-b-[32px] md:px-14 md:pt-(--space-7)">
        <LandingBackdrop />
        <div className="relative mx-auto flex min-h-0 w-full max-w-[1296px] flex-1 flex-col">
          <LandingHeader />
          <main className="flex min-h-0 flex-1 flex-col items-center">
            <div className="flex w-full flex-col items-center pt-(--space-10) pb-(--space-8) md:pt-(--space-12)">
              <div className="flex w-full flex-col items-center gap-(--space-3) text-center md:w-[820px] md:gap-(--space-4)">
                <p className="text-(length:--font-size-overline) font-semibold tracking-[1.5px] text-(--color-semantic-text-secondary) md:text-(length:--font-size-caption) md:tracking-[1.7px]">
                  {COPY.audience}
                </p>
                <RotatingHeadline />
                <p className="text-[15px]/[24px] text-(--color-semantic-text-secondary) md:w-[600px] md:text-(length:--font-size-title) md:leading-[29px]">
                  {COPY.description[0]} <br className="hidden md:inline" />
                  {COPY.description[1]}
                </p>
              </div>
              <div className="w-full pt-(--space-6) md:w-[536px]">
                <WaitlistForm />
              </div>
            </div>
            <ProductMockup />
          </main>
        </div>
      </div>
      <LandingFooter />
    </div>
  );
}
