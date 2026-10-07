import { notFound, redirect } from "next/navigation";

import { signInGalleryAction } from "@/app/actions/client-access/sign-in";
import { loadClientDeliveryEntry } from "@/composition/gallery/client-gallery-flow/client-gallery-flow";
import { ClientGateScreen } from "@/features/gallery/ui/client-gate-screen/client-gate-screen";
import { DeliveryScreen } from "@/features/gallery/ui/delivery-screen/delivery-screen";

export default async function ClientDeliveryPage({
  params,
}: Readonly<PageProps<"/g/[token]/final">>) {
  const { token } = await params;
  const result = await loadClientDeliveryEntry(token);
  if (result.kind === "NEUTRAL") notFound();
  if (result.kind === "PASSWORD") {
    return <ClientGateScreen gate={result.gate} action={signInGalleryAction.bind(null, token)} />;
  }
  // Before final delivery there is nothing here: back to Beranda (TD › Server / API Interface).
  if (result.value === null) redirect(`/g/${token}`);
  return <DeliveryScreen gate={result.gate} token={token} files={result.value} />;
}
