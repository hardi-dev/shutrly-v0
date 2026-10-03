"use client";

import { useState } from "react";

import type { ClientInput } from "@/features/booking/application/schemas/client-input/client-input.types";
import type {
  ClientWriteResult,
  CreatedClient,
} from "@/features/booking/application/use-cases/client-results/client-results.types";

import { useClientMutations } from "../use-client-mutations/use-client-mutations";
import type { ClientPickerProps } from "./client-picker.types";

/** Drives *Tambah klien baru* from the picker: the dialog's query, submit and selection of the new client (AC-PRJ-013). @param props - the picker props @param onCreated - what to do with the new client @returns the dialog state and handlers */
export function useClientCreation(
  props: Readonly<ClientPickerProps>,
  onCreated: (client: CreatedClient) => void,
) {
  const [query, setQuery] = useState<string | null>(null);
  const mutations = useClientMutations();
  const open = (text: string) => {
    setQuery(text.trim());
  };
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) setQuery(null);
  };
  const submit = async (
    workspaceId: string,
    values: ClientInput,
  ): Promise<ClientWriteResult | undefined> => {
    const create = props.createAction;
    if (!create) return undefined;
    return mutations.run(values.name, () => create(workspaceId, values));
  };
  return { query, open, handleOpenChange, submit, onCreated };
}
