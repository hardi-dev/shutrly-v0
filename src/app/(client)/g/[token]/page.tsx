import { notFound } from "next/navigation";

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
  // F-22 R-7: Beranda always renders, even with only the Semua foto card (A-31 withdrawn).
  return <ClientHomeScreen gate={result.gate} home={result.value} token={token} />;
}
