export type LifecycleResult = { readonly ok: true } | { readonly ok: false; readonly code: string };

export interface LifecycleToast {
  readonly title: string;
  readonly body?: string;
}
