const PROJECT_LIST_SECTIONS = new Set(["completed", "cancelled"]);
const SERVICE_TAB_SECTIONS = new Set(["categories", "items"]);
const GALLERY_TAIL = /^gallery(\/picks(\/[^/]+)?)?$/u;

/**
 * Whether this Owner path renders its own page heading in the `@heading` slot: a project's detail, gallery,
 * picks and picks group, Proyek baru, and a service's detail. Next hands the layout the slot as an element
 * even when the slot's default renders nothing, so the shell cannot tell an empty slot from a heading. The
 * path can, as hidesOwnerBottomNav already reads it. Any other path keeps the URL-derived heading.
 * @param pathname - the current pathname
 * @param workspaceId - the workspace the path belongs to
 * @returns true when the path renders its heading on the server
 */
export function hasServerPageHeading(pathname: string, workspaceId: string): boolean {
  const prefix = `/w/${workspaceId}/`;
  if (!pathname.startsWith(prefix)) return false;
  const [section = "", id = "", ...tail] = pathname
    .slice(prefix.length)
    .replace(/\/$/u, "")
    .split("/");
  if (section === "projects") return isProjectHeadingPath(id, tail);
  return (
    section === "services" && id.length > 0 && !SERVICE_TAB_SECTIONS.has(id) && tail.length === 0
  );
}

function isProjectHeadingPath(id: string, tail: readonly string[]): boolean {
  if (id === "new") return tail.length === 0;
  if (id.length === 0 || PROJECT_LIST_SECTIONS.has(id)) return false;
  return tail.length === 0 || GALLERY_TAIL.test(tail.join("/"));
}
