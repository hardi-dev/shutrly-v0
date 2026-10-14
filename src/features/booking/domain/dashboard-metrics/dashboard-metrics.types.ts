export interface MetricWindows {
  readonly today: string;
  readonly monthStart: string;
  readonly prevMonthStart: string;
  readonly prevEnd: string;
  readonly sparkStart: string;
  readonly months: readonly string[];
  readonly now: Date;
}

export interface MonthlyCount {
  readonly month: string;
  readonly count: number;
}

export interface MetricFacts {
  readonly newThisMonth: number;
  readonly newPrev: number;
  readonly toReview: number;
  readonly toReviewWaiting: number;
  readonly inEditing: number;
  readonly inEditingReady: number;
  readonly deliveredThisMonth: number;
  readonly deliveredPrev: number;
  readonly newByMonth: readonly MonthlyCount[];
  readonly deliveredByMonth: readonly MonthlyCount[];
}

export type MetricTone = "positive" | "warning";

export interface MetricTrend {
  readonly delta: number;
  readonly tone: MetricTone;
}

export interface MetricRing {
  readonly part: number;
  readonly total: number;
}

export interface MetricTiles {
  readonly newProjects: {
    readonly value: number;
    readonly trend: MetricTrend | null;
    readonly spark: readonly number[];
  };
  readonly toReview: {
    readonly value: number;
    readonly waiting: number | null;
    readonly ring: MetricRing | null;
  };
  readonly inEditing: {
    readonly value: number;
    readonly ring: MetricRing | null;
  };
  readonly delivered: {
    readonly value: number;
    readonly trend: MetricTrend | null;
    readonly spark: readonly number[];
  };
}
