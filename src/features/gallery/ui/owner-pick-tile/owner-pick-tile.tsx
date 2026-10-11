import { useTranslations } from "next-intl";

import { PhotoTile } from "@/ui/patterns/photo-tile/photo-tile";
import { Icon } from "@/ui/primitives/icon/icon";

import { galleryMediaUrl } from "../gallery-media-url/gallery-media-url";
import { OWNER_PICK_TILE_COPY_NAMESPACE } from "./owner-pick-tile.copy";
import type { OwnerPickTileProps } from "./owner-pick-tile.types";

/** One picked photo on the Owner's group page: thumbnail, file name and folder, *× n* for print, *Hilang* when the file is gone, and the client's note below (owner-2 exports, A-8, A-32, AC-SEL-015). @param props - workspace, the pick and the group's mode @returns the tile */
const FOLDER_SEPARATOR = " › ";

export function OwnerPickTile({ workspaceId, pick, mode }: Readonly<OwnerPickTileProps>) {
  const t = useTranslations(OWNER_PICK_TILE_COPY_NAMESPACE);
  return (
    <li className="flex min-w-0 flex-col gap-(--space-2)">
      <PhotoTile
        fileName={pick.fileName}
        meta={pick.folderPath.split("/").join(FOLDER_SEPARATOR)}
        imageSrc={galleryMediaUrl(workspaceId, pick.photoId, "thumb")}
        isMissing={pick.missing}
        badge={
          mode === "QUANTITY"
            ? { label: t("quantity", { quantity: pick.quantity }), tone: "info" }
            : undefined
        }
      />
      {pick.note === null ? null : (
        <div className="flex items-start gap-(--space-3) rounded-(--radius-md) border border-(--component-alert-info-border) bg-(--component-alert-info-background) p-(--space-3)">
          <span className="text-(--component-alert-info-icon)">
            <Icon name="message-square-text" size="sm" aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-(--space-0-5)">
            <span className="text-(length:--font-size-body-sm) font-semibold text-(--component-alert-info-title)">
              {t("clientNote")}
            </span>
            <span className="text-(length:--font-size-caption) break-words whitespace-pre-line text-(--color-semantic-text-secondary)">
              {pick.note}
            </span>
          </span>
        </div>
      )}
    </li>
  );
}
