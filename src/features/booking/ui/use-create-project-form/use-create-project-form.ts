"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { createProjectInputSchema } from "@/features/booking/application/schemas/create-project-input/create-project-input.schema";
import type {
  CreateProjectFormValues,
  CreateProjectInput,
} from "@/features/booking/application/schemas/create-project-input/create-project-input.types";
import type { BookingValue } from "@/features/booking/domain/booking-field-value/booking-field-value.types";
import type { SessionInput } from "@/features/booking/domain/session/session.types";

import { useProjectPicks } from "../use-project-picks/use-project-picks";
import { useProjectSubmit } from "../use-project-submit/use-project-submit";
import { CREATE_PROJECT_DEFAULTS } from "./create-project-form-defaults";
import type { UseCreateProjectFormInput } from "./use-create-project-form.types";

/** Owns the Proyek baru form: values, service-driven prefill, sessions and submit (AC-PRJ-006…011). @param input - workspace, service options and the create action @returns the form state and handlers */
export function useCreateProjectForm(input: Readonly<UseCreateProjectFormInput>) {
  const form = useForm<CreateProjectFormValues, unknown, CreateProjectInput>({
    resolver: zodResolver(createProjectInputSchema),
    defaultValues: CREATE_PROJECT_DEFAULTS,
  });
  const picks = useProjectPicks(form, input.serviceGroups);
  const submission = useProjectSubmit(form, picks, input);
  const setSessions = (sessions: readonly SessionInput[]) => {
    form.setValue("sessions", [...sessions]);
    form.clearErrors("sessions");
  };
  const addSession = (session: SessionInput) => {
    setSessions([...form.getValues("sessions"), session]);
  };
  const updateSession = (index: number, session: SessionInput) => {
    setSessions(form.getValues("sessions").map((current, i) => (i === index ? session : current)));
  };
  const removeSession = (index: number) => {
    setSessions(form.getValues("sessions").filter((_, i) => i !== index));
  };
  const changeFieldValue = (key: string, value: BookingValue) => {
    form.setValue("fieldValues", { ...form.getValues("fieldValues"), [key]: value });
    form.clearErrors(`fieldValues.${key}`);
  };
  return {
    form,
    ...picks,
    ...submission,
    addSession,
    updateSession,
    removeSession,
    changeFieldValue,
  };
}
