import { showToast } from "@/ui/patterns/toast/toast";

/**
 * Copies the rendered message to the clipboard and confirms with a toast (AC-GFL-023). Nothing is sent
 * by Shutrly; the Owner pastes the text into WhatsApp. A failed copy is not reported here (see the
 * SPEC GAP in the iteration report), so the caller keeps the dialog open.
 * @param text - the rendered message
 * @param copy - the toast copy: title and body
 * @returns a promise that resolves once the clipboard write has been attempted
 */
export async function copyShareMessage(
  text: string,
  copy: { readonly title: string; readonly body: string },
): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    return;
  }
  showToast({ tone: "success", title: copy.title, body: copy.body });
}
