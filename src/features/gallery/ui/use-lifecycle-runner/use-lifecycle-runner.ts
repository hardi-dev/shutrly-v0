"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { showToast } from "@/ui/patterns/toast/toast";

import { GALLERY_REFUSED_MESSAGE_KEY } from "../gallery-copy/gallery-copy.copy";
import type { GalleryTranslate } from "../gallery-copy/gallery-copy.types";
import { USE_LIFECYCLE_RUNNER_COPY_NAMESPACE } from "./use-lifecycle-runner.copy";
import type { LifecycleResult, LifecycleToast } from "./use-lifecycle-runner.types";

const REFUSED_KEYS: Readonly<Record<string, string>> = GALLERY_REFUSED_MESSAGE_KEY;

function refusal(t: GalleryTranslate, code: string): string | null {
  const key = Object.hasOwn(REFUSED_KEYS, code) ? REFUSED_KEYS[code] : undefined;
  return key === undefined ? null : t(key);
}

/** Runs a lifecycle action with a pending flag, a success toast and a refresh, and toasts a domain refusal or a failure; validation failures are returned for the form (C-007). @returns the pending flag and `run` */
export function useLifecycleRunner() {
  const t = useTranslations(USE_LIFECYCLE_RUNNER_COPY_NAMESPACE);
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
        const text = refusal(t, result.code);
        if (text !== null) showToast({ tone: "danger", title: text });
      }
      return result;
    } catch {
      showToast({
        tone: "danger",
        title: t("saveFailedTitle"),
        body: t("saveFailedBody"),
      });
      return null;
    } finally {
      setIsPending(false);
    }
  };
  return { isPending, run };
}
