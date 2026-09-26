import { EmailDeliveryError } from "@/features/auth/application/errors/email-delivery-error/email-delivery-error";
import type {
  AuthEmailPort,
  AuthLink,
  AuthLinkKind,
} from "@/features/auth/application/ports/auth-email/auth-email.port";

/** Test double for the email port: records sent links, or fails every send when `failing`. */
export class RecordingEmailSender implements AuthEmailPort {
  readonly sent: AuthLink[] = [];
  failing = false;

  send(link: AuthLink): Promise<void> {
    if (this.failing) return Promise.reject(new EmailDeliveryError(link.kind, 503));
    this.sent.push(link);
    return Promise.resolve();
  }

  linksTo(to: string, kind: AuthLinkKind): AuthLink[] {
    return this.sent.filter((link) => link.to === to && link.kind === kind);
  }

  lastUrl(to: string, kind: AuthLinkKind): string | undefined {
    return this.linksTo(to, kind).at(-1)?.url;
  }
}
