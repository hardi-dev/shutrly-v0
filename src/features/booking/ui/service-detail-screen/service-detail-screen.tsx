"use client";
/* eslint-disable no-restricted-syntax -- responsive detail actions */

import { useState } from "react";

import { Alert } from "@/ui/patterns/alert/alert";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";
import { Button } from "@/ui/primitives/button/button";

import { BookingFieldsCard } from "../booking-fields-card/booking-fields-card";
import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import { ServiceInfoCard } from "../service-info-card/service-info-card";
import { ServiceItemsCard } from "../service-items-card/service-items-card";
import type { ServiceDetailScreenProps } from "./service-detail-screen.types";

export function ServiceDetailScreen({
  service,
  workspaceId,
  setActiveAction,
}: Readonly<ServiceDetailScreenProps>) {
  const [pending, setPending] = useState(false);

  async function toggleActive(): Promise<void> {
    if (!workspaceId || !setActiveAction) return;
    setPending(true);
    try {
      await setActiveAction(workspaceId, "service", service.id, !service.isActive);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {setActiveAction ? (
        <PageActions>
          <Button
            variant={service.isActive ? "secondary" : "primary"}
            onPress={() => void toggleActive()}
            isPending={pending}
          >
            {service.isActive ? CATALOG_COPY.archive : CATALOG_COPY.unarchive}
          </Button>
        </PageActions>
      ) : null}
      <main className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--component-panel-app-content-gap)">
        {!service.isActive ? (
          <Alert
            tone="warning"
            title={CATALOG_COPY.archivedBannerTitle}
            body={CATALOG_COPY.archivedBannerBody}
          />
        ) : null}
        <ServiceInfoCard service={service} />
        <ServiceItemsCard service={service} />
        <BookingFieldsCard service={service} />
      </main>
    </>
  );
}
/* eslint-enable no-restricted-syntax -- end responsive detail actions */
