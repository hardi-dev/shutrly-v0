import { saveMessageTemplateAction } from "@/app/actions/communications/message-templates";
import { loadMessageTemplateEditor } from "@/composition/communications/message-template-flow/message-template-flow";
import { TemplateEditorScreen } from "@/features/communications/ui/template-editor-screen/template-editor-screen";

export default async function MessageTemplateEditorPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; templateType: string }> }>) {
  const { workspaceId, templateType } = await params;
  const editor = await loadMessageTemplateEditor(workspaceId, templateType);
  const action = saveMessageTemplateAction.bind(null, workspaceId, templateType);
  return <TemplateEditorScreen key={editor.type} editor={editor} action={action} />;
}
