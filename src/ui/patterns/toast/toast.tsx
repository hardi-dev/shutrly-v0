"use client";

import { useToast, useToastRegion } from "@react-aria/toast";
import { ToastQueue, useToastQueue } from "@react-stately/toast";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { Alert } from "../alert/alert";
import { TOAST_COPY } from "./toast.copy";
import type {
  ToastContent,
  ToastItemProps,
  ToastOnMountProps,
  ToastOptions,
  ToastRegionProps,
} from "./toast.types";

const TOAST_DEFAULT_TIMEOUT = 5000;
const EMPTY_SUBSCRIBE = () => () => undefined;
const CLIENT_MOUNTED = () => true;
const SERVER_UNMOUNTED = () => false;
const TOAST_ON_MOUNT_STORAGE_PREFIX = "shutrly:toast-on-mount:";
const inMemoryToastKeys = new Set<string>();

export const toastQueue = new ToastQueue<ToastContent>({ maxVisibleToasts: 3 });

/** Adds a feedback toast to the shared React Aria queue.
 * @param content - tone, title and optional body rendered through Alert
 * @param options - timeout and close callback
 * @returns the queue key for programmatic dismissal
 */
export function showToast(content: ToastContent, options: ToastOptions = {}) {
  return toastQueue.add(content, {
    timeout: options.timeout ?? TOAST_DEFAULT_TIMEOUT,
    onClose: options.onClose,
  });
}

/** Shows one toast after a route-driven success state mounts.
 * @param props - toast tone and copy
 * @returns no visible DOM; the toast is mounted by ToastRegion
 */
export function ToastOnMount({ tone, title, body, dedupeKey }: Readonly<ToastOnMountProps>) {
  const hasQueued = useRef(false);
  const eventKey = dedupeKey ?? `${tone}:${title}:${body ?? ""}`;

  useEffect(() => {
    if (hasQueued.current) return;
    hasQueued.current = true;
    if (!claimToastOnMount(eventKey)) return;
    showToast({ tone, title, body });
  }, [body, eventKey, title, tone]);

  return null;
}

function claimToastOnMount(eventKey: string): boolean {
  const storageKey = `${TOAST_ON_MOUNT_STORAGE_PREFIX}${eventKey}`;
  try {
    if (window.sessionStorage.getItem(storageKey)) return false;
    window.sessionStorage.setItem(storageKey, "1");
    return true;
  } catch {
    if (inMemoryToastKeys.has(storageKey)) return false;
    inMemoryToastKeys.add(storageKey);
    return true;
  }
}

/** Renders the shared toast queue into document.body through a portal.
 * @param props - optional accessible landmark label
 * @returns the portal-mounted toast region
 */
export function ToastRegion({ ariaLabel = TOAST_COPY.regionLabel }: Readonly<ToastRegionProps>) {
  const isMounted = useSyncExternalStore(EMPTY_SUBSCRIBE, CLIENT_MOUNTED, SERVER_UNMOUNTED);
  const regionRef = useRef<HTMLDivElement>(null);
  const state = useToastQueue(toastQueue);
  const { regionProps } = useToastRegion({ "aria-label": ariaLabel }, state, regionRef);

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div
      {...regionProps}
      ref={regionRef}
      className="pointer-events-none fixed inset-x-0 top-(--space-4) z-50 flex flex-col items-center gap-(--space-3) px-(--space-4) outline-none md:bottom-(--space-4) md:top-auto md:items-end md:px-(--space-6)"
    >
      {state.visibleToasts.map((toast) => (
        <ToastItem key={toast.key} toast={toast} state={state} />
      ))}
    </div>,
    document.body,
  );
}

function ToastItem({ toast, state }: Readonly<ToastItemProps>) {
  const toastRef = useRef<HTMLDivElement>(null);
  const { toastProps, contentProps, titleProps, descriptionProps } = useToast(
    { toast },
    state,
    toastRef,
  );
  const handleClose = () => {
    state.close(toast.key);
  };

  return (
    <div {...toastProps} ref={toastRef} className="pointer-events-auto w-full max-w-[420px]">
      <div {...contentProps}>
        <Alert
          tone={toast.content.tone}
          title={toast.content.title}
          body={toast.content.body}
          titleId={titleProps.id}
          bodyId={descriptionProps.id}
          onClose={handleClose}
          closeLabel={toast.content.closeLabel ?? TOAST_COPY.close}
          action={toast.content.action}
          className="shadow-[0_4px_16px_var(--color-semantic-elevation-1-color)]"
        />
      </div>
    </div>
  );
}
