import { getTranslations } from "next-intl/server";

import type { ProjectDetailView } from "@/features/booking/application/use-cases/get-project-detail/get-project-detail.types";
import type { ProjectTranslate } from "@/features/booking/ui/project-copy/project-copy.types";
import {
  projectMetaLine,
  projectMetaText,
} from "@/features/booking/ui/project-session-summary/project-session-summary";
import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";
import { deliveredHeaderMeta } from "@/features/gallery/ui/delivery-text/delivery-text";
import type { FormattingLocale } from "@/shared/locale/locale.types";

import { PROJECT_DETAIL_DELIVERY_NAMESPACE } from "./page.copy";

// A delivered project names when final delivery was published instead of its session (owner-7 `r71J5`).
/** The project header's meta line: the session summary, or the delivery line once it is published. @param t - the project copy @param project - the project detail @param deliveredMeta - the delivery line, or null @param locale - the formatting locale @returns the meta line */
export function headerMetaText(
  t: ProjectTranslate,
  project: ProjectDetailView,
  deliveredMeta: string | null,
  locale: FormattingLocale,
) {
  if (deliveredMeta === null) {
    return projectMetaText(t, project.client.name, project.shownSession, locale);
  }
  return projectMetaLine(project.client.name, deliveredMeta);
}

/** The delivery line for the header, or null when no final delivery is published. @param delivery - the delivery card @param locale - the formatting locale @returns the line or null */
export async function deliveredMetaOf(
  delivery: DeliveryCardView,
  locale: FormattingLocale,
): Promise<string | null> {
  const t = await getTranslations(PROJECT_DETAIL_DELIVERY_NAMESPACE);
  return deliveredHeaderMeta(t, delivery, locale);
}
