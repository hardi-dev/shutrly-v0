import { notFound } from "next/navigation";

import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { isComingSoonSection } from "@/composition/workspace/workspace-flow/workspace-flow";
import { ComingSoonScreen } from "@/features/workspace/ui/coming-soon-screen/coming-soon-screen";

export default async function ComingSoonPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; section: string }> }>) {
  const { workspaceId, section } = await params;
  await verifyOwnerWorkspace(workspaceId);
  if (!isComingSoonSection(section)) notFound();
  return <ComingSoonScreen workspaceId={workspaceId} section={section} />;
}
