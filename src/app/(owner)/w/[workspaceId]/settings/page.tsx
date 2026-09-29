import { saveWorkspaceSettingsAction } from "@/app/actions/workspace/settings";
import { loadWorkspaceProfile } from "@/composition/workspace/workspace-flow/workspace-flow";
import { SettingsScreen } from "@/features/workspace/ui/settings-screen/settings-screen";

export default async function SettingsPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string }> }>) {
  const { workspaceId } = await params;
  const { profile } = await loadWorkspaceProfile(workspaceId);
  const action = saveWorkspaceSettingsAction.bind(null, workspaceId);
  return <SettingsScreen action={action} profile={profile} />;
}
