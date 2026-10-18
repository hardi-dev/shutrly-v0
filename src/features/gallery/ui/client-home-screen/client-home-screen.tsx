import { useTranslations } from "next-intl";

import type { ClientHomeView } from "@/features/gallery/application/use-cases/get-client-home/get-client-home.types";
import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";

import type { ClientTranslate } from "../client-copy/client-copy.types";
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

/** The group's button: a disabled *Mulai memilih* while no photo is visible (AC-GFL-009). @param props - the group, the token and whether it is the last row @returns the button, or null when the group offers nothing */
function GroupAction({ group, token }: Readonly<Omit<GroupCardProps, "isLast">>) {
  const t = useTranslations(CLIENT_HOME_COPY_NAMESPACE);
  if (group.action === "NONE") return null;
  const variant = group.isPrimary ? "primary" : "secondary";
  if (group.isDisabled) {
    return (
      <Button isDisabled variant={variant}>
        {t(ACTION_KEYS[group.action])}
      </Button>
    );
  }
  const href =
    group.action === "VIEW"
      ? `/g/${token}/picks/${group.id}/review`
      : `/g/${token}/picks/${group.id}`;
  return (
    <Button href={href} variant={variant}>
      {t(ACTION_KEYS[group.action])}
    </Button>
  );
}

function GroupCard({ group, token, isLast }: Readonly<GroupCardProps>) {
  return (
    <li className={isLast ? undefined : "border-b border-(--color-semantic-border-subtle)"}>
      <GroupSummary {...group} action={<GroupAction group={group} token={token} />} />
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

function allPhotosMeta(t: ClientTranslate, home: ClientHomeView): string {
  if (home.proofCount === 0) return t("subtitleNoPhotos");
  return home.groups.length > 0
    ? t("allPhotosMeta", { count: home.proofCount })
    : t("allPhotosMetaNoGroups", { count: home.proofCount });
}

/** The *Hasil akhir* row: linked once a finished file is synced, without any delivery step (AC-GFL-019). @param props - the Beranda view and the token for the link @returns the row */
function FinalRow({ home, token }: Readonly<Pick<ClientHomeScreenProps, "home" | "token">>) {
  const t = useTranslations(CLIENT_HOME_COPY_NAMESPACE);
  const shared = useTranslations(CLIENT_HOME_SHARED_NAMESPACE);
  const { editedCount, printCount } = home;
  if (editedCount + printCount === 0) {
    return (
      <ListCardItem
        icon="package-check"
        title={shared("finalDelivery")}
        meta={t("finalUnavailable")}
        isLast
      />
    );
  }
  return (
    <ListCardItem
      icon="package-check"
      title={shared("finalDelivery")}
      meta={t("finalReadyNoDate", { edited: editedCount, print: printCount })}
      href={`/g/${token}/final`}
      isLast
    />
  );
}

function PhotosCard({ home, token }: Readonly<Omit<ClientHomeScreenProps, "gate">>) {
  const t = useTranslations(CLIENT_HOME_COPY_NAMESPACE);
  const shared = useTranslations(CLIENT_HOME_SHARED_NAMESPACE);
  const delivered = home.finalDeliveryPublished;
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
          meta={allPhotosMeta(t, home)}
          href={`/g/${token}/photos`}
          isLast={false}
        />
        <FinalRow home={home} token={token} />
      </ul>
    </SectionCard>
  );
}

/** Beranda: *Hasil akhir siap* once delivered, *Foto Anda* with its *Hasil akhir* row, and one card per group (beranda exports, A-24, AC-SEL-001, AC-GFL-009, AC-GFL-019). @param props - gate names, the Beranda view and the token for links @returns the page */
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
