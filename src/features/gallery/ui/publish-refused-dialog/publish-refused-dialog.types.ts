import type { PublishSourceFailure } from "@/features/gallery/application/use-cases/gallery-results/gallery-results.types";

export interface PublishRefusedDialogProps {
  readonly failures: readonly PublishSourceFailure[];
  readonly onClose: () => void;
}
