/** The copy the next-session label is built from; `todayAt` takes the 24-hour start time. */
export interface NextSessionTexts {
  readonly none: string;
  readonly today: string;
  readonly todayAt: (time: string) => string;
}
