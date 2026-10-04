"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { showToast } from "@/ui/patterns/toast/toast";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type { LifecycleResult, LifecycleToast } from "./use-lifecycle-runner.types";

function refusal(code: string): string | null {
  return Object.entries(GALLERY_COPY.refused).find(([key]) => key === code)?.[1] ?? null;
}

/** Runs a lifecycle action with a pending flag, a success toast and a refresh, and toasts a domain refusal or a failure; validation failures are returned for the form (C-007). @returns the pending flag and `run` */
export function useLifecycleRunner() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const run = async <T extends LifecycleResult>(
    work: () => Promise<T>,
    success: LifecycleToast,
  ): Promise<T | null> => {
    setIsPending(true);
    try {
      const result = await work();
      if (result.ok) {
        showToast({ tone: "success", ...success });
        router.refresh();
      } else {
        const text = refusal(result.code);
        if (text !== null) showToast({ tone: "danger", title: text });
      }
      return result;
    } catch {
      showToast({
        tone: "danger",
        title: GALLERY_COPY.saveFailedTitle,
        body: GALLERY_COPY.saveFailedBody,
      });
      return null;
    } finally {
      setIsPending(false);
    }
  };
  return { isPending, run };
}
