import { notFound, redirect } from "next/navigation";

import { signInGalleryAction } from "@/app/actions/client-access/sign-in";
import { loadClientHomeEntry } from "@/composition/gallery/client-gallery-flow/client-gallery-flow";
import { ClientGateScreen } from "@/features/gallery/ui/client-gate-screen/client-gate-screen";
import { ClientHomeScreen } from "@/features/gallery/ui/client-home-screen/client-home-screen";

export default async function ClientGalleryPage({ params }: Readonly<PageProps<"/g/[token]">>) {
  const { token } = await params;
  const result = await loadClientHomeEntry(token);
  if (result.kind === "NEUTRAL") notFound();
  if (result.kind === "PASSWORD") {
    return <ClientGateScreen gate={result.gate} action={signInGalleryAction.bind(null, token)} />;
  }
  // A-31: without groups and final delivery, Beranda would hold one card.
  if (result.value.landing === "ALL_PHOTOS") redirect(`/g/${token}/foto`);
  return <ClientHomeScreen gate={result.gate} home={result.value} token={token} />;
}
