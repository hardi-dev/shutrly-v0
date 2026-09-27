import { redirect } from "next/navigation";

import { resolveOwnerHome } from "@/composition/workspace/owner-workspace/owner-workspace";

export default async function WorkspaceHomePage() {
  const workspace = await resolveOwnerHome();
  redirect(`/w/${workspace.id}`);
}
