export interface NextTitleInput {
  readonly currentTitle: string;
  readonly lastDefault: string | null;
  readonly serviceName: string | null;
  readonly clientName: string | null;
}

export interface NextTitleResult {
  readonly title: string;
  readonly lastDefault: string | null;
}
