"use client";

import { useEffect, useState } from "react";

import type {
  GalleryShareLoad,
  GalleryShareState,
  UseGalleryShareInput,
} from "./gallery-share-dialog.types";

const LOADING: GalleryShareState = { status: "loading" };
const ERROR: GalleryShareState = { status: "error" };

interface KeyedResult {
  readonly key: string;
  readonly state: GalleryShareState;
}

/**
 * Maps the loader's result to the dialog state. Every refusal is the error state, so the dialog never
 * shows a password, link or number it was not allowed to receive (AC-GFL-025).
 * @param result - the loader's result
 * @returns the dialog state
 */
export function toShareState(result: GalleryShareLoad): GalleryShareState {
  if (!result.ok) return ERROR;
  return {
    status: "ready",
    message: { recipient: result.recipient, text: result.text, waUrl: result.waUrl },
  };
}

/**
 * Tracks the open session: each time the dialog opens, the count goes up, so a message from an earlier
 * open is never shown again (its password may have been rotated since).
 * @param isOpen - whether the dialog is open
 * @returns the number of opens so far
 */
function useOpenCount(isOpen: boolean): number {
  const [wasOpen, setWasOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setOpenCount((count) => count + 1);
  }
  return openCount;
}

/**
 * Loads the share message each time the dialog opens and again whenever the revision changes, for
 * example after a client number is saved (A-8). A stale response never overwrites a newer request.
 * @param input - open state, the project, the loader and the revision
 * @returns the loading, error or ready state
 */
export function useGalleryShare(input: UseGalleryShareInput): GalleryShareState {
  const { isOpen, workspaceId, projectId, loadShare, revision } = input;
  const openCount = useOpenCount(isOpen);
  const requestKey = isOpen ? `${String(openCount)}:${String(revision)}` : null;
  const [result, setResult] = useState<KeyedResult | null>(null);
  useEffect(() => {
    if (requestKey === null) return undefined;
    let isCurrent = true;
    const settle = (state: GalleryShareState) => {
      if (isCurrent) setResult({ key: requestKey, state });
    };
    loadShare(workspaceId, projectId)
      .then((loaded) => {
        settle(toShareState(loaded));
      })
      .catch(() => {
        settle(ERROR);
      });
    return () => {
      isCurrent = false;
    };
  }, [requestKey, workspaceId, projectId, loadShare]);
  if (requestKey === null || result?.key !== requestKey) return LOADING;
  return result.state;
}
