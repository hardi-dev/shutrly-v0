import { notFound } from "next/navigation";

import {
  reloadReviewAction,
  setPickAction,
  setPickNoteAction,
  submitSelectionGroupAction,
} from "@/app/actions/client-access/picks";
import { signInGalleryAction } from "@/app/actions/client-access/sign-in";
import { loadReviewEntry } from "@/composition/gallery/client-selection-flow/client-selection-flow";
import { ClientGateScreen } from "@/features/gallery/ui/client-gate-screen/client-gate-screen";
import { ReviewScreen } from "@/features/gallery/ui/review-screen/review-screen";

export default async function ClientReviewPage({
  params,
}: Readonly<PageProps<"/g/[token]/pilih/[groupId]/tinjau">>) {
  const { token, groupId } = await params;
  const result = await loadReviewEntry(token, groupId);
  if (result.kind === "NEUTRAL") notFound();
  if (result.kind === "PASSWORD") {
    return <ClientGateScreen gate={result.gate} action={signInGalleryAction.bind(null, token)} />;
  }
  if (result.value.kind === "NOT_FOUND") notFound();
  return (
    <ReviewScreen
      gate={result.gate}
      token={token}
      view={result.value.view}
      actions={{
        setPick: setPickAction.bind(null, token),
        setNote: setPickNoteAction.bind(null, token),
        submit: submitSelectionGroupAction.bind(null, token),
        reload: reloadReviewAction.bind(null, token),
      }}
    />
  );
}
