const STORAGE_KEY = "shutrly.sidebar.collapsed";

/** Reads the per-browser sidebar collapse preference, falling back to expanded. */
export function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/** Persists the per-browser sidebar collapse preference without breaking the shell. */
export function writeCollapsed(value: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // Storage is optional browser state.
  }
}
