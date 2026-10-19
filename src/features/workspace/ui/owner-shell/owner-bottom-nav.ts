const PROJECT_LIST_SECTIONS = new Set(["completed", "cancelled"]);
const GALLERY_TAIL = /^gallery(\/picks(\/[^/]+)?)?$/u;

/**
 * Whether the phone Bottom Nav is hidden on this Owner path: Proyek baru, and a project's detail, gallery,
 * picks and picks group, which have their own sticky action bar (AC-PRJ-007). Pages set this by path, so
 * the shell knows it on the first render, before the page heading is in place.
 * @param pathname - the current pathname
 * @param workspaceId - the workspace the path belongs to
 * @returns true when the Bottom Nav is hidden
 */
export function hidesOwnerBottomNav(pathname: string, workspaceId: string): boolean {
  const prefix = `/w/${workspaceId}/projects/`;
  if (!pathname.startsWith(prefix)) return false;
  const rest = pathname.slice(prefix.length).replace(/\/$/u, "");
  if (rest === "new") return true;
  const [projectId, ...tail] = rest.split("/");
  if (!projectId || PROJECT_LIST_SECTIONS.has(projectId)) return false;
  return tail.length === 0 || GALLERY_TAIL.test(tail.join("/"));
}
