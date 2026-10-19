import "server-only";

import { z } from "zod";

import { createWebCryptoGalleryPasswordCipher } from "@/adapters/crypto/gallery-password-cipher/web-crypto-gallery-password-cipher";
import type { DbExecutor } from "@/adapters/db/client/client.types";
import { createDrizzleClientLinkReader } from "@/adapters/db/gallery-repository/drizzle-client-link-reader";
import { createDrizzleGalleryRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-repository";
import { createDrizzleShareRecipientReader } from "@/adapters/db/gallery-repository/drizzle-share-recipient-reader";
import { createDrizzleMessageTemplateRepository } from "@/adapters/db/message-template-repository/drizzle-message-template-repository";
import { createDrizzleWorkspaceRepository } from "@/adapters/db/workspace-repository/drizzle-workspace-repository";
import { formatWhatsappNumber } from "@/features/booking/domain/whatsapp-number/whatsapp-number";
import { getMessageTemplate } from "@/features/communications/application/use-cases/get-message-template/get-message-template";
import { renderTemplateForRecipient } from "@/features/communications/application/use-cases/render-template-for-recipient/render-template-for-recipient";
import { whatsappLink } from "@/features/communications/domain/whatsapp-link/whatsapp-link";
import { GalleryError } from "@/features/gallery/application/errors/gallery-errors/gallery-errors";
import { getGalleryShare } from "@/features/gallery/application/use-cases/get-gallery-share/get-gallery-share";
import type {
  GalleryShare,
  GetGalleryShareDeps,
} from "@/features/gallery/application/use-cases/get-gallery-share/get-gallery-share.types";
import { getWorkspaceProfile } from "@/features/workspace/application/use-cases/get-workspace-profile/get-workspace-profile";
import type { AppLocale } from "@/shared/locale/locale.types";
import { logger } from "@/shared/logging/logger";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { getRequestLocale } from "../../locale/request-locale/request-locale";
import type { RequestContext } from "../../request-context/request-context.types";
import { withRequestDb } from "../../request-db/request-db";
import { verifyOwnerWorkspace } from "../../workspace/owner-workspace/owner-workspace";
import type { GalleryShareEntry } from "./gallery-share-flow.types";

const idSchema = z.uuid();

/**
 * The client's first name for the message greeting (Owner 2026-10-18, same as the client gallery greeting).
 * @param name - the stored full name
 * @returns the first word, or the trimmed name when it has none
 */
function clientFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name.trim();
}

function shareDeps(db: DbExecutor, rc: RequestContext): GetGalleryShareDeps {
  return {
    galleries: createDrizzleGalleryRepository(db),
    cipher: createWebCryptoGalleryPasswordCipher(rc.env.GALLERY_PASSWORD_KEY),
    links: createDrizzleClientLinkReader(db),
    recipients: createDrizzleShareRecipientReader(db),
    now: new Date(),
    origin: rc.env.BETTER_AUTH_URL,
  };
}

/**
 * Renders the GALLERY_SHARE message for the share. The template and the brand name come from
 * the workspace; the language is the Owner's request locale (BR-L10N-006, D-9).
 * @param db - the request-scoped executor
 * @param context - the verified workspace
 * @param share - the share facts
 * @param workspaceName - the workspace name, the brand fallback (BR-WS-004)
 * @param locale - the Owner's active language
 * @returns the rendered plain text
 */
async function renderShareText(
  db: DbExecutor,
  context: WorkspaceContext,
  share: Extract<GalleryShare, { shareable: true }>,
  workspaceName: string,
  locale: AppLocale,
): Promise<string> {
  // The template and the workspace profile are independent reads, so they run together.
  const [template, profile] = await Promise.all([
    getMessageTemplate(createDrizzleMessageTemplateRepository(db), context, "GALLERY_SHARE"),
    getWorkspaceProfile(createDrizzleWorkspaceRepository(db), context),
  ]);
  return renderTemplateForRecipient(template, locale, {
    clientName: clientFirstName(share.recipient.name),
    projectTitle: share.projectTitle,
    brandName: profile?.brandName ?? profile?.name ?? workspaceName,
    galleryUrl: share.link,
    galleryPassword: share.password,
  });
}

async function shareEntry(
  db: DbExecutor,
  rc: RequestContext,
  context: WorkspaceContext,
  workspaceName: string,
  projectId: string,
  locale: AppLocale,
): Promise<GalleryShareEntry> {
  const share = await getGalleryShare(shareDeps(db, rc), context, projectId);
  if (!share.shareable) return { ok: false, code: "NOT_SHAREABLE" };
  const text = await renderShareText(db, context, share, workspaceName, locale);
  const number = share.recipient.whatsappNumber;
  return {
    ok: true,
    recipient: {
      name: share.recipient.name,
      phone: number === null ? null : formatWhatsappNumber(number),
    },
    text,
    waUrl: whatsappLink(number, text),
  };
}

/** Maps a failure to a stable code. Logs IDs and the operation only: never the text, password, link or URL (C-103). */
function failureOf(error: unknown, workspaceId: string, projectId: string): GalleryShareEntry {
  if (error instanceof GalleryError && error.code === "NOT_FOUND") {
    return { ok: false, code: "NOT_FOUND" };
  }
  logger.error("gallery.share_failed", { workspaceId, projectId });
  return { ok: false, code: "FAILED" };
}

/**
 * Loads the share dialog's entry for a project's gallery: the recipient, the `GALLERY_SHARE` text
 * in the Owner's active language and the `wa.me` link, or a refusal (D-9, AC-GFL-021 to 025).
 * Workspace-scoped: another workspace's project is NOT_FOUND. The password is decrypted here only
 * and never returned on a refusal (ADR-017, C-103, C-004).
 * @param rawWorkspaceId - untrusted workspace id
 * @param rawProjectId - untrusted project id
 * @returns the entry, or a refusal code
 */
export async function loadGalleryShareEntry(
  rawWorkspaceId: string,
  rawProjectId: string,
): Promise<GalleryShareEntry> {
  const parsed = idSchema.safeParse(rawProjectId);
  if (!parsed.success) return { ok: false, code: "NOT_FOUND" };
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  const locale = await getRequestLocale();
  const { workspaceId } = verified.context;
  try {
    return await withRequestDb((db, rc) =>
      shareEntry(db, rc, verified.context, verified.workspace.name, parsed.data, locale),
    );
  } catch (error) {
    return failureOf(error, workspaceId, parsed.data);
  }
}
