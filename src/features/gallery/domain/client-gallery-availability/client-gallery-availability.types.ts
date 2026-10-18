export interface AvailabilityInput {
  /** The stored project status as read; validated by the domain, not trusted by type. */
  readonly projectStatus: string;
  readonly expiresAt: Date | null;
  readonly now: Date;
}
