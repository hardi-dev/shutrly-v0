import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import type {
  MetricRing as MetricRingValue,
  MetricTiles,
  MetricTrend,
} from "@/features/booking/domain/dashboard-metrics/dashboard-metrics.types";
import { MetricRing } from "@/ui/patterns/metric-ring/metric-ring";
import { MetricSpark } from "@/ui/patterns/metric-spark/metric-spark";
import { MetricTile } from "@/ui/patterns/metric-tile/metric-tile";
import { MetricDelta } from "@/ui/primitives/metric-delta/metric-delta";

import { DASHBOARD_OVERVIEW_COPY_NAMESPACE } from "./dashboard-overview.copy";

/** Four tiles in lifecycle order. The monthly tiles show a trend and a 7-month spark; the live tiles show a ring, and *To review* a waiting badge (AC-DASH-021…035). @param props - the tile values @returns the tile row */
export function DashboardMetricTiles({
  tiles,
  isMobile = false,
}: Readonly<{ tiles: MetricTiles; isMobile?: boolean }>) {
  const t = useTranslations(DASHBOARD_OVERVIEW_COPY_NAMESPACE);
  const grid = isMobile ? "grid grid-cols-2 gap-(--space-3)" : "grid grid-cols-4 gap-(--space-4)";
  return (
    <div className={grid}>
      <MonthlyTile
        label={t("tileNewProjects")}
        value={tiles.newProjects.value}
        trend={tiles.newProjects.trend}
        spark={tiles.newProjects.spark}
      />
      <MetricTile
        label={t("tileToReview")}
        value={String(tiles.toReview.value)}
        delta={
          tiles.toReview.waiting === null ? null : <WaitingBadge count={tiles.toReview.waiting} />
        }
        chart={tiles.toReview.ring === null ? null : <WaitingRing ring={tiles.toReview.ring} />}
      />
      <MetricTile
        label={t("tileInEditing")}
        value={String(tiles.inEditing.value)}
        chart={tiles.inEditing.ring === null ? null : <ReadyRing ring={tiles.inEditing.ring} />}
      />
      <MonthlyTile
        label={t("tileDelivered")}
        value={tiles.delivered.value}
        trend={tiles.delivered.trend}
        spark={tiles.delivered.spark}
      />
    </div>
  );
}

function MonthlyTile({
  label,
  value,
  trend,
  spark,
}: Readonly<{
  label: string;
  value: number;
  trend: MetricTrend | null;
  spark: readonly number[];
}>) {
  const t = useTranslations(DASHBOARD_OVERVIEW_COPY_NAMESPACE);
  const delta: ReactNode = trend === null ? null : <TrendBadge trend={trend} />;
  return (
    <MetricTile
      label={label}
      value={String(value)}
      delta={delta}
      chart={<MetricSpark values={spark} label={t("sparkLabel", { label })} />}
    />
  );
}

function TrendBadge({ trend }: Readonly<{ trend: MetricTrend }>) {
  const t = useTranslations(DASHBOARD_OVERVIEW_COPY_NAMESPACE);
  // The minus sign is U+2212, as AC-DASH-033 writes it.
  const value = `${trend.delta > 0 ? "+" : "−"}${String(Math.abs(trend.delta))}`;
  return <MetricDelta tone={trend.tone} value={value} srText={t("trendLabel", { delta: value })} />;
}

function WaitingBadge({ count }: Readonly<{ count: number }>) {
  const t = useTranslations(DASHBOARD_OVERVIEW_COPY_NAMESPACE);
  return <MetricDelta tone="warning" value={t("waitingBadge", { count })} />;
}

function WaitingRing({ ring }: Readonly<{ ring: MetricRingValue }>) {
  const t = useTranslations(DASHBOARD_OVERVIEW_COPY_NAMESPACE);
  const label = t("ringWaitingLabel", { waiting: ring.part, total: ring.total });
  return <MetricRing part={ring.part} total={ring.total} label={label} />;
}

function ReadyRing({ ring }: Readonly<{ ring: MetricRingValue }>) {
  const t = useTranslations(DASHBOARD_OVERVIEW_COPY_NAMESPACE);
  const label = t("ringReadyLabel", { ready: ring.part, total: ring.total });
  return <MetricRing part={ring.part} total={ring.total} label={label} />;
}
