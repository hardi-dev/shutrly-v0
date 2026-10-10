/**
 * Saves a downloaded blob under its name through a temporary `<a download>`; some phone browsers
 * ask before each file (risk R-6).
 * @param blob - the file's bytes
 * @param fileName - the original name
 */
export function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  // Revoked later: some browsers start reading the object URL after click() returns.
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60_000);
}
