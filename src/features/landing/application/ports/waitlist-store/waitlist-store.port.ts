import "server-only";

/**
 * Where waitlist emails live (ADR-022: Resend Contacts, one segment per environment). Adding an
 * email that is already there must succeed without changing the entry (A-1).
 */
export interface WaitlistStorePort {
  add: (email: string) => Promise<void>;
}
