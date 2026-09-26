/**
 * Base class for expected, typed failures. Subclasses set a stable `code` that the edge maps to
 * a user message.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  /**
   * @param message - developer-facing description, in English
   * @param options - standard error options, e.g. the `cause`
   */
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}
