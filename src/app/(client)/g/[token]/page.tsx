import { notFound } from "next/navigation";

import { signInGalleryAction } from "@/app/actions/client-access/sign-in";
import { loadClientGate } from "@/composition/gallery/client-access-flow/client-access-flow";
import { ClientGateScreen } from "@/features/gallery/ui/client-gate-screen/client-gate-screen";
import { ClientHomePlaceholder } from "@/features/gallery/ui/client-home-placeholder/client-home-placeholder";

export default async function ClientGalleryPage({ params }: Readonly<PageProps<"/g/[token]">>) {
  const { token } = await params;
  const gate = await loadClientGate(token);
  if (gate.kind === "NEUTRAL") notFound();
  if (gate.kind === "PASSWORD") {
    return <ClientGateScreen gate={gate.gate} action={signInGalleryAction.bind(null, token)} />;
  }
  return <ClientHomePlaceholder gate={gate.gate} />;
}
