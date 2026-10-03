import type { CreateProjectFormValues } from "@/features/booking/application/schemas/create-project-input/create-project-input.types";

export const CREATE_PROJECT_DEFAULTS: CreateProjectFormValues = {
  mode: "DRAFT",
  clientId: "",
  serviceId: "",
  title: "",
  agreedPrice: "",
  notes: "",
  items: [],
  sessions: [],
  fieldValues: {},
};
