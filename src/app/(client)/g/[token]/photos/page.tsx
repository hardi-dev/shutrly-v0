import { notFound } from "next/navigation";

import { browseClientPhotosAction } from "@/app/actions/client-access/browse";
import {
  reloadPickTargetsAction,
  setPickAction,
  setPickNoteAction,
} from "@/app/actions/client-access/picks";
import { signInGalleryAction } from "@/app/actions/client-access/sign-in";
import { loadClientBrowseEntry } from "@/composition/gallery/client-gallery-flow/client-gallery-flow";
import { ClientBrowseScreen } from "@/features/gallery/ui/client-browse-screen/client-browse-screen";
import { ClientGateScreen } from "@/features/gallery/ui/client-gate-screen/client-gate-screen";

export default async function ClientPhotosPage({
  params,
}: Readonly<PageProps<"/g/[token]/photos">>) {
  const { token } = await params;
  const result = await loadClientBrowseEntry(token);
  if (result.kind === "NEUTRAL") notFound();
  if (result.kind === "PASSWORD") {
    return <ClientGateScreen gate={result.gate} action={signInGalleryAction.bind(null, token)} />;
  }
  return (
    <ClientBrowseScreen
      gate={result.gate}
      token={token}
      hasHome={result.value.home.landing === "HOME"}
      initialPage={result.value.firstPage}
      browseAction={browseClientPhotosAction.bind(null, token)}
      targets={result.value.targets}
      pickActions={{
        setPick: setPickAction.bind(null, token),
        setNote: setPickNoteAction.bind(null, token),
        reload: reloadPickTargetsAction.bind(null, token),
      }}
    />
  );
}
