"use client";

import { useCallback } from "react";

import { showToast } from "@/ui/patterns/toast/toast";

import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import type { ClientMutationCall } from "./use-client-mutations.types";

async function runClientMutation(name: string, call: ClientMutationCall) {
  try {
    const result = await call();
    if (result?.ok === false) return result;
    showToast({
      tone: "success",
      title: CLIENT_COPY.addedTitle,
      body: CLIENT_COPY.addedBody(name),
    });
    return result;
  } catch (error) {
    showToast({
      tone: "danger",
      title: CLIENT_COPY.serverErrorTitle,
      body: CLIENT_COPY.serverErrorBody,
      action: { label: CLIENT_COPY.retry, onAction: () => void runClientMutation(name, call) },
    });
    throw error;
  }
}

/** Runs a client write and presents its matching success or retryable failure toast. */
export function useClientMutations() {
  const run = useCallback(
    (name: string, call: ClientMutationCall) => runClientMutation(name, call),
    [],
  );
  return { run };
}
