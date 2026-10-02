"use client";

import { useCallback } from "react";

import { showToast } from "@/ui/patterns/toast/toast";

import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import type { ClientMutationCall, ClientMutationSuccess } from "./use-client-mutations.types";

async function runClientMutation(
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
      title: CLIENT_COPY.serverErrorTitle,
      body: CLIENT_COPY.serverErrorBody,
      action: {
        label: CLIENT_COPY.retry,
        onAction: () => void runClientMutation(name, call, success),
      },
    });
    throw error;
  }
}

/** Runs a client write and presents its matching success or retryable failure toast. */
export function useClientMutations() {
  const run = useCallback(
    (name: string, call: ClientMutationCall, success = addedSuccess(name)) =>
      runClientMutation(name, call, success),
    [],
  );
  return { run };
}

function addedSuccess(name: string): ClientMutationSuccess {
  return { title: CLIENT_COPY.addedTitle, body: CLIENT_COPY.addedBody(name) };
}
