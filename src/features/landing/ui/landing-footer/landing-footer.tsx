import { useTranslations } from "next-intl";

import { cn } from "@/ui/cn/cn";

import { LANDING_CONTACT_EMAIL } from "../landing-page/landing-page.copy";
import { LANDING_FOOTER_COPY_NAMESPACE } from "./landing-footer.copy";

const LINK = "text-(--color-semantic-text-secondary)";

/**
 * The landing footer (landing.pen bcn90 / LXKAW). *Contact* writes to the removal and contact
 * address (AC-LND-011); *Privacy* jumps to the privacy note under the form.
 * @returns the footer
 */
export function LandingFooter() {
  const t = useTranslations(LANDING_FOOTER_COPY_NAMESPACE);
  return (
    <footer className="mx-auto flex h-[72px] w-full max-w-[1408px] items-center justify-between px-(--space-5) text-(length:--font-size-label) md:h-[104px] md:px-14">
      <p className="text-(--color-semantic-text-muted)">{t("copyright")}</p>
      <nav
        aria-label={t("footerLabel")}
        className="flex items-center gap-(--space-5) md:gap-(--space-6)"
      >
        <a
          href={`mailto:${LANDING_CONTACT_EMAIL}`}
          className={cn(LINK, "hover:text-(--color-semantic-text-primary)")}
        >
          {t("contact")}
        </a>
        <a href="#privacy" className={cn(LINK, "hover:text-(--color-semantic-text-primary)")}>
          {t("privacy")}
        </a>
      </nav>
    </footer>
  );
}
