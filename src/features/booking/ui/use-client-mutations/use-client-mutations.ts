"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";

import { showToast } from "@/ui/patterns/toast/toast";

import type { ClientTranslate } from "../client-copy/client-copy.types";
import { USE_CLIENT_MUTATIONS_COPY_NAMESPACE } from "./use-client-mutations.copy";
import type { ClientMutationCall, ClientMutationSuccess } from "./use-client-mutations.types";

async function runClientMutation(
  t: ClientTranslate,
  name: string,
  call: ClientMutationCall,
  success: ClientMutationSuccess,
) {
  try {
    const result = await call();
    if (result?.ok === false) return result;
    showToast({
      tone: "success",
      title: success.title,
      body: success.body,
    });
    return result;
  } catch (error) {
    showToast({
      tone: "danger",
      title: t("serverErrorTitle"),
      body: t("serverErrorBody"),
      action: {
        label: t("retry"),
        onAction: () => void runClientMutation(t, name, call, success),
      },
    });
    throw error;
  }
}

/** Runs a client write and presents its matching success or retryable failure toast. */
export function useClientMutations() {
  const t = useTranslations(USE_CLIENT_MUTATIONS_COPY_NAMESPACE);
  const run = useCallback(
    (name: string, call: ClientMutationCall, success = addedSuccess(t, name)) =>
      runClientMutation(t, name, call, success),
    [t],
  );
  return { run };
}

function addedSuccess(t: ClientTranslate, name: string): ClientMutationSuccess {
  return { title: t("addedTitle"), body: t("addedBody", { name }) };
}
