function isPlainClick(event: MouseEvent): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

function anchorOf(event: MouseEvent): HTMLAnchorElement | null {
  const target = event.target;
  const anchor = target instanceof Element ? target.closest("a[href]") : null;
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  return anchor.target === "_blank" || anchor.hasAttribute("download") ? null : anchor;
}

/**
 * Returns the in-app destination of a plain left click on a same-origin link, so the editor
 * can ask before leaving (A-7). New-tab clicks, external links and the current page pass.
 * @param event - the document click
 * @param origin - the app origin
 * @param currentPath - the current pathname plus search
 * @returns the destination path, or null when the click should proceed
 */
export function internalHrefOf(
  event: MouseEvent,
  origin: string,
  currentPath: string,
): string | null {
  const anchor = isPlainClick(event) ? anchorOf(event) : null;
  if (!anchor) return null;
  const url = new URL(anchor.href, origin);
  if (url.origin !== origin || `${url.pathname}${url.search}` === currentPath) return null;
  return `${url.pathname}${url.search}${url.hash}`;
}
