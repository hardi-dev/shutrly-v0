import type { PickPhotosPage } from "@/features/gallery/application/use-cases/browse-pick-photos/browse-pick-photos.types";
import type {
  PickView,
  PickViewResult,
} from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";

/** What a Pilih page loads on the server: the view with its first grid page (null when it failed). */
export type PickLoad =
  | Exclude<PickViewResult, { readonly kind: "VIEW" }>
  | {
      readonly kind: "VIEW";
      readonly view: PickView;
      readonly firstPage: PickPhotosPage | null;
    };
