"use client";

import { formatIdr } from "@/features/booking/domain/idr-amount/idr-amount";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { TextField } from "@/ui/primitives/text-field/text-field";
import { Textarea } from "@/ui/primitives/textarea/textarea";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { projectFieldErrorText } from "../project-field-error/project-field-error";
import type { CreateProjectState } from "../use-create-project-form/use-create-project-form.types";

const noop = () => undefined;

function errorText(path: string, key: string | undefined): string | undefined {
  return key === undefined ? undefined : projectFieldErrorText(path, key);
}

function titlePlaceholder(state: CreateProjectState, isMobile: boolean): string {
  if (state.service && state.client) {
    return PROJECT_COPY.titleExample(state.service.name, state.client.name);
  }
  return isMobile ? PROJECT_COPY.titlePlaceholderMobile : PROJECT_COPY.titlePlaceholderDesktop;
}

/** The Detail proyek card: title, agreed price and internal notes. */
export function ProjectDetailCard({ state }: Readonly<{ state: CreateProjectState }>) {
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
    <SectionCard title={PROJECT_COPY.detailTitle}>
      <div className="grid grid-cols-1 items-start gap-(--space-4) md:grid-cols-2">
        <TextField
          label={PROJECT_COPY.titleLabel}
          name="title"
          value={values.title}
          onChange={state.changeTitle}
          onBlur={noop}
          placeholder={titlePlaceholder(state, isMobile)}
          description={service ? PROJECT_COPY.titleHelper : undefined}
          errorMessage={errorText("title", errors.title?.message)}
        />
        <TextField
          label={PROJECT_COPY.priceLabel}
          name="agreedPrice"
          prefix={PROJECT_COPY.pricePrefix}
          value={values.agreedPrice}
          onChange={handlePrice}
          onBlur={noop}
          placeholder={PROJECT_COPY.pricePlaceholder}
          description={service ? PROJECT_COPY.priceHelper(formatIdr(service.basePrice)) : undefined}
          errorMessage={errorText("agreedPrice", errors.agreedPrice?.message)}
        />
      </div>
      <Textarea
        label={PROJECT_COPY.notesLabel}
        optional
        name="notes"
        value={values.notes ?? ""}
        onChange={handleNotes}
        placeholder={PROJECT_COPY.notesPlaceholder}
        errorMessage={errorText("notes", errors.notes?.message)}
      />
    </SectionCard>
  );
}
