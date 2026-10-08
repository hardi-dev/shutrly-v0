/**
 * Copies text with the Clipboard API. Some browsers refuse it (in-app browsers, embedded webviews,
 * an unfocused document); callers then select the text on the page with `selectContents`.
 * @param text - what to copy
 * @returns whether the text reached the clipboard
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    // Absent in insecure contexts and old webviews; the type says it always exists.
    if (!("clipboard" in navigator)) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Selects an element's text, so the user copies it with one shortcut or the phone's Copy menu.
 * @param element - the element whose text to select
 */
export function selectContents(element: HTMLElement): void {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);
}
