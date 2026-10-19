"use client";

import { useState } from "react";

import type { ClientRecord } from "@/features/booking/application/ports/client-repository/client-repository.port";
import type { ClientInput } from "@/features/booking/application/schemas/client-input/client-input.types";

import type { ClientNumberFlowInput } from "./project-gallery-host.types";

/**
 * *Tambah nomor WhatsApp* from the share dialog (A-8, AC-GFL-024): loads the project's client, opens the
 * booking client dialog and, once saved, tells the host to reload the share message.
 * @param input - the workspace, the shared project, the server actions and the saved callback
 * @returns the client being edited and the dialog handlers
 */
export function useClientNumberFlow({
  workspaceId,
  projectId,
  actions,
  onSaved,
}: ClientNumberFlowInput) {
  const [client, setClient] = useState<ClientRecord | null>(null);
  const load = async () => {
    if (projectId === null) return;
    const detail = await actions.loadDetailAction(workspaceId, projectId);
    setClient(await actions.loadClientAction(workspaceId, detail.client.id));
  };
  const open = () => {
    void load();
  };
  const close = (isOpen: boolean) => {
    if (!isOpen) setClient(null);
  };
  const save = async (targetWorkspaceId: string, values: ClientInput) => {
    if (client === null) return undefined;
    const result = await actions.updateClientAction(targetWorkspaceId, client.id, values);
    if (result?.ok !== false) {
      setClient(null);
      onSaved();
    }
    return result;
  };
  return { client, open, close, save };
}
