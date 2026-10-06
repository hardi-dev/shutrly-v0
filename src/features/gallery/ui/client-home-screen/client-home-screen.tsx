import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";

import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import { ClientShell } from "../client-shell/client-shell";
import { GroupSummary } from "../group-summary/group-summary";
import { CLIENT_HOME_COPY as COPY } from "./client-home-screen.copy";
import type { ClientHomeScreenProps, GroupCardProps } from "./client-home-screen.types";
import { clientHomeSubtitle } from "./client-home-subtitle";

function GroupCard({ group, token, isLast }: Readonly<GroupCardProps>) {
  const href =
    group.action === "VIEW"
      ? `/g/${token}/pilih/${group.id}/tinjau`
      : `/g/${token}/pilih/${group.id}`;
  const action =
    group.action === "NONE" ? null : (
      <Button href={href} variant={group.isPrimary ? "primary" : "secondary"}>
        {COPY.actions[group.action]}
      </Button>
    );
  return (
    <li className={isLast ? undefined : "border-b border-(--color-semantic-border-subtle)"}>
      <GroupSummary {...group} action={action} />
    </li>
  );
}

function FinalReadyCard({ home, token }: Readonly<Omit<ClientHomeScreenProps, "gate">>) {
  return (
    <SectionCard
      title={COPY.finalReadyTitle}
      description={COPY.finalReadyBody(home.editedCount, home.printCount)}
      actions={
        <Button href={`/g/${token}/hasil-akhir`} iconLeading="download">
          {COPY.finalReadyAction}
        </Button>
      }
      content="bleed"
    >
      {null}
    </SectionCard>
  );
}

function PhotosCard({ home, token }: Readonly<Omit<ClientHomeScreenProps, "gate">>) {
  const delivered = home.finalDeliveryPublished;
  const meta =
    home.groups.length > 0
      ? COPY.allPhotosMeta(home.proofCount)
      : COPY.allPhotosMetaNoGroups(home.proofCount);
  return (
    <SectionCard
      title={COPY.photosTitle}
      description={delivered ? COPY.photosDescriptionDelivered : COPY.photosDescription}
      content="flush"
    >
      <ul>
        <ListCardItem
          icon="images"
          title={CLIENT_COPY.allPhotos}
          meta={meta}
          href={`/g/${token}/foto`}
          isLast={delivered}
        />
        {delivered ? null : (
          <ListCardItem
            icon="package-check"
            title={CLIENT_COPY.finalDelivery}
            meta={COPY.finalPendingMeta}
            isLast
          />
        )}
      </ul>
    </SectionCard>
  );
}

/** Beranda: *Hasil akhir siap* once delivered, *Foto Anda* and one card per group (beranda jwDqh / jXn9U / UIXl3, A-24, AC-SEL-001). @param props - gate names, the Beranda view and the token for links @returns the page */
export function ClientHomeScreen({ gate, home, token }: Readonly<ClientHomeScreenProps>) {
  return (
    <ClientShell
      gate={gate}
      width="narrow"
      header={{
        title: COPY.greeting(gate.clientFirstName),
        subtitle: clientHomeSubtitle(home),
        breadcrumbs: [{ label: CLIENT_COPY.home }],
      }}
    >
      {home.finalDeliveryPublished ? <FinalReadyCard home={home} token={token} /> : null}
      <PhotosCard home={home} token={token} />
      {home.groups.length > 0 ? (
        <SectionCard title={COPY.pickTitle} description={COPY.pickDescription} content="flush">
          <ul>
            {home.groups.map((group, index) => (
              <GroupCard
                key={group.id}
                group={group}
                token={token}
                isLast={index === home.groups.length - 1}
              />
            ))}
          </ul>
        </SectionCard>
      ) : null}
    </ClientShell>
  );
}
