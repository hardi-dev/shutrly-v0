import { loadMessageTemplateList } from "@/composition/communications/message-template-flow/message-template-flow";
import { TemplateListScreen } from "@/features/communications/ui/template-list-screen/template-list-screen";

export default async function MessageTemplatesPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string }> }>) {
  const { workspaceId } = await params;
  const { types } = await loadMessageTemplateList(workspaceId);
  return <TemplateListScreen workspaceId={workspaceId} types={types} />;
}
