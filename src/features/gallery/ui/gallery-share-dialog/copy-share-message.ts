import { showToast } from "@/ui/patterns/toast/toast";

/**
 * Copies the rendered message to the clipboard and confirms with a toast (AC-GFL-023). Nothing is sent
 * by Shutrly; the Owner pastes the text into WhatsApp. When the clipboard write fails, a danger toast
 * points to the message box and the dialog stays open (Owner 2026-10-18).
 * @param text - the rendered message
 * @param copy - the toast copy: the success title and body, and the failure title
 * @returns a promise that resolves once the clipboard write has been attempted
 */
export async function copyShareMessage(
  text: string,
  copy: {
    readonly title: string;
    readonly body: string;
    readonly failedTitle: string;
  },
): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    showToast({ tone: "danger", title: copy.failedTitle });
    return;
  }
  showToast({ tone: "success", title: copy.title, body: copy.body });
}
