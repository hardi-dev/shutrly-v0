import { useTranslations } from "next-intl";

import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";

import { ClientShell } from "../client-shell/client-shell";
import { GroupSummary } from "../group-summary/group-summary";
import {
  CLIENT_HOME_COPY_NAMESPACE,
  CLIENT_HOME_SHARED_NAMESPACE,
} from "./client-home-screen.copy";
import type { ClientHomeScreenProps, GroupCardProps } from "./client-home-screen.types";
import { clientHomeSubtitle } from "./client-home-subtitle";

const ACTION_KEYS = {
  START: "actionStart",
  CONTINUE: "actionContinue",
  VIEW: "actionView",
} as const;

function GroupCard({ group, token, isLast }: Readonly<GroupCardProps>) {
  const t = useTranslations(CLIENT_HOME_COPY_NAMESPACE);
  const href =
    group.action === "VIEW"
      ? `/g/${token}/picks/${group.id}/review`
      : `/g/${token}/picks/${group.id}`;
  const action =
    group.action === "NONE" ? null : (
      <Button href={href} variant={group.isPrimary ? "primary" : "secondary"}>
        {t(ACTION_KEYS[group.action])}
      </Button>
    );
  return (
    <li className={isLast ? undefined : "border-b border-(--color-semantic-border-subtle)"}>
      <GroupSummary {...group} action={action} />
    </li>
  );
}

function FinalReadyCard({ home, token }: Readonly<Omit<ClientHomeScreenProps, "gate">>) {
  const t = useTranslations(CLIENT_HOME_COPY_NAMESPACE);
  return (
    <SectionCard
      title={t("finalReadyTitle")}
      description={t("finalReadyBody", { edited: home.editedCount, print: home.printCount })}
      actions={
        <Button href={`/g/${token}/final`} iconLeading="download">
          {t("finalReadyAction")}
        </Button>
      }
      content="bleed"
    >
      {null}
    </SectionCard>
  );
}

function PhotosCard({ home, token }: Readonly<Omit<ClientHomeScreenProps, "gate">>) {
  const t = useTranslations(CLIENT_HOME_COPY_NAMESPACE);
  const shared = useTranslations(CLIENT_HOME_SHARED_NAMESPACE);
  const delivered = home.finalDeliveryPublished;
  const meta =
    home.groups.length > 0
      ? t("allPhotosMeta", { count: home.proofCount })
      : t("allPhotosMetaNoGroups", { count: home.proofCount });
  return (
    <SectionCard
      title={t("photosTitle")}
      description={delivered ? t("photosDescriptionDelivered") : t("photosDescription")}
      content="flush"
    >
      <ul>
        <ListCardItem
          icon="images"
          title={shared("allPhotos")}
          meta={meta}
          href={`/g/${token}/photos`}
          isLast={delivered}
        />
        {delivered ? null : (
          <ListCardItem
            icon="package-check"
            title={shared("finalDelivery")}
            meta={t("finalPendingMeta")}
            isLast
          />
        )}
      </ul>
    </SectionCard>
  );
}

/** Beranda: *Hasil akhir siap* once delivered, *Foto Anda* and one card per group (beranda jwDqh / jXn9U / UIXl3, A-24, AC-SEL-001). @param props - gate names, the Beranda view and the token for links @returns the page */
export function ClientHomeScreen({ gate, home, token }: Readonly<ClientHomeScreenProps>) {
  const t = useTranslations(CLIENT_HOME_COPY_NAMESPACE);
  const shared = useTranslations(CLIENT_HOME_SHARED_NAMESPACE);
  return (
    <ClientShell
      gate={gate}
      width="narrow"
      header={{
        title: t("greeting", { name: gate.clientFirstName }),
        subtitle: clientHomeSubtitle(t, home),
        breadcrumbs: [{ label: shared("home") }],
      }}
    >
      {home.finalDeliveryPublished ? <FinalReadyCard home={home} token={token} /> : null}
      <PhotosCard home={home} token={token} />
      {home.groups.length > 0 ? (
        <SectionCard title={t("pickTitle")} description={t("pickDescription")} content="flush">
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
