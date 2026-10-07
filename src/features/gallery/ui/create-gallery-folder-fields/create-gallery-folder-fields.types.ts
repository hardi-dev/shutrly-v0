import type { LinkableSourceView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

import type { useCreateGalleryForm } from "../use-create-gallery-form/use-create-gallery-form";

export interface CreateGalleryFolderFieldsProps {
  readonly folder: ReturnType<typeof useCreateGalleryForm>["folder"];
  readonly sources: readonly LinkableSourceView[];
}
