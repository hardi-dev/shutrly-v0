import type { CategoryRecord } from "@/features/booking/application/ports/category-repository/category-repository.port";
import type { ServiceWriteResult } from "@/features/booking/application/use-cases/service-results/service-results.types";

export interface AddServiceDialogProps {
  readonly isOpen: boolean;
  readonly workspaceId: string;
  readonly categories: readonly CategoryRecord[];
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly action: (workspaceId: string, values: unknown) => Promise<ServiceWriteResult>;
}
