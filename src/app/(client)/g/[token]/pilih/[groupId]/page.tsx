import { notFound, redirect } from "next/navigation";

import {
  browsePickPhotosAction,
  reloadPickViewAction,
  setPickAction,
  setPickNoteAction,
} from "@/app/actions/client-access/picks";
import { signInGalleryAction } from "@/app/actions/client-access/sign-in";
import { loadPickEntry } from "@/composition/gallery/client-selection-flow/client-selection-flow";
import { ClientGateScreen } from "@/features/gallery/ui/client-gate-screen/client-gate-screen";
import { PickScreen } from "@/features/gallery/ui/pick-screen/pick-screen";

export default async function ClientPickPage({
  params,
}: Readonly<PageProps<"/g/[token]/pilih/[groupId]">>) {
  const { token, groupId } = await params;
  const result = await loadPickEntry(token, groupId);
  if (result.kind === "NEUTRAL") notFound();
  if (result.kind === "PASSWORD") {
    return <ClientGateScreen gate={result.gate} action={signInGalleryAction.bind(null, token)} />;
  }
  const load = result.value;
  if (load.kind === "NOT_FOUND") notFound();
  // D-2: a group that isn't OPEN shows its picks read-only on Tinjau / Lihat pilihan.
  if (load.kind === "NOT_OPEN") redirect(`/g/${token}/pilih/${groupId}/tinjau`);
  return (
    <PickScreen
      gate={result.gate}
      token={token}
      view={load.view}
      initialPage={load.firstPage}
      actions={{
        setPick: setPickAction.bind(null, token),
        setNote: setPickNoteAction.bind(null, token),
        browse: browsePickPhotosAction.bind(null, token),
        reload: reloadPickViewAction.bind(null, token),
      }}
    />
  );
}
