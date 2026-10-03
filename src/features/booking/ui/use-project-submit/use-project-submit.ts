"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FieldPath } from "react-hook-form";

import type { CreateProjectFormValues } from "@/features/booking/application/schemas/create-project-input/create-project-input.types";
import type { ProjectFailure } from "@/features/booking/application/use-cases/project-results/project-results.types";
import { validateFieldValues } from "@/features/booking/domain/booking-field-value/booking-field-value";
import { showToast } from "@/ui/patterns/toast/toast";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import type {
  CreateForm,
  CreateProjectMode,
  UseCreateProjectFormInput,
} from "../use-create-project-form/use-create-project-form.types";
import type { ProjectPicks } from "../use-create-project-form/use-create-project-form.types";

const FORM_PATH = /^(clientId|serviceId|title|agreedPrice|notes|sessions|items|fieldValues)(\.|$)/;

// The server reports errors with the same paths as the form's values.
function isFormPath(path: string): path is FieldPath<CreateProjectFormValues> {
  return FORM_PATH.test(path);
}

function applyServerErrors(form: CreateForm, failure: ProjectFailure): void {
  if (failure.code !== "VALIDATION_FAILED") return;
  for (const [path, key] of Object.entries(failure.fieldErrors)) {
    if (isFormPath(path)) form.setError(path, { type: "server", message: key });
  }
}

function applyFieldValueErrors(form: CreateForm, picks: ProjectPicks): boolean {
  const { problems } = validateFieldValues(
    picks.service?.fields ?? [],
    form.getValues("fieldValues"),
  );
  const entries = Object.entries(problems);
  for (const [key, problem] of entries) {
    form.setError(`fieldValues.${key}`, { type: "validate", message: problem });
  }
  return entries.length > 0;
}

/** Validates and sends the form as a draft or as booked, then opens the new project (AC-PRJ-008…011, AC-PRJ-029). @param form - the create form @param picks - the picked client and service @param input - workspace and the create action @returns the pending mode and submit */
export function useProjectSubmit(
  form: CreateForm,
  picks: ProjectPicks,
  input: Readonly<UseCreateProjectFormInput>,
) {
  const router = useRouter();
  const [pendingMode, setPendingMode] = useState<CreateProjectMode | null>(null);
  const submit = async (mode: CreateProjectMode): Promise<void> => {
    form.setValue("mode", mode);
    const isValid = await form.trigger();
    const hasFieldErrors = applyFieldValueErrors(form, picks);
    const values = form.getValues();
    if (mode === "BOOKED" && values.sessions.length === 0) {
      form.setError("sessions", { type: "validate", message: "SESSION_REQUIRED" });
      return;
    }
    if (!isValid || hasFieldErrors) return;
    setPendingMode(mode);
    try {
      const result = await input.createAction(input.workspaceId, values);
      if (result.ok) {
        const state = mode === "BOOKED" ? "created" : "draft-saved";
        router.push(`/w/${input.workspaceId}/projects/${result.projectId}?state=${state}`);
        return;
      }
      applyServerErrors(form, result);
    } catch {
      showToast({
        tone: "danger",
        title: PROJECT_COPY.serverErrorTitle,
        body: PROJECT_COPY.serverErrorBody,
        action: { label: PROJECT_COPY.retry, onAction: () => void submit(mode) },
      });
    } finally {
      setPendingMode(null);
    }
  };
  return { pendingMode, submit };
}
