"use client";

import { useTranslations } from "next-intl";

import { formatIdr } from "@/features/booking/domain/idr-amount/idr-amount";
import type { FormattingLocale } from "@/shared/locale/locale.types";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { TextField } from "@/ui/primitives/text-field/text-field";
import { Textarea } from "@/ui/primitives/textarea/textarea";

import type { ProjectTranslate } from "../project-copy/project-copy.types";
import { projectFieldErrorText } from "../project-field-error/project-field-error";
import type { CreateProjectState } from "../use-create-project-form/use-create-project-form.types";
import { CREATE_PROJECT_SCREEN_COPY_NAMESPACE } from "./create-project-screen.copy";

const noop = () => undefined;

function errorText(path: string, key: string | undefined): string | undefined {
  return key === undefined ? undefined : projectFieldErrorText(path, key);
}

function titlePlaceholder(
  t: ProjectTranslate,
  state: CreateProjectState,
  isMobile: boolean,
): string {
  if (state.service && state.client) {
    return t("titleExample", { serviceName: state.service.name, clientName: state.client.name });
  }
  return isMobile ? t("titlePlaceholderMobile") : t("titlePlaceholderDesktop");
}

/** The price helper under the agreed price, shown once a service is picked. */
function priceDescription(
  t: ProjectTranslate,
  service: CreateProjectState["service"],
  locale: FormattingLocale,
) {
  return service ? t("priceHelper", { amount: formatIdr(service.basePrice, locale) }) : undefined;
}

/** The Detail proyek card: title, agreed price and internal notes. */
export function ProjectDetailCard({ state }: Readonly<{ state: CreateProjectState }>) {
  const t = useTranslations(CREATE_PROJECT_SCREEN_COPY_NAMESPACE);
  const locale = useFormattingLocale();
  const isMobile = useMobileViewport();
  const { form, service } = state;
  const values = form.watch();
  const { errors } = form.formState;
  const handlePrice = (price: string) => {
    form.setValue("agreedPrice", price);
  };
  const handleNotes = (notes: string) => {
    form.setValue("notes", notes);
  };
  return (
    <SectionCard title={t("detailTitle")}>
      <div className="grid grid-cols-1 items-start gap-(--space-4) md:grid-cols-2">
        <TextField
          label={t("titleLabel")}
          name="title"
          value={values.title}
          onChange={state.changeTitle}
          onBlur={noop}
          placeholder={titlePlaceholder(t, state, isMobile)}
          description={service ? t("titleHelper") : undefined}
          errorMessage={errorText("title", errors.title?.message)}
        />
        <TextField
          label={t("priceLabel")}
          name="agreedPrice"
          prefix={t("pricePrefix")}
          value={values.agreedPrice}
          onChange={handlePrice}
          onBlur={noop}
          placeholder={t("pricePlaceholder")}
          description={priceDescription(t, service, locale)}
          errorMessage={errorText("agreedPrice", errors.agreedPrice?.message)}
        />
      </div>
      <Textarea
        label={t("notesLabel")}
        optional
        name="notes"
        value={values.notes ?? ""}
        onChange={handleNotes}
        placeholder={t("notesPlaceholder")}
        errorMessage={errorText("notes", errors.notes?.message)}
      />
    </SectionCard>
  );
}
